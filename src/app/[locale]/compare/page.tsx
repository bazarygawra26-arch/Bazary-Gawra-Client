'use client';

import React from 'react';
import { Header } from '../../../components/layout/Header';
import { Footer } from '../../../components/layout/Footer';
import { CompareTable } from '../../../components/compare/CompareTable';
import { AIComparisonPanel } from '../../../components/compare/AIComparisonPanel';
import { useComparison } from '../../../context/ComparisonContext';
import { useLanguage } from '../../../context/LanguageContext';
import { ArrowLeftRight, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function ComparePage() {
  const { t } = useLanguage();
  const { comparedProducts, removeFromCompare, clearCompare } = useComparison();

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-neutral-900">
      <Header />
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EAE7DF] pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#657A52] mb-1.5">
              <ArrowLeftRight className="w-4 h-4" />
              <span>{t('navCompare')}</span>
            </div>
            <h1 className="text-3xl font-black text-neutral-900">{t('compareDrawerTitle')}</h1>
            <p className="text-sm text-neutral-600 mt-1">
              Side-by-side technical evaluation with objective information gap audit
            </p>
          </div>

          {comparedProducts.length > 0 && (
            <button
              onClick={clearCompare}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-neutral-600 border border-[#EAE7DF] hover:bg-neutral-50 hover:text-red-600"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t('clearAll')}</span>
            </button>
          )}
        </div>

        {comparedProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-[#EAE7DF] p-8">
            <div className="w-16 h-16 rounded-2xl bg-[#FFF5DD] text-[#8C5E00] flex items-center justify-center mx-auto mb-4">
              <ArrowLeftRight className="w-8 h-8" />
            </div>
            <h3 className="font-extrabold text-neutral-900 text-lg mb-2">No products in comparison</h3>
            <p className="text-xs text-neutral-500 max-w-md mx-auto mb-6">
              Browse products and click &ldquo;Compare&rdquo; on any two or more items to view feature differences and missing transparency criteria.
            </p>
            <Link
              href="/products"
              className="px-6 py-3 rounded-xl bg-[#F4B942] text-neutral-950 font-bold text-xs inline-block hover:bg-[#E2A732]"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            <AIComparisonPanel products={comparedProducts} />
            <CompareTable products={comparedProducts} onRemove={(id) => removeFromCompare(id)} />
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
