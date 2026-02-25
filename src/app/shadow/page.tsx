'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft, MapPin, Briefcase, GraduationCap, Phone, Globe,
    Shield, AlertTriangle, User, ExternalLink, Lock
} from 'lucide-react';
import { ScanResult } from '@/lib/types';

// Detail card component
function InfoCard({
    icon: Icon,
    label,
    value,
    color = 'cyan',
    sensitive = false,
}: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value?: string;
    color?: 'cyan' | 'purple' | 'pink' | 'amber';
    sensitive?: boolean;
}) {
    const colorMap = {
        cyan: { bg: 'bg-cyan-400/10', border: 'border-cyan-400/20', text: 'text-cyan-400', icon: 'text-cyan-400' },
        purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-400', icon: 'text-purple-400' },
        pink: { bg: 'bg-pink-500/10', border: 'border-pink-500/20', text: 'text-pink-400', icon: 'text-pink-400' },
        amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', icon: 'text-amber-400' },
    };
    const c = colorMap[color];

    return (
        <div className={`${c.bg} border ${c.border} rounded-xl p-5 transition-all hover:scale-[1.02]`}>
            <div className="flex items-center gap-3 mb-2">
                <Icon className={`w-5 h-5 ${c.icon}`} />
                <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold">{label}</span>
            </div>
            {value ? (
                <p className="text-white text-lg font-medium pl-8">
                    {sensitive && <Lock className="w-3 h-3 inline mr-1 text-gray-500" />}
                    {value}
                </p>
            ) : (
                <p className="text-gray-600 text-sm pl-8 italic">Not found</p>
            )}
        </div>
    );
}

export default function ShadowDetailsPage() {
    const router = useRouter();
    const [scanResult, setScanResult] = useState<ScanResult | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Read scan data from sessionStorage (set by the main dashboard before navigating)
        const stored = sessionStorage.getItem('verifiedScanResult');
        if (stored) {
            setScanResult(JSON.parse(stored));
        }
        setIsLoading(false);
    }, []);

    if (isLoading) {
        return (
            <main className="min-h-screen bg-[#0a0a14] flex items-center justify-center">
                <div className="text-cyan-400 animate-pulse">Loading verified data...</div>
            </main>
        );
    }

    if (!scanResult) {
        return (
            <main className="min-h-screen bg-[#0a0a14] flex flex-col items-center justify-center gap-4">
                <Shield className="w-12 h-12 text-gray-600" />
                <p className="text-gray-400">No verified scan data found.</p>
                <button
                    onClick={() => router.push('/')}
                    className="text-cyan-400 hover:underline text-sm"
                >
                    ← Go back to scanner
                </button>
            </main>
        );
    }

    const info = scanResult.personalInfo;

    return (
        <main className="min-h-screen bg-[#0a0a14] text-white">
            {/* Subtle background glow */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-3xl" />
            </div>

            {/* Header */}
            <header className="relative z-10 border-b border-white/5">
                <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
                    <button
                        onClick={() => router.push('/')}
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm">Back to Dashboard</span>
                    </button>
                    <div className="flex items-center gap-2 text-xs text-green-400">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        Identity Verified
                    </div>
                </div>
            </header>

            <div className="relative z-10 max-w-5xl mx-auto px-6 py-10">
                {/* Page Title */}
                <div className="mb-10">
                    <div className="flex items-center gap-4 mb-3">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center">
                            <User className="w-7 h-7 text-cyan-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Full Digital Shadow</h1>
                            <p className="text-gray-500 text-sm">{scanResult.query}</p>
                        </div>
                    </div>
                    <p className="text-gray-400 text-sm max-w-2xl">
                        Below is everything we found linked to your identity across public databases, social media, and data breaches.
                        This is what a stranger with the right tools could piece together.
                    </p>
                </div>

                {/* Risk Score Banner */}
                <div className={`rounded-xl p-5 mb-10 border ${scanResult.riskScore > 70
                    ? 'bg-pink-500/10 border-pink-500/20'
                    : scanResult.riskScore > 40
                        ? 'bg-amber-500/10 border-amber-500/20'
                        : 'bg-green-500/10 border-green-500/20'
                    }`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <AlertTriangle className={`w-5 h-5 ${scanResult.riskScore > 70 ? 'text-pink-500' :
                                scanResult.riskScore > 40 ? 'text-amber-400' : 'text-green-400'
                                }`} />
                            <span className="text-white font-semibold">
                                Risk Score: {scanResult.riskScore}/100
                            </span>
                        </div>
                        <span className={`text-xs font-bold uppercase px-3 py-1 rounded-full ${scanResult.riskScore > 70
                            ? 'bg-pink-500/20 text-pink-400'
                            : scanResult.riskScore > 40
                                ? 'bg-amber-500/20 text-amber-400'
                                : 'bg-green-500/20 text-green-400'
                            }`}>
                            {scanResult.riskScore > 70 ? 'CRITICAL' : scanResult.riskScore > 40 ? 'MODERATE' : 'LOW'}
                        </span>
                    </div>
                </div>

                {/* Personal Information Grid */}
                <section className="mb-10">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Lock className="w-4 h-4 text-purple-400" />
                        Personal Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InfoCard icon={MapPin} label="Location" value={info?.location} color="purple" sensitive />
                        <InfoCard icon={Briefcase} label="Employer" value={info?.employer} color="purple" sensitive />
                        <InfoCard icon={GraduationCap} label="Education" value={info?.education} color="purple" />
                        <InfoCard icon={GraduationCap} label="Field of Study" value={info?.fieldOfStudy} color="purple" />
                        <InfoCard icon={Phone} label="Phone" value={info?.phone} color="pink" sensitive />
                        {info?.address && (
                            <InfoCard icon={MapPin} label="Physical Address" value={info.address} color="pink" sensitive />
                        )}
                    </div>
                </section>

                {/* Known Aliases */}
                {info?.knownAliases && info.knownAliases.length > 0 && (
                    <section className="mb-10">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <User className="w-4 h-4 text-cyan-400" />
                            Known Aliases
                        </h2>
                        <div className="flex flex-wrap gap-2">
                            {info.knownAliases.map((alias, i) => (
                                <span key={i} className="px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-lg text-cyan-400 text-sm font-mono">
                                    {alias}
                                </span>
                            ))}
                        </div>
                    </section>
                )}

                {/* Data Breaches */}
                {scanResult.breaches.length > 0 && (
                    <section className="mb-10">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-pink-500" />
                            Data Breaches ({scanResult.breaches.length})
                        </h2>
                        <div className="space-y-3">
                            {scanResult.breaches.map((breach, i) => (
                                <div key={i} className="bg-pink-500/5 border border-pink-500/15 rounded-xl p-5">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-white font-semibold">{breach.name}</h3>
                                        <span className="text-xs text-gray-500">{breach.breachDate}</span>
                                    </div>
                                    <p className="text-gray-400 text-sm mb-3">{breach.description}</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {breach.dataClasses.map((cls, j) => (
                                            <span key={j} className={`text-xs px-2 py-0.5 rounded ${cls.toLowerCase().includes('password')
                                                ? 'bg-pink-500/20 text-pink-400'
                                                : 'bg-white/5 text-gray-400'
                                                }`}>
                                                {cls}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Public Profiles */}
                {scanResult.profiles.length > 0 && (
                    <section className="mb-10">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Globe className="w-4 h-4 text-cyan-400" />
                            Public Profiles ({scanResult.profiles.length})
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {scanResult.profiles.map((profile, i) => (
                                <a
                                    key={i}
                                    href={profile.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-cyan-500/5 border border-cyan-500/15 rounded-xl p-4 hover:bg-cyan-500/10 transition-all group"
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-cyan-400 font-semibold text-sm">{profile.platform}</span>
                                        <ExternalLink className="w-3 h-3 text-gray-600 group-hover:text-cyan-400 transition-colors" />
                                    </div>
                                    <p className="text-gray-400 text-xs">{profile.snippet}</p>
                                </a>
                            ))}
                        </div>
                    </section>
                )}

                {/* Exposed Data Types */}
                <section className="mb-10">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-amber-400" />
                        Exposed Data Types
                    </h2>
                    <div className="flex flex-wrap gap-2">
                        {scanResult.exposedDataTypes.map((type, i) => (
                            <span key={i} className={`text-xs px-3 py-1.5 rounded-lg border ${type.toLowerCase().includes('password')
                                ? 'bg-pink-500/10 border-pink-500/20 text-pink-400 font-bold'
                                : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                                }`}>
                                {type}
                            </span>
                        ))}
                    </div>
                </section>


                {/* Websites */}
                {info?.websites && info.websites.length > 0 && (
                    <section className="mb-10">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Globe className="w-4 h-4 text-cyan-400" />
                            Linked Websites
                        </h2>
                        <div className="space-y-2">
                            {info.websites.map((url, i) => (
                                <a
                                    key={i}
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block text-cyan-400 text-sm hover:underline"
                                >
                                    {url} ↗
                                </a>
                            ))}
                        </div>
                    </section>
                )}

                {/* Footer disclaimer */}
                <div className="border-t border-white/5 pt-6 mt-10">
                    <p className="text-gray-600 text-xs text-center">
                        This data was compiled from publicly available sources and known data breaches for educational purposes.
                        No unauthorized access was performed.
                    </p>
                </div>
            </div>
        </main>
    );
}
