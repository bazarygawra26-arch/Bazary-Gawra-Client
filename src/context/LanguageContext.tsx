'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { SupportedLanguage } from '../types';

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  dir: 'ltr' | 'rtl';
  t: (key: string) => string;
}

const translations: Record<SupportedLanguage, Record<string, string>> = {
  en: {
    siteTitle: 'BAZARY GAWRA',
    siteTagline: 'AI-Powered Local Product Discovery for Kurdistan',
    heroBadge: '✨ AI-Powered Local Product Discovery',
    heroHeadline: 'Find Local Products Smarter.',
    heroSubheadline: 'Search, compare, and understand local products across Sulaymaniyah, Erbil, and Duhok with AI.',
    searchPlaceholder: 'I need a coffee machine in Sulaymaniyah under 200,000 IQD...',
    searchButton: 'Search with AI',
    navHome: 'Home',
    navCategories: 'Categories',
    navProducts: 'Products',
    navSellers: 'Local Sellers',
    navCompare: 'Compare',
    categoriesTitle: 'Browse by Category',
    categoriesSubtitle: 'Explore vetted local merchants and authentic products across the Kurdistan Region',
    featuredTitle: 'Featured Local Products',
    featuredSubtitle: 'Handpicked offerings with transparent specifications and seller information',
    aiRecommendationsTitle: 'Recommended by AI',
    aiRecommendationsBadge: 'AI Picks for You',
    aiRecommendationsSubtitle: 'Intelligent matches based on your natural language needs and local availability',
    whyThisProduct: 'Why this product?',
    aiComparison: 'AI Comparison',
    sellersTitle: 'Local Kurdistan Merchants',
    sellersSubtitle: 'Directly discover registered local shops in Sulaymaniyah, Erbil, and Duhok',
    whyBazaryGawraTitle: 'Why Bazary Gawra?',
    trustTitle: 'Information & Trust Signals',
    trustSubtitle: 'Objective signals based on provided seller information, not sponsored rankings',
    viewProduct: 'View Details',
    compareButton: 'Compare',
    addedToCompare: 'In Comparison',
    priceIQD: 'IQD',
    warrantyProvided: 'Warranty Provided',
    warrantyMissing: 'Warranty not provided',
    deliveryProvided: 'Delivery Available',
    deliveryMissing: 'Delivery not provided',
    returnPolicyProvided: 'Return Policy Provided',
    returnPolicyMissing: 'Return policy not provided',
    specsProvided: 'Full Specs Provided',
    specsMissing: 'Specs incomplete',
    locationProvided: 'Local Store Location',
    footerAbout: 'Making local product discovery simpler, clearer, and more informed across the Kurdistan Region of Iraq.',
    compareDrawerTitle: 'Product Comparison & Gap Analysis',
    clearAll: 'Clear all',
    informationGaps: 'Information Gaps',
    noRating: 'Information unavailable',
  },
  ckb: {
    siteTitle: 'بازاڕی گەورە',
    siteTagline: 'دۆزینەوە و بەراوردکاری زیرەکی بەرهەمە ناوخۆیییەکان لە کوردستان',
    heroBadge: '✨ دۆزینەوەی زیرەکی بەرهەمی ناوخۆیی بە ژیری دەستکرد',
    heroHeadline: 'بەرهەمە ناوخۆییەکان زیرەکانەتر بدۆزەرەوە.',
    heroSubheadline: 'گەڕان، بەراوردکردن، و تێگەیشتن لە بەرهەمە ناوخۆیییەکان لە سلێمانی، هەولێر، و دهۆک بە ژیری دەستکرد.',
    searchPlaceholder: 'قاوەسازێکم دەوێت لە سلێمانی تا ٢٠٠ هەزار دینار...',
    searchButton: 'گەڕان بە AI',
    navHome: 'سەرەکی',
    navCategories: 'پۆلەکان',
    navProducts: 'بەرهەمەکان',
    navSellers: 'فرۆشیارانی ناوخۆ',
    navCompare: 'بەراوردکردن',
    categoriesTitle: 'گەڕان بەپێی پۆل',
    categoriesSubtitle: 'گەڕان بەنێو دووکان و بەرهەمە ڕەسەنەکانی هەرێمی کوردستاندا',
    featuredTitle: 'بەرهەمە دیاریکراوەکانی ناوخۆ',
    featuredSubtitle: 'بەرهەمی هەڵبژێردراو بە زانیاری و تایبەتمەندییەکی ڕوون',
    aiRecommendationsTitle: 'پێشنیارکراو بە ژیری دەستکرد',
    aiRecommendationsBadge: 'هەڵبژاردەی زیرەک بۆ تۆ',
    aiRecommendationsSubtitle: 'گونجاندنی زیرەک بەپێی داواکارییەکەت و بوونی کاڵاکە لە شارەکەت',
    whyThisProduct: 'بۆچی ئەم بەرهەمە؟',
    aiComparison: 'بەراوردکاری زیرەک',
    sellersTitle: 'فرۆشیارە ناوخۆیییەکانی کوردستان',
    sellersSubtitle: 'ئاشنابوون بە دووکان و کاسبکارانی سلێمانی، هەولێر، و دهۆک',
    whyBazaryGawraTitle: 'بۆچی بازاڕی گەورە؟',
    trustTitle: 'نیشانەکانی زانیاری و متمانە',
    trustSubtitle: 'نیشاندانی ڕوونی زانیارییە بەردەستەکان بە شێوازێکی بێلایەن',
    viewProduct: 'بینینی وردەکاری',
    compareButton: 'بەراوردکردن',
    addedToCompare: 'لە بەراوردکارییە',
    priceIQD: 'دینار',
    warrantyProvided: 'گەرەنتی بەردەستە',
    warrantyMissing: 'گەرەنتی دیاری نەکراوە',
    deliveryProvided: 'گەیاندن هەیە',
    deliveryMissing: 'گەیاندن دیاری نەکراوە',
    returnPolicyProvided: 'مەرجی گەڕاندنەوە هەیە',
    returnPolicyMissing: 'مەرجی گەڕاندنەوە دیاری نەکراوە',
    specsProvided: 'تایبەتمەندی تەواو نوسراوە',
    specsMissing: 'تایبەتمەندی ناتەواوە',
    locationProvided: 'ناونیشانی دیاریکراو',
    footerAbout: 'ئاسانکاری و ڕوونی لە دۆزینەوەی بەرهەمی ناوخۆیی لە سەرانسەری هەرێمی کوردستان.',
    compareDrawerTitle: 'بەراوردکاری بەرهەمەکان و شیکاری کەلێنی زانیاری',
    clearAll: 'سڕینەوەی هەمووی',
    informationGaps: 'کەلێنەکانی زانیاری (نادیارەکان)',
    noRating: 'زانیاری بەردەست نییە',
  },
  ar: {
    siteTitle: 'بازاري گەورە',
    siteTagline: 'اكتشاف ومقارنة المنتجات المحلية بالذكاء الاصطناعي في إقليم كوردستان',
    heroBadge: '✨ اكتشاف ذكي للمنتجات المحلية بالذكاء الاصطناعي',
    heroHeadline: 'اعثر على المنتجات المحلية بذكاء أكبر.',
    heroSubheadline: 'ابحث وقارن وافهم المنتجات المحلية في السليمانية وأربيل ودهوك بالذكاء الاصطناعي.',
    searchPlaceholder: 'أريد ماكينة قهوة في السليمانية بأقل من 200,000 دينار...',
    searchButton: 'بحث بالذكاء الاصطناعي',
    navHome: 'الرئيسية',
    navCategories: 'التصنيفات',
    navProducts: 'المنتجات',
    navSellers: 'المتاجر المحلية',
    navCompare: 'المقارنة',
    categoriesTitle: 'تصفح حسب التصنيف',
    categoriesSubtitle: 'استكشف المتاجر المحلية والمنتجات الموثوقة في إقليم كوردستان',
    featuredTitle: 'منتجات محلية مميزة',
    featuredSubtitle: 'عروض مختارة بمعلومات ومواصفات واضحة وشفافة',
    aiRecommendationsTitle: 'ترشيحات الذكاء الاصطناعي',
    aiRecommendationsBadge: 'مختارات AI لك',
    aiRecommendationsSubtitle: 'تطابق ذكي مبني على متطلباتك الطبيعية والتوفر المحلي',
    whyThisProduct: 'لماذا هذا المنتج؟',
    aiComparison: 'مقارنة الذكاء الاصطناعي',
    sellersTitle: 'متاجر كوردستان المحلية',
    sellersSubtitle: 'تعرف مباشرة على المتاجر المحلية في السليمانية وأربيل ودهوك',
    whyBazaryGawraTitle: 'لماذا بازاري گەورە؟',
    trustTitle: 'إشارات المعلومات والشفافية',
    trustSubtitle: 'تحليل موضوعي للمعلومات المقدمة بدون تصنيفات مدفوعة',
    viewProduct: 'عرض التفاصيل',
    compareButton: 'مقارنة',
    addedToCompare: 'في المقارنة',
    priceIQD: 'د.ع',
    warrantyProvided: 'الضمان متوفر',
    warrantyMissing: 'الضمان غير محدد',
    deliveryProvided: 'التوصيل متوفر',
    deliveryMissing: 'التوصيل غير محدد',
    returnPolicyProvided: 'سياسة الإرجاع متوفرة',
    returnPolicyMissing: 'سياسة الإرجاع غير محددة',
    specsProvided: 'المواصفات كاملة',
    specsMissing: 'المواصفات غير مكتملة',
    locationProvided: 'موقع المتجر محدد',
    footerAbout: 'جعل اكتشاف المنتجات المحلية أسهل وأوضح وأكثر شفافية في إقليم كوردستان العراق.',
    compareDrawerTitle: 'مقارنة المنتجات وتحليل فجوات المعلومات',
    clearAll: 'مسح الكل',
    informationGaps: 'فجوات المعلومات (غير متوفرة)',
    noRating: 'المعلومات غير متوفرة',
  },
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  dir: 'ltr',
  t: (key: string) => key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<SupportedLanguage>('en');

  const dir: 'ltr' | 'rtl' = language === 'ckb' || language === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = language === 'ckb' ? 'ku' : language;
  }, [dir, language]);

  const t = (key: string): string => {
    return translations[language]?.[key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, dir, t }}>
      <div dir={dir} className={dir === 'rtl' ? 'font-kurdish' : ''}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
