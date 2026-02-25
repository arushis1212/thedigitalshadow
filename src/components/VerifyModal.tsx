'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { X, ShieldCheck, Loader2 } from 'lucide-react';

interface VerifyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm?: () => void;
}

export default function VerifyModal({ isOpen, onClose }: VerifyModalProps) {
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        try {
            // Flag so page.tsx knows this is an auth redirect, not a normal reload
            sessionStorage.setItem('auth_redirect', 'true');
            await signIn('google');
        } catch (error) {
            console.error('Sign in failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative z-10 w-full max-w-md mx-4 rounded-2xl overflow-hidden"
                style={{ background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 20, 50, 0.95))', border: '1px solid rgba(255,255,255,0.1)' }}>

                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="px-8 pt-8 pb-4 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center">
                        <ShieldCheck className="w-8 h-8 text-cyan-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1">Identity Verification</h3>
                    <p className="text-gray-400 text-sm">
                        Please sign in with Google to confirm you are the owner of the email address being scanned.
                    </p>
                </div>

                {/* Info banner */}
                <div className="mx-8 px-4 py-3 rounded-lg bg-cyan-400/5 border border-cyan-400/10 mb-6">
                    <p className="text-xs text-cyan-400/80 leading-relaxed">
                        🔒 Verification ensures that sensitive personal data is only visible to the legitimate owner.
                    </p>
                </div>

                {/* Actions */}
                <div className="px-8 pb-8 flex flex-col gap-3">
                    <button
                        onClick={handleGoogleSignIn}
                        disabled={isLoading}
                        className="w-full px-6 py-3 rounded-xl bg-white text-black font-bold hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    >
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                        )}
                        Sign in with Google
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full px-6 py-2 text-gray-500 text-sm font-medium hover:text-gray-300 transition-all"
                    >
                        Maybe later
                    </button>
                </div>
            </div>
        </div>
    );
}
