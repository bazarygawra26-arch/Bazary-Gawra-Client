import type { Metadata } from 'next';
import './globals.css';
import { LanguageProvider } from '../context/LanguageContext';
import { ComparisonProvider } from '../context/ComparisonContext';

export const metadata: Metadata = {
  title: 'BAZARY GAWRA | AI-Powered Local Marketplace for Kurdistan',
  description:
    'Search, compare, and understand local products across Sulaymaniyah, Erbil, and Duhok with AI discovery and transparent information gap analysis.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Noto+Sans+Arabic:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#FAF9F6] text-[#171717]">
        <LanguageProvider>
          <ComparisonProvider>{children}</ComparisonProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
