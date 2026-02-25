// Types for Digital Shadow scanner

export interface BreachData {
    name: string;
    domain: string;
    breachDate: string;
    dataClasses: string[];
    description: string;
    pwnCount: number;
}

export interface ProfileData {
    platform: string;
    url: string;
    title: string;
    snippet: string;
}

export interface PersonalInfo {
    location?: string;
    employer?: string;
    education?: string;
    fieldOfStudy?: string;
    phone?: string;
    address?: string;
    knownAliases?: string[];
    websites?: string[];
    dateOfBirth?: string;
    familyMembers?: string[];
    financialInfo?: string;
    recentTravel?: string[];
    propertyValue?: string;
    vehicleInfo?: string;
}

export interface ScanResult {
    query: string;
    queryType: 'email' | 'username';
    breaches: BreachData[];
    profiles: ProfileData[];
    exposedDataTypes: string[];
    riskScore: number;
    riskBreakdown: RiskBreakdown;
    timestamp: string;
    personalInfo?: PersonalInfo;
}

export interface RiskBreakdown {
    breachExposure: number;
    socialMediaVisibility: number;
    contactInfoLeakage: number;
    locationData: number;
    passwordsExposed: boolean;
}

export interface DataPoint {
    id: number;
    label: string;
    type: string;
    exposed: boolean;
    details?: string;
}

export interface NarratorRequest {
    scanResult: ScanResult;
}

export interface NarratorResponse {
    narrative: string;
    generatedAt: string;
    isAIGenerated: boolean;
}
