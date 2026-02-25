import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ScanResult } from '@/lib/types';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const SYSTEM_PROMPT = `You are a high-level security consultant. Write a detailed "Attacker's Playbook" titled "THE ATTACKER'S PLAN" based on the user data provided.

Analyze the data and identify at least 3 specific attack scenarios. For each scenario, explicitly link what data was found to how it can be abused.

Use exactly this structure for EACH attack scenario:

**[ATTACK NAME] ATTACK**
[A short sentence using the format: "Because your [Found Data] was revealed, hackers could [Specific Attack Action] to [Potential Outcome]."]
- [Specific step 1 regarding how this data makes you vulnerable]
- [Specific step 2 regarding how this data makes you vulnerable]

Rules:
- Be highly specific and personalized to the data.
- Write like you're explaining to a friend. No fluff or extra commentary.
- Use "you" and "your" consistently.
- Exactly 2 bullet points per attack section.
- Never use jargon like "credential stuffing" or "attack vector".`;

function generateFallbackNarrative(scanResult: ScanResult): string {
    const profilePlatforms = scanResult.profiles.slice(0, 2).map(p => p.platform).join(' and ');
    const hasPasswords = scanResult.riskBreakdown.passwordsExposed;
    const location = scanResult.personalInfo?.location;

    let narrative = `**SOCIAL ENGINEERING ATTACK**\n`;
    narrative += `Because your ${profilePlatforms || 'public profile'} details and ${location ? 'location in ' + location : 'interests'} were revealed, hackers could craft a convincing message to steal your keys.\n`;
    narrative += `- They pose as a trusted neighbor or a local support agent.\n`;
    narrative += `- They use your public interests to make the trick feel personal.\n\n`;

    if (hasPasswords) {
        narrative += `**CREDENTIAL ATTACK**\n`;
        narrative += `Because your leaked passwords from past breaches were revealed, hackers could break into your current primary accounts.\n`;
        narrative += `- They use automated tools to try your password on banking and social media.\n`;
        narrative += `- Reusing passwords across different sites is the biggest vulnerability here.\n\n`;
    }

    narrative += `**IDENTITY IMPERSONATION**\n`;
    narrative += `Because enough public details like your name and ${location || 'online handles'} were revealed, someone could try to pose as you to access private info.\n`;
    narrative += `- They contact companies you use and try to "verify" your identity.\n`;
    narrative += `- They piece together your bio and location to build a fake profile of you.`;

    return narrative;
}

function formatDataForPrompt(scanResult: ScanResult): string {
    let data = `Target: ${scanResult.query} (${scanResult.queryType})\n`;
    data += `Risk Score: ${scanResult.riskScore}/100\n\n`;

    if (scanResult.breaches.length > 0) {
        data += `DATA BREACHES (${scanResult.breaches.length}):\n`;
        scanResult.breaches.forEach(breach => {
            data += `- ${breach.name} (${breach.breachDate}): ${breach.dataClasses.join(', ')}\n`;
        });
        data += '\n';
    }

    if (scanResult.profiles.length > 0) {
        data += `PUBLIC PROFILES (${scanResult.profiles.length}):\n`;
        scanResult.profiles.forEach(profile => {
            data += `- ${profile.platform}: ${profile.url}\n`;
        });
        data += '\n';
    }

    if (scanResult.personalInfo) {
        data += `SENSITIVE PERSONAL INFO FOUND:\n`;
        if (scanResult.personalInfo.location) data += `- Location: ${scanResult.personalInfo.location}\n`;
        if (scanResult.personalInfo.employer) data += `- Employer: ${scanResult.personalInfo.employer}\n`;
        if (scanResult.personalInfo.familyMembers) data += `- Family: ${scanResult.personalInfo.familyMembers.join(', ')}\n`;
        if (scanResult.personalInfo.dateOfBirth) data += `- DOB: ${scanResult.personalInfo.dateOfBirth}\n`;
        if (scanResult.personalInfo.financialInfo) data += `- Financial: ${scanResult.personalInfo.financialInfo}\n`;
        if (scanResult.personalInfo.recentTravel) data += `- Travel: ${scanResult.personalInfo.recentTravel.join(', ')}\n`;
        if (scanResult.personalInfo.vehicleInfo) data += `- Vehicle: ${scanResult.personalInfo.vehicleInfo}\n`;
        data += '\n';
    }

    data += `EXPOSED DATA TYPES: ${scanResult.exposedDataTypes.join(', ')}\n`;
    data += `PASSWORDS LEAKED: ${scanResult.riskBreakdown.passwordsExposed ? 'YES' : 'No'}\n`;

    return data;
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const scanResult = body.scanResult;

        console.log('Narrator API called, scanResult exists:', !!scanResult);

        if (!scanResult) {
            return NextResponse.json(
                { error: 'Scan result is required' },
                { status: 400 }
            );
        }

        // Check if Gemini API key is available
        const apiKey = process.env.GEMINI_API_KEY;
        console.log('GEMINI_API_KEY exists:', !!apiKey);
        console.log('GEMINI_API_KEY starts with:', apiKey?.substring(0, 10) + '...');

        if (!apiKey || apiKey === 'your_gemini_key_here') {
            console.log('No valid API key, using fallback');
            return NextResponse.json({
                narrative: generateFallbackNarrative(scanResult),
                generatedAt: new Date().toISOString(),
                isAIGenerated: false,
            });
        }

        // Use Gemini to generate narrative
        console.log('Attempting Gemini API call...');
        const genAI = new GoogleGenerativeAI(apiKey);

        // Use gemini-2.0-flash-exp - the latest experimental model
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

        const prompt = `${SYSTEM_PROMPT}\n\n---\n\nUSER DATA:\n${formatDataForPrompt(scanResult)}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const narrative = response.text();

        console.log('Gemini API success! Narrative length:', narrative.length);

        return NextResponse.json({
            narrative,
            generatedAt: new Date().toISOString(),
            isAIGenerated: true,
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : 'No stack';

        console.error('Narrator API error:', errorMessage);

        // Write error to file for debugging
        const fs = require('fs');
        const errorLog = `Time: ${new Date().toISOString()}\nError: ${errorMessage}\nStack: ${errorStack}\n\n`;
        try {
            fs.appendFileSync('narrator-errors.log', errorLog);
        } catch (e) {
            // ignore file write errors
        }

        // Return fallback on error
        return NextResponse.json({
            narrative: 'Unable to generate AI narrative. Please try again later.',
            generatedAt: new Date().toISOString(),
            isAIGenerated: false,
            error: true,
            errorMessage: errorMessage, // Include error message for debugging
        });
    }
}

