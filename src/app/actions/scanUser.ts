'use server';

// Main server action for scanning a user's digital footprint
// Branches on ENABLE_REAL_API: true → real BreachDirectory API, false → mock personas
// No data is persisted - everything stays in memory

import { checkBreaches, getExposedDataTypes } from '@/lib/hibp';
import { searchProfiles } from '@/lib/profileSearch';
import { calculateRiskScore } from '@/lib/riskScoring';
import { ScanResult, DataPoint } from '@/lib/types';
import { getMockPersona } from '@/lib/mocks/personas';
import { MOCK_MODE } from '@/lib/config';
import { breachLookup } from './breachLookup';

function isEmail(query: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(query);
}

export async function scanUser(query: string): Promise<{ result: ScanResult; narrative?: string }> {
    if (!query || query.trim().length < 2) {
        throw new Error('Please enter a valid username or email');
    }

    const sanitizedQuery = query.trim().toLowerCase();
    const enableRealApi = process.env.ENABLE_REAL_API === 'true';

    // ─── BRANCH 1: Real BreachDirectory API ───
    if (enableRealApi) {
        try {
            const { result, narrative, source } = await breachLookup(sanitizedQuery);
            console.log(`✅ Scan complete via ${source} source — ${result.breaches.length} breaches found`);

            // If breachLookup returned real data, also try to get social profiles
            // (these come from Serper, not BreachDirectory)
            if (source === 'real') {
                try {
                    const profiles = await searchProfiles(sanitizedQuery);
                    result.profiles = profiles;

                    // Recalculate risk score with profiles included
                    const { score, breakdown } = calculateRiskScore(result.breaches, profiles);
                    result.riskScore = score;
                    result.riskBreakdown = breakdown;
                    result.exposedDataTypes = getExposedDataTypes(result.breaches);
                } catch (profileErr) {
                    console.log('⚠️ Profile search failed, continuing with breaches only:', profileErr);
                    // Breaches still work, just no social profiles
                }
            }

            return { result, narrative };
        } catch (error) {
            // Real API failed — fall through to mock mode
            const msg = error instanceof Error ? error.message : String(error);
            console.error('❌ Real API failed, falling back to mock data:', msg);
        }
    }

    // ─── BRANCH 2: Mock Mode (shield ON or real API failed) ───
    console.log('🛡️ Using mock persona data');
    await new Promise(resolve => setTimeout(resolve, 1500));
    const mockData = getMockPersona(sanitizedQuery);
    return { result: mockData.result, narrative: mockData.narrative };
}

export async function generateDataPoints(scanResult: ScanResult): Promise<DataPoint[]> {
    const dataPoints: DataPoint[] = [];
    let id = 1;

    // Email exposure
    if (scanResult.exposedDataTypes.some(t => t.toLowerCase().includes('email'))) {
        dataPoints.push({
            id: id++,
            label: 'Email',
            type: 'identity',
            exposed: true,
            details: `Found in ${scanResult.breaches.length} breaches`,
        });
    } else {
        dataPoints.push({
            id: id++,
            label: 'Email',
            type: 'identity',
            exposed: false,
        });
    }

    // Social media based on profiles found
    const hasSocialMedia = scanResult.profiles.length > 0;
    dataPoints.push({
        id: id++,
        label: 'Social Media',
        type: 'social',
        exposed: hasSocialMedia,
        details: hasSocialMedia ? `${scanResult.profiles.length} profiles found` : undefined,
    });

    // Location data — kept blurred/locked for now (verification layer TBD)
    const hasLocation = scanResult.exposedDataTypes.some(t =>
        t.toLowerCase().includes('location') ||
        t.toLowerCase().includes('geographic') ||
        t.toLowerCase().includes('address')
    );
    dataPoints.push({
        id: id++,
        label: 'Location',
        type: 'location',
        exposed: hasLocation,
        // Details intentionally omitted — sensitive data stays locked
    });

    // Phone — kept blurred/locked for now (verification layer TBD)
    const hasPhone = scanResult.exposedDataTypes.some(t =>
        t.toLowerCase().includes('phone')
    );
    dataPoints.push({
        id: id++,
        label: 'Phone',
        type: 'contact',
        exposed: hasPhone,
        // Details intentionally omitted — sensitive data stays locked
    });

    // Passwords
    const hasPasswords = scanResult.riskBreakdown.passwordsExposed;
    dataPoints.push({
        id: id++,
        label: 'Passwords',
        type: 'credential',
        exposed: hasPasswords,
        details: hasPasswords ? 'CRITICAL: Passwords leaked!' : undefined,
    });

    // Network/websites
    dataPoints.push({
        id: id++,
        label: 'Websites',
        type: 'web',
        exposed: scanResult.profiles.length > 2,
        details: `Linked to ${scanResult.breaches.map(b => b.domain).join(', ')}`,
    });

    return dataPoints;
}
