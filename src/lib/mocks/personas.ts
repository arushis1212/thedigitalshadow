// Mock data for Demo Mode - 5 fake personas with pre-written breach data and narratives
import { ScanResult, DataPoint } from '@/lib/types';

export interface MockPersona {
    keywords: string[]; // Terms that trigger this persona
    result: ScanResult;
    narrative: string;
}

export const mockPersonas: MockPersona[] = [
    // Persona 1: John Doe - Average professional
    {
        keywords: ['john', 'doe', 'johndoe', 'john.doe'],
        result: {
            query: 'john.doe@company.com',
            queryType: 'email',
            breaches: [
                {
                    name: 'LinkedIn',
                    domain: 'linkedin.com',
                    breachDate: '2021-06-22',
                    dataClasses: ['Email addresses', 'Names', 'Phone numbers', 'Professional info'],
                    description: 'In June 2021, 700 million LinkedIn user records were scraped.',
                    pwnCount: 700000000,
                },
                {
                    name: 'Adobe',
                    domain: 'adobe.com',
                    breachDate: '2013-10-04',
                    dataClasses: ['Email addresses', 'Passwords', 'Password hints'],
                    description: '153 million Adobe accounts were breached with encrypted passwords.',
                    pwnCount: 153000000,
                },
            ],
            profiles: [
                { platform: 'LinkedIn', url: 'https://linkedin.com/in/johndoe', title: 'John Doe - Software Engineer', snippet: 'Experienced developer with 10+ years...' },
                { platform: 'Twitter/X', url: 'https://twitter.com/johndoe', title: '@johndoe', snippet: 'Tech enthusiast. Coffee lover. Bay Area.' },
                { platform: 'GitHub', url: 'https://github.com/johndoe', title: 'johndoe (John Doe)', snippet: '42 repositories, 156 followers' },
            ],
            exposedDataTypes: ['Email addresses', 'Names', 'Phone numbers', 'Passwords', 'Professional info'],
            riskScore: 78,
            riskBreakdown: {
                breachExposure: 50,
                socialMediaVisibility: 18,
                contactInfoLeakage: 5,
                locationData: 5,
                passwordsExposed: true,
            },
            timestamp: new Date().toISOString(),
            personalInfo: {
                location: 'San Francisco, CA',
                employer: 'Acme Software Inc.',
                education: 'UC Berkeley',
                fieldOfStudy: 'Computer Science, B.S.',
                phone: '+1 (415) ***-**42',
                knownAliases: ['johndoe', 'john.doe', 'jdoe_dev'],
                websites: ['https://github.com/johndoe', 'https://johndoe.dev'],
                dateOfBirth: 'October 12, 1988',
                familyMembers: ['Jane Doe (Spouse)', 'Michael Doe (Brother)'],
                financialInfo: 'Estimated Income: $140k - $160k',
                recentTravel: ['Tokyo, Japan (Oct 2023)', 'London, UK (Mar 2023)'],
                propertyValue: 'Est. Home Value: $1.2M',
                vehicleInfo: '2021 Tesla Model 3',
            },
        },
        narrative: `**CREDENTIAL ATTACK**
Because your old password from the 2013 Adobe leak was revealed, hackers could break into your current primary accounts to steal your data.
- Automated tools test your leaked credentials against hundreds of popular sites.
- If you still use that old password anywhere, those accounts are now high-priority targets.

**PHISHING ATTACK**
Because your LinkedIn details and role at Acme Software Inc. were revealed, hackers could craft a convincing fake message to trick you.
- They might pose as a colleague or manager to gain your immediate trust.
- The goal is to trick you into clicking a harmful link that installs malware on your work laptop.

**IMPERSONATION ATTACK**
Because your full name and public handles were revealed, hackers could build a fake profile of you to trick your professional network.
- They use your bio and career history to create an identical social media account.
- This fake "you" is then used to ask colleagues for sensitive info or internal documents.`,
    },
    // Persona 2: Sarah Chen - Tech Manager
    {
        keywords: ['sarah', 'chen', 'manager', 'tech manager', 'sarahchen'],
        result: {
            query: 'sarah.chen@techcorp.io',
            queryType: 'email',
            breaches: [
                {
                    name: 'Dropbox',
                    domain: 'dropbox.com',
                    breachDate: '2012-07-01',
                    dataClasses: ['Email addresses', 'Passwords'],
                    description: 'Dropbox suffered a data breach exposing 68 million accounts.',
                    pwnCount: 68648009,
                },
                {
                    name: 'Canva',
                    domain: 'canva.com',
                    breachDate: '2019-05-24',
                    dataClasses: ['Email addresses', 'Names', 'Usernames', 'Geographic locations'],
                    description: '137 million Canva users had their data exposed.',
                    pwnCount: 137272116,
                },
                {
                    name: 'Twitter',
                    domain: 'twitter.com',
                    breachDate: '2023-01-05',
                    dataClasses: ['Email addresses', 'Names', 'Phone numbers'],
                    description: 'Over 200 million Twitter records were leaked online.',
                    pwnCount: 211524284,
                },
            ],
            profiles: [
                { platform: 'LinkedIn', url: 'https://linkedin.com/in/sarahchen', title: 'Sarah Chen - Engineering Manager at TechCorp', snippet: 'Leading a team of 15 engineers...' },
                { platform: 'Twitter/X', url: 'https://twitter.com/sarahchentech', title: '@sarahchentech', snippet: 'Eng Manager @TechCorp | Speaker | Mom of 2' },
                { platform: 'GitHub', url: 'https://github.com/sarahchen', title: 'sarahchen', snippet: '89 repositories, 2.1k followers' },
                { platform: 'Medium', url: 'https://medium.com/@sarahchen', title: 'Sarah Chen - Medium', snippet: 'Writing about engineering leadership...' },
            ],
            exposedDataTypes: ['Email addresses', 'Names', 'Phone numbers', 'Passwords', 'Geographic locations'],
            riskScore: 92,
            riskBreakdown: {
                breachExposure: 60,
                socialMediaVisibility: 22,
                contactInfoLeakage: 10,
                locationData: 0,
                passwordsExposed: true,
            },
            timestamp: new Date().toISOString(),
            personalInfo: {
                location: 'Seattle, WA',
                employer: 'TechCorp',
                education: 'Stanford University',
                fieldOfStudy: 'Computer Engineering, M.S.',
                phone: '+1 (206) ***-**18',
                knownAliases: ['sarahchen', 'sarahchentech', 's.chen'],
                websites: ['https://medium.com/@sarahchen'],
                familyMembers: ['David Chen (Husband)', 'Lily Chen (Daughter)', 'Oliver Chen (Son)'],
                recentTravel: ['Austin, TX (SXSW 2023)'],
                vehicleInfo: '2019 Subaru Outback',
            },
        },
        narrative: `**SIM SWAP ATTACK**
Because your phone number was revealed in the Twitter breach, hackers could hijack your mobile account to bypass security.
- Attackers trick your provider into transferring your number to a device they control.
- This lets them intercept the text-based login codes for your high-value bank and email accounts.

**EXECUTIVE IMPERSONATION**
Because your role at TechCorp and your team details are public, hackers could pose as an executive to commit financial fraud.
- Someone might send an "urgent" wire transfer request to a teammate while posing as you.
- They use your public success stories to make the request feel authentic and high-priority.

**PHISHING ATTACK**
Because your Medium and LinkedIn profiles confirm your tech stack, hackers could send you a targeted virus disguised as a tool.
- They send you a fake developer tool or "beta version" of a popular library you use.
- One click gives them full access to your Stanford-linked research or company files.`,
    },
    // Persona 3: Alex Rivera - Crypto Enthusiast
    {
        keywords: ['alex', 'rivera', 'crypto', 'bitcoin', 'alexrivera'],
        result: {
            query: 'alexrivera_crypto',
            queryType: 'username',
            breaches: [
                {
                    name: 'Ledger',
                    domain: 'ledger.com',
                    breachDate: '2020-07-14',
                    dataClasses: ['Email addresses', 'Names', 'Phone numbers', 'Physical addresses'],
                    description: '272,000 Ledger customers had physical addresses leaked.',
                    pwnCount: 272000,
                },
                {
                    name: 'BitcoinTalk',
                    domain: 'bitcointalk.org',
                    breachDate: '2015-05-22',
                    dataClasses: ['Email addresses', 'Passwords', 'Usernames'],
                    description: 'BitcoinTalk forum breach exposed 500k accounts.',
                    pwnCount: 500000,
                },
            ],
            profiles: [
                { platform: 'Twitter/X', url: 'https://twitter.com/alexrivera_btc', title: '@alexrivera_btc', snippet: 'Bitcoin maximalist 🟠 | DeFi degen | NFA' },
                { platform: 'Reddit', url: 'https://reddit.com/user/alexrivera_crypto', title: 'u/alexrivera_crypto', snippet: 'Active in r/cryptocurrency, r/bitcoin' },
                { platform: 'Discord', url: '#', title: 'alexrivera#1337', snippet: 'Server: CryptoTraders VIP' },
            ],
            exposedDataTypes: ['Email addresses', 'Names', 'Phone numbers', 'Physical addresses', 'Passwords'],
            riskScore: 95,
            riskBreakdown: {
                breachExposure: 55,
                socialMediaVisibility: 15,
                contactInfoLeakage: 15,
                locationData: 10,
                passwordsExposed: true,
            },
            timestamp: new Date().toISOString(),
            personalInfo: {
                location: 'Miami, FL',
                employer: 'Self-Employed (Crypto Trader)',
                education: 'Florida International University',
                fieldOfStudy: 'Finance, B.A.',
                phone: '+1 (305) ***-**77',
                address: '****** NW 2nd Ave, Miami, FL 33127',
                knownAliases: ['alexrivera_crypto', 'alexrivera_btc', 'alex_defi'],
                websites: ['https://reddit.com/user/alexrivera_crypto'],
                dateOfBirth: 'March 3, 1995',
                financialInfo: 'High-risk crypto asset holdings detected',
                propertyValue: 'Est. Condo Value: $850k',
                vehicleInfo: '2023 Porsche 911',
            },
        },
        narrative: `**PHYSICAL SECURITY RISK**
Because your home address in Miami was revealed in the Ledger breach, hackers could target you for a real-world home invasion.
- Since you openly discuss high-value crypto, attackers know exactly where the "physical vault" is.
- This turns a digital leak into a direct, physical safety concern for you and your family.

**ACCOUNT HIJACKING**
Because your phone number and crypto handles were revealed, hackers could bypass your security to drain your wallets.
- Someone could hijack your social media to post fake "giveaways" to your 🟠 Bitcoin followers.
- They'll use your phone number to reset access on your primary crypto exchange accounts.

**FINANCIAL FRAUD**
Because your high-risk crypto holdings and $850k property value were revealed, hackers could target you with complex tax scams.
- They send you official-looking "IRS" or "SEC" notices regarding your digital assets.
- The goal is to panic you into "verifying" your wallet keys on a fake government site.`,
    },
    // Persona 4: Emily Watson - Healthcare Professional
    {
        keywords: ['emily', 'watson', 'doctor', 'nurse', 'healthcare', 'medical'],
        result: {
            query: 'emily.watson.rn@hospital.org',
            queryType: 'email',
            breaches: [
                {
                    name: 'MyFitnessPal',
                    domain: 'myfitnesspal.com',
                    breachDate: '2018-02-01',
                    dataClasses: ['Email addresses', 'Passwords', 'Usernames'],
                    description: '144 million MyFitnessPal accounts were compromised.',
                    pwnCount: 143606147,
                },
            ],
            profiles: [
                { platform: 'LinkedIn', url: 'https://linkedin.com/in/emilywatsonrn', title: 'Emily Watson, RN, BSN - ICU Nurse', snippet: 'Critical care nurse at Memorial Hospital' },
                { platform: 'Facebook', url: 'https://facebook.com/emily.watson.rn', title: 'Emily Watson', snippet: 'Lives in Portland, Oregon' },
                { platform: 'Instagram', url: 'https://instagram.com/emily_watson_rn', title: '@emily_watson_rn', snippet: '2.4k followers | Nurse life 💉' },
            ],
            exposedDataTypes: ['Email addresses', 'Passwords', 'Usernames'],
            riskScore: 65,
            riskBreakdown: {
                breachExposure: 35,
                socialMediaVisibility: 20,
                contactInfoLeakage: 5,
                locationData: 5,
                passwordsExposed: true,
            },
            timestamp: new Date().toISOString(),
            personalInfo: {
                location: 'Portland, OR',
                employer: 'Memorial Hospital',
                education: 'Oregon Health & Science University',
                fieldOfStudy: 'Nursing, BSN',
                phone: '+1 (503) ***-**91',
                knownAliases: ['emily.watson.rn', 'emily_watson_rn'],
                websites: ['https://instagram.com/emily_watson_rn'],
                dateOfBirth: 'February 14, 1992',
                familyMembers: ['Thomas Watson (Father)', 'Martha Watson (Mother)'],
                financialInfo: 'Avg Household Income for Area: $95k',
                recentTravel: ['Oahu, Hawaii (Jan 2024)', 'Vancouver, BC (Aug 2023)'],
            },
        },
        narrative: `**CREDENTIAL STUFFING**
Because a password was revealed in the MyFitnessPal leak, hackers could break into your Memorial Hospital systems.
- Attackers try your leaked credentials on medical portals and patient databases.
- If successful, they could gain access to protected health information and your employee portal.

**SOCIAL ENGINEERING**
Because your role as an ICU nurse at Memorial Hospital was revealed, hackers could trick you into sharing hospital keys.
- Someone might pose as Hospital IT calling about an "urgent security patch" for your nurses' station.
- They'll use your current department and supervisor's name to make the scam feel terrifyingly real.

**IDENTITY THEFT**
Because your family member details and Portland location were revealed, hackers could answer your personal security questions.
- Scammers use your father's or mother's name to reset passwords on your utility or bank accounts.
- This allows them to take full control of your life without ever knowing your actual password.`,
    },
    // Persona 5: Default/Generic - Used for any other input
    {
        keywords: [], // Empty = default fallback
        result: {
            query: 'demo_user@email.com',
            queryType: 'email',
            breaches: [
                {
                    name: 'Collection #1',
                    domain: 'various',
                    breachDate: '2019-01-17',
                    dataClasses: ['Email addresses', 'Passwords'],
                    description: 'Collection #1 contained 773 million leaked credentials from various sources.',
                    pwnCount: 772904991,
                },
                {
                    name: 'Facebook',
                    domain: 'facebook.com',
                    breachDate: '2021-04-03',
                    dataClasses: ['Email addresses', 'Names', 'Phone numbers', 'Geographic locations'],
                    description: '533 million Facebook users had their data scraped and leaked.',
                    pwnCount: 533000000,
                },
                {
                    name: 'Spotify',
                    domain: 'spotify.com',
                    breachDate: '2020-11-23',
                    dataClasses: ['Email addresses', 'Names', 'Passwords'],
                    description: '300k Spotify accounts were exposed through credential stuffing.',
                    pwnCount: 300000,
                },
            ],
            profiles: [
                { platform: 'LinkedIn', url: 'https://linkedin.com/in/demo', title: 'Demo User - Professional', snippet: 'Example professional profile' },
                { platform: 'Twitter/X', url: 'https://twitter.com/demouser', title: '@demouser', snippet: 'Just a demo account for testing' },
                { platform: 'Facebook', url: 'https://facebook.com/demo.user', title: 'Demo User', snippet: 'Example Facebook profile' },
                { platform: 'Instagram', url: 'https://instagram.com/demouser', title: '@demouser', snippet: '1k followers | Demo account' },
            ],
            exposedDataTypes: ['Email addresses', 'Names', 'Phone numbers', 'Passwords', 'Geographic locations'],
            riskScore: 82,
            riskBreakdown: {
                breachExposure: 45,
                socialMediaVisibility: 22,
                contactInfoLeakage: 10,
                locationData: 5,
                passwordsExposed: true,
            },
            timestamp: new Date().toISOString(),
            personalInfo: {
                location: 'Austin, TX',
                employer: 'Unknown',
                education: 'University of Texas at Austin',
                fieldOfStudy: 'Information Technology',
                phone: '+1 (512) ***-**03',
                knownAliases: ['demouser', 'demo_user'],
                websites: ['https://facebook.com/demo.user'],
                dateOfBirth: 'January 1, 1990',
            },
        },
        narrative: `**CREDENTIAL ATTACK**
Because your credentials appeared in multiple massive leaks, hackers could gain full access to your digital life today.
- Automated bots try your common email/password combos on every major bank and social network.
- Each reused password is a direct open door into your private and financial history.

**IDENTITY IMPERSONATION**
Because your phone number and Austin location were revealed, hackers could pose as you to hijack your services.
- They use these details to pass the "verify who you are" checks with your phone company or ISP.
- This can lead to unauthorized changes to your accounts or even service cancellations in your name.

**SOCIAL ENGINEERING**
Because your public handles and location were revealed, hackers could craft a fake but personal message to steal your data.
- They pose as local support or authorities to trick you into "validating" your sensitive information.
- By using details you thought were private, they make the request seem official and unavoidable.`,
    },
];

export function getMockPersona(query: string): { result: ScanResult; narrative: string } {
    const normalizedQuery = query.toLowerCase().trim();

    // Find matching persona based on keywords
    const matchedPersona = mockPersonas.find(persona =>
        persona.keywords.length > 0 &&
        persona.keywords.some(keyword => normalizedQuery.includes(keyword))
    );

    // Return matched persona or default (last one)
    const persona = matchedPersona || mockPersonas[mockPersonas.length - 1];

    // Update the query and timestamp
    const result = {
        ...persona.result,
        query: query,
        timestamp: new Date().toISOString(),
    };

    return { result, narrative: persona.narrative };
}
