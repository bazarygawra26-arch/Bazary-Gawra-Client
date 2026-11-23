'use client';

import React, { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BriefcaseBusiness, Eye, EyeOff, ShoppingBag, Store, Truck } from 'lucide-react';
import { Button } from '../ui/Button';
import { LocationFields } from './LocationFields';
import { SearchableMultiSelect, SearchableOption, SearchableSelect } from '../ui/SearchableSelect';
import { useLanguage } from '../../context/LanguageContext';
import { Category } from '../../types';
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

const retailerTypes = ['retail_store', 'retail_chain', 'supermarket', 'distributor', 'other_business'] as const;
const supplierTypes = ['manufacturer', 'wholesaler', 'distributor', 'importer', 'supplier'] as const;
const strongPasswordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
const phonePattern = /^[()\d.\-\s]+$/;

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const { language, dir } = useLanguage();
  const locale = language === 'ckb' ? 'ku' : language;
  const isKu = locale === 'ku';
  const isAr = locale === 'ar';
  const [role, setRole] = useState<AccountRole | null>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [governorateCode, setGovernorateCode] = useState('');
  const [city, setCity] = useState('');
  const [locationValid, setLocationValid] = useState(false);
  const [storeName, setStoreName] = useState('');
  const [storeAddress, setStoreAddress] = useState('');
  const [storeDescription, setStoreDescription] = useState('');
  const [storeCategorySlug, setStoreCategorySlug] = useState('');
  const [storeWebsite, setStoreWebsite] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [businessDescription, setBusinessDescription] = useState('');
  const [categorySlugs, setCategorySlugs] = useState<string[]>([]);
  const [categories, setCategories] = useState<Array<Pick<Category, 'slug' | 'name'>>>([]);
  const [categoryLoadError, setCategoryLoadError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [notice, setNotice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const copy = {
    title: mode === 'login'
      ? isKu ? 'بەخێربێیتەوە' : isAr ? 'مرحباً بعودتك' : 'Welcome back'
      : isKu ? 'هەژمارێک دروست بکە' : isAr ? 'أنشئ حساباً' : 'Create your account',
    chooseAccount: isKu ? 'هەنگاوی ١: جۆری هەژمار هەڵبژێرە' : isAr ? 'الخطوة ١: اختر نوع الحساب' : 'Step 1: Choose your account type',
    completeRegistration: isKu ? 'هەنگاوی ٢: زانیارییەکانت تەواو بکە' : isAr ? 'الخطوة ٢: أكمل بيانات التسجيل' : 'Step 2: Complete your registration',
    signInSubtitle: isKu ? 'بچۆ ژوورەوە بۆ بەردەوامبوون' : isAr ? 'سجّل الدخول للمتابعة' : 'Sign in to continue',
    fullName: isKu ? 'ناوی تەواو' : isAr ? 'الاسم الكامل' : 'Full name',
    email: isKu ? 'ئیمەیڵ' : isAr ? 'البريد الإلكتروني' : 'Email address',
    password: isKu ? 'وشەی نهێنی' : isAr ? 'كلمة المرور' : 'Password',
    confirmPassword: isKu ? 'دووبارە وشەی نهێنی بنووسە' : isAr ? 'تأكيد كلمة المرور' : 'Confirm password',
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
    invalidLocation: isKu ? 'تکایە وڵات، پارێزگا و شار بە دروستی هەڵبژێرە و ژمارەی تەلەفۆن بنووسە.' : isAr ? 'يرجى اختيار الدولة والمحافظة والمدينة بشكل صحيح وإدخال رقم الهاتف.' : 'Choose a valid country, governorate, and city, and enter a phone number.',
    categorySearch: isKu ? 'گەڕان لە بەشەکاندا...' : isAr ? 'ابحث في الفئات...' : 'Search categories...',
    noMatchingCategories: isKu ? 'هیچ بەشێک نەدۆزرایەوە.' : isAr ? 'لم يتم العثور على فئات.' : 'No matching categories.',
    storeName: isKu ? 'ناوی فرۆشگا' : isAr ? 'اسم المتجر' : 'Store name',
    storeAddress: isKu ? 'ناونیشانی فرۆشگا' : isAr ? 'عنوان المتجر' : 'Store address',
    storeDescription: isKu ? 'دەربارەی فرۆشگا' : isAr ? 'وصف المتجر' : 'Store description',
    storeCategory: isKu ? 'بەشی فرۆشگا' : isAr ? 'فئة المتجر' : 'Store category',
    storeWebsite: isKu ? 'ماڵپەڕی فرۆشگا (ئارەزوومەندانە)' : isAr ? 'موقع المتجر (اختياري)' : 'Store website (optional)',
    businessName: isKu ? 'ناوی بازرگانی' : isAr ? 'اسم النشاط التجاري' : 'Business name',
    businessType: isKu ? 'جۆری بازرگانی' : isAr ? 'نوع النشاط التجاري' : 'Business type',
    selectBusinessType: isKu ? 'جۆرێک هەڵبژێرە' : isAr ? 'اختر نوع النشاط' : 'Select a business type',
    businessAddress: isKu ? 'ناونیشانی بازرگانی' : isAr ? 'عنوان النشاط التجاري' : 'Business address',
    businessDescription: isKu ? 'وردەکارییەکانی بازرگانی' : isAr ? 'تفاصيل النشاط التجاري' : 'Business details',
    buyerCategories: isKu ? 'بەشەکانی بەرهەمە خوازراوەکان' : isAr ? 'فئات المنتجات المطلوبة' : 'Product categories of interest',
    supplierCategories: isKu ? 'بەرهەمەکانی دابینکراو' : isAr ? 'فئات المنتجات التي توفرها' : 'Product categories supplied',
    selectCategory: isKu ? 'بەشێک هەڵبژێرە' : isAr ? 'اختر فئة' : 'Select a category',
    selectCategories: isKu ? 'لانیکەم یەک بەش هەڵبژێرە' : isAr ? 'اختر فئة واحدة على الأقل' : 'Choose at least one category',
    passwordHint: isKu
      ? 'لانیکەم ٨ پیت، پیتی گەورە و بچووک و ژمارە.'
      : isAr
        ? '٨ أحرف على الأقل، مع حرف كبير وصغير ورقم.'
        : 'At least 8 characters, with uppercase, lowercase, and a number.',
    register: isKu ? 'دروستکردنی هەژمار' : isAr ? 'إنشاء الحساب' : 'Create account',
    submitSeller: isKu ? 'ناردنی داواکاری فرۆشگا' : isAr ? 'إرسال طلب المتجر' : 'Submit seller application',
    submitBuyer: isKu ? 'دروستکردنی هەژماری بازرگانی' : isAr ? 'إنشاء حساب مشتري تجاري' : 'Create business buyer account',
    submitSupplier: isKu ? 'ناردنی داواکاری دابینکەر' : isAr ? 'إرسال طلب المورد' : 'Submit supplier application',
    signIn: isKu ? 'چوونەژوورەوە' : isAr ? 'تسجيل الدخول' : 'Sign in',
    customer: isKu ? 'کڕیار' : isAr ? 'عميل' : 'Customer',
    localSeller: isKu ? 'فرۆشیاری ناوخۆیی' : isAr ? 'بائع محلي' : 'Local seller',
    businessBuyer: isKu ? 'کڕیاری بازرگانی' : isAr ? 'مشتري تجاري' : 'Business buyer',
    supplier: isKu ? 'دابینکەر / کۆفرۆشیار' : isAr ? 'مورد / تاجر جملة' : 'Supplier / wholesaler',
    needAccount: isKu ? 'هەژمارت نییە؟ دروستی بکە' : isAr ? 'ليس لديك حساب؟ أنشئ حساباً' : 'Need an account? Create one',
    alreadyAccount: isKu ? 'پێشتر هەژمارت هەیە؟ بچۆ ژوورەوە' : isAr ? 'لديك حساب؟ سجّل الدخول' : 'Already have an account? Sign in',
    phoneInvalid: isKu ? 'ژمارەی تەلەفۆن بە دروستی بنووسە.' : isAr ? 'أدخل رقم هاتف صحيحاً.' : 'Enter a valid phone number.',
    weakPassword: isKu ? 'وشەی نهێنی پێویستە بەهێزتر بێت.' : isAr ? 'كلمة المرور لا تحقق شروط القوة.' : 'Choose a stronger password.',
    passwordsMismatch: isKu ? 'وشە نهێنییەکان یەک ناگرنەوە.' : isAr ? 'كلمتا المرور غير متطابقتين.' : 'Passwords do not match.',
    invalidEmail: isKu ? 'ئیمەیڵێکی دروست بنووسە.' : isAr ? 'أدخل بريداً إلكترونياً صحيحاً.' : 'Enter a valid email address.',
    requiredFields: isKu ? 'تکایە هەموو خانە پێویستەکان پڕ بکەرەوە.' : isAr ? 'يرجى تعبئة جميع الحقول المطلوبة.' : 'Please complete all required fields.',
    chooseCategory: isKu ? 'بەشێکی دروست هەڵبژێرە.' : isAr ? 'اختر فئة صحيحة.' : 'Choose a valid category.',
    checkEmail: isKu
      ? 'ئیمەیڵەکەت بپشکنە بۆ پشتڕاستکردنەوەی هەژمارەکەت.'
      : isAr
        ? 'تحقق من بريدك الإلكتروني لتأكيد حسابك.'
        : 'Check your email to confirm your account.',
    sellerPending: isKu
      ? 'هەژمارەکەت دوای پشتڕاستکردنەوەی ئیمەیڵ چاوەڕێی پێداچوونەوەی داواکاری فرۆشگا دەبێت.'
      : isAr
        ? 'بعد تأكيد البريد الإلكتروني، سيبقى طلب المتجر قيد المراجعة.'
        : 'After email confirmation, your store application will await review.',
    supplierPending: isKu
      ? 'هەژمارەکەت دوای پشتڕاستکردنەوەی ئیمەیڵ چاوەڕێی پێداچوونەوەی داواکاری دابینکەر دەبێت.'
      : isAr
        ? 'بعد تأكيد البريد الإلكتروني، سيبقى طلب المورد قيد المراجعة.'
        : 'After email confirmation, your supplier application will await review.',
    buyerCreated: isKu
      ? 'پاش پشتڕاستکردنەوەی ئیمەیڵ دەتوانیت بازاڕی بازرگانی بەکاربهێنیت.'
      : isAr
        ? 'بعد تأكيد البريد الإلكتروني، يمكنك استخدام سوق الأعمال.'
        : 'After email confirmation, you can access the B2B marketplace.',
  };

  const roleLabels: Record<AccountRole, string> = {
    buyer: copy.customer,
    seller: copy.localSeller,
    retailer: copy.businessBuyer,
    supplier: copy.supplier,
  };

  const roleDescriptions: Record<AccountRole, string> = {
    buyer: isKu
      ? 'بەرهەمە ناوخۆییەکان بدۆزەرەوە، بەراوردیان بکە و لە فرۆشگاکان داوا بکە.'
      : isAr
        ? 'تصفح المنتجات وقارن بينها واطلب من المتاجر المحلية.'
        : 'Browse, compare, and order from local shops.',
    seller: isKu
      ? 'داواکاری فرۆشگاکەت بنێرە و بەرهەمەکانت دوای پەسەندکردن بەڕێوەببە.'
      : isAr
        ? 'قدّم طلب متجرك وأدر منتجاتك بعد الموافقة.'
        : 'Apply for a store and manage products after approval.',
    retailer: isKu
      ? 'دابینکەر بدۆزەرەوە و نرخەکانی کۆمەڵ بۆ بازرگانییەکەت بەراورد بکە.'
      : isAr
        ? 'اكتشف الموردين وقارن أسعار الجملة لنشاطك التجاري.'
        : 'Discover suppliers and compare wholesale prices for your business.',
    supplier: isKu
      ? 'داواکاری دابینکەری بازرگانی بنێرە و بەرهەمە کۆمەڵەکانت پێشکەش بکە.'
      : isAr
        ? 'قدّم طلب المورد واعرض منتجاتك بالجملة.'
        : 'Apply as a supplier and present your wholesale products.',
  };

  const localizePath = (path: string) => `/${locale}${path}`;
  const selectedRole = role;
  const categoryOptions: SearchableOption[] = categories.map((category) => ({
    value: category.slug,
    label: category.name,
    searchText: category.slug,
  }));

  useEffect(() => {
    if (mode !== 'register') return;
    let active = true;

    async function loadCategories() {
      try {
        const response = await fetch(`/api/categories?lang=${locale}`, { cache: 'no-store' });
        const result = await response.json();
        if (!response.ok) throw new Error('Categories could not be loaded.');
        if (active) {
          const categoryChoices: Array<Pick<Category, 'slug' | 'name'>> = Array.isArray(result)
            ? result.flatMap((category: Category) => [
                { slug: category.slug, name: category.name },
                ...(category.subcategories || []).map((subcategory) => ({
                  slug: subcategory.slug,
                  name: `${category.name} — ${subcategory.name}`,
                })),
              ])
            : [];
          if (categoryChoices.length === 0) throw new Error('No active categories are available.');
          setCategories(categoryChoices);
          setCategoryLoadError('');
        }
      } catch {
        if (active) {
          setCategoryLoadError(
            locale === 'ku'
              ? 'بەشەکان بارنەکران. تکایە دووبارە هەوڵ بدەرەوە.'
              : locale === 'ar'
                ? 'تعذر تحميل الفئات. يرجى المحاولة مرة أخرى.'
                : 'Could not load categories. Please try again.'
          );
        }
      }
    }

    void loadCategories();
    return () => {
      active = false;
    };
  }, [locale, mode]);

  function resetRoleSpecificFields() {
    setStoreName('');
    setStoreAddress('');
    setStoreDescription('');
    setStoreCategorySlug('');
    setStoreWebsite('');
    setBusinessName('');
    setBusinessType('');
    setBusinessAddress('');
    setBusinessDescription('');
    setCategorySlugs([]);
  }

  function handleRoleSelection(nextRole: AccountRole) {
    if (nextRole !== selectedRole) resetRoleSpecificFields();
    setRole(nextRole);
    setErrorMessage('');
    setNotice('');
  }

  async function getDashboardPath() {
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
    return '/products';
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage('');
    setNotice('');

    const normalizedEmail = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setErrorMessage(copy.invalidEmail);
      return;
    }

    if (!supabaseBrowserClient) {
      setErrorMessage(isKu ? 'پەیوەندی Supabase ڕێک نەخراوە.' : isAr ? 'اتصال Supabase غير مُهيأ.' : 'Supabase is not configured.');
      return;
    }
    if (mode === 'register') {
      if (!selectedRole) {
        setErrorMessage(copy.chooseAccount);
        return;
      }
      const requiredValues = [fullName, phone, city];
      if (selectedRole === 'seller') requiredValues.push(storeName, storeAddress, storeCategorySlug, storeDescription);
      if (selectedRole === 'retailer') {
        requiredValues.push(businessName, businessType, businessAddress, businessDescription);
      }
      if (selectedRole === 'supplier') {
        requiredValues.push(businessName, businessType, businessAddress);
      }
      if (requiredValues.some((value) => !value.trim())) {
        setErrorMessage(copy.requiredFields);
        return;
      }
      if (!locationValid) {
        setErrorMessage(copy.invalidLocation);
        return;
      }
      if (!phonePattern.test(phone) || phone.replace(/\D/g, '').length < 5 || phone.replace(/\D/g, '').length > 14) {
        setErrorMessage(copy.phoneInvalid);
        return;
      }
      if (!strongPasswordPattern.test(password)) {
        setErrorMessage(copy.weakPassword);
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage(copy.passwordsMismatch);
        return;
      }
      if (selectedRole === 'seller' && !categories.some((category) => category.slug === storeCategorySlug)) {
        setErrorMessage(categoryLoadError || copy.chooseCategory);
        return;
      }
      if (
        (selectedRole === 'retailer' || selectedRole === 'supplier') &&
        categorySlugs.some((slug) => !categories.some((category) => category.slug === slug))
      ) {
        setErrorMessage(categoryLoadError || copy.chooseCategory);
        return;
      }
      if (selectedRole === 'supplier' && categorySlugs.length === 0) {
        setErrorMessage(copy.selectCategories);
        return;
      }
    } else if (!password) {
      setErrorMessage(copy.requiredFields);
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === 'register') {
        const registration: Record<string, unknown> = {
          role: selectedRole,
          email: normalizedEmail,
          password,
          full_name: fullName.trim(),
          phone: phone.trim(),
          country_code: countryCode,
          governorate_code: governorateCode,
          city: city.trim(),
        };
        if (selectedRole === 'seller') {
          Object.assign(registration, {
            store_name: storeName.trim(),
            store_address: storeAddress.trim(),
            store_description: storeDescription.trim(),
            store_category_slug: storeCategorySlug,
            store_website: storeWebsite.trim(),
          });
        } else if (selectedRole === 'retailer') {
          Object.assign(registration, {
            business_name: businessName.trim(),
            business_type: businessType,
            business_address: businessAddress.trim(),
            business_description: businessDescription.trim(),
            buyer_category_slugs: categorySlugs,
          });
        } else if (selectedRole === 'supplier') {
          Object.assign(registration, {
            business_name: businessName.trim(),
            business_type: businessType,
            business_address: businessAddress.trim(),
            supplier_category_slugs: categorySlugs,
          });
        }

        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(registration),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Registration failed.');

        if (!result.session) {
          setNotice(
            selectedRole === 'seller'
              ? copy.sellerPending
              : selectedRole === 'supplier'
                ? copy.supplierPending
                : selectedRole === 'retailer'
                  ? copy.buyerCreated
                  : copy.checkEmail
          );
          return;
        }

        const { error: sessionError } = await supabaseBrowserClient.auth.setSession(result.session);
        if (sessionError) throw sessionError;
        router.replace(localizePath(await getDashboardPath()));
        return;
      }

      const { data, error } = await supabaseBrowserClient.auth.signInWithPassword({
        email: normalizedEmail,
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

  const inputClassName =
    'w-full rounded-xl border border-[#EAE7DF] bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus-visible:border-[#8C5E00] focus-visible:ring-2 focus-visible:ring-[#8C5E00]/20';
  const labelClassName = 'mb-1.5 block text-sm font-semibold text-neutral-700';
  const passwordType = showPassword ? 'text' : 'password';
  const locationFieldError = errorMessage === copy.invalidLocation ? copy.invalidLocation : undefined;

  function renderCategoryChoices(keyPrefix: string, label: string) {
    return (
      <>
        {categoryLoadError && categories.length === 0 ? (
          <p role="alert" className="rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800 sm:col-span-2">
            {categoryLoadError}
          </p>
        ) : (
          <SearchableMultiSelect
            id={`${keyPrefix}-categories`}
            label={label}
            searchPlaceholder={copy.categorySearch}
            emptyMessage={copy.noMatchingCategories}
            options={categoryOptions}
            value={categorySlugs}
            error={selectedRole === 'supplier' && errorMessage === copy.selectCategories ? copy.selectCategories : undefined}
            dir={dir}
            locale={locale === 'ku' ? 'ckb' : locale}
            onChange={setCategorySlugs}
          />
        )}
      </>
    );
  }

  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-10 sm:py-16" dir={dir}>
      <div className="rounded-3xl border border-[#EAE7DF] bg-white p-5 shadow-sm sm:p-8">
        <div className="mb-7 text-center">
          <h1 className="text-2xl font-black text-neutral-950 sm:text-3xl">{copy.title}</h1>
          <p className="mt-2 text-sm text-neutral-600">
            {mode === 'register' ? copy.chooseAccount : copy.signInSubtitle}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {mode === 'register' && (
            <fieldset>
              <legend className="mb-3 text-sm font-bold text-neutral-800">{copy.chooseAccount}</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {roles.map(({ value, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={role === value}
                    onClick={() => handleRoleSelection(value)}
                    className={`flex min-h-24 items-start gap-3 rounded-2xl border p-4 text-start transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8C5E00] ${
                      role === value
                        ? 'border-[#F4B942] bg-[#FFF8E8] shadow-sm'
                        : 'border-[#EAE7DF] hover:border-[#D8D4C8] hover:bg-[#FAF9F6]'
                    }`}
                  >
                    <Icon className="mt-0.5 h-5 w-5 shrink-0 text-[#8C5E00]" aria-hidden="true" />
                    <span>
                      <span className="block text-sm font-bold text-neutral-900">{roleLabels[value]}</span>
                      <span className="mt-1 block text-xs leading-relaxed text-neutral-600">{roleDescriptions[value]}</span>
                    </span>
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          {mode === 'register' && selectedRole && (
            <div className="rounded-2xl border border-[#EAE7DF] bg-[#FAF9F6] px-4 py-3">
              <h2 className="text-base font-bold text-neutral-900">{copy.completeRegistration}</h2>
              <p className="mt-1 text-sm text-neutral-600">{roleDescriptions[selectedRole]}</p>
            </div>
          )}

          {(mode === 'login' || selectedRole !== null) && (
            <>
              {mode === 'register' && (
                <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="full-name" className={labelClassName}>{copy.fullName}</label>
                    <input
                      id="full-name"
                      autoComplete="name"
                      required
                      maxLength={160}
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      className={inputClassName}
                    />
                  </div>
                </div>
                <LocationFields
                  idPrefix="registration"
                  locale={locale}
                  dir={dir}
                  countryCode={countryCode}
                  governorateCode={governorateCode}
                  city={city}
                  phone={phone}
                  labels={{
                    country: copy.country,
                    countryPlaceholder: copy.countryPlaceholder,
                    countrySearch: copy.countrySearch,
                    governorate: copy.governorate,
                    governoratePlaceholder: copy.governoratePlaceholder,
                    governorateSearch: copy.governorateSearch,
                    city: copy.city,
                    cityPlaceholder: copy.cityPlaceholder,
                    citySearch: copy.citySearch,
                    phone: copy.phone,
                    noCities: copy.noCities,
                    loading: copy.loadingLocations,
                    moreResults: copy.moreLocationResults,
                    noOptions: copy.noLocationOptions,
                    clear: copy.clearSelection,
                    locationUnavailable: copy.locationsUnavailable,
                  }}
                  error={locationFieldError}
                  onCountryChange={setCountryCode}
                  onGovernorateChange={setGovernorateCode}
                  onCityChange={setCity}
                  onPhoneChange={setPhone}
                  onValidityChange={setLocationValid}
                />
                </>
              )}

              {selectedRole === 'seller' && (
                <div className="grid gap-4 rounded-2xl border border-[#EAE7DF] p-4 sm:grid-cols-2">
                  <h3 className="text-sm font-bold text-neutral-900 sm:col-span-2">{copy.localSeller}</h3>
                  <div>
                    <label htmlFor="store-name" className={labelClassName}>{copy.storeName}</label>
                    <input id="store-name" required maxLength={160} value={storeName} onChange={(event) => setStoreName(event.target.value)} className={inputClassName} />
                  </div>
                  <div>
                    <SearchableSelect
                      id="store-category"
                      label={copy.storeCategory}
                      value={storeCategorySlug}
                      options={categoryOptions}
                      placeholder={copy.selectCategory}
                      searchPlaceholder={copy.categorySearch}
                      clearLabel={copy.clearSelection}
                      emptyMessage={copy.noMatchingCategories}
                      moreResultsMessage={copy.moreLocationResults}
                      disabled={categories.length === 0}
                      error={categoryLoadError || (errorMessage === copy.chooseCategory ? copy.chooseCategory : undefined)}
                      dir={dir}
                      locale={locale === 'ku' ? 'ckb' : locale}
                      onChange={setStoreCategorySlug}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="store-address" className={labelClassName}>{copy.storeAddress}</label>
                    <input id="store-address" required maxLength={300} autoComplete="street-address" value={storeAddress} onChange={(event) => setStoreAddress(event.target.value)} className={inputClassName} />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="store-description" className={labelClassName}>{copy.storeDescription}</label>
                    <textarea id="store-description" rows={3} required maxLength={2000} value={storeDescription} onChange={(event) => setStoreDescription(event.target.value)} className={inputClassName} />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="store-website" className={labelClassName}>{copy.storeWebsite}</label>
                    <input id="store-website" type="url" maxLength={2048} value={storeWebsite} onChange={(event) => setStoreWebsite(event.target.value)} className={inputClassName} />
                  </div>
                </div>
              )}

              {(selectedRole === 'retailer' || selectedRole === 'supplier') && (
                <div className="grid gap-4 rounded-2xl border border-[#EAE7DF] p-4 sm:grid-cols-2">
                  <h3 className="text-sm font-bold text-neutral-900 sm:col-span-2">
                    {selectedRole === 'retailer' ? copy.businessBuyer : copy.supplier}
                  </h3>
                  <div>
                    <label htmlFor="business-name" className={labelClassName}>{copy.businessName}</label>
                    <input id="business-name" required maxLength={160} autoComplete="organization" value={businessName} onChange={(event) => setBusinessName(event.target.value)} className={inputClassName} />
                  </div>
                  <div>
                    <label htmlFor="business-type" className={labelClassName}>{copy.businessType}</label>
                    <select
                      id="business-type"
                      required
                      value={businessType}
                      onChange={(event) => setBusinessType(event.target.value)}
                      className={inputClassName}
                    >
                      <option value="">{copy.selectBusinessType}</option>
                      {(selectedRole === 'retailer' ? retailerTypes : supplierTypes).map((type) => (
                        <option key={type} value={type}>
                          {selectedRole === 'retailer'
                            ? type === 'retail_store'
                              ? isKu ? 'فرۆشگای تاکفرۆشی' : isAr ? 'متجر تجزئة' : 'Retail store'
                              : type === 'retail_chain'
                                ? isKu ? 'زنجیرە فرۆشگا' : isAr ? 'سلسلة متاجر' : 'Retail chain'
                                : type === 'supermarket'
                                  ? isKu ? 'سوپەرمارکێت' : isAr ? 'سوبرماركت' : 'Supermarket'
                                  : type === 'distributor'
                                  ? isKu ? 'دابەشکەر' : isAr ? 'موزّع' : 'Distributor'
                                  : isKu ? 'بازرگانی تر' : isAr ? 'نشاط آخر' : 'Other business'
                            : type === 'manufacturer'
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
                  <div className="sm:col-span-2">
                    <label htmlFor="business-address" className={labelClassName}>{copy.businessAddress}</label>
                    <input id="business-address" required maxLength={300} autoComplete="street-address" value={businessAddress} onChange={(event) => setBusinessAddress(event.target.value)} className={inputClassName} />
                  </div>
                  {selectedRole === 'retailer' && (
                    <div className="sm:col-span-2">
                      <label htmlFor="business-description" className={labelClassName}>{copy.businessDescription}</label>
                      <textarea id="business-description" rows={3} required maxLength={2000} value={businessDescription} onChange={(event) => setBusinessDescription(event.target.value)} className={inputClassName} />
                    </div>
                  )}
                  {(selectedRole === 'supplier' || selectedRole === 'retailer') &&
                    renderCategoryChoices(
                      selectedRole,
                      selectedRole === 'retailer' ? copy.buyerCategories : copy.supplierCategories
                    )}
                  </div>
              )}

              {mode === 'register' && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="email" className={labelClassName}>{copy.email}</label>
                    <input id="email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} className={inputClassName} />
                  </div>
                  <div>
                    <label htmlFor="password" className={labelClassName}>{copy.password}</label>
                    <div className="relative">
                      <input id="password" type={passwordType} autoComplete="new-password" required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} className={`${inputClassName} pe-12`} />
                      <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? (isKu ? 'شاردنەوەی وشەی نهێنی' : isAr ? 'إخفاء كلمة المرور' : 'Hide password') : (isKu ? 'پیشاندانی وشەی نهێنی' : isAr ? 'إظهار كلمة المرور' : 'Show password')} className="absolute inset-y-0 end-2 flex w-9 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8C5E00]">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <p className="mt-1.5 text-xs text-neutral-500">{copy.passwordHint}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="confirm-password" className={labelClassName}>{copy.confirmPassword}</label>
                    <div className="relative">
                      <input id="confirm-password" type={showConfirmPassword ? 'text' : 'password'} autoComplete="new-password" required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className={`${inputClassName} pe-12`} />
                      <button type="button" onClick={() => setShowConfirmPassword((visible) => !visible)} aria-label={showConfirmPassword ? (isKu ? 'شاردنەوەی وشەی نهێنی' : isAr ? 'إخفاء كلمة المرور' : 'Hide password') : (isKu ? 'پیشاندانی وشەی نهێنی' : isAr ? 'إظهار كلمة المرور' : 'Show password')} className="absolute inset-y-0 end-2 flex w-9 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8C5E00]">
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {mode === 'login' && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label htmlFor="email" className={labelClassName}>{copy.email}</label>
                    <input id="email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} className={inputClassName} />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="password" className={labelClassName}>{copy.password}</label>
                    <div className="relative">
                      <input id="password" type={passwordType} autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} className={`${inputClassName} pe-12`} />
                      <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? (isKu ? 'شاردنەوەی وشەی نهێنی' : isAr ? 'إخفاء كلمة المرور' : 'Hide password') : (isKu ? 'پیشاندانی وشەی نهێنی' : isAr ? 'إظهار كلمة المرور' : 'Show password')} className="absolute inset-y-0 end-2 flex w-9 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8C5E00]">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

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

          {(mode === 'login' || selectedRole !== null) && (
            <Button type="submit" className="w-full" size="lg" isLoading={isSubmitting} disabled={mode === 'register' && !selectedRole}>
              {mode === 'login'
                ? copy.signIn
                : selectedRole === 'seller'
                  ? copy.submitSeller
                  : selectedRole === 'supplier'
                    ? copy.submitSupplier
                    : selectedRole === 'retailer'
                      ? copy.submitBuyer
                      : copy.register}
            </Button>
          )}
        </form>

        <p className="mt-6 text-center text-sm text-neutral-600">
          <Link
            href={localizePath(mode === 'login' ? '/register' : '/login')}
            className="font-bold text-[#8C5E00] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8C5E00]"
          >
            {mode === 'login' ? copy.needAccount : copy.alreadyAccount}
          </Link>
        </p>
      </div>
    </section>
  );
}
