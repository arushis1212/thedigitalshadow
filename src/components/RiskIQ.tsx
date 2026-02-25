'use client';

import { Activity, ShieldAlert, Users, Zap } from 'lucide-react';

interface RiskIQProps {
    score: number;
}

export default function RiskIQ({ score }: RiskIQProps) {
    // Simulated comparative data for hackathon 'impact'
    const peerAvg = 42;
    const isAboveAvg = score > peerAvg;

    const metrics = [
        {
            label: 'Identity Theft Risk',
            value: score > 70 ? 'CRITICAL' : score > 40 ? 'ELEVATED' : 'MODERATE',
            icon: ShieldAlert,
            color: score > 70 ? 'text-pink-500' : 'text-amber-500'
        },
        {
            label: 'Social Engineering Vulnerability',
            value: `${Math.min(100, score + 12)}%`,
            icon: Users,
            color: 'text-cyan-400'
        },
        {
            label: 'Digital Blast Radius',
            value: score > 60 ? 'HIGH' : 'GLOBAL AVG',
            icon: Activity,
            color: 'text-purple-400'
        }
    ];

    return (
        <div className="glass-card p-6 h-full flex flex-col justify-between">
            <div>
                <div className="flex items-center gap-3 mb-4">
                    <Zap className="w-5 h-5 text-amber-400" />
                    <h2 className="text-lg font-bold text-white tracking-tight">Risk IQ Assessment</h2>
                </div>

                <div className="space-y-4">
                    {metrics.map((m, i) => (
                        <div key={i} className="flex items-start gap-3">
                            <div className="mt-1">
                                <m.icon className={`w-4 h-4 ${m.color}`} />
                            </div>
                            <div>
                                <p className="text-[11px] text-gray-500 uppercase font-semibold tracking-wider">{m.label}</p>
                                <p className={`text-sm font-bold ${m.color}`}>{m.value}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500 font-medium italic">Comparison to Global Index</span>
                    <span className={`text-xs font-bold ${isAboveAvg ? 'text-pink-500' : 'text-green-500'}`}>
                        {isAboveAvg ? `+${score - peerAvg}% Above Avg` : 'Within Safe Range'}
                    </span>
                </div>
                <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div
                        className={`h-full transition-all duration-1000 ${isAboveAvg ? 'bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.5)]' : 'bg-green-500'}`}
                        style={{ width: `${Math.min(100, (score / 100) * 100)}%` }}
                    />
                </div>
            </div>
        </div>
    );
}
