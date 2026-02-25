# 🕳️ Digital Shadow: AI Identity Risk Oracle

> "An attacker doesn't just see your data; they see your patterns."

Digital Shadow is a high-fidelity OSINT (Open Source Intelligence) visualization platform designed to show users exactly what a motivated threat actor can learn about them from public and leaked data. Built for the RSA Conference 2026, it demonstrates the power of AI-driven narrative generation combined with real-time breach analysis.

---

## 🚀 Mission
In an era of ubiquitous data leaks, the "Security through Obscurity" model is dead. Digital Shadow aims to:
1. **Humanize Risk**: Shift from abstract "breach counts" to concrete "attack strategies."
2. **Visualize Connections**: Map how disparate data points (LinkedIn, old forum leaks, social media) form a coherent target profile.
3. **Actionable Resilience**: Provide one-click paths to hardening privacy settings on major platforms.

---

## 🛠️ Tech Stack
- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Styling**: Vanilla CSS with Tailwind-enhanced Glassmorphism
- **Intelligence**: 
  - **HIBP/BreachDirectory**: Real-time credential leak checks.
  - **Google Serper**: Social footprint and public profile discovery.
  - **Google Gemini 1.5 Pro**: Generative AI "Attacker Narratives."
- **Authentication**: Google OAuth via [NextAuth.js](https://next-auth.js.org/).
- **Visuals**: [Lucide React](https://lucide.dev/) & Custom SVG Force-Graphs.

---

## 🔒 Security Architecture
The platform is designed with a "Verified Reveal" gate:
1. **Public Recon**: Shows non-sensitive data points found via public search.
2. **Deep Shadow**: Locked behind Google Verification. Sensitive data (Address, Phone, Financial Insights) is only unblurred when the scanned email exactly matches the authenticated session user.
3. **Data Ephemerality**: Scans are performed in-memory. No user search data is persisted to a database.

---

## 📂 Setup Instructions

### 1. Prerequisites
- Node.js 18+ 
- A Google Cloud Project (for Auth)
- RapidAPI Key (for BreachDirectory)

### 2. Environment Configuration
Copy `.env.example` to `.env.local` and populate the keys:
```bash
cp .env.example .env.local
```

### 3. Installation
```bash
npm install
npm run dev
```

### 4. Demo Mode
To experience the dashboard without setting up API keys, set `ENABLE_MOCK_MODE=true` in your `.env.local`. This will enable high-fidelity mock personas (John Doe, Alex Rivera, Emily Watson) for demonstration purposes.

---

## 👨‍⚖️ For Judges
- **Code Hardening**: All configuration is centralized. TypeScript interfaces are strictly enforced across the data layer.
- **Visual Polish**: Standardized `.cyber-glass` utility class ensures a consistent, premium aesthetic across all screen sizes.
- **Robust Error Handling**: API failures fail-safe into localized error states rather than crashing the experience.

---
*Created for RSA 2026. Empowering users through data transparency.*
