'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Shield, Eye, AlertTriangle, Globe, Lock, Unlock, RotateCcw, Sparkles, ShieldCheck, MapPin, Briefcase, GraduationCap, Phone, User, Calendar, Users, DollarSign, Plane, Home as HomeIcon, Car, Info } from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import ForceGraph from '@/components/ForceGraph';
import AttackerPanel from '@/components/AttackerPanel';
import VulnerabilityScore from '@/components/VulnerabilityScore';
import Recommendations from '@/components/Recommendations';
import ExportReport from '@/components/ExportReport';
import VerifyModal from '@/components/VerifyModal';
import { scanUser, generateDataPoints } from '@/app/actions/scanUser';
import { MOCK_MODE } from '@/lib/config';
import { ScanResult, DataPoint, NarratorResponse, PersonalInfo } from '@/lib/types';

export default function Home() {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([]);
  const [narrative, setNarrative] = useState<string>('');
  const [isNarrativeLoading, setIsNarrativeLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  // Intentional Reveal Gate — never persisted, resets on every page load
  const [isUnveiled, setIsUnveiled] = useState(false);

  // Force re-auth on every normal reload; auto-unveil on auth redirect return
  useEffect(() => {
    const isAuthReturn = sessionStorage.getItem('auth_redirect');

    if (isAuthReturn) {
      // Coming back from Google Auth — consume the flag, keep session, auto-unveil
      sessionStorage.removeItem('auth_redirect');
      setIsUnveiled(true);
    } else if (session) {
      // Normal reload with a stale session — sign out silently
      signOut({ redirect: false });
    }
    // Only run once on mount + when session first resolves
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  // Restore scan data after Auth redirect (but NOT verification or unveil status)
  useEffect(() => {
    const savedQuery = sessionStorage.getItem('last_scan_query');
    const savedResult = sessionStorage.getItem('last_scan_result');
    const savedNarrative = sessionStorage.getItem('last_scan_narrative');

    if (savedQuery && savedResult) {
      try {
        const result = JSON.parse(savedResult);
        setSearchQuery(savedQuery);
        setScanResult(result);
        setScanComplete(true);
        if (savedNarrative) setNarrative(savedNarrative);
        generateDataPoints(result).then(setDataPoints);
      } catch (e) {
        console.error("Failed to restore scan data:", e);
      }
    }
  }, []);

  // Real identity verification: Only true if logged in AND email matches the search query EXACTLY
  const userEmail = session?.user?.email?.toLowerCase();
  const scannedEmail = searchQuery.toLowerCase().trim();
  const isValidatedOwner = !!(session && userEmail === scannedEmail);
  // isVerified = eligible, isUnveiled = intentionally revealed
  const isVerified = isValidatedOwner;

  const handleReset = () => {
    setSearchQuery('');
    setScanComplete(false);
    setScanResult(null);
    setDataPoints([]);
    setNarrative('');
    setError(null);
    setShowVerifyModal(false);
    setIsUnveiled(false);

    // Clear session storage on manual reset
    sessionStorage.removeItem('last_scan_query');
    sessionStorage.removeItem('last_scan_result');
    sessionStorage.removeItem('last_scan_narrative');
  };

  // Verification via modal — reveal personal info inline
  const handleOpenVerify = () => setShowVerifyModal(true);
  const handleConfirmVerify = () => {
    setShowVerifyModal(false);
  };

  // Auto re-scan when isUnveiled becomes true (after auth redirect)
  useEffect(() => {
    if (isUnveiled && searchQuery && scanComplete && !isScanning) {
      handleSearch(searchQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUnveiled]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setIsScanning(true);
    setScanComplete(false);
    setError(null);
    setNarrative('');
    setShowVerifyModal(false);

    try {
      const { result, narrative: mockNarrative } = await scanUser(query);

      // PRODUCTION FIX: Merge real session data into personalInfo if verified
      if (isValidatedOwner && session?.user) {
        const enhancedInfo: PersonalInfo = {
          ...(result.personalInfo || {}),
          location: result.personalInfo?.location || (session.user as any).location || 'San Francisco, CA', // Mock location fallback if session doesn't have it
          knownAliases: result.personalInfo?.knownAliases || [session.user.name || 'Anonymous'],
        };
        result.personalInfo = enhancedInfo;
      }

      setScanResult(result);

      // Persist results so they survive the Google Auth redirect
      sessionStorage.setItem('last_scan_query', query);
      sessionStorage.setItem('last_scan_result', JSON.stringify(result));

      // Generate data points for visualization
      const points = await generateDataPoints(result);
      setDataPoints(points);

      setIsScanning(false);
      setScanComplete(true);

      // If mock mode returned a narrative, use it; otherwise fetch from API
      if (mockNarrative) {
        setNarrative(mockNarrative);
      } else {
        fetchNarrative(result);
      }
    } catch (err) {
      setIsScanning(false);
      setError(err instanceof Error ? err.message : 'An error occurred during scanning');
    }
  };

  const fetchNarrative = async (result: ScanResult) => {
    setIsNarrativeLoading(true);
    try {
      const response = await fetch('/api/narrator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scanResult: result }),
      });

      if (response.ok) {
        const data: NarratorResponse = await response.json();
        setNarrative(data.narrative);
        sessionStorage.setItem('last_scan_narrative', data.narrative);
      }
    } catch (err) {
      console.error('Failed to fetch narrative:', err);
    } finally {
      setIsNarrativeLoading(false);
    }
  };

  return (
    <main className="min-h-screen relative overflow-hidden">

      {/* Hero Section */}
      <section className="relative z-10 pt-14 pb-4 px-4">
        <div className="max-w-6xl mx-auto text-center">
          {/* Logo & Title */}
          <div className="mb-6 flex flex-col items-center justify-center">
            <h1 className="text-5xl md:text-6xl font-light tracking-tight mb-3">
              <span className="text-white op-80">The </span>
              <span className="text-cyan-400 font-bold glow-text-sm">Digital</span>
              <span className="text-white op-80"> Shadow</span>
            </h1>
            <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
          </div>

          {/* Tagline */}
          <div className="mb-8">
            <p className="text-lg text-gray-400 max-w-4xl mx-auto font-light leading-relaxed">
              Explore your footprint through a hacker&apos;s perspective. Uncover your digital attack surface before they do.
            </p>
          </div>



          {/* Demo Mode Badge */}
          {MOCK_MODE && (
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-purple-500/20 border border-purple-500/50">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-purple-400 text-sm font-medium">DEMO MODE</span>
              <span className="text-gray-600 text-[11px]">Using simulated data</span>
            </div>
          )}

          {!MOCK_MODE && <div className="mb-8" />}

          {/* Search Bar */}
          <SearchBar
            onSearch={handleSearch}
            isScanning={isScanning}
            isVerified={isVerified}
            initialQuery={searchQuery}
          />

          {/* Error Display */}
          {error && (
            <div className="mt-4 text-pink-500 text-sm cyber-glass inline-block px-4 py-2">
              {error}
            </div>
          )}
        </div>
      </section>

      {/* Results Section */}
      {(isScanning || scanComplete) && (
        <section className="relative z-10 px-4 pb-16">
          <div className="max-w-7xl mx-auto">
            {/* Scanning animation */}
            {isScanning && (
              <div className="text-center py-20">
                <div className="inline-flex items-center gap-3 cyber-glass px-8 py-4 mb-4">
                  <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse" />
                  <span className="text-cyan-400 font-mono text-lg">
                    SCANNING DIGITAL FOOTPRINT...
                  </span>
                </div>
                <p className="text-gray-500 font-mono text-sm">
                  Checking data breaches, searching public profiles...
                </p>
              </div>
            )}

            {/* Results Grid */}
            {scanComplete && scanResult && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left column — Public graph + Deep Shadow (when unveiled) */}
                <div className="lg:col-span-2 flex flex-col gap-6 h-full">
                  {/* Public Constellation */}
                  <div className="cyber-glass p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <Globe className="w-5 h-5 text-cyan-400" />
                      <h2 className="text-lg font-bold text-white tracking-tight">Your Digital Constellation</h2>
                    </div>
                    <ForceGraph scanResult={scanResult} mode="public" />

                    {/* Breach Summary */}
                    {scanResult.breaches.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <h3 className="text-sm font-semibold text-pink-500 mb-2">
                          ⚠️ Found in {scanResult.breaches.length} Data Breaches
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {scanResult.breaches.map((breach, i) => (
                            <a
                              key={i}
                              href={`https://www.google.com/search?q=${encodeURIComponent(breach.name + ' data breach news')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs px-2 py-1 bg-pink-500/20 text-pink-400 rounded hover:bg-pink-500/30 transition-colors cursor-pointer"
                            >
                              {breach.name}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Profile Summary */}
                    {scanResult.profiles.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <h3 className="text-sm font-semibold text-cyan-400 mb-2">
                          🔍 {scanResult.profiles.length} Public Profiles Found
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {scanResult.profiles.map((profile, i) => (
                            <a
                              key={i}
                              href={profile.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded hover:bg-cyan-500/30 transition-colors"
                            >
                              {profile.platform}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ═══ THE DEEP SHADOW: VERIFIED CORE ═══ */}
                  {isUnveiled && (
                    <div className="cyber-glass p-8 border-indigo-500/30">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-3 h-3 rounded-full bg-indigo-500 animate-pulse" style={{ boxShadow: '0 0 12px rgba(99,102,241,0.6)' }} />
                        <h2 className="text-lg font-bold text-indigo-300 tracking-wide uppercase">The Deep Shadow: Verified Core</h2>
                      </div>
                      <p className="text-gray-500 text-xs mb-4 pl-6 font-medium">Sensitive intelligence derived from verified identity — this is what an attacker sees after confirming who you are.</p>
                      <ForceGraph scanResult={scanResult} mode="verified" />
                    </div>
                  )}
                </div>

                {/* Right Panel */}
                <div className="flex flex-col gap-8 h-full">
                  {/* Vulnerability Score */}
                  <VulnerabilityScore score={scanResult.riskScore} />

                  {/* Attacker Panel */}
                  <AttackerPanel
                    username={searchQuery}
                    score={scanResult.riskScore}
                    dataPoints={dataPoints}
                    narrative={narrative}
                    isLoading={isNarrativeLoading}
                    breaches={scanResult.breaches}
                    profiles={scanResult.profiles}
                    isVerified={isUnveiled}
                    onVerify={handleOpenVerify}
                  />

                  {/* Export Report */}
                  <div className="mt-auto">
                    <ExportReport
                      scanResult={scanResult}
                      narrative={narrative}
                      isVerified={isUnveiled}
                      onVerify={handleOpenVerify}
                    />
                  </div>
                </div>

                {/* Identity Verification — Banner or Verified Personal Info */}
                {/* Show Verify banner (not logged in), or nothing (logged in but not matching), or Personal Info (unveiled) */}
                {!isUnveiled && !isValidatedOwner && !session ? (
                  <div className="lg:col-span-3">
                    <div className="glass-card overflow-hidden border border-cyan-500/20">
                      <div className="relative px-8 py-8 flex flex-col sm:flex-row items-center gap-6"
                        style={{ background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.08), rgba(168, 85, 247, 0.08))' }}>
                        <div className="flex-shrink-0">
                          <div className="w-16 h-16 rounded-full bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center">
                            <ShieldCheck className="w-7 h-7 text-cyan-400" />
                          </div>
                        </div>
                        <div className="flex-1 text-center sm:text-left">
                          <h3 className="text-lg font-bold text-white mb-1">Want to see everything?</h3>
                          <p className="text-gray-400 text-sm">
                            Verify your identity to unlock the full report — including your location, employer, education, phone number, and more.
                          </p>
                        </div>
                        <button
                          onClick={handleOpenVerify}
                          className="flex-shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 text-white font-semibold hover:from-cyan-500/30 hover:to-purple-500/30 hover:scale-105 transition-all"
                        >
                          <ShieldCheck className="w-5 h-5 text-cyan-400" />
                          Verify Identity to See Full Shadow
                        </button>
                      </div>
                    </div>
                  </div>
                ) : isUnveiled ? (
                  <div className="lg:col-span-3">
                    <div className="glass-card overflow-hidden border border-purple-500/20">
                      {/* Verified header */}
                      <div className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border-b border-purple-500/20 px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Lock className="w-5 h-5 text-purple-400" />
                          <h2 className="font-semibold text-white">Personal Information</h2>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-green-400">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                          Identity Verified
                        </div>
                      </div>

                      {/* Personal info grid */}
                      <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {scanResult.personalInfo?.location && (
                            <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                              <div className="flex items-center gap-2 mb-1">
                                <MapPin className="w-4 h-4 text-purple-400" />
                                <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Location</span>
                              </div>
                              <p className="text-white font-medium pl-6">{scanResult.personalInfo.location}</p>
                            </div>
                          )}
                          {scanResult.personalInfo?.employer && (
                            <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                              <div className="flex items-center gap-2 mb-1">
                                <Briefcase className="w-4 h-4 text-purple-400" />
                                <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Employer</span>
                              </div>
                              <p className="text-white font-medium pl-6">{scanResult.personalInfo.employer}</p>
                            </div>
                          )}
                          {scanResult.personalInfo?.education && (
                            <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                              <div className="flex items-center gap-2 mb-1">
                                <GraduationCap className="w-4 h-4 text-purple-400" />
                                <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Education</span>
                              </div>
                              <p className="text-white font-medium pl-6">{scanResult.personalInfo.education}</p>
                              {scanResult.personalInfo.fieldOfStudy && (
                                <p className="text-gray-400 text-sm pl-6">{scanResult.personalInfo.fieldOfStudy}</p>
                              )}
                            </div>
                          )}
                          {scanResult.personalInfo?.phone && (
                            <div className="bg-pink-500/10 border border-pink-500/20 rounded-xl p-4">
                              <div className="flex items-center gap-2 mb-1">
                                <Phone className="w-4 h-4 text-pink-400" />
                                <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Phone</span>
                              </div>
                              <p className="text-white font-medium pl-6">{scanResult.personalInfo.phone}</p>
                            </div>
                          )}
                          {scanResult.personalInfo?.address && (
                            <div className="bg-pink-500/10 border border-pink-500/20 rounded-xl p-4">
                              <div className="flex items-center gap-2 mb-1">
                                <MapPin className="w-4 h-4 text-pink-400" />
                                <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Physical Address</span>
                              </div>
                              <p className="text-white font-medium pl-6">{scanResult.personalInfo.address}</p>
                            </div>
                          )}
                          {scanResult.personalInfo?.dateOfBirth && (
                            <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                              <div className="flex items-center gap-2 mb-1">
                                <Calendar className="w-4 h-4 text-purple-400" />
                                <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Date of Birth</span>
                              </div>
                              <p className="text-white font-medium pl-6">{scanResult.personalInfo.dateOfBirth}</p>
                            </div>
                          )}
                          {scanResult.personalInfo?.financialInfo && (
                            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                              <div className="flex items-center gap-2 mb-1">
                                <DollarSign className="w-4 h-4 text-green-400" />
                                <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Financial Estimate</span>
                              </div>
                              <p className="text-white font-medium pl-6">{scanResult.personalInfo.financialInfo}</p>
                            </div>
                          )}
                          {scanResult.personalInfo?.propertyValue && (
                            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                              <div className="flex items-center gap-2 mb-1">
                                <HomeIcon className="w-4 h-4 text-green-400" />
                                <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Property</span>
                              </div>
                              <p className="text-white font-medium pl-6">{scanResult.personalInfo.propertyValue}</p>
                            </div>
                          )}
                          {scanResult.personalInfo?.vehicleInfo && (
                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                              <div className="flex items-center gap-2 mb-1">
                                <Car className="w-4 h-4 text-blue-400" />
                                <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Vehicle</span>
                              </div>
                              <p className="text-white font-medium pl-6">{scanResult.personalInfo.vehicleInfo}</p>
                            </div>
                          )}
                        </div>

                        {/* Known Aliases */}
                        {scanResult.personalInfo?.knownAliases && scanResult.personalInfo.knownAliases.length > 0 && (
                          <div className="mt-5 pt-5 border-t border-white/5">
                            <div className="flex items-center gap-2 mb-3">
                              <User className="w-4 h-4 text-cyan-400" />
                              <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Known Aliases</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {scanResult.personalInfo.knownAliases.map((alias, i) => (
                                <span key={i} className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-lg text-cyan-400 text-sm font-mono">
                                  {alias}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Family Members */}
                        {scanResult.personalInfo?.familyMembers && scanResult.personalInfo.familyMembers.length > 0 && (
                          <div className="mt-5 pt-5 border-t border-white/5">
                            <div className="flex items-center gap-2 mb-3">
                              <Users className="w-4 h-4 text-pink-400" />
                              <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Known Relatives / Associations</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {scanResult.personalInfo.familyMembers.map((member, i) => (
                                <span key={i} className="px-3 py-1 bg-pink-500/10 border border-pink-500/20 rounded-lg text-pink-400 text-sm">
                                  {member}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Recent Travel */}
                        {scanResult.personalInfo?.recentTravel && scanResult.personalInfo.recentTravel.length > 0 && (
                          <div className="mt-5 pt-5 border-t border-white/5">
                            <div className="flex items-center gap-2 mb-3">
                              <Plane className="w-4 h-4 text-blue-400" />
                              <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Recent Travel Itinerary</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {scanResult.personalInfo.recentTravel.map((travel, i) => (
                                <span key={i} className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400 text-sm">
                                  {travel}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : null}


                {/* Email Mismatch Notice */}
                {session && !isValidatedOwner && (
                  <div className="lg:col-span-3">
                    <div className="cyber-glass p-6 border-amber-500/30 bg-amber-500/5 mb-8">
                      <div className="flex items-center gap-4 text-left">
                        <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
                          <Info className="w-6 h-6 text-amber-500" />
                        </div>
                        <div>
                          <h3 className="text-white font-bold">Verification Limited</h3>
                          <p className="text-gray-400 text-sm font-medium">
                            You are signed in as <span className="text-amber-400">{session.user?.email}</span>.
                            However, deep personal insights are only revealed for your own verified email address.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Full Width Recommendations */}
                <div className="lg:col-span-3">
                  <Recommendations
                    riskBreakdown={scanResult.riskBreakdown}
                    riskScore={scanResult.riskScore}
                    scanResult={scanResult}
                    isVerified={isUnveiled}
                    onVerify={handleOpenVerify}
                  />
                </div>

                {/* Immediate Assistance Section (Unblurred) - Moved here */}
                {scanComplete && (
                  <div className="lg:col-span-3">
                    <div className="cyber-glass p-8 border-amber-500/20">
                      <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="text-center md:text-left">
                          <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
                            <ShieldCheck className="w-6 h-6 text-amber-500" />
                            <h2 className="text-xl font-bold text-white uppercase tracking-tight">Immediate Assistance</h2>
                          </div>
                          <p className="text-gray-400 max-w-xl text-sm">
                            If you believe your identity has been stolen or your safety is at risk, please use these verified official resources.
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full md:w-auto">
                          <a
                            href="https://www.identitytheft.gov"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-all group"
                          >
                            <p className="text-amber-500 font-bold text-sm mb-1 group-hover:text-amber-400">IdentityTheft.gov</p>
                            <p className="text-[11px] text-gray-500">Official FTC Resource</p>
                          </a>

                          <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                            <p className="text-cyan-400 font-bold text-sm mb-1">Crisis Text Line</p>
                            <p className="text-[11px] text-gray-500">Text <span className="text-white font-mono">HOME</span> to <span className="text-white font-mono">741741</span></p>
                          </div>

                          <a
                            href="https://ssd.eff.org/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-all group sm:col-span-2"
                          >
                            <p className="text-blue-400 font-bold text-sm mb-1 group-hover:text-blue-300">Electronic Frontier Foundation (EFF)</p>
                            <p className="text-[11px] text-gray-500">Surveillance Self-Defense Guide</p>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Scan Again Button */}
                <div className="lg:col-span-3 text-center pt-4">
                  <button
                    onClick={handleReset}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-all hover:scale-105 border border-cyan-500/30"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Scan Another Target
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Features Section (shown before search) */}
      {!isScanning && !scanComplete && (
        <section className="relative z-10 px-4 py-16">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: Eye,
                  title: 'Attack Surface Mapping',
                  description: 'Visualize what data about you is publicly accessible across the internet.',
                  color: 'cyan',
                },
                {
                  icon: AlertTriangle,
                  title: 'Threat Assessment',
                  description: 'Understand how attackers could chain your exposed data together.',
                  color: 'pink',
                },
                {
                  icon: Lock,
                  title: 'Security Score',
                  description: 'Get a vulnerability score and actionable steps to reduce your exposure.',
                  color: 'purple',
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="glass-card p-6 hover:scale-105 transition-transform duration-300 group"
                >
                  <feature.icon
                    className={`w-10 h-10 mb-4 ${feature.color === 'cyan' ? 'text-cyan-400' :
                      feature.color === 'pink' ? 'text-pink-500' :
                        'text-purple-500'
                      } group-hover:scale-110 transition-transform`}
                  />
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-400 text-sm">{feature.description}</p>
                </div>
              ))}
            </div>

            {/* Warning Banner */}
            <div className="mt-12 danger-zone glass-card p-6 flex items-start gap-4">
              <Unlock className="w-8 h-8 text-pink-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Your data is more exposed than you think
                </h3>
                <p className="text-gray-400 text-sm">
                  The average person has their information exposed in <span className="text-pink-500 font-semibold">5+ data breaches</span>.
                  Social media, public records, and forgotten accounts create a trail that attackers exploit daily.
                  Enter your username or email above to see your digital shadow.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="relative z-10 py-8 px-4 border-t border-white/5">
        <div className="max-w-6xl mx-auto text-center text-gray-500 text-sm">
          <p>
            <span className="text-cyan-400">The Digital Shadow</span>
          </p>
          <p className="mt-2 text-xs">
            No actual hacking or unauthorized access is performed. Data breach info is simulated for educational purposes.
          </p>
          <p className="mt-4 text-[11px] text-gray-600 max-w-lg mx-auto leading-relaxed">
            🔒 <span className="text-gray-500">Privacy Notice:</span> We use Google Authentication only for high-level identity verification. We never store your password, tokens, or personal data found during the scan.
          </p>
        </div>
      </footer>

      {/* Verify Identity Modal */}
      <VerifyModal
        isOpen={showVerifyModal}
        onClose={() => setShowVerifyModal(false)}
      />
    </main>
  );
}
