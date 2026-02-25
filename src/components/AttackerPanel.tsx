'use client';

import { AlertCircle, Loader2 } from 'lucide-react';
import { BreachData, ProfileData, DataPoint } from '@/lib/types';

interface AttackerPanelProps {
    username: string;
    score: number;
    dataPoints: DataPoint[];
    narrative?: string;
    isLoading?: boolean;
    breaches?: BreachData[];
    profiles?: ProfileData[];
    isVerified?: boolean;
    onVerify?: () => void;
}

export default function AttackerPanel({
    username,
    score,
    dataPoints,
    narrative,
    isLoading = false,
    breaches = [],
    profiles = [],
    isVerified = false,
    onVerify,
}: AttackerPanelProps) {
    const exposedCount = dataPoints.filter(d => d.exposed).length;

    // Parse the narrative into dynamic attack sections (e.g., **PHISHING ATTACK**)
    const parseSections = (text: string) => {
        const sections: { title: string; icon: string; content: string }[] = [];

        // Match **Title** followed by content until the next **Title** or end of string
        const regex = /\*\*([^*]+)\*\*[:\s]*([\s\S]*?)(?=\*\*|$)/g;
        let match;

        const getIcon = (title: string) => {
            const t = title.toLowerCase();
            if (t.includes('phishing')) return '✉️';
            if (t.includes('identity')) return '👤';
            if (t.includes('credential') || t.includes('password')) return '🔑';
            if (t.includes('social') || t.includes('impersonation')) return '📱';
            if (t.includes('financial') || t.includes('crypto')) return '💰';
            if (t.includes('physical')) return '📍';
            return '⚡';
        };

        while ((match = regex.exec(text)) !== null) {
            const title = match[1].trim().replace(/:$/, '');
            const content = match[2].trim();
            if (title && content) {
                sections.push({
                    title: title.toUpperCase(),
                    icon: getIcon(title),
                    content: content
                });
            }
        }

        return sections;
    };

    // Fallback sections when no AI narrative is available
    const getFallbackSections = () => {
        const profileNames = profiles.slice(0, 2).map(p => p.platform).join(' and ');

        return [
            {
                title: 'SOCIAL ENGINEERING',
                icon: '📱',
                content: `An attacker could use your ${profileNames || 'public profiles'} to craft a convincing message and trick you into sharing more private info.\n- They might pose as a colleague or a support agent.\n- They'll use your public interests to make the message feel personal.`,
            },
            {
                title: 'CREDENTIAL ATTACK',
                icon: '🔑',
                content: `If your passwords have ever been leaked, someone could try them on your other important accounts.\n- They use automated tools to try thousands of leaked combinations.\n- Password reuse is the most common way accounts are compromised.`,
            },
        ];
    };

    const sections = narrative
        ? parseSections(narrative)
        : getFallbackSections();

    const displaySections = sections.length > 0 ? sections : getFallbackSections();

    return (
        <div className="cyber-glass overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-pink-500/20 to-red-500/20 border-b border-pink-500/30 px-6 py-4 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-pink-500" />
                <h2 className="font-semibold text-white">Attacker&apos;s Playbook</h2>
            </div>

            {/* Playbook Content */}
            <div className="relative">
                <div className={`p-6 transition-all duration-700 ${!isVerified && !isLoading ? 'blur-md select-none pointer-events-none grayscale' : ''}`}>
                    {isLoading ? (
                        <div className="flex items-center gap-3 text-gray-400 py-8 justify-center">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-sm">Generating playbook...</span>
                        </div>
                    ) : (
                        <div className="space-y-5">
                            {displaySections.map((section, i) => (
                                <div key={i}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-base">{section.icon}</span>
                                        <span className="text-xs font-bold text-pink-400 uppercase tracking-wider">
                                            {section.title}
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-300 leading-relaxed pl-7">
                                        {section.content.split('\n').map((line, idx) => {
                                            const isBullet = line.trim().startsWith('-');
                                            if (isBullet) return null;
                                            return line.trim() ? (
                                                <p key={idx} className="mb-2">{line.trim()}</p>
                                            ) : null;
                                        })}
                                        {section.content.split('\n').some(line => line.trim().startsWith('-')) && (
                                            <ul className="list-disc leading-relaxed pl-4 space-y-1 mt-1 text-sm text-gray-400">
                                                {section.content.split('\n')
                                                    .filter(line => line.trim().startsWith('-'))
                                                    .map(line => line.replace(/^-+/, '').trim())
                                                    .map((item, idx) => (
                                                        <li key={idx} className="first-letter:capitalize">{item}</li>
                                                    ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Locked Overlay */}
                {!isVerified && !isLoading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-black/40 backdrop-blur-[2px] z-10">
                        <div className="w-12 h-12 rounded-full bg-pink-500/10 border border-pink-500/20 flex items-center justify-center mb-4">
                            <AlertCircle className="w-6 h-6 text-pink-500" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">Playbook Locked</h3>
                        <p className="text-gray-400 text-sm mb-6 max-w-[250px]">
                            Specific attacker strategies are hidden until identity is confirmed.
                        </p>
                        <button
                            onClick={onVerify}
                            className="px-6 py-2 bg-pink-500/20 text-pink-400 rounded-lg border border-pink-500/30 hover:bg-pink-500/30 transition-all font-semibold text-sm"
                        >
                            Verify to Unlock
                        </button>
                    </div>
                )}
            </div>

            {/* Summary */}
            <div className="px-6 py-4 bg-pink-500/10 border-t border-pink-500/20">
                <p className="text-xs text-gray-400">
                    <span className="text-pink-500 font-bold">{exposedCount}</span> of {dataPoints.length} data categories exposed.
                    Risk level: <span className={`font-bold ${score > 70 ? 'text-pink-500' : score > 40 ? 'text-amber-400' : 'text-green-400'}`}>
                        {score > 70 ? 'CRITICAL' : score > 40 ? 'MODERATE' : 'LOW'}
                    </span>
                </p>
            </div>
        </div>
    );
}
