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
} from 'lucide-react';

export default function SingleProductPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug } = use(params);
  const { language, t } = useLanguage();
  const { addToCompare, removeFromCompare, isCompared } = useComparison();

  const [product, setProduct] = useState<Product | null>(null);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'ai'>('desc');
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const isRtl = language === 'ku' || language === 'ar';
  const ArrowIcon = isRtl ? ArrowRight : ArrowLeft;

  useEffect(() => {
    let isMounted = true;
    async function loadProductDetail() {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/products/${encodeURIComponent(slug)}?lang=${language}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data) {
            setProduct(data);

            // Fetch similar products in category
            if (data.category) {
              fetch(`/api/products?category=${encodeURIComponent(data.category)}&lang=${language}&limit=4`)
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
            {language === 'ku' ? 'بارکردنی زانیارییە شەفافەکانی بەرهەم...' : 'Loading product details...'}
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
            {language === 'ku' ? 'بەرهەم نەدۆزرایەوە' : 'Product Not Found'}
          </h2>
          <Link
            href="/products"
            className="text-sm text-[#F4B942] underline mt-3 inline-flex items-center gap-1 font-semibold"
          >
            <ArrowIcon className="w-4 h-4" />
            <span>{language === 'ku' ? 'گەڕانەوە بۆ کەتەلۆک' : 'Back to Catalog'}</span>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const compared = isCompared(product.id);
  const displayName =
    language === 'ku' && product.name_ckb
      ? product.name_ckb
      : language === 'ar' && product.name_ar
      ? product.name_ar
      : product.name;

  // WhatsApp and phone setup
  const sellerPhone = product.seller_phone || product.seller_whatsapp;
  const cleanPhone = sellerPhone ? sellerPhone.replace(/[^0-9]/g, '') : null;
  const whatsappUrl = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
        `Slaw, I saw your product "${displayName}" on Bazary Gawra and would like to ask about it.`
      )}`
    : null;
  const telUrl = sellerPhone ? `tel:${sellerPhone}` : null;

  // Seller slug
  const shopHref = product.seller_slug
    ? `/sellers/${product.seller_slug}`
    : `/sellers/${product.seller_name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

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
            <span>{language === 'ku' ? 'هەموو بەرهەمەکان' : 'All Products'}</span>
          </Link>
          <span>/</span>
          <span className="text-neutral-400 truncate max-w-xs">{displayName}</span>
        </div>

        {/* Envato Market Layout: Gallery Left (4:3), Info Panel Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: 4:3 Gallery (7 cols on desktop) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-[#EAE7DF] p-4 sm:p-6 shadow-2xs">
            <Gallery images={[product.image_url]} alt={displayName} />
          </div>

          {/* RIGHT: Info Panel (5 cols on desktop) */}
          <div className="lg:col-span-5 space-y-5 text-start">
            {/* Title & Category */}
            <div>
              <div className="inline-flex items-center gap-1 text-[11px] font-bold text-[#657A52] bg-[#F2F5EF] px-2.5 py-0.5 rounded-full mb-2">
                <Tag className="w-3 h-3" />
                <span>{product.category}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight leading-snug">
                {displayName}
              </h1>
            </div>

            {/* Price (Bold below name) */}
            <div className="flex items-baseline gap-2 bg-[#FAF9F6] p-4 rounded-xl border border-[#EAE7DF]">
              <span className="text-3xl font-black text-neutral-900 tracking-tight">
                {product.price.toLocaleString()}
              </span>
              <span className="text-sm font-extrabold text-neutral-600 uppercase">
                {product.currency}
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
                        {product.seller_name}
                      </span>
                      {product.seller_verification === 'verified' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      ) : null}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-neutral-500 mt-0.5">
                      <MapPin className="w-3 h-3 text-[#657A52]" />
                      <span>{product.location}</span>
                    </div>
                  </div>
                </div>

                <span className="text-xs font-bold text-[#657A52] group-hover:text-[#8C5E00] transition-colors inline-flex items-center gap-1">
                  <span>{language === 'ku' ? 'فرۆشگا' : 'Visit Shop'}</span>
                  <ArrowIcon className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>

            {/* Key-Facts Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl bg-white border border-[#EAE7DF]">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-neutral-500 mb-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#657A52]" />
                  <span>{language === 'ku' ? 'گەرەنتی' : 'Warranty'}</span>
                </div>
                <div className="text-xs font-bold text-neutral-900 truncate">
                  {product.warranty || (language === 'ku' ? 'دیاری نەکراوە' : 'Not provided')}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white border border-[#EAE7DF]">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-neutral-500 mb-0.5">
                  <Truck className="w-3.5 h-3.5 text-[#657A52]" />
                  <span>{language === 'ku' ? 'گەیاندن' : 'Delivery'}</span>
                </div>
                <div className="text-xs font-bold text-neutral-900 truncate">
                  {product.delivery_info || (language === 'ku' ? 'لە فرۆشگا' : 'Store pickup')}
                </div>
              </div>

              {product.capacity && (
                <div className="p-3 rounded-xl bg-white border border-[#EAE7DF]">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-neutral-500 mb-0.5">
                    <Gauge className="w-3.5 h-3.5 text-[#657A52]" />
                    <span>{language === 'ku' ? 'قەبارە' : 'Capacity'}</span>
                  </div>
                  <div className="text-xs font-bold text-neutral-900 truncate">
                    {product.capacity}
                  </div>
                </div>
              )}

              {product.power && (
                <div className="p-3 rounded-xl bg-white border border-[#EAE7DF]">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-neutral-500 mb-0.5">
                    <Zap className="w-3.5 h-3.5 text-[#657A52]" />
                    <span>{language === 'ku' ? 'توانا' : 'Power'}</span>
                  </div>
                  <div className="text-xs font-bold text-neutral-900 truncate">
                    {product.power}
                  </div>
                </div>
              )}
            </div>

            {/* Actions: Contact Seller (WhatsApp / Phone) + Compare Button */}
            <div className="space-y-2.5 pt-2">
              {whatsappUrl ? (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{language === 'ku' ? 'پەیوەندی لە ڕێگەی WhatsApp' : 'Contact seller via WhatsApp'}</span>
                </a>
              ) : telUrl ? (
                <a
                  href={telUrl}
                  className="w-full py-3 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
                >
                  <Phone className="w-4 h-4" />
                  <span>{language === 'ku' ? 'پەیوەندی بە تەلەفۆن' : 'Call Seller'} ({product.seller_phone})</span>
                </a>
              ) : (
                <div className="w-full py-2.5 px-4 rounded-xl bg-neutral-100 text-neutral-400 font-medium text-xs text-center border border-neutral-200">
                  {language === 'ku' ? 'پەیوەندی لەلایەن فرۆشیارەوە دیاری نەکراوە' : 'Contact not provided'}
                </div>
              )}

              <button
                onClick={() => (compared ? removeFromCompare(product.id) : addToCompare(product))}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  compared
                    ? 'bg-neutral-900 text-white'
                    : 'bg-white border-2 border-[#F4B942] text-[#8C5E00] hover:bg-[#FFF5DD]/40'
                }`}
              >
                <ArrowLeftRight className="w-4 h-4" />
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
              <span>{language === 'ku' ? 'وەسفی بەرهەم' : 'Description'}</span>
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
              <span>{language === 'ku' ? 'تایبەتمەندییەکان' : 'Specifications'}</span>
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
              <span>{language === 'ku' ? 'پرسیار لە AI' : 'Ask AI'}</span>
            </button>
          </div>

          {/* Tab 1: Description */}
          {activeTab === 'desc' && (
            <div className="space-y-4">
              <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-line">
                {product.description || (language === 'ku' ? 'وەسفی زیاتر بەردەست نییە.' : 'No detailed description provided.')}
              </p>
              {/* Trust Signals & Transparency Audit */}
              <div className="pt-4 border-t border-[#EAE7DF]">
                <TrustSignals product={product} />
              </div>
            </div>
          )}

          {/* Tab 2: Specs */}
          {activeTab === 'specs' && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase text-neutral-400">
                {language === 'ku' ? 'وردەکارییە تەکنیکییەکان' : 'Technical Specifications'}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#EAE7DF] flex justify-between">
                  <span className="text-neutral-500">{language === 'ku' ? 'براند' : 'Brand'}</span>
                  <span className="font-bold text-neutral-900">{product.brand || (language === 'ku' ? 'دیاری نەکراوە' : 'Not provided')}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#EAE7DF] flex justify-between">
                  <span className="text-neutral-500">{language === 'ku' ? 'توانا (وات)' : 'Power (Watts)'}</span>
                  <span className="font-bold text-neutral-900">{product.power || (language === 'ku' ? 'دیاری نەکراوە' : 'Not provided')}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#EAE7DF] flex justify-between">
                  <span className="text-neutral-500">{language === 'ku' ? 'قەبارە' : 'Capacity'}</span>
                  <span className="font-bold text-neutral-900">{product.capacity || (language === 'ku' ? 'دیاری نەکراوە' : 'Not provided')}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#EAE7DF] flex justify-between">
                  <span className="text-neutral-500">{language === 'ku' ? 'ماوەی گەرەنتی' : 'Warranty Duration'}</span>
                  <span className="font-bold text-neutral-900">{product.warranty || (language === 'ku' ? 'بێ گەرەنتی' : 'No warranty')}</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Ask AI */}
          {activeTab === 'ai' && (
            <AIAssistant product={product} />
          )}
        </div>

        {/* More from this seller strip */}
        <MoreFromSeller
          sellerSlug={product.seller_slug}
          sellerName={product.seller_name}
          currentProductId={product.id}
        />

        {/* Similar Products below that */}
        {similarProducts.length > 0 && (
          <section className="pt-8 border-t border-[#EAE7DF]">
            <div className="mb-6">
              <h3 className="text-lg sm:text-xl font-bold text-neutral-900">
                {language === 'ku' ? 'بەرهەمی هاوشێوە لەم پۆلەدا' : 'Similar Products'}
              </h3>
              <p className="text-xs text-neutral-500">
                {language === 'ku'
                  ? 'بەرهەمە پەیوەندیدارەکانی بازاڕ بەپێی تایبەتمەندییەکان'
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
        <span>{language === 'ku' ? 'پرسیار لە AI' : 'Ask AI'}</span>
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
                  {language === 'ku' ? 'یارمەتیدەری زیرەکی بەرهەم' : 'AI Product Assistant'}
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

      <Footer />
    </div>
  );
}
