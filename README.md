# BAZARY GAWRA (بازاڕی گەورە) — Client

> **AI-Powered Local Product Discovery & Comparison Platform for the Kurdistan Region of Iraq**

Bazary Gawra is a next-generation local marketplace prototype designed specifically for Kurdistan (Sulaymaniyah, Erbil, Duhok). Combining local merchant cataloging with Google Gemini's multimodal and reasoning capabilities, it provides transparent product discovery, information gap analysis, and conversational assistance.

---

## 🌟 Key Features

1. **Multilingual AI Search Hero**:
   - Natural language semantic search in **Kurdish Sorani (سۆرانی)**, **Arabic (العربية)**, and **English**.
   - Extracts product categories, city locations (Sulaymaniyah, Erbil, Duhok), and budget limits in IQD.

2. **AI Product Scanner (Multimodal Vision)**:
   - Upload or drag-and-drop product photos for Gemini Vision analysis.
   - Strictly extracts visible product attributes (category, brand, model, visible capacity) without hallucinating missing data.
   - Highlights **Information Gaps**: clearly flags when price, warranty, seller, or return policy are not provided.
   - Instantly finds similar local products in Kurdistan for side-by-side comparison.
   - Includes a **Seller Listing Assistant** draft generator.

3. **Side-by-Side Product Comparison Matrix**:
   - Compare up to 3 products side-by-side across detailed technical specifications.
   - **AI Information Gap Analysis**: flags missing warranty duration, unstated return policies, or omitted merchant details.

4. **Information & Trust Signals**:
   - Objective audit checklist of merchant disclosures without subjective sponsored ratings.

5. **Local Sellers Directory**:
   - Informational merchant spotlights across Sulaymaniyah, Erbil, and Penjwen.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or Bun
- Google Gemini API Key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/bazarygawra26-arch/Bazary-Gawra-Client.git
   cd Bazary-Gawra-Client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   Add your Gemini API Key in `.env.local`:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. Run the development server:
   ```bash
   npm run dev
   # or
   bun dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (Custom Bazary Gawra warm yellow `#F4B942` design system)
- **AI**: Google Gemini API (`gemini-3.8-flash` Multimodal Vision)
- **Icons**: Lucide React
- **Typography**: Inter & Noto Sans Arabic (Dynamic RTL/LTR)
