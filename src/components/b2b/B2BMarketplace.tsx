'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, BriefcaseBusiness, Globe2, Package, Search, Truck } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { supabaseBrowserClient } from '../../lib/supabase/client';
import { Database } from '../../types/database';

type Supplier = Database['public']['Tables']['suppliers']['Row'];

export function B2BMarketplace() {
  const { language } = useLanguage();
  const isKu = language === 'ku' || language === 'ckb';
  const isAr = language === 'ar';
  const loadErrorMessage = isKu
    ? 'نەتوانرا دابینکەرەکان باربکرێن. تکایە دواتر هەوڵبدەرەوە.'
    : isAr
      ? 'تعذر تحميل الموردين. يرجى المحاولة لاحقاً.'
      : 'Suppliers could not be loaded. Please try again later.';
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(!!supabaseBrowserClient);
  const [errorMessage, setErrorMessage] = useState(
    supabaseBrowserClient ? '' : loadErrorMessage
  );

  const text = {
    title: isKu ? 'بازاڕی بازرگانی' : isAr ? 'السوق التجاري' : 'Business marketplace',
    description: isKu
      ? 'کڕیارانی بازرگانی بە دابینکەر و پێشکەشکارانی کۆمەڵەوە پەیوەست بکە.'
      : isAr
        ? 'اربط تجار التجزئة بالموردين ومقدمي عروض الجملة.'
        : 'Connect retailers with suppliers and wholesale offers.',
    join: isKu ? 'وەک دابینکەر تۆماربە' : isAr ? 'انضم كمورد' : 'Join as a supplier',
    find: isKu ? 'دابینکەر بدۆزەرەوە' : isAr ? 'اكتشف الموردين' : 'Find suppliers',
    suppliers: isKu ? 'دابینکەرانی پشتڕاستکراو' : isAr ? 'الموردون المعتمدون' : 'Verified suppliers',
    empty: isKu ? 'هێشتا دابینکەری پشتڕاستکراو نییە.' : isAr ? 'لا يوجد موردون معتمدون بعد.' : 'No verified suppliers are listed yet.',
    loadError: loadErrorMessage,
  };

  useEffect(() => {
    let active = true;

    async function loadSuppliers() {
      if (!supabaseBrowserClient) return;

      const { data, error } = await supabaseBrowserClient
        .from('suppliers')
        .select('*')
        .eq('is_active', true)
        .eq('verification_status', 'verified')
        .order('business_name');

      if (!active) return;

      if (error) {
        console.error('Failed to load verified suppliers:', error);
        setErrorMessage(text.loadError);
      } else {
        setSuppliers(data || []);
      }
      setIsLoading(false);
    }

    void loadSuppliers();
    return () => {
      active = false;
    };
  }, [text.loadError]);

  return (
    <main className="flex-1">
      <section className="border-b border-[#EAE7DF] bg-[#FFF8E8]">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:px-8">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#F4B942]/50 bg-white px-3 py-1 text-xs font-bold text-[#8C5E00]">
              <BriefcaseBusiness className="h-4 w-4" aria-hidden="true" />
              {isKu ? 'بۆ کڕیاران و دابینکەران' : isAr ? 'للتجار والموردين' : 'For retailers and suppliers'}
            </p>
            <h1 className="max-w-3xl text-3xl font-black leading-tight text-neutral-950 sm:text-5xl">
              {text.title}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-700 sm:text-lg">
              {text.description}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="#suppliers"
                className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#F4B942] px-5 py-3 text-sm font-black text-neutral-950 hover:bg-[#E2A732] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8C5E00] focus-visible:ring-offset-2"
              >
                <Search className="h-4 w-4" aria-hidden="true" />
                {text.find}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
              <Link
                href="/register"
                className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#D8D4C8] bg-white px-5 py-3 text-sm font-bold text-neutral-800 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8C5E00] focus-visible:ring-offset-2"
              >
                {text.join}
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {[
              { icon: Package, title: isKu ? 'بەرهەمە کۆمەڵەکان' : isAr ? 'منتجات بالجملة' : 'Wholesale products' },
              { icon: Truck, title: isKu ? 'زانیاری گەیاندن' : isAr ? 'تفاصيل الشحن' : 'Shipping details' },
              { icon: Globe2, title: isKu ? 'پەیوەندی نێودەوڵەتی' : isAr ? 'تواصل دولي' : 'Cross-border sourcing' },
            ].map(({ icon: Icon, title }) => (
              <div key={title} className="flex items-center gap-3 rounded-2xl border border-[#EAE7DF] bg-white p-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F5F3ED] text-[#657A52]">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="text-sm font-bold text-neutral-800">{title}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="suppliers" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-black text-neutral-950">{text.suppliers}</h2>
            <p className="mt-1 text-sm text-neutral-600">
              {isKu ? 'تەنها دابینکەرانی چالاک و پشتڕاستکراو لێرە دەردەکەون.' : isAr ? 'تظهر هنا الملفات النشطة والمعتمدة فقط.' : 'Only active, verified supplier profiles appear here.'}
            </p>
          </div>
          <Link href="/register" className="text-sm font-bold text-[#8C5E00] underline-offset-4 hover:underline">
            {text.join}
          </Link>
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Loading suppliers">
            {[0, 1, 2].map((item) => (
              <div key={item} className="h-40 animate-pulse rounded-2xl border border-[#EAE7DF] bg-white" />
            ))}
          </div>
        ) : errorMessage ? (
          <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800">
            {errorMessage}
          </p>
        ) : suppliers.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-[#D8D4C8] bg-white px-5 py-10 text-center text-sm text-neutral-600">
            {text.empty}
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {suppliers.map((supplier) => (
              <article key={supplier.id} className="rounded-2xl border border-[#EAE7DF] bg-white p-5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wide text-[#657A52]">
                  {supplier.business_type}
                </p>
                <h3 className="mt-2 text-lg font-black text-neutral-950">{supplier.business_name}</h3>
                <p className="mt-1 text-sm text-neutral-600">{[supplier.city, supplier.country].filter(Boolean).join(', ')}</p>
                {supplier.description && (
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-neutral-700">{supplier.description}</p>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
