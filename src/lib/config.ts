// Configuration for the Digital Shadow application

/**
 * Toggle Mock Mode for Demo purposes
 * When true: Uses fake personas with pre-written data (no API calls)
 * When false: Uses real HIBP/Serper APIs and Gemini AI
 * 
 * Set ENABLE_MOCK_MODE=true in .env.local to enable
 */
export const MOCK_MODE = process.env.ENABLE_MOCK_MODE === 'true';

// API Configuration
export const API_CONFIG = {
    // Simulated delay in mock mode (ms)
    mockDelay: 1500,

    // Risk score thresholds
    riskThresholds: {
        low: 30,
        medium: 50,
        high: 70,
        critical: 85,
    },

    // Session verification timeout (ms)
    verificationTimeout: 60000, // 1 minute
};
