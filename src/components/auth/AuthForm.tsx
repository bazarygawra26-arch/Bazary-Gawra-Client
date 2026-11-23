'use client';

import React, { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BriefcaseBusiness, ShoppingBag, Store, Truck } from 'lucide-react';
import { Button } from '../ui/Button';
import { useLanguage } from '../../context/LanguageContext';
import { MarketplaceRole } from '../../types/database';
import { supabaseBrowserClient } from '../../lib/supabase/client';
import { getSupabaseAuthHeaders } from '../../lib/supabase/authHeaders';

type AccountRole = Exclude<MarketplaceRole, 'admin'>;
type AuthMode = 'login' | 'register';

interface AuthFormProps {
  mode: AuthMode;
}

const roles: Array<{
  value: AccountRole;
  icon: typeof ShoppingBag;
}> = [
  { value: 'buyer', icon: ShoppingBag },
  { value: 'seller', icon: Store },
  { value: 'retailer', icon: BriefcaseBusiness },
  { value: 'supplier', icon: Truck },
];

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const { language } = useLanguage();
  const isKu = language === 'ku' || language === 'ckb';
  const isAr = language === 'ar';
  const [role, setRole] = useState<AccountRole>('buyer');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('wholesaler');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [notice, setNotice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const copy = {
    title: mode === 'login'
      ? isKu ? 'بەخێربێیتەوە' : isAr ? 'مرحباً بعودتك' : 'Welcome back'
      : isKu ? 'هەژمارێک دروست بکە' : isAr ? 'أنشئ حساباً' : 'Create your account',
    subtitle: mode === 'login'
      ? isKu ? 'بچۆ ژوورەوە بۆ بەردەوامبوون' : isAr ? 'سجّل الدخول للمتابعة' : 'Sign in to continue'
      : isKu ? 'جۆری هەژمارەکەت هەڵبژێرە' : isAr ? 'اختر نوع حسابك' : 'Choose the account type that fits you',
    fullName: isKu ? 'ناوی تەواو' : isAr ? 'الاسم الكامل' : 'Full name',
    email: isKu ? 'ئیمەیڵ' : isAr ? 'البريد الإلكتروني' : 'Email',
    password: isKu ? 'وشەی نهێنی' : isAr ? 'كلمة المرور' : 'Password',
    businessName: isKu ? 'ناوی بازرگانی' : isAr ? 'اسم النشاط التجاري' : 'Business name',
    phone: isKu ? 'ژمارەی تەلەفۆن' : isAr ? 'رقم الهاتف' : 'Phone',
    country: isKu ? 'وڵات' : isAr ? 'الدولة' : 'Country',
    city: isKu ? 'شار' : isAr ? 'المدينة' : 'City',
    address: isKu ? 'ناونیشانی بازرگانی' : isAr ? 'عنوان العمل' : 'Business address',
    description: isKu ? 'دەربارەی بازرگانی' : isAr ? 'نبذة عن النشاط' : 'Business description',
    website: isKu ? 'ماڵپەڕ (ئارەزوومەندانە)' : isAr ? 'الموقع الإلكتروني (اختياري)' : 'Website (optional)',
    businessType: isKu ? 'جۆری بازرگانی' : isAr ? 'نوع النشاط' : 'Business type',
    submit: mode === 'login'
      ? isKu ? 'چوونەژوورەوە' : isAr ? 'تسجيل الدخول' : 'Sign in'
      : isKu ? 'دروستکردنی هەژمار' : isAr ? 'إنشاء الحساب' : 'Create account',
    buyer: isKu ? 'کڕیار' : isAr ? 'مشتري' : 'Customer',
    seller: isKu ? 'فرۆشیاری ناوخۆیی' : isAr ? 'متجر محلي' : 'Local seller',
    retailer: isKu ? 'کڕیاری بازرگانی' : isAr ? 'تاجر تجزئة' : 'Business retailer',
    supplier: isKu ? 'دابینکەر / کۆفرۆشیار' : isAr ? 'مورد / تاجر جملة' : 'Supplier / wholesaler',
    loginLink: isKu ? 'پێشتر هەژمارت هەیە؟ بچۆ ژوورەوە' : isAr ? 'لديك حساب؟ سجّل الدخول' : 'Already have an account? Sign in',
    registerLink: isKu ? 'هەژمارت نییە؟ دروستی بکە' : isAr ? 'ليس لديك حساب؟ أنشئ حساباً' : 'Need an account? Create one',
  };

  const roleDescriptions: Record<AccountRole, string> = {
    buyer: isKu ? 'بگەڕێ، بەراورد بکە و لە دوکانە ناوخۆییەکان داوا بکە' : isAr ? 'اكتشف المنتجات وقارنها واطلب من المتاجر المحلية' : 'Discover products, compare offers, and order from local stores',
    seller: isKu ? 'بەرهەمەکانی فرۆشگاکەت بەڕێوەببە' : isAr ? 'أدر منتجات متجرك المحلي' : 'Manage products for your local shop',
    retailer: isKu ? 'بەدوای دابینکەر و نرخەکانی کۆمەڵ بگەڕێ' : isAr ? 'ابحث عن الموردين وأسعار الجملة' : 'Find suppliers and wholesale offers',
    supplier: isKu ? 'بەرهەم و پێشنیارە کۆمەڵەکانت پێشکەش بکە' : isAr ? 'اعرض منتجاتك وعروض الجملة' : 'List wholesale products and respond to business requests',
  };

  const localizePath = (path: string) => `/${language === 'ckb' ? 'ku' : language}${path}`;

  const getDashboardPath = async () => {
    const response = await fetch('/api/account/navigation', {
      headers: await getSupabaseAuthHeaders(),
      cache: 'no-store',
    });
    const navigation = await response.json();
    if (!response.ok) {
      throw new Error(navigation.error || 'Account permissions could not be loaded.');
    }

    const accountRoles = navigation.roles as MarketplaceRole[];
    if (accountRoles.includes('seller')) return '/seller/dashboard';
    if (accountRoles.includes('supplier')) return '/supplier/dashboard';
    if (accountRoles.includes('retailer')) return '/b2b';
    if (accountRoles.includes('buyer')) return '/products';
    return '/products';
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage('');
    setNotice('');

    if (!supabaseBrowserClient) {
      setErrorMessage(isKu ? 'پەیوەندی Supabase ڕێک نەخراوە.' : isAr ? 'اتصال Supabase غير مُهيأ.' : 'Supabase is not configured.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === 'register') {
        const { data, error } = await supabaseBrowserClient.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              role,
              full_name: fullName.trim(),
              business_name: businessName.trim(),
              business_type: businessType,
              phone: phone.trim(),
              country: country.trim(),
              city: city.trim(),
              address: address.trim(),
              description: description.trim(),
              website: website.trim(),
            },
          },
        });

        if (error) throw error;

        if (!data.session) {
          setNotice(
            isKu
              ? 'ئیمەیڵەکەت بپشکنە بۆ پشتڕاستکردنەوەی هەژمارەکەت.'
              : isAr
                ? 'تحقق من بريدك الإلكتروني لتأكيد حسابك.'
                : 'Check your email to confirm your account.'
          );
          return;
        }

        if (!data.user) throw new Error('Sign-up did not return a user.');
        router.replace(localizePath(await getDashboardPath()));
        return;
      }

      const { data, error } = await supabaseBrowserClient.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;
      if (!data.user) throw new Error('Sign-in did not return a user.');
      router.replace(localizePath(await getDashboardPath()));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Authentication failed.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputClassName = 'w-full rounded-xl border border-[#EAE7DF] bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus-visible:border-[#8C5E00] focus-visible:ring-2 focus-visible:ring-[#8C5E00]/20';
  const labelClassName = 'mb-1.5 block text-sm font-semibold text-neutral-700';

  return (
    <section className="mx-auto w-full max-w-2xl px-4 py-10 sm:py-16">
      <div className="rounded-3xl border border-[#EAE7DF] bg-white p-5 shadow-sm sm:p-8">
        <div className="mb-7 text-center">
          <h1 className="text-2xl font-black text-neutral-950 sm:text-3xl">{copy.title}</h1>
          <p className="mt-2 text-sm text-neutral-600">{copy.subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {mode === 'register' && (
            <fieldset>
              <legend className="mb-2 text-sm font-bold text-neutral-800">{copy.subtitle}</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {roles.map(({ value, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={role === value}
                    onClick={() => setRole(value)}
                    className={`flex min-h-20 items-start gap-3 rounded-xl border p-3 text-start transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8C5E00] ${
                      role === value
                        ? 'border-[#F4B942] bg-[#FFF8E8]'
                        : 'border-[#EAE7DF] hover:border-[#D8D4C8]'
                    }`}
                  >
                    <Icon className="mt-0.5 h-5 w-5 shrink-0 text-[#8C5E00]" aria-hidden="true" />
                    <span>
                      <span className="block text-sm font-bold text-neutral-900">{copy[value]}</span>
                      <span className="mt-1 block text-xs leading-relaxed text-neutral-600">{roleDescriptions[value]}</span>
                    </span>
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          {mode === 'register' && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className={role === 'buyer' ? 'sm:col-span-2' : ''}>
                <label htmlFor="full-name" className={labelClassName}>{copy.fullName}</label>
                <input id="full-name" autoComplete="name" required value={fullName} onChange={(event) => setFullName(event.target.value)} className={inputClassName} />
              </div>
              {role !== 'buyer' && (
                <div className="sm:col-span-2">
                  <label htmlFor="business-name" className={labelClassName}>{copy.businessName}</label>
                  <input id="business-name" autoComplete="organization" required value={businessName} onChange={(event) => setBusinessName(event.target.value)} className={inputClassName} />
                </div>
              )}
              {role !== 'buyer' && (
                <div>
                  <label htmlFor="phone" className={labelClassName}>{copy.phone}</label>
                  <input id="phone" type="tel" autoComplete="tel" required value={phone} onChange={(event) => setPhone(event.target.value)} className={inputClassName} />
                </div>
              )}
              {(role === 'supplier' || role === 'retailer') && (
                <>
                  <div>
                    <label htmlFor="country" className={labelClassName}>{copy.country}</label>
                    <input id="country" autoComplete="country-name" required value={country} onChange={(event) => setCountry(event.target.value)} className={inputClassName} />
                  </div>
                  <div>
                    <label htmlFor="city" className={labelClassName}>{copy.city}</label>
                    <input id="city" autoComplete="address-level2" required value={city} onChange={(event) => setCity(event.target.value)} className={inputClassName} />
                  </div>
                </>
              )}
              {role === 'seller' && (
                <div>
                  <label htmlFor="address" className={labelClassName}>{copy.address}</label>
                  <input id="address" autoComplete="street-address" value={address} onChange={(event) => setAddress(event.target.value)} className={inputClassName} />
                </div>
              )}
              {role === 'supplier' && (
                <>
                  <div>
                    <label htmlFor="business-type" className={labelClassName}>{copy.businessType}</label>
                    <select id="business-type" value={businessType} onChange={(event) => setBusinessType(event.target.value)} className={inputClassName}>
                      {['manufacturer', 'wholesaler', 'distributor', 'importer', 'supplier'].map((type) => (
                        <option key={type} value={type}>{type[0].toUpperCase() + type.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="supplier-address" className={labelClassName}>{copy.address}</label>
                    <input id="supplier-address" autoComplete="street-address" value={address} onChange={(event) => setAddress(event.target.value)} className={inputClassName} />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="description" className={labelClassName}>{copy.description}</label>
                    <textarea id="description" rows={3} value={description} onChange={(event) => setDescription(event.target.value)} className={inputClassName} />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="website" className={labelClassName}>{copy.website}</label>
                    <input id="website" type="url" autoComplete="url" value={website} onChange={(event) => setWebsite(event.target.value)} className={inputClassName} />
                  </div>
                </>
              )}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className={mode === 'register' ? '' : 'sm:col-span-2'}>
              <label htmlFor="email" className={labelClassName}>{copy.email}</label>
              <input id="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className={inputClassName} />
            </div>
            <div>
              <label htmlFor="password" className={labelClassName}>{copy.password}</label>
              <input id="password" type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} className={inputClassName} />
            </div>
          </div>

          {errorMessage && (
            <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </p>
          )}
          {notice && (
            <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              {notice}
            </p>
          )}

          <Button type="submit" className="w-full" size="lg" isLoading={isSubmitting}>
            {copy.submit}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-600">
          <Link
            href={localizePath(mode === 'login' ? '/register' : '/login')}
            className="font-bold text-[#8C5E00] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8C5E00]"
          >
            {mode === 'login' ? copy.registerLink : copy.loginLink}
          </Link>
        </p>
      </div>
    </section>
  );
}
