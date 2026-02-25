// Profile search using Serper.dev API
// Searches for public social media profiles associated with a username/email

import { ProfileData } from './types';

const SERPER_API_KEY = process.env.SERPER_API_KEY;

const socialPlatforms = [
    { name: 'LinkedIn', searchTerm: 'site:linkedin.com/in/' },
    { name: 'Twitter/X', searchTerm: 'site:twitter.com OR site:x.com' },
    { name: 'Facebook', searchTerm: 'site:facebook.com' },
    { name: 'Instagram', searchTerm: 'site:instagram.com' },
    { name: 'GitHub', searchTerm: 'site:github.com' },
    { name: 'Reddit', searchTerm: 'site:reddit.com/user/' },
];

interface SerperResult {
    title: string;
    link: string;
    snippet: string;
}

interface SerperResponse {
    organic: SerperResult[];
}

async function searchSerper(query: string): Promise<SerperResult[]> {
    if (!SERPER_API_KEY || SERPER_API_KEY === 'your_serper_key_here') {
        // Return mock data if no API key
        return getMockResults(query);
    }

    try {
        const response = await fetch('https://google.serper.dev/search', {
            method: 'POST',
            headers: {
                'X-API-KEY': SERPER_API_KEY,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                q: query,
                num: 10,
            }),
        });

        if (!response.ok) {
            console.error('Serper API error:', response.status);
            return getMockResults(query);
        }

        const data: SerperResponse = await response.json();
        return data.organic || [];
    } catch (error) {
        console.error('Serper API error:', error);
        return getMockResults(query);
    }
}

function getMockResults(query: string): SerperResult[] {
    // Generate deterministic mock results based on query
    const hash = query.split('').reduce((a, b) => a + b.charCodeAt(0), 0);

    const mockProfiles: SerperResult[] = [
        {
            title: `${query} - LinkedIn`,
            link: `https://linkedin.com/in/${query.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
            snippet: `View ${query}'s professional profile on LinkedIn. Software Engineer with 5+ years experience...`,
        },
        {
            title: `${query} (@${query.toLowerCase()}) / X`,
            link: `https://twitter.com/${query.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
            snippet: `The latest posts from ${query}. Tech enthusiast, coffee lover. San Francisco, CA.`,
        },
        {
            title: `${query} - GitHub`,
            link: `https://github.com/${query.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
            snippet: `${query} has 47 repositories. Follow their code on GitHub.`,
        },
        {
            title: `${query} | Facebook`,
            link: `https://facebook.com/${query.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
            snippet: `${query} is on Facebook. Join Facebook to connect with ${query} and others.`,
        },
        {
            title: `${query} (@${query.toLowerCase()}) • Instagram`,
            link: `https://instagram.com/${query.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
            snippet: `1,234 Followers, 567 Following, 89 Posts - See Instagram photos and videos from ${query}`,
        },
    ];

    // Return subset based on hash
    const numResults = 3 + (hash % 3);
    return mockProfiles.slice(0, numResults);
}

function detectPlatform(url: string): string {
    if (url.includes('linkedin.com')) return 'LinkedIn';
    if (url.includes('twitter.com') || url.includes('x.com')) return 'Twitter/X';
    if (url.includes('facebook.com')) return 'Facebook';
    if (url.includes('instagram.com')) return 'Instagram';
    if (url.includes('github.com')) return 'GitHub';
    if (url.includes('reddit.com')) return 'Reddit';
    if (url.includes('tiktok.com')) return 'TikTok';
    if (url.includes('youtube.com')) return 'YouTube';
    return 'Website';
}

export async function searchProfiles(query: string): Promise<ProfileData[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));

    const profiles: ProfileData[] = [];
    const seenUrls = new Set<string>();

    // Search for the username/email across platforms
    const searchQuery = `"${query}" (${socialPlatforms.map(p => p.searchTerm).join(' OR ')})`;
    const results = await searchSerper(searchQuery);

    for (const result of results) {
        // Deduplicate by URL
        const normalizedUrl = result.link.toLowerCase().replace(/\/$/, '');
        if (seenUrls.has(normalizedUrl)) continue;
        seenUrls.add(normalizedUrl);

        profiles.push({
            platform: detectPlatform(result.link),
            url: result.link,
            title: result.title,
            snippet: result.snippet,
        });
    }

    return profiles;
}
