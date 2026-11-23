'use client';

import React, { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../../context/LanguageContext';
import { getSupabaseAuthHeaders } from '../../lib/supabase/authHeaders';
import { supabaseBrowserClient } from '../../lib/supabase/client';
import { Database } from '../../types/database';

type Supplier = Database['public']['Tables']['suppliers']['Row'];
type DashboardState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'application' }
  | { status: 'ready'; supplier: Supplier };

export function SupplierDashboard() {
  const router = useRouter();
  const { language } = useLanguage();
  const locale = language === 'ckb' ? 'ku' : language;
  const isKu = locale === 'ku';
  const isAr = locale === 'ar';
  const [state, setState] = useState<DashboardState>({ status: 'loading' });
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState<Supplier['business_type']>('wholesaler');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applicationError, setApplicationError] = useState('');

  const text = {
    title: isKu ? 'داشبۆردی دابینکەر' : isAr ? 'لوحة تحكم المورد' : 'Supplier dashboard',
    loading: isKu ? 'زانیاری هەژمار بار دەکرێت...' : isAr ? 'جارٍ تحميل الحساب...' : 'Loading your account...',
    unavailable: isKu ? 'زانیاری هەژماری دابینکەر بەردەست نییە.' : isAr ? 'ملف المورد غير متاح.' : 'Supplier profile is unavailable.',
    pending: isKu ? 'چاوەڕێی پێداچوونەوە' : isAr ? 'قيد المراجعة' : 'Pending review',
    approved: isKu ? 'پەسەندکراو' : isAr ? 'تمت الموافقة' : 'Approved',
    rejected: isKu ? 'ڕەتکرایەوە' : isAr ? 'مرفوض' : 'Rejected',
    suspended: isKu ? 'وەستاندراوە' : isAr ? 'موقوف' : 'Suspended',
    status: isKu ? 'دۆخی هەژمار' : isAr ? 'حالة الحساب' : 'Account status',
    businessName: isKu ? 'ناوی بازرگانی' : isAr ? 'اسم النشاط التجاري' : 'Business name',
    businessType: isKu ? 'جۆری بازرگانی' : isAr ? 'نوع النشاط' : 'Business type',
    contactPerson: isKu ? 'کەسی پەیوەندی' : isAr ? 'الشخص المسؤول' : 'Contact person',
    phone: isKu ? 'ژمارەی تەلەفۆن' : isAr ? 'رقم الهاتف' : 'Phone number',
    country: isKu ? 'وڵات' : isAr ? 'الدولة' : 'Country',
    city: isKu ? 'شار' : isAr ? 'المدينة' : 'City',
    location: isKu ? 'شوێن' : isAr ? 'الموقع' : 'Location',
    address: isKu ? 'ناونیشان' : isAr ? 'العنوان' : 'Address',
    description: isKu ? 'دەربارەی بازرگانی' : isAr ? 'نبذة عن النشاط' : 'Business description',
    website: isKu ? 'ماڵپەڕ' : isAr ? 'الموقع الإلكتروني' : 'Website',
    apply: isKu ? 'ناردنی داواکاری' : isAr ? 'إرسال الطلب' : 'Submit application',
    submitting: isKu ? 'داواکاری دەنێردرێت...' : isAr ? 'جارٍ إرسال الطلب...' : 'Submitting application...',
    signOut: isKu ? 'چوونەدەرەوە' : isAr ? 'تسجيل الخروج' : 'Sign out',
    chooseType: isKu ? 'هەڵبژێرە' : isAr ? 'اختر النوع' : 'Select type',
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
      if (!sessionData.session) {
        router.replace(`/${locale}/login`);
        return;
      }

      try {
        const response = await fetch('/api/supplier/profile', {
          headers: await getSupabaseAuthHeaders(),
          cache: 'no-store',
        });
        const result = await response.json();
        if (!response.ok) {
          if (response.status === 401) {
            router.replace(`/${locale}/login`);
            return;
          }
          throw new Error(result.error || text.unavailable);
        }

        if (!active) return;
        if (result.supplier) {
          setState({ status: 'ready', supplier: result.supplier as Supplier });
        } else {
          setState({ status: 'application' });
        }
      } catch (error) {
        if (active) {
          setState({
            status: 'error',
            message: error instanceof Error ? error.message : text.unavailable,
          });
        }
      }
    }

    void loadSupplier();
    return () => {
      active = false;
    };
  }, [locale, router, text.unavailable]);

  async function handleApplicationSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setApplicationError('');

    try {
      const response = await fetch('/api/supplier/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...await getSupabaseAuthHeaders(),
        },
        body: JSON.stringify({
          business_name: businessName,
          business_type: businessType,
          contact_person: contactPerson,
          phone,
          country,
          city,
          address,
          description,
          website,
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || text.unavailable);
      }
      setState({ status: 'ready', supplier: result.supplier as Supplier });
    } catch (error) {
      setApplicationError(error instanceof Error ? error.message : text.unavailable);
    } finally {
      setIsSubmitting(false);
    }
  }

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

  const inputClass =
    'w-full rounded-xl border border-[#EAE7DF] bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none focus-visible:border-[#8C5E00] focus-visible:ring-2 focus-visible:ring-[#8C5E00]/20';
  const labelClass = 'mb-1.5 block text-sm font-semibold text-neutral-700';
  const statusLabel = (supplier: Supplier) => {
    if (supplier.verification_status === 'rejected') return text.rejected;
    if (supplier.verification_status === 'suspended') return text.suspended;
    if (supplier.verification_status === 'verified' && supplier.is_active) return text.approved;
    return text.pending;
  };
  const isApproved = (supplier: Supplier) =>
    supplier.verification_status === 'verified' && supplier.is_active;

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8" dir={isKu || isAr ? 'rtl' : 'ltr'}>
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
        {state.status !== 'loading' && (
          <button
            type="button"
            onClick={handleSignOut}
            className="rounded-xl border border-[#EAE7DF] bg-white px-4 py-2 text-sm font-bold text-neutral-700 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8C5E00]"
          >
            {text.signOut}
          </button>
        )}
      </div>

      {state.status === 'loading' ? (
        <div className="mt-8 h-48 animate-pulse rounded-2xl border border-[#EAE7DF] bg-white" aria-label={text.loading} />
      ) : state.status === 'error' ? (
        <p role="alert" className="mt-8 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800">
          {state.message}
        </p>
      ) : state.status === 'application' ? (
        <form onSubmit={handleApplicationSubmit} className="mt-8 grid max-w-3xl gap-4 rounded-2xl border border-[#EAE7DF] bg-white p-5 shadow-sm sm:grid-cols-2 sm:p-7">
          <h2 className="text-xl font-black text-neutral-950 sm:col-span-2">
            {isKu ? 'داواکاری دابینکەری بازرگانی' : isAr ? 'طلب تسجيل نشاط كمورد' : 'Register as a business supplier'}
          </h2>
          <div className="sm:col-span-2">
            <label htmlFor="supplier-business-name" className={labelClass}>{text.businessName}</label>
            <input id="supplier-business-name" required minLength={2} maxLength={160} value={businessName} onChange={(event) => setBusinessName(event.target.value)} className={inputClass} />
          </div>
          <div>
            <label htmlFor="supplier-business-type" className={labelClass}>{text.businessType}</label>
            <select id="supplier-business-type" value={businessType} onChange={(event) => setBusinessType(event.target.value as Supplier['business_type'])} className={inputClass}>
              {(['manufacturer', 'wholesaler', 'distributor', 'importer', 'supplier'] as const).map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="supplier-contact" className={labelClass}>{text.contactPerson}</label>
            <input id="supplier-contact" required minLength={2} maxLength={160} value={contactPerson} onChange={(event) => setContactPerson(event.target.value)} className={inputClass} />
          </div>
          <div>
            <label htmlFor="supplier-phone" className={labelClass}>{text.phone}</label>
            <input id="supplier-phone" type="tel" required minLength={5} maxLength={40} value={phone} onChange={(event) => setPhone(event.target.value)} className={inputClass} />
          </div>
          <div>
            <label htmlFor="supplier-country" className={labelClass}>{text.country}</label>
            <input id="supplier-country" required value={country} onChange={(event) => setCountry(event.target.value)} className={inputClass} />
          </div>
          <div>
            <label htmlFor="supplier-city" className={labelClass}>{text.city}</label>
            <input id="supplier-city" required value={city} onChange={(event) => setCity(event.target.value)} className={inputClass} />
          </div>
          <div>
            <label htmlFor="supplier-address" className={labelClass}>{text.address}</label>
            <input id="supplier-address" value={address} onChange={(event) => setAddress(event.target.value)} className={inputClass} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="supplier-description" className={labelClass}>{text.description}</label>
            <textarea id="supplier-description" rows={3} value={description} onChange={(event) => setDescription(event.target.value)} className={inputClass} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="supplier-website" className={labelClass}>{text.website}</label>
            <input id="supplier-website" type="url" value={website} onChange={(event) => setWebsite(event.target.value)} className={inputClass} />
          </div>
          {applicationError && <p role="alert" className="text-sm text-red-700 sm:col-span-2">{applicationError}</p>}
          <button type="submit" disabled={isSubmitting} className="min-h-11 rounded-xl bg-[#F4B942] px-4 py-2 text-sm font-bold text-neutral-950 hover:bg-[#E2A732] disabled:opacity-60 sm:col-span-2">
            {isSubmitting ? text.submitting : text.apply}
          </button>
        </form>
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
              isApproved(state.supplier) ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'
            }`}>
              {statusLabel(state.supplier)}
            </span>
          </div>
          <div className="mt-6 grid gap-4 border-t border-[#EAE7DF] pt-5 sm:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-neutral-500">{text.status}</p>
              <p className="mt-1 text-sm font-semibold text-neutral-800">{statusLabel(state.supplier)}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-neutral-500">{text.location}</p>
              <p className="mt-1 text-sm font-semibold text-neutral-800">
                {[state.supplier.city, state.supplier.country].filter(Boolean).join(', ')}
              </p>
            </div>
          </div>
          {!isApproved(state.supplier) && (
            <p className="mt-5 rounded-xl bg-[#FFF8E8] p-4 text-sm leading-6 text-neutral-700">
              {state.supplier.verification_status === 'rejected'
                ? (isKu ? 'داواکارییەکەت ڕەتکراوەتەوە. تکایە پەیوەندی بە پشتگیرییەوە بکە.' : isAr ? 'تم رفض طلبك. يرجى التواصل مع الدعم.' : 'Your application was rejected. Please contact support.')
                : state.supplier.verification_status === 'suspended'
                  ? (isKu ? 'هەژمارەکەت وەستاندراوە. تکایە پەیوەندی بە پشتگیرییەوە بکە.' : isAr ? 'تم إيقاف حسابك. يرجى التواصل مع الدعم.' : 'Your account is suspended. Please contact support.')
                  : (isKu
                    ? 'پڕۆفایلەکەت دوای پەسەندکردن دەردەکەوێت.'
                    : isAr
                      ? 'سيظهر ملفك للمشترين بعد اكتمال المراجعة.'
                      : 'Your supplier profile will be visible to buyers after it is reviewed.')}
            </p>
          )}
        </section>
      )}
    </main>
  );
}
