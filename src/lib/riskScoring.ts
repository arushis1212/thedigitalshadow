// Risk scoring engine for Digital Shadow
// Calculates vulnerability score based on discovered data

import { BreachData, ProfileData, RiskBreakdown } from './types';

// Risk point values
const RISK_POINTS = {
    // Breach-related
    PASSWORD_LEAKED: 50,
    EMAIL_IN_BREACH: 30,
    PHONE_EXPOSED: 15,
    ADDRESS_EXPOSED: 20,
    FINANCIAL_EXPOSED: 40,

    // Social media
    LINKEDIN: 10,
    TWITTER: 10,
    FACEBOOK: 10,
    INSTAGRAM: 8,
    GITHUB: 5,
    REDDIT: 5,
    TIKTOK: 8,
    YOUTUBE: 5,
    OTHER_PROFILE: 5,

    // Per breach penalty
    PER_BREACH: 5,
};

export function calculateRiskScore(
    breaches: BreachData[],
    profiles: ProfileData[]
): { score: number; breakdown: RiskBreakdown } {
    let score = 0;

    const breakdown: RiskBreakdown = {
        breachExposure: 0,
        socialMediaVisibility: 0,
        contactInfoLeakage: 0,
        locationData: 0,
        passwordsExposed: false,
    };

    // Calculate breach exposure
    const allDataClasses = new Set<string>();
    breaches.forEach(breach => {
        breach.dataClasses.forEach(dc => allDataClasses.add(dc.toLowerCase()));
        breakdown.breachExposure += RISK_POINTS.PER_BREACH;
    });

    // Check for specific data types in breaches
    if (allDataClasses.has('passwords') || allDataClasses.has('password hints')) {
        breakdown.breachExposure += RISK_POINTS.PASSWORD_LEAKED;
        breakdown.passwordsExposed = true;
    }

    if (allDataClasses.has('email addresses')) {
        breakdown.breachExposure += RISK_POINTS.EMAIL_IN_BREACH;
    }

    if (allDataClasses.has('phone numbers')) {
        breakdown.contactInfoLeakage += RISK_POINTS.PHONE_EXPOSED;
    }

    if (allDataClasses.has('physical addresses') || allDataClasses.has('geographic locations')) {
        breakdown.locationData += RISK_POINTS.ADDRESS_EXPOSED;
    }

    if (allDataClasses.has('financial data') || allDataClasses.has('credit cards')) {
        breakdown.breachExposure += RISK_POINTS.FINANCIAL_EXPOSED;
    }

    // Calculate social media visibility
    profiles.forEach(profile => {
        const platform = profile.platform.toLowerCase();

        if (platform.includes('linkedin')) {
            breakdown.socialMediaVisibility += RISK_POINTS.LINKEDIN;
        } else if (platform.includes('twitter') || platform.includes('x')) {
            breakdown.socialMediaVisibility += RISK_POINTS.TWITTER;
        } else if (platform.includes('facebook')) {
            breakdown.socialMediaVisibility += RISK_POINTS.FACEBOOK;
        } else if (platform.includes('instagram')) {
            breakdown.socialMediaVisibility += RISK_POINTS.INSTAGRAM;
        } else if (platform.includes('github')) {
            breakdown.socialMediaVisibility += RISK_POINTS.GITHUB;
        } else if (platform.includes('reddit')) {
            breakdown.socialMediaVisibility += RISK_POINTS.REDDIT;
        } else if (platform.includes('tiktok')) {
            breakdown.socialMediaVisibility += RISK_POINTS.TIKTOK;
        } else if (platform.includes('youtube')) {
            breakdown.socialMediaVisibility += RISK_POINTS.YOUTUBE;
        } else {
            breakdown.socialMediaVisibility += RISK_POINTS.OTHER_PROFILE;
        }
    });

    // Total score (capped at 100)
    score = Math.min(
        100,
        breakdown.breachExposure +
        breakdown.socialMediaVisibility +
        breakdown.contactInfoLeakage +
        breakdown.locationData
    );

    return { score, breakdown };
}

export function getRiskLevel(score: number): 'low' | 'moderate' | 'high' | 'critical' {
    if (score >= 70) return 'critical';
    if (score >= 50) return 'high';
    if (score >= 30) return 'moderate';
    return 'low';
}

export function getRecommendations(breakdown: RiskBreakdown): string[] {
    const recommendations: string[] = [];

    if (breakdown.passwordsExposed) {
        recommendations.push('Change passwords on all accounts immediately and enable 2FA');
    }

    if (breakdown.breachExposure > 30) {
        recommendations.push('Monitor your accounts for suspicious activity');
        recommendations.push('Consider using a password manager with unique passwords');
    }

    if (breakdown.socialMediaVisibility > 20) {
        recommendations.push('Review privacy settings on social media accounts');
        recommendations.push('Limit publicly visible personal information');
    }

    if (breakdown.contactInfoLeakage > 0) {
        recommendations.push('Be cautious of phishing attempts via phone or SMS');
    }

    if (breakdown.locationData > 0) {
        recommendations.push('Disable location tagging on social media posts');
    }

    return recommendations;
}
