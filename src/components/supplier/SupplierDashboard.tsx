'use client';

import React, { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../../context/LanguageContext';
import { getSupabaseAuthHeaders } from '../../lib/supabase/authHeaders';
import { supabaseBrowserClient } from '../../lib/supabase/client';
import { Database } from '../../types/database';
import { Category } from '../../types';
import { LocationFields } from '../auth/LocationFields';
import { SearchableMultiSelect, SearchableOption } from '../ui/SearchableSelect';

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
  const [countryCode, setCountryCode] = useState('');
  const [governorateCode, setGovernorateCode] = useState('');
  const [city, setCity] = useState('');
  const [locationValid, setLocationValid] = useState(false);
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [categories, setCategories] = useState<Array<Pick<Category, 'slug' | 'name'>>>([]);
  const [selectedCategorySlugs, setSelectedCategorySlugs] = useState<string[]>([]);
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
    countryPlaceholder: isKu ? 'وڵات هەڵبژێرە' : isAr ? 'اختر الدولة' : 'Choose a country',
    countrySearch: isKu ? 'گەڕان بۆ وڵات...' : isAr ? 'ابحث عن دولة...' : 'Search countries...',
    governorate: isKu ? 'پارێزگا' : isAr ? 'المحافظة' : 'Governorate',
    governoratePlaceholder: isKu ? 'پارێزگا هەڵبژێرە' : isAr ? 'اختر المحافظة' : 'Choose a governorate',
    governorateSearch: isKu ? 'گەڕان بۆ پارێزگا...' : isAr ? 'ابحث عن محافظة...' : 'Search governorates...',
    city: isKu ? 'شار' : isAr ? 'المدينة' : 'City',
    cityPlaceholder: isKu ? 'شار هەڵبژێرە یان بنووسە' : isAr ? 'اختر المدينة أو اكتبها' : 'Choose or enter a city',
    citySearch: isKu ? 'گەڕان بۆ شار...' : isAr ? 'ابحث عن مدينة...' : 'Search cities...',
    noCities: isKu ? 'بۆ ئەم شوێنە لیستی شار بەردەست نییە؛ تکایە شارەکەت بنووسە.' : isAr ? 'لا تتوفر قائمة مدن لهذا الموقع؛ أدخل مدينتك.' : 'No city list is available for this location; enter your city.',
    loadingLocations: isKu ? 'شوێنەکان بار دەکرێن...' : isAr ? 'جارٍ تحميل المواقع...' : 'Loading locations...',
    moreLocationResults: isKu ? 'زیاتر بنووسە بۆ کەمکردنەوەی ئەنجامەکان.' : isAr ? 'اكتب المزيد لتضييق النتائج.' : 'Type to narrow the results.',
    noLocationOptions: isKu ? 'هیچ ئەنجامێک نەدۆزرایەوە.' : isAr ? 'لم يتم العثور على نتائج.' : 'No matching options.',
    clearSelection: isKu ? 'پاککردنەوەی هەڵبژاردە' : isAr ? 'مسح التحديد' : 'Clear selection',
    locationsUnavailable: isKu ? 'زانیاری شوێن بەردەست نییە.' : isAr ? 'بيانات المواقع غير متاحة.' : 'Location data is unavailable.',
    invalidLocation: isKu ? 'تکایە وڵات، پارێزگا و شار بە دروستی هەڵبژێرە.' : isAr ? 'يرجى اختيار الدولة والمحافظة والمدينة بشكل صحيح.' : 'Choose a valid country, governorate, and city.',
    location: isKu ? 'شوێن' : isAr ? 'الموقع' : 'Location',
    address: isKu ? 'ناونیشان' : isAr ? 'العنوان' : 'Address',
    description: isKu ? 'دەربارەی بازرگانی' : isAr ? 'نبذة عن النشاط' : 'Business description',
    website: isKu ? 'ماڵپەڕ' : isAr ? 'الموقع الإلكتروني' : 'Website',
    apply: isKu ? 'ناردنی داواکاری' : isAr ? 'إرسال الطلب' : 'Submit application',
    submitting: isKu ? 'داواکاری دەنێردرێت...' : isAr ? 'جارٍ إرسال الطلب...' : 'Submitting application...',
    signOut: isKu ? 'چوونەدەرەوە' : isAr ? 'تسجيل الخروج' : 'Sign out',
    chooseType: isKu ? 'هەڵبژێرە' : isAr ? 'اختر النوع' : 'Select type',
    suppliedCategories: isKu ? 'بەشەکانی بەرهەمە دابینکراوەکان' : isAr ? 'فئات المنتجات التي توفرها' : 'Product categories supplied',
    chooseCategories: isKu ? 'لانیکەم یەک بەش هەڵبژێرە' : isAr ? 'اختر فئة واحدة على الأقل' : 'Choose at least one category',
    categorySearch: isKu ? 'گەڕان لە بەشەکاندا...' : isAr ? 'ابحث في الفئات...' : 'Search categories...',
    noMatchingCategories: isKu ? 'هیچ بەشێک نەدۆزرایەوە.' : isAr ? 'لم يتم العثور على فئات.' : 'No matching categories.',
    categoriesUnavailable: isKu ? 'بەشەکان بارنەکران.' : isAr ? 'تعذر تحميل الفئات.' : 'Categories could not be loaded.',
  };
  const categoryOptions: SearchableOption[] = categories.map((category) => ({
    value: category.slug,
    label: category.name,
    searchText: category.slug,
  }));

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
          const categoriesResponse = await fetch(`/api/categories?lang=${locale}`, { cache: 'no-store' });
          const categoryResult = await categoriesResponse.json();
          if (!categoriesResponse.ok || !Array.isArray(categoryResult)) {
            throw new Error(categoryResult.error || text.categoriesUnavailable);
          }
          if (!active) return;
          setCategories(
            categoryResult.flatMap((category: Category) => [
              { slug: category.slug, name: category.name },
              ...(category.subcategories || []).map((subcategory) => ({
                slug: subcategory.slug,
                name: `${category.name} — ${subcategory.name}`,
              })),
            ])
          );
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
  }, [locale, router, text.categoriesUnavailable, text.unavailable]);

  async function handleApplicationSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setApplicationError('');
    if (selectedCategorySlugs.length === 0) {
      setApplicationError(text.chooseCategories);
      setIsSubmitting(false);
      return;
    }
    if (!locationValid) {
      setApplicationError(text.invalidLocation);
      setIsSubmitting(false);
      return;
    }
    if (!/^[0-9().\s-]+$/.test(phone) || phone.replace(/\D/g, '').length < 5 || phone.replace(/\D/g, '').length > 14) {
      setApplicationError(isKu ? 'ژمارەی تەلەفۆن بە دروستی بنووسە.' : isAr ? 'أدخل رقم هاتف صحيحاً.' : 'Enter a valid phone number.');
      setIsSubmitting(false);
      return;
    }

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
          country_code: countryCode,
          governorate_code: governorateCode,
          city,
          address,
          description,
          website,
          category_slugs: selectedCategorySlugs,
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
                <option key={type} value={type}>
                  {type === 'manufacturer'
                    ? isKu ? 'بەرهەمهێنەر' : isAr ? 'مصنّع' : 'Manufacturer'
                    : type === 'wholesaler'
                      ? isKu ? 'کۆفرۆشیار' : isAr ? 'تاجر جملة' : 'Wholesaler'
                      : type === 'distributor'
                        ? isKu ? 'دابەشکەر' : isAr ? 'موزّع' : 'Distributor'
                        : type === 'importer'
                          ? isKu ? 'هاوردەکار' : isAr ? 'مستورد' : 'Importer'
                          : isKu ? 'دابینکەر' : isAr ? 'مورد' : 'Supplier'}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="supplier-contact" className={labelClass}>{text.contactPerson}</label>
            <input id="supplier-contact" required minLength={2} maxLength={160} value={contactPerson} onChange={(event) => setContactPerson(event.target.value)} className={inputClass} />
          </div>
          <div className="sm:col-span-2">
            <LocationFields
              idPrefix="supplier-application"
              locale={locale}
              dir={isKu || isAr ? 'rtl' : 'ltr'}
              countryCode={countryCode}
              governorateCode={governorateCode}
              city={city}
              phone={phone}
              labels={{
                country: text.country,
                countryPlaceholder: text.countryPlaceholder,
                countrySearch: text.countrySearch,
                governorate: text.governorate,
                governoratePlaceholder: text.governoratePlaceholder,
                governorateSearch: text.governorateSearch,
                city: text.city,
                cityPlaceholder: text.cityPlaceholder,
                citySearch: text.citySearch,
                phone: text.phone,
                noCities: text.noCities,
                loading: text.loadingLocations,
                moreResults: text.moreLocationResults,
                noOptions: text.noLocationOptions,
                clear: text.clearSelection,
                locationUnavailable: text.locationsUnavailable,
              }}
              error={applicationError === text.invalidLocation ? text.invalidLocation : undefined}
              onCountryChange={setCountryCode}
              onGovernorateChange={setGovernorateCode}
              onCityChange={setCity}
              onPhoneChange={setPhone}
              onValidityChange={setLocationValid}
            />
          </div>
          <div>
            <label htmlFor="supplier-address" className={labelClass}>{text.address}</label>
            <input id="supplier-address" required minLength={2} maxLength={300} value={address} onChange={(event) => setAddress(event.target.value)} className={inputClass} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="supplier-description" className={labelClass}>{text.description}</label>
            <textarea id="supplier-description" rows={3} value={description} onChange={(event) => setDescription(event.target.value)} className={inputClass} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="supplier-website" className={labelClass}>{text.website}</label>
            <input id="supplier-website" type="url" value={website} onChange={(event) => setWebsite(event.target.value)} className={inputClass} />
          </div>
          <div className="sm:col-span-2">
            {categories.length === 0 ? (
              <p role="alert" className="text-sm text-red-700">{text.categoriesUnavailable}</p>
            ) : (
              <SearchableMultiSelect
                id="supplier-application-categories"
                label={text.suppliedCategories}
                searchPlaceholder={text.categorySearch}
                emptyMessage={text.noMatchingCategories}
                options={categoryOptions}
                value={selectedCategorySlugs}
                error={applicationError === text.chooseCategories ? text.chooseCategories : undefined}
                dir={isKu || isAr ? 'rtl' : 'ltr'}
                locale={locale === 'ku' ? 'ckb' : locale}
                onChange={setSelectedCategorySlugs}
              />
            )}
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
