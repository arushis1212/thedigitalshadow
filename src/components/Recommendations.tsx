'use client';

import { useState } from 'react';
import { Shield, Sparkles, CheckCircle2, Circle } from 'lucide-react';
import { RiskBreakdown, ScanResult } from '@/lib/types';

interface RecommendationsProps {
    riskBreakdown: RiskBreakdown;
    riskScore: number;
    scanResult?: ScanResult;
    isVerified?: boolean;
    onVerify?: () => void;
}

interface Recommendation {
    id: string;
    title: string;
    description: string;
    priority: 'Priority 1' | 'Priority 2' | 'Maintenance';
    action: string;
    fixUrl: string;
}

export default function Recommendations({ riskBreakdown, riskScore, scanResult, isVerified = false, onVerify }: RecommendationsProps) {
    const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

    const toggleItem = (id: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const getRecommendations = (): Recommendation[] => {
        const recs: Recommendation[] = [];

        // Extract specific info to map into our templates
        const breachName = scanResult?.breaches?.[0]?.name || 'a recent data breach';
        const platformName = scanResult?.profiles?.[0]?.platform || 'social media updates';
        const locationOrEmployer = scanResult?.personalInfo?.employer || scanResult?.personalInfo?.location || 'personal';
        const cityName = scanResult?.personalInfo?.location || 'your city';

        if (riskBreakdown.passwordsExposed || riskBreakdown.breachExposure > 0 || riskScore > 30) {
            recs.push({
                id: 'rec-1',
                title: `Update your login for ${breachName}`,
                description: `Since info from ${breachName} is available, updating your password would be a great way to stay ahead of potential risks. It’s a simple step that keeps your digital identity solid.`,
                priority: 'Priority 1',
                action: 'Update password',
                fixUrl: 'https://myaccount.google.com/security',
            });
        }

        if (riskBreakdown.socialMediaVisibility > 0 || riskScore > 20) {
            recs.push({
                id: 'rec-2',
                title: `Adjust your ${platformName} visibility`,
                description: `To keep your professional and personal lives separate, you might consider adjusting your ${platformName} settings. Changing this to "Private" helps you control who can see your ${locationOrEmployer} details.`,
                priority: 'Priority 2',
                action: 'Review privacy settings',
                fixUrl: 'https://www.facebook.com/settings?tab=privacy',
            });
        }

        // Always show the Maintenance one
        recs.push({
            id: 'rec-3',
            title: `Audit your photo settings on ${platformName}`,
            description: `A quick check of your ${platformName} photo settings can help prevent accidental sharing of ${cityName} location tags. Turning off "Location Services" for your camera is a small win for your daily privacy.`,
            priority: 'Maintenance',
            action: 'Check location permissions',
            fixUrl: 'https://support.google.com/chrome/answer/142065',
        });

        return recs;
    };

    const recommendations = getRecommendations();

    const priorityColors = {
        'Priority 1': 'border border-blue-500/30 border-l-blue-500 bg-blue-900/20',
        'Priority 2': 'border border-purple-400/30 border-l-purple-400 bg-purple-900/20',
        'Maintenance': 'border border-slate-500/30 border-l-slate-400 bg-slate-800/40',
    };

    const priorityTextColors = {
        'Priority 1': 'text-blue-400',
        'Priority 2': 'text-purple-300',
        'Maintenance': 'text-slate-300',
    };

    const allChecked = recommendations.length > 0 && recommendations.every(r => checkedItems[r.id]);

    return (
        <div className="cyber-glass p-6 animate-fadeIn transition-colors duration-500" style={{
            borderColor: allChecked ? 'rgba(74, 222, 128, 0.4)' : undefined,
            boxShadow: allChecked ? '0 0 20px rgba(74, 222, 128, 0.1)' : undefined
        }}>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-indigo-400" />
                    <h2 className="text-lg font-semibold text-white">Security Resilience Checklist</h2>
                </div>
                {allChecked && <span className="text-xs text-green-400 font-medium tracking-wide flex items-center gap-1 opacity-80 animate-pulse"><Sparkles className="w-3 h-3" /> ALL SECURE</span>}
            </div>

            <div className="relative">
                <div className={`space-y-3 transition-all duration-700 ${!isVerified ? 'blur-md grayscale select-none pointer-events-none' : ''}`}>
                    {recommendations.map((rec, index) => {
                        const isChecked = checkedItems[rec.id];
                        return (
                            <div
                                key={rec.id}
                                onClick={() => toggleItem(rec.id)}
                                className={`p-5 rounded-lg border-l-3 transition-all cursor-pointer ${isChecked
                                    ? 'border border-green-500/20 border-l-green-500 bg-green-500/10 opacity-60'
                                    : priorityColors[rec.priority]
                                    } hover:scale-[1.01]`}
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className="flex items-start gap-4">
                                    <button
                                        className={`mt-1 flex-shrink-0 transition-colors ${isChecked ? 'text-green-400' : 'text-slate-400 hover:text-white'}`}
                                    >
                                        {isChecked ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                                    </button>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className={`font-semibold text-sm transition-all ${isChecked ? 'text-gray-400 line-through' : 'text-white'}`}>
                                                {rec.title}
                                            </h3>
                                            <span className={`text-[10px] px-2 py-0.5 rounded tracking-wide font-medium transition-all ${isChecked
                                                ? 'border border-green-500/20 bg-green-500/10 text-green-400'
                                                : `${priorityColors[rec.priority]} ${priorityTextColors[rec.priority]}`
                                                }`}>
                                                {rec.priority.toUpperCase()}
                                            </span>
                                        </div>
                                        <p className={`text-xs mb-3 transition-all ${isChecked ? 'text-gray-500' : 'text-gray-400'}`}>
                                            {rec.description}
                                        </p>
                                        <div className="flex items-center gap-2 mt-2">
                                            {isChecked ? (
                                                <span className="text-xs font-medium text-green-400">Addressed</span>
                                            ) : (
                                                <a
                                                    href={rec.fixUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={(e) => e.stopPropagation()}
                                                    className={`text-xs font-medium ${priorityTextColors[rec.priority]} py-1 px-3 rounded bg-white/5 hover:bg-white/10 transition-colors inline-block`}
                                                >
                                                    {rec.action} →
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Locked Overlay */}
                {!isVerified && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10">
                        <div className="w-12 h-12 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4">
                            <Shield className="w-6 h-6 text-indigo-400" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">Checklist Locked</h3>
                        <p className="text-gray-400 text-sm mb-6 max-w-[250px]">
                            Specific security recommendations are hidden until identity is confirmed.
                        </p>
                        <button
                            onClick={onVerify}
                            className="px-6 py-2 bg-indigo-500/20 text-indigo-300 rounded-lg border border-indigo-500/30 hover:bg-indigo-500/30 transition-all font-semibold text-sm"
                        >
                            Verify to Unlock
                        </button>
                    </div>
                )}
            </div>

            {/* Gentle 'Strengthen' Call to Action */}
            <div className="mt-6 pt-4 border-t border-white/5 flex flex-wrap items-center justify-between gap-4">
                <p className="text-xs text-indigo-300">Take it one step at a time. Small actions compound into strong defenses.</p>
                <div className="flex items-center gap-2">
                    <button className="text-xs px-4 py-2 bg-indigo-500/10 text-indigo-300 rounded-md hover:bg-indigo-500/20 transition-colors border border-indigo-500/20">
                        Strengthen Privacy
                    </button>
                    <button className="text-xs px-4 py-2 bg-slate-500/10 text-slate-300 rounded-md hover:bg-slate-500/20 transition-colors border border-slate-500/20">
                        Review Defaults
                    </button>
                </div>
            </div>
        </div>
    );
}
