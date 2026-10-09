'use client';

import React, { useState, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useComparison } from '../context/ComparisonContext';
import { Product } from '../types';
import { ProductCard } from './ProductCard';
import { localizeAnalysisResult, AIImageAnalysisData } from '../lib/i18nData';
import {
  Sparkles,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Search,
  Store,
  Layers,
  Tag,
  ShieldAlert,
  SlidersHorizontal,
  X,
  FileText,
} from 'lucide-react';

interface AIProductScannerProps {
  onViewProduct?: (product: Product) => void;
}

export const AIProductScanner: React.FC<AIProductScannerProps> = ({ onViewProduct }) => {
  const { language, t } = useLanguage();
  const { addToCompare } = useComparison();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isKurdish = language === 'ckb' || language === 'ku';
  const isArabic = language === 'ar';

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [sampleType, setSampleType] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AIImageAnalysisData | null>(null);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<'buyer' | 'seller'>('buyer');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Pre-configured multilingual demo samples for 1-click test
  const demoSamples = [
    {
      id: 'airfryer',
      label: isKurdish
        ? 'قلاێنەری هەوایی نینجا دوو سەبەتە'
        : isArabic
        ? 'قلاية نينجا الهوائية بسلتين'
        : 'Ninja DualZone Air Fryer',
      category: isKurdish
        ? 'ئامێری چێشتخانە'
        : isArabic
        ? 'أجهزة المطبخ'
        : 'Kitchen Appliance',
      url: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'coffee',
      label: isKurdish
        ? 'ئامێری قاوەی دیلۆنگی ئێسپرێسۆ'
        : isArabic
        ? 'ماكينة قهوة ديلونجي ديدیکا'
        : 'DeLonghi Espresso Machine',
      category: isKurdish
        ? 'قاوە و قاوەساز'
        : isArabic
        ? 'القهوة والإسبريسو'
        : 'Coffee & Espresso',
      url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'honey',
      label: isKurdish
        ? 'شوشەی هەنگوینی شاخی پێنجوێن ١ کگم'
        : isArabic
        ? 'عسل جبال بنجوين 1 كغم'
        : 'Penjwen Mountain Honey Jar',
      category: isKurdish
        ? 'هەنگوین و بەرهەمی خۆماڵی'
        : isArabic
        ? 'عسل وأغذية محلية'
        : 'Local Honey & Food',
      url: 'https://images.unsplash.com/photo-1587049352851-8d4e89133924?auto=format&fit=crop&w=600&q=80',
    },
  ];

  const handleSelectSample = async (sample: typeof demoSamples[0]) => {
    setImagePreview(sample.url);
    setSampleType(sample.id);
    setAnalysisResult(null);
    setSimilarProducts([]);
    setErrorMsg(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg(
        isKurdish
          ? 'تکایە پەڕگەیەکی وێنەی دروست هەڵبژێرە (JPEG, PNG, WebP).'
          : isArabic
          ? 'يرجى اختيار ملف صورة صالح (JPEG, PNG, WebP).'
          : 'Please select a valid image file (JPEG, PNG, WebP).'
      );
      return;
    }

    setMimeType(file.type);
    setSampleType(null);
    setErrorMsg(null);
    setAnalysisResult(null);
    setSimilarProducts([]);

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setImagePreview(uploadEvent.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg(
        isKurdish
          ? 'تکایە وێنەیەکی دروست لێرە دابنێ.'
          : isArabic
          ? 'يرجى إفلات ملف صورة صالح.'
          : 'Please drop a valid image file.'
      );
      return;
    }

    setMimeType(file.type);
    setSampleType(null);
    setErrorMsg(null);
    setAnalysisResult(null);
    setSimilarProducts([]);

    const reader = new FileReader();
    reader.onload = (dropEvent) => {
      setImagePreview(dropEvent.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleClearImage = () => {
    setImagePreview(null);
    setSampleType(null);
    setAnalysisResult(null);
    setSimilarProducts([]);
    setErrorMsg(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAnalyze = async () => {
    if (!imagePreview) return;
    setIsAnalyzing(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/ai-image-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imagePreview.startsWith('data:') ? imagePreview : undefined,
          mimeType,
          sampleType,
          language,
        }),
      });

      const data = await response.json();
      if (data.success && data.analysis) {
        setAnalysisResult(localizeAnalysisResult(data.analysis, language));
        setSimilarProducts(data.similar_products || []);
      } else {
        setErrorMsg(
          data.error ||
            (isKurdish
              ? 'پشکنینی وێنەکە سەرکەوتوو نەبوو.'
              : isArabic
              ? 'فشل تحليل صورة المنتج.'
              : 'Failed to analyze product image.')
        );
      }
    } catch (err: any) {
      console.error('Analysis error:', err);
      setErrorMsg(
        isKurdish
          ? 'هەڵەیەک ڕوویدا لە کاتی شیکردنەوەی وێنەکەدا. تکایە دووبارە هەوڵبدەرەوە.'
          : isArabic
          ? 'حدث خطأ أثناء فحص الصورة. يرجى المحاولة مرة أخرى.'
          : 'An error occurred during AI image analysis. Please try again.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Dynamically localized display result
  const displayResult = analysisResult ? localizeAnalysisResult(analysisResult, language) : null;

  return (
    <section id="scanner" className="py-14 bg-gradient-to-b from-white via-[#FAF9F6] to-[#FAF9F6] border-b border-[#EAE7DF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF5DD] border border-[#F4B942]/60 text-[#8C5E00] text-xs font-bold mb-3 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 fill-[#F4B942] text-[#F4B942]" />
            <span>{t('scannerTitle')}</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">
            {t('scannerHeadline')}
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 mt-2">
            {t('scannerSubtitle')}
          </p>
        </div>

        {/* Mode Selector (Buyer Discovery vs Seller Listing Draft) */}
        <div className="flex justify-center mb-8">
          <div className="bg-[#FAF9F6] p-1 rounded-xl border border-[#EAE7DF] flex items-center gap-1 shadow-2xs text-xs font-bold">
            <button
              onClick={() => setActiveTab('buyer')}
              className={`px-4 py-2 rounded-lg transition-all ${
                activeTab === 'buyer'
                  ? 'bg-white text-neutral-900 shadow-2xs border border-[#EAE7DF]'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              {t('scannerBuyerTab')}
            </button>
            <button
              onClick={() => setActiveTab('seller')}
              className={`px-4 py-2 rounded-lg transition-all ${
                activeTab === 'seller'
                  ? 'bg-[#F4B942] text-neutral-950 shadow-2xs font-extrabold'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              {t('scannerSellerTab')}
            </button>
          </div>
        </div>

        {/* Main Upload / Scanner Box */}
        <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-[#EAE7DF] p-6 sm:p-8 shadow-sm">
          {!imagePreview ? (
            /* Upload Drop Area */
            <div>
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#DBD7CD] hover:border-[#F4B942] bg-[#FAF9F6] rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all hover:bg-[#FFFBF0]/60 group"
              >
                <div className="w-16 h-16 rounded-2xl bg-white border border-[#EAE7DF] shadow-2xs flex items-center justify-center mx-auto mb-4 text-[#8C5E00] group-hover:scale-105 group-hover:border-[#F4B942] transition-transform">
                  <Upload className="w-8 h-8 text-[#8C5E00]" />
                </div>
                <h3 className="font-extrabold text-neutral-900 text-base sm:text-lg mb-1">
                  {t('scannerUploadBox')}
                </h3>
                <p className="text-xs sm:text-sm text-neutral-500 max-w-sm mx-auto mb-4">
                  {t('scannerDragDrop')}
                </p>

                <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F4B942] hover:bg-[#E2A732] text-neutral-950 font-bold text-xs sm:text-sm shadow-2xs">
                  <ImageIcon className="w-4 h-4" />
                  <span>{t('scannerChooseFile')}</span>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>

              {/* Quick Demo Preloaded Samples */}
              <div className="mt-6 pt-6 border-t border-[#EAE7DF]">
                <div className="flex items-center justify-between mb-3 text-xs">
                  <span className="font-bold text-neutral-700 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#8C5E00]" />
                    <span>{t('scannerTrySamples')}</span>
                  </span>
                  <span className="text-neutral-400 font-medium">
                    {isKurdish ? '⚡ بە یەک کلیک' : isArabic ? '⚡ بنقرة واحدة' : '⚡ 1-Click'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {demoSamples.map((sample) => (
                    <button
                      key={sample.id}
                      onClick={() => handleSelectSample(sample)}
                      className="flex items-center gap-3 p-2.5 rounded-xl border border-[#EAE7DF] hover:border-[#F4B942] hover:bg-[#FFF5DD]/40 text-start transition-all bg-[#FAF9F6] group"
                    >
                      <img
                        src={sample.url}
                        alt={sample.label}
                        className="w-12 h-12 rounded-lg object-cover border border-[#EAE7DF] group-hover:scale-105 transition-transform"
                      />
                      <div className="min-w-0">
                        <div className="font-bold text-neutral-900 text-xs truncate">
                          {sample.label}
                        </div>
                        <div className="text-[11px] text-neutral-500 truncate">
                          {sample.category}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Image Selected State */
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl bg-[#FAF9F6] border border-[#EAE7DF]">
                <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-xl overflow-hidden border border-[#EAE7DF] bg-white shrink-0 shadow-2xs">
                  <img
                    src={imagePreview}
                    alt="Product preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={handleClearImage}
                    className="absolute top-2 end-2 p-1.5 rounded-full bg-white/90 text-neutral-500 hover:text-red-600 shadow-2xs transition-colors"
                    title={isKurdish ? 'سڕینەوەی وێنە' : isArabic ? 'حذف الصورة' : 'Remove image'}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1 text-start space-y-3 w-full">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#657A52] bg-[#F2F5EF] px-2 py-0.5 rounded">
                      {isKurdish ? 'وێنەکە بارکرا' : isArabic ? 'تم تحميل الصورة' : 'Photo Loaded'}
                    </span>
                    <h3 className="font-extrabold text-neutral-900 text-base sm:text-lg mt-1">
                      {isKurdish
                        ? 'ئامادەیە بۆ پشکنینی فرەلایەنی بەرهەمەکە'
                        : isArabic
                        ? 'جاهز لفحص الصورة المتعدد الوسائط'
                        : 'Ready for Multimodal Image Inspection'}
                    </h3>
                    <p className="text-xs text-neutral-500 leading-relaxed">
                      {isKurdish
                        ? 'ژیری دەستکرد پشکنین بۆ نیشانە فیزیاییەکان، قەبارە و تایبەتمەندییە دیارەکان دەکات بەبێ هەڵبەستنی نرخ یان گەرەنتی نادیار.'
                        : isArabic
                        ? 'سيقوم الذكاء الاصطناعي بفحص العلامات المادية وملصقات السعة وميزات التصميم المرئية دون اختلاق أسعار أو ضمانات مجهولة.'
                        : 'Gemini will inspect only visible physical markings, capacity labels, and build features without fabricating unknown prices or warranties.'}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      onClick={handleAnalyze}
                      disabled={isAnalyzing}
                      className="px-6 py-3 rounded-xl bg-[#F4B942] hover:bg-[#E2A732] text-neutral-950 font-extrabold text-sm flex items-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-60"
                    >
                      {isAnalyzing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                          <span>{t('scannerAnalyzing')}</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 fill-neutral-950" />
                          <span>{t('scannerAnalyzeBtn')}</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleClearImage}
                      disabled={isAnalyzing}
                      className="px-4 py-3 rounded-xl border border-[#EAE7DF] hover:bg-white text-neutral-700 text-xs font-semibold"
                    >
                      {t('scannerChangePhoto')}
                    </button>
                  </div>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>
          )}

          {/* Analysis Results View */}
          {displayResult && (
            <div className="mt-8 pt-8 border-t border-[#EAE7DF] text-start space-y-6 animate-fadeIn">
              {/* 1. Concise AI Product Summary */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-[#FFFBF0] to-[#FAF9F6] border border-[#F4B942]/70 shadow-2xs">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 font-extrabold text-neutral-900 text-sm">
                    <Sparkles className="w-4 h-4 text-[#8C5E00] fill-[#F4B942]" />
                    <span>{t('scannerSummaryTitle')}</span>
                  </div>
                  <span className="text-[11px] font-semibold bg-[#FFF5DD] text-[#8C5E00] px-2.5 py-0.5 rounded-full">
                    {isKurdish
                      ? 'یاسای توندی ڕێگری لە زانیاری هەڵبەستراو'
                      : isArabic
                      ? 'سياسة صارمة لمنع التخمين أو التزييف'
                      : 'Strict Non-Hallucination Policy'}
                  </span>
                </div>
                <p className="text-sm text-neutral-800 leading-relaxed font-medium">
                  {displayResult.summary}
                </p>
              </div>

              {/* 2. Visible Attributes Grid */}
              <div className="rounded-2xl border border-[#EAE7DF] bg-white p-5 shadow-2xs">
                <h4 className="font-extrabold text-neutral-900 text-xs uppercase tracking-wider mb-4">
                  {t('scannerAttributesTitle')}
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-4">
                  <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#EAE7DF]">
                    <span className="text-neutral-500 block text-[11px] mb-0.5">
                      {isKurdish ? 'پۆلی بەرهەم' : isArabic ? 'فئة المنتج' : 'Product Category'}
                    </span>
                    <span className="font-bold text-neutral-900">{displayResult.category}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#EAE7DF]">
                    <span className="text-neutral-500 block text-[11px] mb-0.5">
                      {isKurdish ? 'جۆری بەرهەم' : isArabic ? 'نوع المنتج' : 'Product Type'}
                    </span>
                    <span className="font-bold text-neutral-900">{displayResult.product_type}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#EAE7DF]">
                    <span className="text-neutral-500 block text-[11px] mb-0.5">
                      {isKurdish ? 'براندی دیار' : isArabic ? 'العلامة التجارية المرئية' : 'Visible Brand'}
                    </span>
                    <span className="font-bold text-neutral-900">{displayResult.brand_name}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#EAE7DF]">
                    <span className="text-neutral-500 block text-[11px] mb-0.5">
                      {isKurdish ? 'قەبارەی دیار' : isArabic ? 'السعة المرئية' : 'Visible Capacity'}
                    </span>
                    <span className="font-bold text-neutral-900">{displayResult.visible_capacity}</span>
                  </div>
                </div>

                {/* Visible features checklist */}
                <div className="space-y-1.5 pt-2 border-t border-[#EAE7DF] text-xs">
                  <span className="font-bold text-neutral-800 block mb-1">
                    {isKurdish
                      ? 'تایبەتمەندییە فیزیاییە دیارەکان:'
                      : isArabic
                      ? 'الميزات المادية المرئية:'
                      : 'Visible Physical Features:'}
                  </span>
                  {displayResult.visible_features.map((feat, i) => (
                    <div key={i} className="flex items-center gap-2 text-neutral-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#657A52] shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. AI Information Check (Available vs Missing) */}
              <div className="rounded-2xl border border-[#EAE7DF] bg-white p-5 shadow-2xs">
                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-[#EAE7DF]">
                  <ShieldAlert className="w-4 h-4 text-[#8C5E00]" />
                  <h4 className="font-extrabold text-neutral-900 text-sm">
                    {t('scannerInfoCheckTitle')}
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Available Signals */}
                  <div className="p-3.5 rounded-xl bg-[#F2F5EF] border border-[#E2E8DC] space-y-2">
                    <span className="font-bold text-[#657A52] block">
                      {t('scannerAvailableTitle')}
                    </span>
                    {displayResult.available_signals.map((sig, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-neutral-800">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#657A52] shrink-0" />
                        <span>{sig}</span>
                      </div>
                    ))}
                  </div>

                  {/* Missing Signals */}
                  <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-2">
                    <span className="font-bold text-amber-900 block">
                      {t('scannerMissingTitle')}
                    </span>
                    {displayResult.missing_signals.map((sig, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-amber-800">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>{sig}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 4. Tab Mode: Buyer Similar Products vs Seller Draft Listing */}
              {activeTab === 'buyer' ? (
                /* Buyer: Find Similar Products Flow */
                <div className="p-5 rounded-2xl bg-white border border-[#EAE7DF] shadow-2xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EAE7DF]">
                    <div>
                      <h4 className="font-extrabold text-neutral-900 text-base">
                        {t('scannerSimilarTitle')}
                      </h4>
                      <p className="text-xs text-neutral-500">
                        {isKurdish
                          ? 'بەرهەمە هاوشێوەکان لە دوکانەکانی سلێمانی، هەولێر و دهۆک'
                          : isArabic
                          ? 'المنتجات المطابقة في متاجر السليمانية وأربيل ودهوك المحلية'
                          : `Products matching "${displayResult.suggested_search_query}" in local Sulaymaniyah, Erbil & Duhok shops`}
                      </p>
                    </div>

                    <span className="text-xs font-bold text-[#8C5E00] bg-[#FFF5DD] px-3 py-1 rounded-full self-start sm:self-auto">
                      {similarProducts.length}{' '}
                      {isKurdish
                        ? 'بەرهەمی هاوشێوەی ناوخۆیی دۆزرایەوە'
                        : isArabic
                        ? 'منتجات محلية مطابقة'
                        : 'Local Matches Found'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {similarProducts.map((prod) => (
                      <ProductCard
                        key={prod.id}
                        product={prod}
                        onViewProduct={onViewProduct}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                /* Seller: Draft Listing Assistant */
                <div className="p-5 rounded-2xl bg-[#FFFBF0] border border-[#F4B942]/80 shadow-2xs space-y-4 text-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-[#F4B942]/40">
                    <div className="flex items-center gap-2 font-extrabold text-neutral-900 text-sm">
                      <Store className="w-4 h-4 text-[#8C5E00]" />
                      <span>{t('scannerDraftTitle')}</span>
                    </div>
                    <span className="text-[11px] font-bold bg-[#FFF5DD] text-[#8C5E00] px-2.5 py-0.5 rounded-full">
                      {isKurdish
                        ? 'خۆکارانە لە وێنەکەوە پڕکراوەتەوە'
                        : isArabic
                        ? 'مملوء تلقائياً من الصورة'
                        : 'Auto-Populated from Image'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-3 bg-white p-4 rounded-xl border border-[#EAE7DF]">
                      <span className="font-bold text-neutral-900 block text-xs">
                        {isKurdish
                          ? '١. تایبەتمەندییە دەرکێشراوەکان لە وێنەکە:'
                          : isArabic
                          ? '١. المواصفات المستخرجة من الصورة:'
                          : '1. Attributes Extracted from Photo:'}
                      </span>
                      <div>
                        <label className="text-[11px] text-neutral-400 block">
                          {isKurdish ? 'ناونیشانی پێشنیازکراو' : isArabic ? 'العنوان المقترح' : 'Proposed Title'}
                        </label>
                        <input
                          type="text"
                          readOnly
                          value={displayResult.draft_listing.suggested_title}
                          className="w-full mt-1 px-3 py-2 rounded-lg bg-neutral-50 border border-[#EAE7DF] font-semibold text-neutral-800"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-neutral-400 block">
                          {isKurdish ? 'پۆل' : isArabic ? 'الفئة' : 'Category'}
                        </label>
                        <input
                          type="text"
                          readOnly
                          value={displayResult.draft_listing.category}
                          className="w-full mt-1 px-3 py-2 rounded-lg bg-neutral-50 border border-[#EAE7DF] text-neutral-700"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-neutral-400 block">
                          {isKurdish ? 'تایبەتمەندییە دیارەکان' : isArabic ? 'المواصفات المرئية' : 'Visible Specs'}
                        </label>
                        <input
                          type="text"
                          readOnly
                          value={displayResult.draft_listing.visible_specs}
                          className="w-full mt-1 px-3 py-2 rounded-lg bg-neutral-50 border border-[#EAE7DF] text-neutral-700"
                        />
                      </div>
                    </div>

                    <div className="space-y-3 bg-white p-4 rounded-xl border border-amber-200">
                      <span className="font-bold text-amber-900 block text-xs flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        <span>{t('scannerMissingSellerNotice')}</span>
                      </span>
                      <p className="text-[11px] text-neutral-500">
                        {isKurdish
                          ? 'یاساکانی بازاڕی گەورە ڕێگری دەکەن لە خەمڵاندنی نرخ یان گەرەنتی لەلایەن AI. فرۆشیار دەبێت زانیاری دروست بنووسێت:'
                          : isArabic
                          ? 'قواعد بازاري كورة تمنع الذكاء الاصطناعي من تخمين الأسعار أو الضمان. يجب على البائع إدخال البيانات المؤكدة:'
                          : 'Bazary Gawra rules prohibit AI from guessing prices or warranties. Seller must input verified data:'}
                      </p>

                      <div className="space-y-2">
                        {displayResult.draft_listing.missing_required_fields.map((field, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-amber-50/50 border border-amber-100">
                            <span className="font-medium text-neutral-800">{field}</span>
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                              {isKurdish ? 'پێویستە' : isArabic ? 'مطلوب' : 'Required'}
                            </span>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() =>
                          alert(
                            isKurdish
                              ? 'ڕەشنووسی بەرهەمەکە تۆمارکرا. لە سیستەمی کۆتاییدا ڕاستەوخۆ دەچێتە خشتەی بەرهەمەکانی سوپابەیس.'
                              : isArabic
                              ? 'تم حفظ مسودة المنتج. في النسخة النهائية يتم حفظها في قاعدة بيانات سوبابيز.'
                              : 'Draft listing preserved. In production, this saves directly to merchant Supabase listings table.'
                          )
                        }
                        className="w-full mt-2 py-2.5 rounded-xl bg-[#F4B942] hover:bg-[#E2A732] text-neutral-950 font-bold text-xs transition-colors shadow-2xs cursor-pointer"
                      >
                        {t('scannerCompleteListing')}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
