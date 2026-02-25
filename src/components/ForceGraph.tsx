'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { ScanResult } from '@/lib/types';

// ─── Types ────────────────────────────────────────────────────────────────────
interface ForceNode {
    id: string;
    parentId?: string;
    label: string;
    type: 'user' | 'verified-core' | 'breach' | 'social' | 'info' | 'inferred' | 'inferred-item';
    x: number;
    y: number;
    isHighRisk: boolean;
    tooltip: string;
}

type GraphMode = 'public' | 'verified';

interface ForceGraphProps {
    scanResult: ScanResult | null;
    mode: GraphMode;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const toRad = (deg: number) => (deg * Math.PI) / 180;

/** Place `count` nodes evenly along an arc from startDeg→endDeg at `radius` from (cx,cy). */
const arcPositions = (
    cx: number,
    cy: number,
    count: number,
    startDeg: number,
    endDeg: number,
    radius: number,
    pad = 12,
) => {
    const s = startDeg + pad;
    const e = endDeg - pad;
    const out: { x: number; y: number }[] = [];
    for (let i = 0; i < count; i++) {
        const angle = count === 1 ? toRad((startDeg + endDeg) / 2) : toRad(s + (i / (count - 1)) * (e - s));
        out.push({ x: cx + Math.cos(angle) * radius, y: cy + Math.sin(angle) * radius });
    }
    return out;
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function ForceGraph({ scanResult, mode }: ForceGraphProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const nodesRef = useRef<ForceNode[]>([]);
    const [hoveredNode, setHoveredNode] = useState<ForceNode | null>(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    // ── Node generation ──────────────────────────────────────────────────────
    const generateNodes = useCallback(
        (result: ScanResult, w: number, h: number): ForceNode[] => {
            const nodes: ForceNode[] = [];
            const cx = w / 2;
            const cy = h / 2;

            if (mode === 'public') {
                // ═════════════════════════════════════════════════════════════
                // PUBLIC SHADOW — User, Breaches, Socials, teaser info squares
                // ═════════════════════════════════════════════════════════════
                const R = 150; // fixed radius

                nodes.push({
                    id: 'user', label: result.query, type: 'user',
                    x: cx, y: cy, isHighRisk: result.riskScore > 70,
                    tooltip: `Target: ${result.query} | Risk: ${result.riskScore}/100`,
                });

                // Breaches — upper arc (200° → 340°)
                const bPos = arcPositions(cx, cy, result.breaches.length, 200, 340, R);
                result.breaches.forEach((b, i) => {
                    nodes.push({
                        id: `breach-${i}`, label: b.name, type: 'breach',
                        x: bPos[i].x, y: bPos[i].y,
                        isHighRisk: b.dataClasses.some(d => /password|credit/i.test(d)),
                        tooltip: `🔺 ${b.name}: ${b.dataClasses.slice(0, 3).join(', ')}`,
                    });
                });

                // Passwords node
                if (result.riskBreakdown.passwordsExposed) {
                    nodes.push({
                        id: 'password', label: 'PASSWORDS', type: 'breach',
                        x: cx, y: cy - R - 50, isHighRisk: true,
                        tooltip: '⚠️ CRITICAL: Passwords exposed in data breaches!',
                    });
                }

                // Socials — lower-right arc (10° → 80°)
                const sPos = arcPositions(cx, cy, result.profiles.length, 10, 80, R + 15);
                result.profiles.forEach((p, i) => {
                    nodes.push({
                        id: `social-${i}`, label: p.platform, type: 'social',
                        x: sPos[i].x, y: sPos[i].y, isHighRisk: false,
                        tooltip: `⬤ ${p.platform}: Public profile found`,
                    });
                });

                // Teaser info squares — bottom-left arc (100° → 170°), category labels only
                const teaserCategories = ['Phone', 'Location', 'Employer'];
                const iPos = arcPositions(cx, cy, teaserCategories.length, 100, 170, R + 10);
                teaserCategories.forEach((cat, i) => {
                    nodes.push({
                        id: `info-${cat.toLowerCase()}`, label: cat, type: 'info',
                        x: iPos[i].x, y: iPos[i].y, isHighRisk: false,
                        tooltip: `◼ ${cat}: Verify identity to reveal`,
                    });
                });

            } else {
                // ═════════════════════════════════════════════════════════════
                // VERIFIED CORE — hub with private values + inferred branches
                // ═════════════════════════════════════════════════════════════
                const R = 200; // wider radius for verified

                // Central hub
                nodes.push({
                    id: 'verified-core', label: 'Verified Identity', type: 'verified-core',
                    x: cx, y: cy, isHighRisk: false,
                    tooltip: '🔐 Verified — sensitive intelligence unlocked',
                });

                // ── Private value nodes (personal info w/ actual values) ──
                const pi = result.personalInfo;
                const privItems: { key: string; label: string }[] = [];
                if (pi?.location) privItems.push({ key: 'location', label: `📍 ${pi.location}` });
                if (pi?.employer) privItems.push({ key: 'employer', label: `💼 ${pi.employer}` });
                if (pi?.education) privItems.push({ key: 'education', label: `🎓 ${pi.education}` });
                if (pi?.phone) privItems.push({ key: 'phone', label: `📞 ${pi.phone}` });
                if (pi?.address) privItems.push({ key: 'address', label: `🏠 ${pi.address}` });
                if (pi?.dateOfBirth) privItems.push({ key: 'dob', label: `🎂 ${pi.dateOfBirth}` });
                if (pi?.financialInfo) privItems.push({ key: 'finance', label: `💳 ${pi.financialInfo}` });
                if (pi?.propertyValue) privItems.push({ key: 'property', label: `🏡 ${pi.propertyValue}` });
                if (pi?.vehicleInfo) privItems.push({ key: 'vehicle', label: `🚗 ${pi.vehicleInfo}` });

                // Place private values in inner ring
                const innerR = 135; // tighter inner ring
                const pvPos = arcPositions(cx, cy, privItems.length, 0, 360, innerR, 10);
                privItems.forEach((item, i) => {
                    nodes.push({
                        id: `priv-${item.key}`, parentId: 'verified-core', label: item.label, type: 'info',
                        x: pvPos[i].x, y: pvPos[i].y, isHighRisk: false,
                        tooltip: `Private: ${item.label}`,
                    });
                });

                // ── Inferred Intelligence — outer ring ──
                const inferredGroups = [
                    { id: 'inf-behav', label: 'Behavioral Patterns', items: ['Active: 8am-11pm', 'Commute: Caltrain'] },
                    { id: 'inf-sec', label: 'Security Questions', items: ["Pet: Rex", 'School: Lincoln High'] },
                    { id: 'inf-tech', label: 'Tech Stack', items: ['VS Code', 'AWS', 'Slack'] },
                    { id: 'inf-trust', label: 'Circle of Trust', items: ['Alex Chen', 'Sarah Jenkins', 'Mike Ross'] },
                ];

                const outerAngles = [45, 135, 225, 315]; // four quadrants
                inferredGroups.forEach((group, i) => {
                    const angle = toRad(outerAngles[i]);
                    const gx = cx + Math.cos(angle) * R;
                    const gy = cy + Math.sin(angle) * R;

                    nodes.push({
                        id: group.id, parentId: 'verified-core', label: group.label, type: 'inferred',
                        x: gx, y: gy, isHighRisk: false,
                        tooltip: `🧠 ${group.label}`,
                    });

                    // Sub items
                    const subR = 65;
                    group.items.forEach((item, j) => {
                        const spread = 0.55;
                        const itemAngle = angle + (j - (group.items.length - 1) / 2) * spread;
                        nodes.push({
                            id: `${group.id}-${j}`, parentId: group.id, label: item, type: 'inferred-item',
                            x: gx + Math.cos(itemAngle) * subR,
                            y: gy + Math.sin(itemAngle) * subR,
                            isHighRisk: false,
                            tooltip: `Intelligence: ${item}`,
                        });
                    });
                });
            }

            return nodes;
        },
        [mode],
    );

    // ── Mouse handling ────────────────────────────────────────────────────────
    const handleMouseMove = useCallback((e: MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setMousePos({ x, y });

        let hovered: ForceNode | null = null;
        for (const node of nodesRef.current) {
            const dist = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2);
            const hit = node.type === 'user' || node.type === 'verified-core' ? 28 : 18;
            if (dist < hit) { hovered = node; break; }
        }
        setHoveredNode(hovered);
    }, []);

    // ── Drawing ───────────────────────────────────────────────────────────────
    const drawGraph = useCallback(
        (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const nodes = nodesRef.current;
            const isVerified = mode === 'verified';

            // ── Edges ──
            nodes.forEach((node) => {
                if (node.type === 'user' || node.type === 'verified-core') return;

                let parent = node.parentId ? nodes.find(n => n.id === node.parentId) : undefined;
                if (!parent) parent = nodes.find(n => n.type === (isVerified ? 'verified-core' : 'user'));
                if (!parent) return;

                ctx.save();
                ctx.beginPath();

                if (node.type === 'breach' && node.isHighRisk) {
                    ctx.strokeStyle = 'rgba(255, 51, 102, 0.45)';
                    ctx.lineWidth = 2;
                } else if (node.type === 'breach') {
                    ctx.strokeStyle = 'rgba(255, 153, 51, 0.3)';
                    ctx.lineWidth = 1;
                } else if (node.type === 'social') {
                    ctx.strokeStyle = 'rgba(0, 255, 255, 0.25)';
                    ctx.lineWidth = 1;
                } else if (node.type === 'info') {
                    ctx.strokeStyle = isVerified
                        ? 'rgba(129, 140, 248, 0.4)'
                        : 'rgba(168, 85, 247, 0.25)';
                    ctx.lineWidth = isVerified ? 1.5 : 1;
                    if (isVerified) { ctx.shadowBlur = 8; ctx.shadowColor = 'rgba(129,140,248,0.2)'; }
                } else if (node.type === 'inferred') {
                    ctx.strokeStyle = 'rgba(52, 211, 153, 0.45)';
                    ctx.lineWidth = 1;
                    ctx.shadowBlur = 6; ctx.shadowColor = 'rgba(52,211,153,0.2)';
                } else if (node.type === 'inferred-item') {
                    ctx.strokeStyle = 'rgba(52, 211, 153, 0.3)';
                    ctx.lineWidth = 0.7;
                }

                ctx.moveTo(parent.x, parent.y);
                ctx.lineTo(node.x, node.y);
                ctx.stroke();
                ctx.restore();
            });

            // ── Nodes ──
            nodes.forEach((node) => {
                ctx.save();

                if (node.isHighRisk && node.type === 'breach') {
                    ctx.shadowBlur = 15; ctx.shadowColor = '#ff3366';
                }
                if (isVerified && node.type !== 'inferred-item') {
                    ctx.shadowBlur = 12;
                    ctx.shadowColor = node.type === 'inferred'
                        ? 'rgba(52,211,153,0.5)' : 'rgba(168,85,247,0.5)';
                }

                if (node.type === 'user') {
                    const g = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, 28);
                    g.addColorStop(0, '#00ffff');
                    g.addColorStop(0.5, '#0088aa');
                    g.addColorStop(1, 'rgba(0,136,170,0)');
                    ctx.fillStyle = g;
                    ctx.beginPath(); ctx.arc(node.x, node.y, 28, 0, Math.PI * 2); ctx.fill();
                    ctx.fillStyle = '#00ffff';
                    ctx.beginPath(); ctx.arc(node.x, node.y, 13, 0, Math.PI * 2); ctx.fill();
                } else if (node.type === 'verified-core') {
                    const g = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, 36);
                    g.addColorStop(0, '#818cf8'); // Indigo start
                    g.addColorStop(0.4, '#4f46e5'); // Indigo mid
                    g.addColorStop(1, 'rgba(79,70,229,0)');
                    ctx.fillStyle = g;
                    ctx.beginPath(); ctx.arc(node.x, node.y, 36, 0, Math.PI * 2); ctx.fill();
                    ctx.fillStyle = '#6366f1';
                    ctx.beginPath(); ctx.arc(node.x, node.y, 16, 0, Math.PI * 2); ctx.fill();
                    ctx.fillStyle = '#e0e7ff';
                    ctx.beginPath(); ctx.arc(node.x, node.y, 5, 0, Math.PI * 2); ctx.fill();
                } else if (node.type === 'breach') {
                    const s = 12;
                    ctx.fillStyle = node.isHighRisk ? '#ff3366' : '#ff9933';
                    ctx.beginPath();
                    ctx.moveTo(node.x, node.y - s);
                    ctx.lineTo(node.x - s, node.y + s * 0.7);
                    ctx.lineTo(node.x + s, node.y + s * 0.7);
                    ctx.closePath(); ctx.fill();
                } else if (node.type === 'social') {
                    ctx.fillStyle = '#00ffff';
                    ctx.beginPath(); ctx.arc(node.x, node.y, 10, 0, Math.PI * 2); ctx.fill();
                } else if (node.type === 'info') {
                    const s = 10;
                    ctx.fillStyle = isVerified ? '#6366f1' : '#A855F7';
                    ctx.fillRect(node.x - s, node.y - s, s * 2, s * 2);
                } else if (node.type === 'inferred') {
                    const s = 7;
                    ctx.fillStyle = '#34d399';
                    ctx.beginPath();
                    ctx.moveTo(node.x, node.y - s);
                    ctx.lineTo(node.x + s, node.y);
                    ctx.lineTo(node.x, node.y + s);
                    ctx.lineTo(node.x - s, node.y);
                    ctx.closePath(); ctx.fill();
                } else if (node.type === 'inferred-item') {
                    ctx.fillStyle = '#a7f3d0';
                    ctx.beginPath(); ctx.arc(node.x, node.y, 3.5, 0, Math.PI * 2); ctx.fill();
                }

                ctx.restore();

                // ── Labels ──
                ctx.save();

                const isCenter = node.type === 'user' || node.type === 'verified-core';
                const isPrivValue = isVerified && node.id.startsWith('priv-');

                ctx.fillStyle = isVerified ? '#e0e7ff' : '#ffffff';

                if (isPrivValue) {
                    ctx.font = 'bold 13px Inter, sans-serif'; // Larger, bold font for actual values
                    ctx.shadowBlur = 4;
                    ctx.shadowColor = 'rgba(0,0,0,0.5)';
                } else {
                    ctx.font = isCenter ? 'bold 13px Inter, sans-serif' : '11px Inter, sans-serif';
                }

                ctx.textAlign = 'center';

                let labelY: number;
                if (isCenter) {
                    labelY = node.y + 46;
                } else if (node.type === 'inferred') {
                    labelY = node.y - 18;
                } else if (node.type === 'inferred-item') {
                    labelY = node.y + 16;
                } else {
                    // Place above if node is in upper half, below otherwise
                    labelY = node.y < canvas.height / 2 ? node.y - 20 : node.y + 24;
                }
                ctx.fillText(node.label, node.x, labelY);
                ctx.restore();
            });
        },
        [mode],
    );

    // ── Init & render ─────────────────────────────────────────────────────────
    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container || !scanResult) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const resizeAndDraw = () => {
            const rect = container.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = rect.height;
            nodesRef.current = generateNodes(scanResult, rect.width, rect.height);
            drawGraph(ctx, canvas);
        };

        resizeAndDraw();
        window.addEventListener('resize', resizeAndDraw);
        canvas.addEventListener('mousemove', handleMouseMove);
        return () => {
            window.removeEventListener('resize', resizeAndDraw);
            canvas.removeEventListener('mousemove', handleMouseMove);
        };
    }, [scanResult, mode, generateNodes, handleMouseMove, drawGraph]);

    // ── Legend items by mode ──
    const publicLegend = (
        <>
            <div className="flex items-center gap-2">
                <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[10px]" style={{ borderBottomColor: '#ff9933' }} />
                <span className="text-gray-400">Breach</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#00ffff' }} />
                <span className="text-gray-400">Social</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-3 h-3" style={{ backgroundColor: '#A855F7' }} />
                <span className="text-gray-400">Personal Info</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[10px]" style={{ borderBottomColor: '#ff3366', filter: 'drop-shadow(0 0 4px #ff3366)' }} />
                <span className="text-gray-400">High Risk</span>
            </div>
        </>
    );

    const verifiedLegend = (
        <>
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#6366f1', boxShadow: '0 0 6px #6366f1' }} />
                <span className="text-gray-400">Verified Hub</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-3 h-3" style={{ backgroundColor: '#6366f1' }} />
                <span className="text-gray-400">Private Values</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-sm rotate-45" style={{ backgroundColor: '#34d399' }} />
                <span className="text-gray-400">Inferred</span>
            </div>
        </>
    );

    // ── Render ─────────────────────────────────────────────────────────────────
    return (
        <div ref={containerRef} className="relative w-full min-h-[500px]">
            <canvas ref={canvasRef} className="w-full h-full cursor-crosshair" />

            {/* Tooltip */}
            {hoveredNode && (
                <div
                    className="absolute pointer-events-none z-50 px-3 py-2 rounded-lg text-sm max-w-[250px]"
                    style={{
                        left: mousePos.x + 15,
                        top: mousePos.y - 10,
                        background: hoveredNode.isHighRisk
                            ? 'rgba(255, 51, 102, 0.9)'
                            : mode === 'verified'
                                ? 'rgba(88, 28, 135, 0.9)'
                                : 'rgba(0, 0, 0, 0.85)',
                        border: `1px solid ${hoveredNode.isHighRisk ? '#ff3366' : mode === 'verified' ? '#6366f1' : '#00ffff'}`,
                        boxShadow: `0 0 20px ${hoveredNode.isHighRisk ? 'rgba(255,51,102,0.5)' : mode === 'verified' ? 'rgba(99,102,241,0.4)' : 'rgba(0,255,255,0.3)'}`,
                    }}
                >
                    <p className="text-white font-medium">{hoveredNode.tooltip}</p>
                </div>
            )}

            {/* Legend */}
            <div className="absolute bottom-4 left-4 flex flex-wrap gap-4 text-xs">
                {mode === 'public' ? publicLegend : verifiedLegend}
            </div>
        </div>
    );
}
