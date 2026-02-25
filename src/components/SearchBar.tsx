'use client';

import { useState, useEffect } from 'react';
import { Search, Loader2, ShieldCheck } from 'lucide-react';

interface SearchBarProps {
    onSearch: (query: string) => void;
    isScanning: boolean;
    isVerified?: boolean;
    initialQuery?: string;
}

export default function SearchBar({
    onSearch,
    isScanning,
    isVerified = false,
    initialQuery = '',
}: SearchBarProps) {
    const [query, setQuery] = useState(initialQuery);

    // Sync with initialQuery when it changes (e.g. after sessionStorage restore)
    useEffect(() => {
        if (initialQuery && query !== initialQuery) {
            setQuery(initialQuery);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialQuery]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim() && !isScanning) {
            onSearch(query.trim());
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
            <div className="relative glow-border rounded-xl p-1 bg-black/30">
                <div className="flex items-center gap-3 px-4">
                    {isScanning ? (
                        <Loader2 className="w-6 h-6 text-cyan-400 animate-spin flex-shrink-0" />
                    ) : (
                        <Search className="w-6 h-6 text-cyan-400 flex-shrink-0" />
                    )}
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Enter username or email address..."
                        className={`cyber-input border-0 bg-transparent py-4 px-0 focus:ring-0 focus:shadow-none ${isVerified ? 'text-green-400' : ''}`}
                        disabled={isScanning}
                    />

                    {isVerified && (
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-bold uppercase tracking-wider animate-in fade-in zoom-in duration-300">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Verified
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isScanning || !query.trim()}
                        className="cyber-button flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isScanning ? 'Scanning...' : 'Analyze'}
                    </button>
                </div>
            </div>
        </form>
    );
}
