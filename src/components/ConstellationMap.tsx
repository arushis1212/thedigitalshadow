'use client';

import { useEffect, useRef, useState } from 'react';
import { DataPoint } from '@/lib/types';

interface ConstellationMapProps {
    dataPoints: DataPoint[];
}

interface Node {
    x: number;
    y: number;
    vx: number;
    vy: number;
    data: DataPoint;
    targetX: number;
    targetY: number;
}

export default function ConstellationMap({ dataPoints }: ConstellationMapProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const animationRef = useRef<number>(0);
    const nodesRef = useRef<Node[]>([]);
    const [hoveredNode, setHoveredNode] = useState<DataPoint | null>(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size
        const resizeCanvas = () => {
            const rect = container.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = rect.height;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Initialize nodes in a circular pattern
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(canvas.width, canvas.height) * 0.35;

        nodesRef.current = dataPoints.map((data, i) => {
            const angle = (i / dataPoints.length) * Math.PI * 2 - Math.PI / 2;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            return {
                x: centerX,
                y: centerY,
                vx: 0,
                vy: 0,
                data,
                targetX: x,
                targetY: y,
            };
        });

        // Animation loop
        let time = 0;
        const animate = () => {
            if (!ctx || !canvas) return;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            time += 0.01;

            const nodes = nodesRef.current;

            // Draw connections
            ctx.strokeStyle = 'rgba(0, 255, 255, 0.15)';
            ctx.lineWidth = 1;

            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const dx = nodes[j].x - nodes[i].x;
                    const dy = nodes[j].y - nodes[i].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 200) {
                        ctx.beginPath();
                        ctx.moveTo(nodes[i].x, nodes[i].y);
                        ctx.lineTo(nodes[j].x, nodes[j].y);
                        ctx.globalAlpha = 1 - dist / 200;
                        ctx.stroke();
                        ctx.globalAlpha = 1;
                    }
                }

                // Connect to center
                ctx.beginPath();
                ctx.strokeStyle = nodes[i].data.exposed ? 'rgba(255, 51, 102, 0.3)' : 'rgba(0, 255, 255, 0.2)';
                ctx.moveTo(centerX, centerY);
                ctx.lineTo(nodes[i].x, nodes[i].y);
                ctx.stroke();
            }

            // Draw center node (user)
            const pulseSize = 20 + Math.sin(time * 2) * 5;
            const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, pulseSize * 2);
            gradient.addColorStop(0, 'rgba(0, 255, 255, 0.8)');
            gradient.addColorStop(0.5, 'rgba(0, 255, 255, 0.2)');
            gradient.addColorStop(1, 'rgba(0, 255, 255, 0)');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(centerX, centerY, pulseSize * 2, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#00ffff';
            ctx.beginPath();
            ctx.arc(centerX, centerY, 12, 0, Math.PI * 2);
            ctx.fill();

            // Draw "YOU" label
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 12px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('YOU', centerX, centerY + 35);

            // Draw data nodes
            nodes.forEach((node, i) => {
                // Animate towards target with floating effect
                const floatX = Math.sin(time + i) * 3;
                const floatY = Math.cos(time * 0.8 + i) * 3;

                node.x += (node.targetX + floatX - node.x) * 0.05;
                node.y += (node.targetY + floatY - node.y) * 0.05;

                // Node glow
                const nodeGradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, 30);
                const color = node.data.exposed ? '255, 51, 102' : '0, 255, 255';
                nodeGradient.addColorStop(0, `rgba(${color}, 0.4)`);
                nodeGradient.addColorStop(1, `rgba(${color}, 0)`);

                ctx.fillStyle = nodeGradient;
                ctx.beginPath();
                ctx.arc(node.x, node.y, 30, 0, Math.PI * 2);
                ctx.fill();

                // Node circle
                ctx.fillStyle = node.data.exposed ? '#ff3366' : '#00ffff';
                ctx.beginPath();
                ctx.arc(node.x, node.y, 8, 0, Math.PI * 2);
                ctx.fill();

                // Node label
                ctx.fillStyle = '#ffffff';
                ctx.font = '11px Inter, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(node.data.label, node.x, node.y + 25);

                // Status indicator
                ctx.fillStyle = node.data.exposed ? 'rgba(255, 51, 102, 0.8)' : 'rgba(0, 255, 136, 0.8)';
                ctx.font = '9px Inter, sans-serif';
                ctx.fillText(node.data.exposed ? 'EXPOSED' : 'SECURE', node.x, node.y + 38);
            });

            // Draw scanning line effect
            const scanLine = (time * 100) % canvas.height;
            const scanGradient = ctx.createLinearGradient(0, scanLine - 20, 0, scanLine + 20);
            scanGradient.addColorStop(0, 'rgba(0, 255, 255, 0)');
            scanGradient.addColorStop(0.5, 'rgba(0, 255, 255, 0.1)');
            scanGradient.addColorStop(1, 'rgba(0, 255, 255, 0)');

            ctx.fillStyle = scanGradient;
            ctx.fillRect(0, scanLine - 20, canvas.width, 40);

            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationRef.current);
        };
    }, [dataPoints]);

    return (
        <div ref={containerRef} className="relative w-full h-[400px]">
            <canvas ref={canvasRef} className="w-full h-full" />

            {/* Legend */}
            <div className="absolute bottom-4 left-4 flex gap-4 text-xs">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-pink-500" />
                    <span className="text-gray-400">Exposed Data</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-cyan-400" />
                    <span className="text-gray-400">Secure</span>
                </div>
            </div>
        </div>
    );
}
