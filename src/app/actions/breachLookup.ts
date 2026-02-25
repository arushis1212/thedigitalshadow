'use server';

// BreachDirectory API lookup with mock/real toggle
// Shield: Checks ENABLE_REAL_API env var before making any real API calls

import { ScanResult, BreachData } from '@/lib/types';
import { getMockPersona } from '@/lib/mocks/personas';
import { calculateRiskScore } from '@/lib/riskScoring';
import { getExposedDataTypes } from '@/lib/hibp';

// ─── Types for BreachDirectory API response ───
interface BreachDirectoryResult {
    email: string;
    hash_password: string;
    password: string;
    sha1: string;
    sources: string[];
}

interface BreachDirectoryResponse {
    success: boolean;
    found: number;
    result: BreachDirectoryResult[];
}

// ─── Map API results to our BreachData format ───
function mapToBreachData(apiResults: BreachDirectoryResult[]): BreachData[] {
    // Group by source to create one BreachData per breach source
    const sourceMap = new Map<string, BreachDirectoryResult[]>();

    apiResults.forEach(entry => {
        (entry.sources || ['Unknown']).forEach(source => {
            const existing = sourceMap.get(source) || [];
            existing.push(entry);
            sourceMap.set(source, existing);
        });
    });

    const breaches: BreachData[] = [];

    sourceMap.forEach((entries, sourceName) => {
        // Determine which data classes were exposed in this breach
        const dataClasses: string[] = ['Email addresses'];
        const hasPassword = entries.some(e => e.password && e.password.length > 0);
        const hasHash = entries.some(e => e.hash_password && e.hash_password.length > 0);

        if (hasPassword) dataClasses.push('Passwords');
        if (hasHash) dataClasses.push('Password hashes');

        breaches.push({
            name: sourceName,
            domain: sourceName.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com',
            breachDate: 'Unknown', // API doesn't provide breach dates
            dataClasses,
            description: `Your data was found in the ${sourceName} breach. ${entries.length} record(s) matched.`,
            pwnCount: entries.length,
        });
    });

    return breaches;
}

// ─── Main lookup function ───
export async function breachLookup(
    query: string
): Promise<{ result: ScanResult; narrative?: string; source: 'mock' | 'real' }> {
    if (!query || query.trim().length < 2) {
        throw new Error('Please enter a valid email or username');
    }

    const sanitizedQuery = query.trim().toLowerCase();
    const enableRealApi = process.env.ENABLE_REAL_API === 'true';

    // ─── MOCK MODE (Shield is ON) ───
    if (!enableRealApi) {
        console.log('🛡️ MOCK MODE: Returning random persona (ENABLE_REAL_API=false)');
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate delay
        const mockData = getMockPersona(sanitizedQuery);
        return { result: mockData.result, narrative: mockData.narrative, source: 'mock' };
    }

    // ─── REAL MODE (Shield is OFF) ───
    console.log(`⚠️ REAL API CALL: "${sanitizedQuery}"`);

    const rapidApiKey = process.env.RAPIDAPI_KEY;
    if (!rapidApiKey) {
        throw new Error('RAPIDAPI_KEY is not set in .env.local');
    }

    try {
        const response = await fetch(
            `https://breachdirectory.p.rapidapi.com/?func=auto&term=${encodeURIComponent(sanitizedQuery)}`,
            {
                method: 'GET',
                headers: {
                    'X-RapidAPI-Key': rapidApiKey,
                    'X-RapidAPI-Host': 'breachdirectory.p.rapidapi.com',
                },
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ BreachDirectory API error:', response.status, errorText);
            throw new Error(`BreachDirectory API returned ${response.status}: ${errorText}`);
        }

        const data: BreachDirectoryResponse = await response.json();
        console.log(`✅ API returned ${data.found} results`);

        // Map API data to our format
        const breaches = data.result && data.result.length > 0
            ? mapToBreachData(data.result)
            : [];

        const exposedDataTypes = getExposedDataTypes(breaches);
        const { score, breakdown } = calculateRiskScore(breaches, []);

        const result: ScanResult = {
            query: sanitizedQuery,
            queryType: sanitizedQuery.includes('@') ? 'email' : 'username',
            breaches,
            profiles: [], // BreachDirectory only does breach lookup, not social profiles
            exposedDataTypes,
            riskScore: score,
            riskBreakdown: breakdown,
            timestamp: new Date().toISOString(),
        };

        return { result, source: 'real' };
    } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        console.error('❌ BreachDirectory lookup failed:', msg);
        throw new Error(`Breach lookup failed: ${msg}`);
    }
}
