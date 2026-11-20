# BAZARY GAWRA (بازاڕی گەورە) — Client

**AI-Powered Local Product Discovery & Comparison Platform for the Kurdistan Region of Iraq**

**Live Demo:** https://bazary-gawra.netlify.app/ku  
**Repository:** https://github.com/bazarygawra26-arch/Bazary-Gawra-Client

---

## 📌 Project Overview

**Bazary Gawra (بازاڕی گەورە)** is an AI-powered local product discovery and comparison platform designed for the Kurdistan Region of Iraq, initially focusing on Sulaymaniyah, Erbil, and Duhok.

The platform aims to make local product discovery more transparent and accessible by combining local merchant information with Google's Gemini AI capabilities.

Through multilingual AI search, multimodal product recognition, side-by-side comparisons, and information gap analysis, Bazary Gawra helps consumers make more informed purchasing decisions.

The project is currently a **prototype**, demonstrating how AI can improve local product discovery and comparison.

---

## 🌟 Key Features

### 1. Multilingual AI Search

- Natural language product search in three languages:
  - Kurdish Sorani (سۆرانی)
  - Arabic (العربية)
  - English
- Understands user search intent using AI-powered semantic analysis.
- Extracts relevant search criteria, including:
  - Product categories
  - Preferred locations (Sulaymaniyah, Erbil, and Duhok)
  - Budget limits in Iraqi Dinars (IQD).
- Supports conversational product discovery.

### 2. AI Product Scanner (Multimodal Vision)

- Upload or drag and drop product images for AI-powered visual analysis.
- Uses Gemini Vision to identify visible product attributes, such as:
  - Product category
  - Brand
  - Model
  - Visible specifications and capacity
- Avoids assuming specifications that cannot be verified from the image.
- Identifies missing product information, including:
  - Price
  - Warranty
  - Seller information
  - Return policy
- Finds similar local products for comparison.
- Includes an AI-powered Seller Listing Assistant to help generate product listing drafts.

### 3. Side-by-Side Product Comparison

- Compare up to three products simultaneously.
- Displays available technical specifications and product details.
- Highlights differences between products.
- Includes AI-powered Information Gap Analysis to identify missing details, such as:
  - Warranty duration
  - Return policies
  - Merchant information
  - Missing product specifications

### 4. Information Transparency & Trust Signals

- Provides an objective checklist of available product and merchant information.
- Highlights missing or undisclosed information.
- Helps consumers evaluate the completeness of product listings.
- Focuses on transparency rather than subjective or sponsored ratings.

### 5. Local Sellers Directory

- Provides informational merchant spotlights.
- Covers local sellers across:
  - Sulaymaniyah
  - Erbil
- Helps users discover local merchants and explore available marketplace information.

---

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| Next.js 16 (App Router) | Frontend framework |
| TypeScript | Programming language |
| Tailwind CSS | Styling and responsive UI |
| Google Gemini API | AI reasoning and multimodal vision |
| Lucide React | Icon library |
| Inter | Primary typography |
| Netlify | Demo deployment |

### Design System

- **Primary Brand Color:** `#F4B942` (Warm Yellow)
- **Typography:** Inter and Noto Sans Arabic
- **Layout:** Responsive interface
- **Language Support:** Kurdish Sorani, Arabic, and English
- **Direction Support:** Dynamic RTL/LTR layouts

---

## 🚀 Getting Started

Follow these instructions to run the project locally.

### Prerequisites

Make sure you have the following installed:

- Node.js 18 or later
- npm or Bun
- Google Gemini API Key

### 1. Clone the Repository

```bash
git clone https://github.com/bazarygawra26-arch/Bazary-Gawra-Client.git

cd Bazary-Gawra-Client
```

### 2. Install Dependencies

Using npm:

```bash
npm install
```

Or using Bun:

```bash
bun install
```

### 3. Configure Environment Variables

Create your local environment file by copying the example:

```bash
cp .env.example .env.local
```

Add your Google Gemini API key:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

**Note:** Keep your API key private. Do not commit `.env.local` or expose secret API keys in client-side code.

### 4. Start the Development Server

Using npm:

```bash
npm run dev
```

Or using Bun:

```bash
bun dev
```

### 5. Open the Application

Visit:

```text
http://localhost:3000
```

---

## 🎯 Project Vision

Bazary Gawra aims to improve the local shopping experience by bringing product information, merchant discovery, and AI-powered assistance into one accessible platform.

Its central focus is **local discovery, product transparency, and informed purchasing decisions**.

By supporting Kurdish Sorani, Arabic, and English, the platform also aims to make AI-powered shopping tools more accessible to local communities.

---

## 👨‍💻 Project Information

**Project Name:** Bazary Gawra (بازاڕی گەورە)  
**Category:** Artificial Intelligence / E-Commerce / Local Marketplace  
**Target Market:** Kurdistan Region of Iraq  
**Development Stage:** Prototype  
**Founder & Developer:** Shajwan Namiq Salih

---

*Built with the vision of making local product discovery smarter, more transparent, and more accessible.*
