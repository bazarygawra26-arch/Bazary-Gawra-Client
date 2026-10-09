'use client';

import React, { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '../../../../components/layout/Header';
import { Footer } from '../../../../components/layout/Footer';
import { Gallery } from '../../../../components/product/Gallery';
import { TrustSignals } from '../../../../components/product/TrustSignals';
import { AIAssistant } from '../../../../components/ai/AIAssistant';
import { MoreFromSeller } from '../../../../components/seller/MoreFromSeller';
import { ProductCard } from '../../../../components/product/ProductCard';
import { useLanguage } from '../../../../context/LanguageContext';
import { useComparison } from '../../../../context/ComparisonContext';
import { Product } from '../../../../types';
import { localizeProduct } from '../../../../lib/i18nData';
import { OrderModal } from '../../../../components/order/OrderModal';
import {
  ArrowLeft,
  ArrowRight,
  ArrowLeftRight,
  Store,
  MapPin,
  Loader2,
  Sparkles,
  Phone,
  MessageCircle,
  ShieldCheck,
  Truck,
  Zap,
  Gauge,
  Tag,
  CheckCircle2,
  X,
  FileText,
  Sliders,
  HelpCircle,
  ShoppingBag,
} from 'lucide-react';

export default function SingleProductPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug } = use(params);
  const { language, t, isKu } = useLanguage();
  const { addToCompare, removeFromCompare, isCompared } = useComparison();

  const [product, setProduct] = useState<Product | null>(null);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'ai'>('desc');
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const isRtl = isKu || language === 'ar';
  const ArrowIcon = isRtl ? ArrowRight : ArrowLeft;

  useEffect(() => {
    let isMounted = true;
    async function loadProductDetail() {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/products/${encodeURIComponent(slug)}?lang=${language}`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data) {
            setProduct(data);

            // Fetch similar products in category
            if (data.category) {
              fetch(`/api/products?category=${encodeURIComponent(data.category)}&lang=${language}&limit=4`, { cache: 'no-store' })
                .then((r) => r.json())
                .then((similar) => {
                  if (isMounted && Array.isArray(similar)) {
                    setSimilarProducts(similar.filter((p: Product) => p.id !== data.id));
                  }
                })
                .catch(() => {});
            }
          }
        }
      } catch (err) {
        console.error('Failed to load product from Supabase:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadProductDetail();
    return () => {
      isMounted = false;
    };
  }, [slug, language]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-neutral-900">
        <Header />
        <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 flex flex-col items-center justify-center gap-3 text-neutral-400">
          <Loader2 className="w-8 h-8 animate-spin text-[#F4B942]" />
          <p className="text-sm font-medium">
            {isKu
              ? 'بارکردنی زانیارییە شەفافەکانی بەرهەم...'
              : language === 'ar'
              ? 'جاري تحميل تفاصيل المنتج...'
              : 'Loading product details...'}
          </p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-neutral-900">
        <Header />
        <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <h2 className="text-xl font-bold text-neutral-800">
            {isKu ? 'بەرهەم نەدۆزرایەوە' : language === 'ar' ? 'المنتج غير موجود' : 'Product Not Found'}
          </h2>
          <Link
            href="/products"
            className="text-sm text-[#F4B942] underline mt-3 inline-flex items-center gap-1 font-semibold"
          >
            <ArrowIcon className="w-4 h-4" />
            <span>{isKu ? 'گەڕانەوە بۆ کەتەلۆک' : language === 'ar' ? 'العودة للكتالوج' : 'Back to Catalog'}</span>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const lp = localizeProduct(product, language);
  const compared = isCompared(lp.id);
  const displayName = lp.name;

  // WhatsApp and phone setup
  const sellerPhone = lp.seller_phone || lp.seller_whatsapp;
  const cleanPhone = sellerPhone ? sellerPhone.replace(/[^0-9]/g, '') : null;
  const whatsappUrl = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
        `Slaw, I saw your product "${displayName}" on Bazary Gawra and would like to ask about it.`
      )}`
    : null;
  const telUrl = sellerPhone ? `tel:${sellerPhone}` : null;

  // Seller slug
  const shopHref = lp.seller_slug
    ? `/sellers/${lp.seller_slug}`
    : `/sellers/${lp.seller_name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-neutral-900 relative">
      <Header />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full space-y-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-neutral-500">
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 font-semibold hover:text-neutral-900 transition-colors"
          >
            <ArrowIcon className="w-3.5 h-3.5" />
            <span>{isKu ? 'هەموو بەرهەمەکان' : language === 'ar' ? 'جميع المنتجات' : 'All Products'}</span>
          </Link>
          <span>/</span>
          <span className="text-neutral-400 truncate max-w-xs">{displayName}</span>
        </div>

        {/* Envato Market Layout: Gallery Left (4:3), Info Panel Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: 4:3 Gallery (7 cols on desktop) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-[#EAE7DF] p-4 sm:p-6 shadow-2xs">
            <Gallery images={lp.images && lp.images.length > 0 ? lp.images : [lp.image_url]} alt={displayName} />
          </div>

          {/* RIGHT: Info Panel (5 cols on desktop) */}
          <div className="lg:col-span-5 space-y-5 text-start">
            {/* Title & Category */}
            <div>
              <div className="inline-flex items-center gap-1 text-[11px] font-bold text-[#657A52] bg-[#F2F5EF] px-2.5 py-0.5 rounded-full mb-2">
                <Tag className="w-3 h-3" />
                <span>{lp.category}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight leading-snug">
                {displayName}
              </h1>
            </div>

            {/* Price (Bold below name) */}
            <div className="flex items-baseline gap-2 bg-[#FAF9F6] p-4 rounded-xl border border-[#EAE7DF]">
              <span className="text-3xl font-black text-neutral-900 tracking-tight">
                {lp.price.toLocaleString()}
              </span>
              <span className="text-sm font-extrabold text-neutral-600 uppercase">
                {lp.currency}
              </span>
            </div>

            {/* Seller Mini-Card linking to shop */}
            <Link
              href={shopHref}
              className="group block p-4 rounded-2xl border border-[#EAE7DF] bg-white hover:border-[#F4B942] hover:shadow-sm transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-[#FFF5DD] text-[#8C5E00] flex items-center justify-center font-bold shrink-0 group-hover:scale-105 transition-transform">
                    <Store className="w-5 h-5 text-[#657A52]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-neutral-900 group-hover:text-[#8C5E00] transition-colors">
                        {lp.seller_name}
                      </span>
                      {lp.seller_verification === 'verified' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      ) : null}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-neutral-500 mt-0.5">
                      <MapPin className="w-3 h-3 text-[#657A52]" />
                      <span>{lp.location}</span>
                    </div>
                  </div>
                </div>

                <span className="text-xs font-bold text-[#657A52] group-hover:text-[#8C5E00] transition-colors inline-flex items-center gap-1">
                  <span>{isKu ? 'سەردانی فرۆشگا' : language === 'ar' ? 'زيارة المتجر' : 'Visit Shop'}</span>
                  <ArrowIcon className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>

            {/* Key-Facts Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl bg-white border border-[#EAE7DF]">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-neutral-500 mb-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#657A52]" />
                  <span>{isKu ? 'گەرەنتی' : language === 'ar' ? 'الضمان' : 'Warranty'}</span>
                </div>
                <div className="text-xs font-bold text-neutral-900 truncate">
                  {lp.warranty || (isKu ? 'دیاری نەکراوە' : language === 'ar' ? 'غير محدد' : 'Not provided')}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white border border-[#EAE7DF]">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-neutral-500 mb-0.5">
                  <Truck className="w-3.5 h-3.5 text-[#657A52]" />
                  <span>{isKu ? 'گەیاندن' : language === 'ar' ? 'التوصيل' : 'Delivery'}</span>
                </div>
                <div className="text-xs font-bold text-neutral-900 truncate">
                  {lp.delivery_info || (isKu ? 'لە فرۆشگا' : language === 'ar' ? 'استلام من المتجر' : 'Store pickup')}
                </div>
              </div>

              {lp.capacity && (
                <div className="p-3 rounded-xl bg-white border border-[#EAE7DF]">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-neutral-500 mb-0.5">
                    <Gauge className="w-3.5 h-3.5 text-[#657A52]" />
                    <span>{isKu ? 'قەبارە' : language === 'ar' ? 'السعة' : 'Capacity'}</span>
                  </div>
                  <div className="text-xs font-bold text-neutral-900 truncate">
                    {lp.capacity}
                  </div>
                </div>
              )}

              {lp.power && (
                <div className="p-3 rounded-xl bg-white border border-[#EAE7DF]">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-neutral-500 mb-0.5">
                    <Zap className="w-3.5 h-3.5 text-[#657A52]" />
                    <span>{isKu ? 'توانا' : language === 'ar' ? 'القدرة الكهربائية' : 'Power'}</span>
                  </div>
                  <div className="text-xs font-bold text-neutral-900 truncate">
                    {lp.power}
                  </div>
                </div>
              )}
            </div>

            {/* Actions: Order Now (Cash on Delivery) + Contact Seller (WhatsApp / Phone) + Compare Button */}
            <div className="space-y-2.5 pt-2">
              <button
                onClick={() => setIsOrderModalOpen(true)}
                className="w-full py-3.5 px-4 rounded-xl bg-[#F4B942] hover:bg-[#E2A732] text-neutral-950 font-black text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-[0.99]"
              >
                <ShoppingBag className="w-4 h-4 text-neutral-900" />
                <span>
                  {isKu
                    ? 'کڕینی دەستبەجێ (داواکردن بە کاش)'
                    : language === 'ar'
                    ? 'اطلب الآن (الدفع عند الاستلام)'
                    : 'Order Now (Cash on Delivery)'}
                </span>
              </button>

              {whatsappUrl ? (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{isKu ? 'پەیوەندی لە ڕێگەی WhatsApp' : language === 'ar' ? 'تواصل عبر واتساب' : 'Contact seller via WhatsApp'}</span>
                </a>
              ) : telUrl ? (
                <a
                  href={telUrl}
                  className="w-full py-2.5 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <Phone className="w-4 h-4" />
                  <span>{isKu ? 'پەیوەندی بە تەلەفۆن' : language === 'ar' ? 'اتصل بالبائع' : 'Call Seller'} ({lp.seller_phone})</span>
                </a>
              ) : (
                <div className="w-full py-2 px-4 rounded-xl bg-neutral-100 text-neutral-400 font-medium text-xs text-center border border-neutral-200">
                  {isKu ? 'پەیوەندی لەلایەن فرۆشیارەوە دیاری نەکراوە' : language === 'ar' ? 'معلومات الاتصال غير متوفرة' : 'Contact not provided'}
                </div>
              )}

              <button
                onClick={() => (compared ? removeFromCompare(lp.id) : addToCompare(lp))}
                className={`w-full py-2 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  compared
                    ? 'bg-neutral-900 text-white'
                    : 'bg-white border border-[#EAE7DF] text-neutral-700 hover:bg-[#FAF9F6]'
                }`}
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
                <span>{compared ? t('compareAdded') : `+ ${t('compareButton')}`}</span>
              </button>
            </div>
          </div>
        </div>

        {/* BELOW: Tabs for Description, Specs and Ask AI */}
        <div className="bg-white rounded-2xl border border-[#EAE7DF] p-6 shadow-2xs">
          <div className="flex items-center gap-2 border-b border-[#EAE7DF] pb-2 mb-6 overflow-x-auto">
            <button
              onClick={() => setActiveTab('desc')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'desc'
                  ? 'bg-[#F4B942] text-neutral-900 shadow-2xs'
                  : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>{isKu ? 'وەسفی بەرهەم' : language === 'ar' ? 'وصف المنتج' : 'Description'}</span>
            </button>

            <button
              onClick={() => setActiveTab('specs')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'specs'
                  ? 'bg-[#F4B942] text-neutral-900 shadow-2xs'
                  : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>{isKu ? 'تایبەتمەندییەکان' : language === 'ar' ? 'المواصفات' : 'Specifications'}</span>
            </button>

            <button
              onClick={() => setActiveTab('ai')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'ai'
                  ? 'bg-[#F4B942] text-neutral-900 shadow-2xs'
                  : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              <Sparkles className="w-4 h-4 fill-current" />
              <span>{isKu ? 'پرسیار لە AI' : language === 'ar' ? 'اسأل الذكاء الاصطناعي' : 'Ask AI'}</span>
            </button>
          </div>

          {/* Tab 1: Description */}
          {activeTab === 'desc' && (
            <div className="space-y-4">
              <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-line">
                {lp.description || (isKu ? 'وەسفی زیاتر بەردەست نییە.' : language === 'ar' ? 'لا يوجد وصف تفصيلي إضافي.' : 'No detailed description provided.')}
              </p>
              {/* Trust Signals & Transparency Audit */}
              <div className="pt-4 border-t border-[#EAE7DF]">
                <TrustSignals product={lp} />
              </div>
            </div>
          )}

          {/* Tab 2: Specs */}
          {activeTab === 'specs' && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase text-neutral-400">
                {isKu ? 'وردەکارییە تەکنیکییەکان' : language === 'ar' ? 'المواصفات الفنية' : 'Technical Specifications'}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#EAE7DF] flex justify-between">
                  <span className="text-neutral-500">{isKu ? 'براند' : language === 'ar' ? 'العلامة التجارية' : 'Brand'}</span>
                  <span className="font-bold text-neutral-900">{lp.brand || (isKu ? 'دیاری نەکراوە' : language === 'ar' ? 'غير محدد' : 'Not provided')}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#EAE7DF] flex justify-between">
                  <span className="text-neutral-500">{isKu ? 'توانا (وات)' : language === 'ar' ? 'القدرة (واط)' : 'Power (Watts)'}</span>
                  <span className="font-bold text-neutral-900">{lp.power || (isKu ? 'دیاری نەکراوە' : language === 'ar' ? 'غير محدد' : 'Not provided')}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#EAE7DF] flex justify-between">
                  <span className="text-neutral-500">{isKu ? 'قەبارە' : language === 'ar' ? 'السعة' : 'Capacity'}</span>
                  <span className="font-bold text-neutral-900">{lp.capacity || (isKu ? 'دیاری نەکراوە' : language === 'ar' ? 'غير محدد' : 'Not provided')}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#EAE7DF] flex justify-between">
                  <span className="text-neutral-500">{isKu ? 'ماوەی گەرەنتی' : language === 'ar' ? 'مدة الضمان' : 'Warranty Duration'}</span>
                  <span className="font-bold text-neutral-900">{lp.warranty || (isKu ? 'بێ گەرەنتی' : language === 'ar' ? 'بدون ضمان' : 'No warranty')}</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Ask AI */}
          {activeTab === 'ai' && (
            <AIAssistant product={lp} />
          )}
        </div>

        {/* More from this seller strip */}
        <MoreFromSeller
          sellerSlug={lp.seller_slug}
          sellerName={lp.seller_name}
          currentProductId={lp.id}
        />

        {/* Similar Products below that */}
        {similarProducts.length > 0 && (
          <section className="pt-8 border-t border-[#EAE7DF]">
            <div className="mb-6">
              <h3 className="text-lg sm:text-xl font-bold text-neutral-900">
                {isKu ? 'بەرهەمی هاوشێوە لەم پۆلەدا' : language === 'ar' ? 'منتجات مشابهة في هذا القسم' : 'Similar Products'}
              </h3>
              <p className="text-xs text-neutral-500">
                {isKu
                  ? 'بەرهەمە پەیوەندیدارەکانی بازاڕ بەپێی تایبەتمەندییەکان'
                  : language === 'ar'
                  ? 'خيارات مطابقة في أسواق كوردستان'
                  : 'Compare similar choices in Kurdistan'}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {similarProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Floating Ask AI Button (Opens AI Assistant Drawer) */}
      <button
        onClick={() => setIsAiDrawerOpen(true)}
        className="fixed bottom-20 md:bottom-6 end-6 z-40 px-4 py-3 rounded-full bg-[#F4B942] hover:bg-[#E2A732] text-neutral-950 font-bold text-xs shadow-lg flex items-center gap-2 transition-transform hover:scale-105 cursor-pointer"
      >
        <Sparkles className="w-4 h-4 fill-neutral-900" />
        <span>{isKu ? 'پرسیار لە AI' : language === 'ar' ? 'اسأل الذكاء الاصطناعي' : 'Ask AI'}</span>
      </button>

      {/* AI Assistant Modal/Drawer */}
      {isAiDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-xl rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl overflow-hidden border border-[#EAE7DF] max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE7DF] mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#F4B942] flex items-center justify-center text-neutral-900">
                  <Sparkles className="w-4 h-4 fill-neutral-900" />
                </div>
                <h3 className="font-extrabold text-sm text-neutral-900">
                  {isKu ? 'یارمەتیدەری زیرەکی بەرهەم' : language === 'ar' ? 'مساعد المنتج الذكي' : 'AI Product Assistant'}
                </h3>
              </div>
              <button
                onClick={() => setIsAiDrawerOpen(false)}
                className="p-1 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <AIAssistant
                product={product}
                isDrawer={true}
                onClose={() => setIsAiDrawerOpen(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Fast Direct Order Modal */}
      {isOrderModalOpen && (
        <OrderModal
          product={lp}
          isOpen={isOrderModalOpen}
          onClose={() => setIsOrderModalOpen(false)}
        />
      )}

      <Footer />
    </div>
  );
}
