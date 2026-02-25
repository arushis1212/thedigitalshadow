// Have I Been Pwned mock implementation
// Note: Real HIBP API requires paid subscription ($3.50/month)
// This simulates realistic breach data for educational purposes

import { BreachData } from './types';

// Simulated breach database
const mockBreaches: BreachData[] = [
    {
        name: 'LinkedIn',
        domain: 'linkedin.com',
        breachDate: '2021-06-22',
        dataClasses: ['Email addresses', 'Names', 'Phone numbers', 'Professional info'],
        description: 'In June 2021, 700 million LinkedIn user records were scraped and posted for sale.',
        pwnCount: 700000000,
    },
    {
        name: 'Adobe',
        domain: 'adobe.com',
        breachDate: '2013-10-04',
        dataClasses: ['Email addresses', 'Passwords', 'Password hints'],
        description: 'In October 2013, 153 million Adobe accounts were breached.',
        pwnCount: 153000000,
    },
    {
        name: 'Dropbox',
        domain: 'dropbox.com',
        breachDate: '2012-07-01',
        dataClasses: ['Email addresses', 'Passwords'],
        description: 'In mid-2012, Dropbox suffered a data breach exposing stored credentials.',
        pwnCount: 68648009,
    },
    {
        name: 'MyFitnessPal',
        domain: 'myfitnesspal.com',
        breachDate: '2018-02-01',
        dataClasses: ['Email addresses', 'Passwords', 'Usernames'],
        description: 'In February 2018, Under Armour\'s MyFitnessPal was breached.',
        pwnCount: 143606147,
    },
    {
        name: 'Canva',
        domain: 'canva.com',
        breachDate: '2019-05-24',
        dataClasses: ['Email addresses', 'Names', 'Usernames', 'Geographic locations'],
        description: 'In May 2019, Canva suffered a breach impacting 137 million users.',
        pwnCount: 137272116,
    },
    {
        name: 'Twitter',
        domain: 'twitter.com',
        breachDate: '2023-01-05',
        dataClasses: ['Email addresses', 'Names', 'Usernames', 'Phone numbers'],
        description: 'In early 2023, over 200 million Twitter records were leaked.',
        pwnCount: 211524284,
    },
];

function hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash);
}

export async function checkBreaches(email: string): Promise<BreachData[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));

    // Use hash of email to deterministically select breaches
    // This makes the same email always return the same breaches
    const hash = hashString(email.toLowerCase());
    const numBreaches = 2 + (hash % 4); // 2-5 breaches

    const selectedBreaches: BreachData[] = [];
    const shuffled = [...mockBreaches].sort(() => (hash % 2) - 0.5);

    for (let i = 0; i < Math.min(numBreaches, shuffled.length); i++) {
        selectedBreaches.push(shuffled[i]);
    }

    return selectedBreaches;
}

export function hasPasswordExposed(breaches: BreachData[]): boolean {
    return breaches.some(b => b.dataClasses.includes('Passwords'));
}

export function getExposedDataTypes(breaches: BreachData[]): string[] {
    const types = new Set<string>();
    breaches.forEach(b => b.dataClasses.forEach(dc => types.add(dc)));
    return Array.from(types);
}
