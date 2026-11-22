'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../../context/LanguageContext';
import { supabaseBrowserClient } from '../../lib/supabase/client';
import { Database } from '../../types/database';

type Supplier = Database['public']['Tables']['suppliers']['Row'];
type DashboardState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; supplier: Supplier };

export function SupplierDashboard() {
  const router = useRouter();
  const { language } = useLanguage();
  const locale = language === 'ckb' ? 'ku' : language;
  const isKu = locale === 'ku';
  const isAr = locale === 'ar';
  const [state, setState] = useState<DashboardState>({ status: 'loading' });

  const text = {
    title: isKu ? 'داشبۆردی دابینکەر' : isAr ? 'لوحة تحكم المورد' : 'Supplier dashboard',
    loading: isKu ? 'زانیاری هەژمار بار دەکرێت...' : isAr ? 'جارٍ تحميل الحساب...' : 'Loading your account...',
    unavailable: isKu ? 'زانیاری هەژماری دابینکەر بەردەست نییە.' : isAr ? 'ملف المورد غير متاح.' : 'Supplier profile is unavailable.',
    pending: isKu ? 'چاوەڕێی پەسەندکردنە' : isAr ? 'بانتظار المراجعة' : 'Pending review',
    approved: isKu ? 'پەسەندکراو' : isAr ? 'تم التحقق' : 'Verified',
    status: isKu ? 'دۆخی هەژمار' : isAr ? 'حالة الحساب' : 'Account status',
    businessName: isKu ? 'ناوی بازرگانی' : isAr ? 'اسم النشاط التجاري' : 'Business name',
    location: isKu ? 'شوێن' : isAr ? 'الموقع' : 'Location',
    signOut: isKu ? 'چوونەدەرەوە' : isAr ? 'تسجيل الخروج' : 'Sign out',
  };

  useEffect(() => {
    let active = true;

    async function loadSupplier() {
      if (!supabaseBrowserClient) {
        setState({ status: 'error', message: text.unavailable });
        return;
      }

      const { data: sessionData, error: sessionError } =
        await supabaseBrowserClient.auth.getSession();
      if (sessionError) {
        setState({ status: 'error', message: sessionError.message });
        return;
      }

      const user = sessionData.session?.user;
      if (!user) {
        router.replace(`/${locale}/login`);
        return;
      }

      const { data: profile, error: profileError } = await supabaseBrowserClient
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        setState({ status: 'error', message: profileError.message });
        return;
      }

      if (profile?.role !== 'supplier') {
        router.replace(`/${locale}/products`);
        return;
      }

      const { data: supplier, error: supplierError } = await supabaseBrowserClient
        .from('suppliers')
        .select('*')
        .eq('owner_id', user.id)
        .maybeSingle();

      if (!active) return;

      if (supplierError || !supplier) {
        setState({
          status: 'error',
          message: supplierError?.message || text.unavailable,
        });
        return;
      }

      setState({ status: 'ready', supplier });
    }

    void loadSupplier();
    return () => {
      active = false;
    };
  }, [locale, router, text.unavailable]);

  async function handleSignOut() {
    if (!supabaseBrowserClient) {
      setState({ status: 'error', message: text.unavailable });
      return;
    }

    const { error } = await supabaseBrowserClient.auth.signOut();
    if (error) {
      setState({ status: 'error', message: error.message });
      return;
    }
    router.replace(`/${locale}`);
  }

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-950 sm:text-3xl">{text.title}</h1>
          <p className="mt-1 text-sm text-neutral-600">
            {isKu
              ? 'پڕۆفایلی بازرگانی و دۆخی پەسەندکردنت لێرە بەڕێوەببە.'
              : isAr
                ? 'تابع ملف نشاطك وحالة مراجعته هنا.'
                : 'Manage your business profile and review status here.'}
          </p>
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          className="rounded-xl border border-[#EAE7DF] bg-white px-4 py-2 text-sm font-bold text-neutral-700 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8C5E00]"
        >
          {text.signOut}
        </button>
      </div>

      {state.status === 'loading' ? (
        <div className="mt-8 h-48 animate-pulse rounded-2xl border border-[#EAE7DF] bg-white" aria-label={text.loading} />
      ) : state.status === 'error' ? (
        <p role="alert" className="mt-8 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800">
          {state.message}
        </p>
      ) : (
        <section className="mt-8 max-w-3xl rounded-2xl border border-[#EAE7DF] bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-neutral-500">{text.businessName}</p>
              <h2 className="mt-1 text-xl font-black text-neutral-950">{state.supplier.business_name}</h2>
              <p className="mt-2 text-sm text-neutral-600">
                {[state.supplier.city, state.supplier.country].filter(Boolean).join(', ')}
              </p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${
              state.supplier.verification_status === 'verified'
                ? 'bg-emerald-50 text-emerald-800'
                : 'bg-amber-50 text-amber-800'
            }`}>
              {state.supplier.verification_status === 'verified' ? text.approved : text.pending}
            </span>
          </div>
          <div className="mt-6 grid gap-4 border-t border-[#EAE7DF] pt-5 sm:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-neutral-500">{text.status}</p>
              <p className="mt-1 text-sm font-semibold text-neutral-800">{state.supplier.verification_status}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-neutral-500">{text.location}</p>
              <p className="mt-1 text-sm font-semibold text-neutral-800">
                {[state.supplier.city, state.supplier.country].filter(Boolean).join(', ')}
              </p>
            </div>
          </div>
          {state.supplier.verification_status !== 'verified' && (
            <p className="mt-5 rounded-xl bg-[#FFF8E8] p-4 text-sm leading-6 text-neutral-700">
              {isKu
                ? 'پڕۆفایلەکەت دوای پەسەندکردن دەردەکەوێت.'
                : isAr
                  ? 'سيظهر ملفك للمشترين بعد اكتمال المراجعة.'
                  : 'Your supplier profile will be visible to buyers after it is reviewed.'}
            </p>
          )}
        </section>
      )}
    </main>
  );
}
