'use client';

import React, { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '../../../../components/layout/Header';
import { Footer } from '../../../../components/layout/Footer';
import { ShopHeader } from '../../../../components/seller/ShopHeader';
import { ProductGrid } from '../../../../components/product/ProductGrid';
import { useLanguage } from '../../../../context/LanguageContext';
import { SellerProfile, Product } from '../../../../types';
import { localizeCategory, localizeLocation } from '../../../../lib/i18nData';
import { AddProductModal } from '../../../../components/seller/AddProductModal';
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  Store,
  Grid,
  Info,
  MapPin,
  ShieldCheck,
  Truck,
  RotateCcw,
  PlusCircle,
} from 'lucide-react';

export default function SellerShopPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug } = use(params);
  const { language, isKu } = useLanguage();
  const isRtl = isKu || language === 'ar';
  const ArrowIcon = isRtl ? ArrowRight : ArrowLeft;

  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'products' | 'about'>('products');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isProductsLoading, setIsProductsLoading] = useState(false);

  // 1. Fetch Seller Profile (header & stats)
  useEffect(() => {
    let isMounted = true;
    async function loadShop() {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/sellers/${encodeURIComponent(slug)}?lang=${language}`);
        if (res.ok) {
          const data = (await res.json()) as SellerProfile;
          if (isMounted) {
            setSeller(data);
          }
        }
      } catch (err) {
        console.error('Failed to load seller shop:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadShop();
    return () => {
      isMounted = false;
    };
  }, [slug, language]);

  // 2. Fetch Shop Products (filtered by category inside shop)
  useEffect(() => {
    let isMounted = true;
    async function loadProducts() {
      try {
        setIsProductsLoading(true);
        const catQuery = selectedCategory !== 'all' ? `&category=${encodeURIComponent(selectedCategory)}` : '';
        const res = await fetch(
          `/api/sellers/${encodeURIComponent(slug)}/products?lang=${language}${catQuery}`
        );
        if (res.ok) {
          const data = (await res.json()) as Product[];
          if (isMounted) {
            setProducts(Array.isArray(data) ? data : []);
          }
        }
      } catch (err) {
        console.error('Failed to load shop products:', err);
      } finally {
        if (isMounted) setIsProductsLoading(false);
      }
    }

    loadProducts();
    return () => {
      isMounted = false;
    };
  }, [slug, language, selectedCategory]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-neutral-900">
      <Header />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        {/* Breadcrumb Navigation */}
        <div className="mb-4">
          <Link
            href="/sellers"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            <ArrowIcon className="w-3.5 h-3.5" />
            <span>
              {isKu
                ? 'گەڕانەوە بۆ سەرجەم فرۆشگاکان'
                : language === 'ar'
                ? 'العودة إلى جميع المتاجر'
                : 'Back to all shops'}
            </span>
          </Link>
        </div>

        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3 text-neutral-400">
            <Loader2 className="w-8 h-8 animate-spin text-[#F4B942]" />
            <p className="text-sm font-medium">
              {isKu
                ? 'بارکردنی فرۆشگا لە داتابەیس...'
                : language === 'ar'
                ? 'جاري تحميل المتجر...'
                : 'Loading shop profile...'}
            </p>
          </div>
        ) : seller ? (
          <>
            {/* Etsy Style Shop Header with Kilim top border & honest stats */}
            <ShopHeader seller={seller} />

            {/* Shop Navigation Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EAE7DF] mb-6">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('products')}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all ${
                    activeTab === 'products'
                      ? 'border-[#F4B942] text-neutral-900 text-[#8C5E00]'
                      : 'border-transparent text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                  <span>
                    {isKu ? 'بەرهەمەکان' : language === 'ar' ? 'المنتجات' : 'Products'} (
                    {seller.product_count})
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('about')}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all ${
                    activeTab === 'about'
                      ? 'border-[#F4B942] text-neutral-900 text-[#8C5E00]'
                      : 'border-transparent text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  <Info className="w-4 h-4" />
                  <span>
                    {isKu
                      ? 'دەربارەی فرۆشگا'
                      : language === 'ar'
                      ? 'حول المتجر'
                      : 'About Shop'}
                  </span>
                </button>
              </div>

              {/* Seller Add Product Quick Action */}
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#F4B942] hover:bg-[#E2A732] text-neutral-950 font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{isKu ? '+ دانانی بەرهەم لەم فرۆشگایە' : '+ Add Product to Shop'}</span>
              </button>
            </div>

            {/* TAB 1: Products */}
            {activeTab === 'products' && (
              <div className="space-y-6">
                {/* Internal Category Filter Chips (Etsy style) */}
                {seller.categories && seller.categories.length > 0 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all ${
                        selectedCategory === 'all'
                          ? 'bg-[#F4B942] text-neutral-900 shadow-2xs'
                          : 'bg-white border border-[#EAE7DF] text-neutral-700 hover:bg-neutral-50'
                      }`}
                    >
                      {isKu ? 'هەموو' : language === 'ar' ? 'الكل' : 'All'} (
                      {seller.product_count})
                    </button>

                    {seller.categories.map((c) => (
                      <button
                        key={c.slug}
                        onClick={() => setSelectedCategory(c.slug)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all ${
                          selectedCategory === c.slug
                            ? 'bg-[#F4B942] text-neutral-900 shadow-2xs'
                            : 'bg-white border border-[#EAE7DF] text-neutral-700 hover:bg-neutral-50'
                        }`}
                      >
                        {localizeCategory(c.name, language)} ({c.count})
                      </button>
                    ))}
                  </div>
                )}

                {/* Product Grid */}
                {isProductsLoading ? (
                  <div className="py-16 flex flex-col items-center justify-center gap-2 text-neutral-400">
                    <Loader2 className="w-6 h-6 animate-spin text-[#F4B942]" />
                    <span className="text-xs">
                      {isKu
                        ? 'نوێکردنەوەی بەرهەمەکانی فرۆشگا...'
                        : language === 'ar'
                        ? 'جاري تحديث منتجات المتجر...'
                        : 'Updating shop catalog...'}
                    </span>
                  </div>
                ) : products.length > 0 ? (
                  <ProductGrid products={products} />
                ) : (
                  <div className="bg-white rounded-2xl border border-[#EAE7DF] p-12 text-center text-neutral-500">
                    <Store className="w-10 h-10 mx-auto text-neutral-300 mb-2" />
                    <p className="text-sm font-semibold">
                      {isKu
                        ? 'هیچ بەرهەمێک لەم پۆلەدا نەدۆزرایەوە'
                        : language === 'ar'
                        ? 'لا توجد منتجات في هذه الفئة حالياً'
                        : 'No products in this category yet.'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: About Shop */}
            {activeTab === 'about' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 bg-white rounded-2xl border border-[#EAE7DF] p-6 sm:p-8 space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-neutral-900 mb-2">
                      {isKu ? 'دەربارەی فرۆشگا' : language === 'ar' ? 'حول المتجر' : 'About the Shop'}
                    </h2>
                    <p className="text-sm text-neutral-600 leading-relaxed">
                      {isKu
                        ? (seller.description && !seller.description.includes('Local Kurdish merchant')
                            ? seller.description
                            : 'ئەم فرۆشگایە ئەندامێکی تۆمارکراوە لە بازاڕی گەورە، کە زانیاری شەفاف سەبارەت بە نرخ، گەرەنتی و گەیاندنی کاڵاکانی پێشکەش دەکات بەبێ نێوەندگیر.')
                        : language === 'ar'
                        ? (seller.description && !seller.description.includes('Local Kurdish merchant')
                            ? seller.description
                            : 'هذا التاجر المحلي مسجل في بازاري گەورە ويوفر مواصفات شفافة وضماناً وخدمة توصيل حقيقية.')
                        : seller.description || 'This local merchant lists verified products in Bazary Gawra with transparent specifications and local support.'}
                    </p>
                  </div>

                  <div className="pt-6 border-t border-[#EAE7DF]">
                    <h3 className="text-sm font-bold text-neutral-900 mb-3">
                      {isKu ? 'شوێن و خزمەتگوزارییەکان' : language === 'ar' ? 'الموقع والخدمات' : 'Location & Services'}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-[#FAF9F6] border border-[#EAE7DF]">
                        <MapPin className="w-4 h-4 text-[#657A52]" />
                        <div className="text-xs">
                          <span className="font-semibold text-neutral-700 block">
                            {isKu ? 'شار و ناونیشان' : language === 'ar' ? 'المدينة والعنوان' : 'City & Address'}
                          </span>
                          <span className="text-neutral-500">{localizeLocation(seller.location, language)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 rounded-xl bg-[#FAF9F6] border border-[#EAE7DF]">
                        <Truck className="w-4 h-4 text-[#657A52]" />
                        <div className="text-xs">
                          <span className="font-semibold text-neutral-700 block">
                            {isKu ? 'گەیاندن' : language === 'ar' ? 'التوصيل' : 'Delivery'}
                          </span>
                          <span className="text-neutral-500">
                            {seller.info_summary.with_delivery_info > 0
                              ? isKu
                                ? 'گەیاندنی ناوخۆیی بەردەستە'
                                : language === 'ar'
                                ? 'التوصيل المحلي متوفر'
                                : 'Local delivery available'
                              : isKu
                              ? 'وەرگرتن لە فرۆشگا'
                              : language === 'ar'
                              ? 'استلام من المتجر فقط'
                              : 'In-store pickup only'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Transparency Checklist Box */}
                <div className="bg-[#FAF9F6] rounded-2xl border border-[#EAE7DF] p-6 space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#657A52]">
                    {isKu ? 'شەفافیەتی بازاڕی گەورە' : language === 'ar' ? 'تدقيق الشفافية في بازاري گەورە' : 'Bazary Gawra Transparency Audit'}
                  </h3>

                  <div className="space-y-3">
                    <div className="flex items-start gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-[#657A52] shrink-0 mt-0.5" />
                      <div className="text-xs text-neutral-700">
                        <span className="font-bold block">
                          {isKu ? 'بەرهەمی ڕاستەقینە' : language === 'ar' ? 'إفصاحات حقيقية' : 'Honest Disclosures'}
                        </span>
                        <span className="text-neutral-500">
                          {isKu
                            ? 'هیچ زانیارییەکی ساختە یاخود هەڵبەستراو لەم فرۆشگایە نییە'
                            : language === 'ar'
                            ? 'لا توجد تقييمات مزيفة أو رسوم مخفية.'
                            : 'No fabricated reviews or hidden fees.'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <RotateCcw className="w-4 h-4 text-[#657A52] shrink-0 mt-0.5" />
                      <div className="text-xs text-neutral-700">
                        <span className="font-bold block">
                          {isKu ? 'پەیوەندی ڕاستەوخۆ' : language === 'ar' ? 'واتساب وتواصل مباشر' : 'Direct WhatsApp'}
                        </span>
                        <span className="text-neutral-500">
                          {isKu
                            ? 'پەیوەندی ڕاستەوخۆ لەگەڵ خاوەن فرۆشگا بەبێ نێوەندگیر'
                            : language === 'ar'
                            ? 'تواصل مباشر مع التاجر دون وسطاء.'
                            : 'Direct contact with merchant without intermediaries.'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="py-24 text-center">
            <h2 className="text-xl font-bold text-neutral-800">
              {isKu ? 'فرۆشگا نەدۆزرایەوە' : language === 'ar' ? 'المتجر غير موجود' : 'Shop not found'}
            </h2>
          </div>
        )}
      </main>

      {/* Add Product Studio Modal for Seller */}
      {isAddModalOpen && seller && (
        <AddProductModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          sellerId={seller.id}
          sellerName={seller.name}
          sellerSlug={seller.slug}
          sellerLocation={seller.location}
          sellerPhone={seller.phone}
          onProductCreated={(newProd) => {
            setProducts((prev) => [newProd, ...prev]);
            if (seller) {
              setSeller({ ...seller, product_count: seller.product_count + 1 });
            }
          }}
        />
      )}

      <Footer />
    </div>
  );
}
