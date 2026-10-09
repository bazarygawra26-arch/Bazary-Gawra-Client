'use client';

import React, { useEffect, useState, use, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '../../../components/layout/Header';
import { Footer } from '../../../components/layout/Footer';
import { CompareTable } from '../../../components/compare/CompareTable';
import { AIComparisonPanel } from '../../../components/compare/AIComparisonPanel';
import { useComparison } from '../../../context/ComparisonContext';
import { useLanguage } from '../../../context/LanguageContext';
import { Product } from '../../../types';
import { ArrowLeftRight, Trash2, Share2, Check, Loader2 } from 'lucide-react';
import Link from 'next/link';

function CompareContent() {
  const searchParams = useSearchParams();
  const idsParam = searchParams?.get('ids');

  const { t, language } = useLanguage();
  const { comparedProducts, addToCompare, removeFromCompare, clearCompare } = useComparison();
  const [copied, setCopied] = useState(false);
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);

  // 1. Sync from URL `?ids=a,b` if present on mount
  useEffect(() => {
    if (!idsParam) return;

    const requestedIds = idsParam.split(',').map((s) => s.trim()).filter(Boolean);
    const missingIds = requestedIds.filter(
      (id) => !comparedProducts.some((p) => p.id === id)
    );

    if (missingIds.length > 0) {
      setIsLoadingUrl(true);
      fetch(`/api/products?lang=${language}`, { cache: 'no-store' })
        .then((r) => r.json())
        .then((all: Product[]) => {
          if (Array.isArray(all)) {
            missingIds.forEach((id) => {
              const found = all.find((p) => p.id === id);
              if (found) addToCompare(found);
            });
          }
        })
        .catch((err) => console.error('Failed to load url compare ids:', err))
        .finally(() => setIsLoadingUrl(false));
    }
  }, [idsParam, language]);

  // 2. Sync to URL whenever comparedProducts changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const ids = comparedProducts.map((p) => p.id).join(',');
    const newUrl = ids ? `?ids=${encodeURIComponent(ids)}` : window.location.pathname;
    window.history.replaceState(null, '', newUrl);
  }, [comparedProducts]);

  const handleShare = () => {
    if (typeof window === 'undefined') return;
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-neutral-900">
      <Header />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EAE7DF] pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#657A52] mb-1">
              <ArrowLeftRight className="w-4 h-4" />
              <span>{t('navCompare')}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900">
              {t('compareDrawerTitle')}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1">
              {language === 'ku'
                ? 'بەراوردکردنی ڕاستەوخۆ بەپێی تایبەتمەندییەکان و دۆزینەوەی کەلێنی زانیارییەکان'
                : 'Side-by-side technical evaluation with objective information gap audit'}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {comparedProducts.length > 0 && (
              <>
                <button
                  onClick={handleShare}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-neutral-700 bg-white border border-[#EAE7DF] hover:bg-neutral-50 transition-colors shadow-2xs"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">{language === 'ku' ? 'کۆپی کرا' : 'Copied Link'}</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5 text-[#657A52]" />
                      <span>{language === 'ku' ? 'بەشکردنی بەستەر' : 'Share URL'}</span>
                    </>
                  )}
                </button>

                <button
                  onClick={clearCompare}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-neutral-500 border border-[#EAE7DF] hover:bg-neutral-50 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{t('clearAll')}</span>
                </button>
              </>
            )}
          </div>
        </div>

        {isLoadingUrl ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-neutral-400">
            <Loader2 className="w-8 h-8 animate-spin text-[#F4B942]" />
            <p className="text-xs font-medium">Loading shared comparison items...</p>
          </div>
        ) : comparedProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-[#EAE7DF] p-8">
            <div className="w-16 h-16 rounded-2xl bg-[#FFF5DD] text-[#8C5E00] flex items-center justify-center mx-auto mb-4 shadow-2xs">
              <ArrowLeftRight className="w-8 h-8" />
            </div>
            <h3 className="font-extrabold text-neutral-900 text-lg mb-2">
              {language === 'ku' ? 'هیچ بەرهەمێک هەڵنەبژێردراوە' : 'No products in comparison'}
            </h3>
            <p className="text-xs text-neutral-500 max-w-md mx-auto mb-6 leading-relaxed">
              {language === 'ku'
                ? 'سەردانی کەتەلۆکی بەرهەمەکان بکە و دوو یان سێ بەرهەم بۆ بەراوردکردن هەڵبژێرە.'
                : 'Browse products and click "+ Add to Compare" on any two or more items to view feature differences and missing transparency criteria.'}
            </p>
            <Link
              href="/products"
              className="px-6 py-3 rounded-xl bg-[#F4B942] hover:bg-[#E2A732] text-neutral-950 font-bold text-xs inline-block transition-colors shadow-2xs"
            >
              {language === 'ku' ? 'گەڕان بەناو بەرهەمەکاندا' : 'Browse Products'}
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* 1. Comparison Table with Differences and ⚠ Warnings */}
            <CompareTable products={comparedProducts} onRemove={(id) => removeFromCompare(id)} />

            {/* 2. AI Comparison Panel */}
            <AIComparisonPanel products={comparedProducts} />
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6] text-neutral-400">
          <Loader2 className="w-8 h-8 animate-spin text-[#F4B942]" />
        </div>
      }
    >
      <CompareContent />
    </Suspense>
  );
}

