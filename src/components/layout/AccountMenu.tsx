'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronDown, CircleUserRound, LogOut, Store, Truck } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { getSupabaseAuthHeaders } from '../../lib/supabase/authHeaders';
import { supabaseBrowserClient } from '../../lib/supabase/client';
import { MarketplaceRole } from '../../types/database';

interface AccountNavigation {
  email: string;
  roles: MarketplaceRole[];
  seller: {
    id: string;
    slug: string;
    name_en: string;
    verification_status: string;
    is_active: boolean;
  } | null;
  supplierAvailable: boolean;
  supplier: {
    id: string;
    business_name: string;
    verification_status: string;
    is_active: boolean;
  } | null;
}

type AccountState =
  | { status: 'loading' }
  | { status: 'guest' }
  | { status: 'error'; message: string; email?: string }
  | { status: 'authenticated'; account: AccountNavigation };

export function AccountMenu() {
  const router = useRouter();
  const { language, dir } = useLanguage();
  const locale = language === 'ckb' ? 'ku' : language;
  const isKu = locale === 'ku';
  const isAr = locale === 'ar';
  const [isOpen, setIsOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [state, setState] = useState<AccountState>({ status: 'loading' });
  const rootRef = useRef<HTMLDivElement>(null);

  const copy = {
    account: isKu ? 'هەژمار' : isAr ? 'الحساب' : 'Account',
    signIn: isKu ? 'چوونەژوورەوە' : isAr ? 'تسجيل الدخول' : 'Sign in',
    createAccount: isKu ? 'دروستکردنی هەژمار' : isAr ? 'إنشاء حساب' : 'Create account',
    becomeSeller: isKu ? 'بوون بە فرۆشیار' : isAr ? 'انضم كبائع' : 'Become a seller',
    becomeSupplier: isKu ? 'تۆمارکردنی بازرگانی' : isAr ? 'سجّل نشاطك التجاري' : 'Register a business',
    sellerDashboard: isKu ? 'داشبۆردی فرۆشیار' : isAr ? 'لوحة تحكم البائع' : 'Seller dashboard',
    supplierDashboard: isKu ? 'داشبۆردی دابینکەر' : isAr ? 'لوحة تحكم المورد' : 'Supplier dashboard',
    myStore: isKu ? 'فرۆشگاکەم' : isAr ? 'متجري' : 'My store',
    myProducts: isKu ? 'بەرهەمەکانم' : isAr ? 'منتجاتي' : 'My products',
    myOrders: isKu ? 'داواکارییەکانم' : isAr ? 'طلباتي' : 'My orders',
    sellerPlans: isKu ? 'پلانەکان' : isAr ? 'الخطط' : 'Seller plans',
    signOut: isKu ? 'چوونەدەرەوە' : isAr ? 'تسجيل الخروج' : 'Sign out',
    loading: isKu ? 'بارکردنی هەژمار...' : isAr ? 'جارٍ تحميل الحساب...' : 'Loading account...',
    permissionError: isKu
      ? 'زانیاری مۆڵەتەکان نەخوێندرایەوە.'
      : isAr
        ? 'تعذر تحميل صلاحيات الحساب.'
        : 'Could not load account permissions.',
    pending: isKu ? 'چاوەڕێی پێداچوونەوە' : isAr ? 'قيد المراجعة' : 'Pending review',
    rejected: isKu ? 'ڕەتکرایەوە' : isAr ? 'مرفوض' : 'Rejected',
    suspended: isKu ? 'وەستاندراوە' : isAr ? 'موقوف' : 'Suspended',
    approved: isKu ? 'پەسەندکراو' : isAr ? 'تمت الموافقة' : 'Approved',
    customer: isKu ? 'کڕیار' : isAr ? 'عميل' : 'Customer',
    seller: isKu ? 'فرۆشیار' : isAr ? 'بائع' : 'Seller',
    supplier: isKu ? 'دابینکەر' : isAr ? 'مورد' : 'Supplier',
    supplierUnavailable: isKu
      ? 'خزمەتگوزاری دابینکەر پێویستی بە ڕێکخستنی بنکەدراوە هەیە.'
      : isAr
        ? 'خدمات الموردين غير متاحة حتى إعداد قاعدة البيانات.'
        : 'Supplier services are unavailable until the database is configured.',
    retailer: isKu ? 'کڕیاری بازرگانی' : isAr ? 'مشتري تجاري' : 'Business buyer',
  };

  const localize = (path: string) => `/${locale}${path}`;
  const roleLabel = (role: MarketplaceRole) =>
    ({
      buyer: copy.customer,
      seller: copy.seller,
      supplier: copy.supplier,
      retailer: copy.retailer,
      admin: copy.account,
    })[role];

  function applicationStatus(status: string, isActive: boolean) {
    if (status === 'rejected') return copy.rejected;
    if (status === 'suspended') return copy.suspended;
    if (status === 'verified' && isActive) return copy.approved;
    return copy.pending;
  }

  useEffect(() => {
    if (!isOpen) return;

    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [isOpen]);

  useEffect(() => {
    let mounted = true;

    async function loadAccount() {
      if (!supabaseBrowserClient) {
        if (mounted) setState({ status: 'guest' });
        return;
      }

      let email: string | undefined;
      try {
        const { data: sessionData, error: sessionError } =
          await supabaseBrowserClient.auth.getSession();
        if (sessionError) throw sessionError;
        if (!sessionData.session) {
          if (mounted) setState({ status: 'guest' });
          return;
        }
        email = sessionData.session.user.email;

        const response = await fetch('/api/account/navigation', {
          headers: await getSupabaseAuthHeaders(),
          cache: 'no-store',
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || copy.permissionError);
        if (mounted) setState({ status: 'authenticated', account: data as AccountNavigation });
      } catch (error) {
        if (mounted) {
          setState({
            status: 'error',
            message: error instanceof Error ? error.message : copy.permissionError,
            email,
          });
        }
      }
    }

    void loadAccount();
    const { data: authListener } = supabaseBrowserClient?.auth.onAuthStateChange(() => {
      window.setTimeout(() => void loadAccount(), 0);
    }) || { data: { subscription: null } };

    return () => {
      mounted = false;
      authListener.subscription?.unsubscribe();
    };
  }, [locale, copy.permissionError]);

  async function handleSignOut() {
    if (!supabaseBrowserClient) {
      setState({ status: 'error', message: copy.permissionError });
      return;
    }

    setIsSigningOut(true);
    const { error } = await supabaseBrowserClient.auth.signOut();
    setIsSigningOut(false);
    if (error) {
      setState({ status: 'error', message: error.message });
      return;
    }

    setIsOpen(false);
    setState({ status: 'guest' });
    router.replace(localize('/'));
  }

  const linkClass =
    'flex min-h-10 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 transition hover:bg-[#FAF9F6] hover:text-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8C5E00]';
  const isApprovedSeller =
    state.status === 'authenticated' &&
    state.account.seller?.verification_status === 'verified' &&
    state.account.seller.is_active;

  return (
    <div className="relative shrink-0" ref={rootRef} dir={dir}>
      <button
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-controls="account-menu-panel"
        onClick={() => setIsOpen((open) => !open)}
        className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#EAE7DF] bg-white px-3 text-sm font-semibold text-neutral-800 shadow-xs transition hover:border-[#D8D4C8] hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8C5E00]"
      >
        <CircleUserRound className="h-4 w-4 text-[#657A52]" aria-hidden="true" />
        <span className="hidden sm:inline">{copy.account}</span>
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>

      {isOpen && (
        <div
          id="account-menu-panel"
          className="absolute end-0 top-full z-50 mt-2 max-h-[min(75vh,34rem)] w-[min(20rem,calc(100vw-1.5rem))] overflow-y-auto rounded-2xl border border-[#EAE7DF] bg-white p-2 shadow-xl"
        >
          {state.status === 'loading' ? (
            <p className="px-3 py-4 text-sm text-neutral-500" aria-live="polite">{copy.loading}</p>
          ) : state.status === 'error' ? (
            <div className="space-y-2 px-3 py-3">
              {state.email && <p className="truncate text-sm font-bold text-neutral-900">{state.email}</p>}
              <p className="text-sm text-red-700" role="alert">{state.message}</p>
              {state.email && (
                <button type="button" onClick={handleSignOut} className={`${linkClass} w-full`}>
                  <LogOut className="h-4 w-4" aria-hidden="true" />{copy.signOut}
                </button>
              )}
            </div>
          ) : state.status === 'guest' ? (
            <nav aria-label={copy.account} className="space-y-1">
              <Link href={localize('/login')} onClick={() => setIsOpen(false)} className={linkClass}>
                {copy.signIn}
              </Link>
              <Link
                href={localize('/register')}
                onClick={() => setIsOpen(false)}
                className="flex min-h-10 items-center justify-center rounded-lg bg-[#F4B942] px-3 py-2 text-sm font-bold text-neutral-950 transition hover:bg-[#E2A732] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8C5E00]"
              >
                {copy.createAccount}
              </Link>
              <div className="my-2 border-t border-[#EAE7DF]" />
              <Link href={localize('/register')} onClick={() => setIsOpen(false)} className={linkClass}>
                <Store className="h-4 w-4" aria-hidden="true" />{copy.becomeSeller}
              </Link>
              <Link href={localize('/register')} onClick={() => setIsOpen(false)} className={linkClass}>
                <Truck className="h-4 w-4" aria-hidden="true" />{copy.becomeSupplier}
              </Link>
            </nav>
          ) : (
            <nav aria-label={copy.account} className="space-y-1">
              <div className="px-3 py-2">
                <p className="truncate text-sm font-bold text-neutral-900">{state.account.email}</p>
                <p className="mt-1 text-xs text-neutral-500">
                  {state.account.roles.map(roleLabel).join(' · ')}
                </p>
              </div>
              <div className="border-t border-[#EAE7DF]" />

              {state.account.seller && (
                <>
                  <Link href={localize('/seller/dashboard')} onClick={() => setIsOpen(false)} className={linkClass}>
                    <Store className="h-4 w-4" aria-hidden="true" />
                    {copy.sellerDashboard}
                    <span className="ms-auto text-[11px] text-neutral-500">
                      {applicationStatus(state.account.seller.verification_status, state.account.seller.is_active)}
                    </span>
                  </Link>
                  {isApprovedSeller && (
                    <>
                      <Link href={localize(`/sellers/${encodeURIComponent(state.account.seller.slug)}`)} onClick={() => setIsOpen(false)} className={linkClass}>
                        {copy.myStore}
                      </Link>
                      <Link href={localize('/seller/dashboard?tab=products')} onClick={() => setIsOpen(false)} className={linkClass}>
                        {copy.myProducts}
                      </Link>
                      <Link href={localize('/seller/dashboard?tab=orders')} onClick={() => setIsOpen(false)} className={linkClass}>
                        {copy.myOrders}
                      </Link>
                      <Link href={localize('/seller/plans')} onClick={() => setIsOpen(false)} className={linkClass}>
                        {copy.sellerPlans}
                      </Link>
                    </>
                  )}
                </>
              )}

              {state.account.supplier && (
                <Link href={localize('/supplier/dashboard')} onClick={() => setIsOpen(false)} className={linkClass}>
                  <Truck className="h-4 w-4" aria-hidden="true" />
                  {copy.supplierDashboard}
                  <span className="ms-auto text-[11px] text-neutral-500">
                    {applicationStatus(state.account.supplier.verification_status, state.account.supplier.is_active)}
                  </span>
                </Link>
              )}
              {!state.account.supplierAvailable && (
                <p className="px-3 py-2 text-xs leading-5 text-amber-800" role="status">
                  {copy.supplierUnavailable}
                </p>
              )}

              {state.account.roles.includes('retailer') && (
                <Link href={localize('/b2b')} onClick={() => setIsOpen(false)} className={linkClass}>
                  {isKu ? 'بازاڕی بازرگانی' : isAr ? 'سوق الأعمال' : 'B2B Marketplace'}
                </Link>
              )}

              {!state.account.seller && (
                <Link href={localize('/seller/register')} onClick={() => setIsOpen(false)} className={linkClass}>
                  <Store className="h-4 w-4" aria-hidden="true" />{copy.becomeSeller}
                </Link>
              )}
              {!state.account.supplier && state.account.supplierAvailable && (
                <Link href={localize('/supplier/dashboard')} onClick={() => setIsOpen(false)} className={linkClass}>
                  <Truck className="h-4 w-4" aria-hidden="true" />{copy.becomeSupplier}
                </Link>
              )}

              <div className="my-1 border-t border-[#EAE7DF]" />
              <button
                type="button"
                disabled={isSigningOut}
                onClick={handleSignOut}
                className={`${linkClass} w-full disabled:cursor-wait disabled:opacity-60`}
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                {isSigningOut ? copy.loading : copy.signOut}
              </button>
            </nav>
          )}
        </div>
      )}
    </div>
  );
}
