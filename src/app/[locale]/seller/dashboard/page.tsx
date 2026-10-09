'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '../../../../components/layout/Header';
import { Footer } from '../../../../components/layout/Footer';
import { AddProductModal } from '../../../../components/seller/AddProductModal';
import { useLanguage } from '../../../../context/LanguageContext';
import { Product, SellerProfile } from '../../../../types';
import {
  Store,
  PlusCircle,
  ExternalLink,
  ShieldCheck,
  Truck,
  RotateCcw,
  Package,
  ShoppingBag,
  Eye,
  MapPin,
  Phone,
  MessageCircle,
  Clock,
  CheckCircle2,
  Filter,
} from 'lucide-react';

const DEMO_SHOPS = [
  {
    id: '1ef9d0e1-dc94-437e-a1a9-e478055d3f73',
    slug: 'sulaymaniyah-home-tech',
    name: 'Sulaymaniyah Home Tech',
    name_ckb: 'ماڵی تەکنەلۆجی سلێمانی',
    location: 'Sulaymaniyah, Ashti District',
    location_ckb: 'سلێمانی، گەڕەکی ئاشتی',
    phone: '+964 770 123 4567',
  },
  {
    id: '581ec98e-637a-4653-9ac5-16ef19ebdedc',
    slug: 'erbil-modern-appliances',
    name: 'Erbil Modern Appliances',
    name_ckb: 'کەلوپەلی مۆدێرنی هەولێر',
    location: 'Erbil, Gulan Street & Empire',
    location_ckb: 'هەولێر، شەقامی گوڵان و ئیمپایەر',
    phone: '+964 750 234 5678',
  },
  {
    id: '4542abe5-2b58-44bf-8705-6322658f779b',
    slug: 'hawraman-heritage-crafts',
    name: 'Hawraman Heritage Crafts',
    name_ckb: 'کەلەپوور و دەستکردی هەورامان',
    location: 'Sulaymaniyah (Qaisari Bazaar)',
    location_ckb: 'سلێمانی (بازاڕی قەیسەری)',
    phone: '+964 771 987 6543',
  },
];

export default function SellerDashboardPage() {
  const { language, isKu } = useLanguage();

  const [shops, setShops] = useState(DEMO_SHOPS);
  const [selectedShop, setSelectedShop] = useState(DEMO_SHOPS[0]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Dynamically load sellers from database
  useEffect(() => {
    async function loadShops() {
      try {
        const langParam = language === 'ckb' ? 'ku' : language;
        const res = await fetch(`/api/sellers?lang=${langParam}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const mapped = data.map((s: any) => ({
              id: s.id,
              slug: s.slug || s.id,
              name: s.name,
              name_ckb: s.name,
              location: s.location,
              location_ckb: s.location,
              phone: s.phone || s.phone_placeholder || '+964 770 000 0000',
            }));
            setShops(mapped);
            // Retain currently selected shop if found
            setSelectedShop((prev) => {
              const matched = mapped.find((m) => m.slug === prev.slug || m.id === prev.id);
              return matched || mapped[0];
            });
          }
        }
      } catch (e) {
        console.error('Failed to load dynamic sellers:', e);
      }
    }
    loadShops();
  }, [language]);

  // Load shop products
  const loadProducts = async () => {
    if (!selectedShop?.slug) return;
    try {
      setIsLoading(true);
      const langParam = language === 'ckb' ? 'ku' : language;
      const res = await fetch(`/api/sellers/${encodeURIComponent(selectedShop.slug)}/products?lang=${langParam}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to load shop products:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Load orders
  const loadOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    }
  };

  useEffect(() => {
    loadProducts();
    loadOrders();
  }, [selectedShop, language]);

  const handleProductCreated = (newProd: Product) => {
    setProducts((prev) => [newProd, ...prev]);
  };

  const displayName = isKu ? (selectedShop.name_ckb || selectedShop.name) : selectedShop.name;
  const displayLocation = isKu ? (selectedShop.location_ckb || selectedShop.location) : selectedShop.location;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-neutral-900">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Top Hub Banner */}
        <div className="bg-white rounded-3xl border border-[#EAE7DF] shadow-sm p-6 sm:p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#EAE7DF]">
            {/* Store Branding */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#FFF5DD] border-2 border-[#F4B942]/50 flex items-center justify-center shrink-0 shadow-xs">
                <Store className="w-8 h-8 text-[#8C5E00]" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
                    {displayName}
                  </h1>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                    {isKu ? 'فرۆشیاری چالاک' : 'Active Merchant'}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-neutral-500 font-medium mt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#657A52]" />
                    {displayLocation}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-[#657A52]" />
                    {selectedShop.phone}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions: View Public Shop & Add Product */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Switch Demo Shop selector */}
              <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                <span className="hidden sm:inline font-semibold">{isKu ? 'گۆڕینی فرۆشگا:' : 'Shop:'}</span>
                <select
                  value={selectedShop.id}
                  onChange={(e) => {
                    const found = shops.find((s) => s.id === e.target.value || s.slug === e.target.value);
                    if (found) setSelectedShop(found);
                  }}
                  className="px-3 py-2 rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] text-xs font-bold focus:outline-none focus:border-[#F4B942]"
                >
                  {shops.map((s) => (
                    <option key={s.id || s.slug} value={s.id}>
                      {isKu ? (s.name_ckb || s.name) : s.name}
                    </option>
                  ))}
                </select>
              </div>

              <Link
                href={`/sellers/${selectedShop.slug}`}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] hover:bg-neutral-100 text-neutral-800 font-bold text-xs transition-colors"
              >
                <Eye className="w-4 h-4 text-[#657A52]" />
                <span>{isKu ? 'بینینی فرۆشگاکەم لە بازاڕدا' : 'View Public Shop'}</span>
              </Link>

              <button
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F4B942] hover:bg-[#E2A732] text-neutral-950 font-black text-xs shadow-sm transition-all cursor-pointer active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{isKu ? '+ زیادکردنی بەرهەمی نوێ' : '+ Add New Product'}</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
            <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#EAE7DF]">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-xs font-bold">{isKu ? 'کۆی بەرهەمەکان' : 'Total Products'}</span>
                <Package className="w-4 h-4 text-[#8C5E00]" />
              </div>
              <div className="text-2xl font-black text-neutral-900">{products.length}</div>
              <span className="text-[11px] text-neutral-500 font-medium">
                {isKu ? 'لە کەتەلۆکی گشتیدا چالاکە' : 'Live on marketplace'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#EAE7DF]">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-xs font-bold">{isKu ? 'بە گەرەنتی فەرمی' : 'With Warranty'}</span>
                <ShieldCheck className="w-4 h-4 text-[#657A52]" />
              </div>
              <div className="text-2xl font-black text-neutral-900">
                {products.filter((p) => p.warranty && !p.warranty.includes('دیاری نەکراوە')).length}
              </div>
              <span className="text-[11px] text-[#657A52] font-medium">
                {isKu ? 'شەفافیەتی سەدا سەد' : 'Full transparency'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#EAE7DF]">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-xs font-bold">{isKu ? 'گەیاندنی خێرا' : 'Fast Delivery'}</span>
                <Truck className="w-4 h-4 text-[#657A52]" />
              </div>
              <div className="text-2xl font-black text-neutral-900">
                {products.filter((p) => p.delivery_info).length}
              </div>
              <span className="text-[11px] text-neutral-500 font-medium">
                {isKu ? 'خزمەتگوزاری ناوخۆیی' : 'Local city coverage'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#FFFDF7] border border-[#F4B942]/40">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-xs font-bold text-[#8C5E00]">{isKu ? 'داواکارییە نوێیەکان' : 'Customer Orders'}</span>
                <ShoppingBag className="w-4 h-4 text-[#8C5E00]" />
              </div>
              <div className="text-2xl font-black text-neutral-900">{orders.length}</div>
              <span className="text-[11px] text-neutral-500 font-medium">
                {isKu ? 'کاش لە کاتی وەرگرتن' : 'Cash on delivery'}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs: My Products vs. Orders */}
        <div className="flex items-center gap-3 border-b border-[#EAE7DF] mb-6">
          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'products'
                ? 'border-[#F4B942] text-neutral-950 text-[#8C5E00]'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>{isKu ? 'بەرهەمەکانی فرۆشگاکەم' : 'My Shop Products'} ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'orders'
                ? 'border-[#F4B942] text-neutral-950 text-[#8C5E00]'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{isKu ? 'داواکارییەکانی کڕیاران' : 'Customer Orders'} ({orders.length})</span>
          </button>
        </div>

        {/* TAB 1: PRODUCTS IN THIS SHOP */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-xs text-neutral-500 font-medium">
                {isKu
                  ? 'سەرجەم ئەو کاڵایانەی لەم فرۆشگایەدا بڵاوکراونەتەوە. دەتوانیت بەرهەمی نوێش زیاد بکەیت.'
                  : 'Products listed under this shop. Click to preview or add new items.'}
              </p>

              <button
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#FFF5DD] text-[#8C5E00] hover:bg-[#F4B942]/30 font-bold text-xs transition-colors"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>{isKu ? '+ دانانی بەرهەم' : '+ Put Product'}</span>
              </button>
            </div>

            {isLoading ? (
              <div className="py-20 text-center text-neutral-400 text-xs">
                {isKu ? 'بارکردنی بەرهەمەکان...' : 'Loading products...'}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {products.map((p) => (
                  <div
                    key={p.id}
                    className="bg-white rounded-2xl border border-[#EAE7DF] overflow-hidden shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative aspect-4/3 w-full bg-neutral-100 overflow-hidden">
                        <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                        <span className="absolute top-2.5 start-2.5 px-2 py-0.5 rounded-md bg-white/95 text-[10px] font-bold text-neutral-800 shadow-2xs">
                          {p.category}
                        </span>
                      </div>

                      <div className="p-4 space-y-2">
                        <h3 className="font-bold text-neutral-900 text-sm line-clamp-2 leading-snug">
                          {p.name_ckb || p.name}
                        </h3>

                        <div className="text-base font-black text-neutral-950">
                          {p.price.toLocaleString()} <span className="text-xs text-[#8C5E00]">IQD</span>
                        </div>

                        {/* Transparency badges */}
                        <div className="pt-2 border-t border-[#EAE7DF] space-y-1 text-[11px] text-neutral-600">
                          <div className="flex items-center gap-1.5 truncate">
                            <ShieldCheck className="w-3.5 h-3.5 text-[#657A52] shrink-0" />
                            <span className="truncate">{p.warranty || 'گەرەنتی دیاری نەکراوە'}</span>
                          </div>
                          <div className="flex items-center gap-1.5 truncate">
                            <Truck className="w-3.5 h-3.5 text-[#657A52] shrink-0" />
                            <span className="truncate">{p.delivery_info || 'گەیاندن لە فرۆشگا'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 pt-0">
                      <Link
                        href={`/products/${p.slug || p.id}`}
                        className="w-full py-2 px-3 rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] hover:bg-[#F4B942] hover:text-neutral-950 text-neutral-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>{isKu ? 'بینینی بەرهەم لە بازاڕدا' : 'View on Marketplace'}</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-[#EAE7DF] p-12 text-center text-neutral-500 space-y-3">
                <Store className="w-12 h-12 mx-auto text-neutral-300" />
                <h3 className="text-base font-bold text-neutral-800">
                  {isKu ? 'هیچ بەرهەمێک لەم فرۆشگایەدا نییە' : 'No products in this shop yet'}
                </h3>
                <p className="text-xs max-w-sm mx-auto">
                  {isKu
                    ? 'دەتوانیت یەکەمین کاڵا زیاد بکەیت تا ڕاستەوخۆ بۆ کڕیاران لە سەرتاسەری کوردستان دەربکەوێت.'
                    : 'Add your first product now to start receiving orders.'}
                </p>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F4B942] text-neutral-950 font-bold text-xs shadow-xs"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>{isKu ? 'زیادکردنی بەرهەم' : 'Add First Product'}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CUSTOMER ORDERS */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <p className="text-xs text-neutral-500 font-medium">
              {isKu
                ? 'سەرجەم ئەو داواکارییانەی کڕیاران لە ڕێگەی کڕینی دەستبەجێ تۆماریان کردووە.'
                : 'Customer orders placed through the instant Cash on Delivery checkout.'}
            </p>

            {orders.length > 0 ? (
              <div className="space-y-3">
                {orders.map((ord) => (
                  <div
                    key={ord.id}
                    className="bg-white rounded-2xl border border-[#EAE7DF] p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-[#8C5E00] tracking-wide">
                          {ord.id}
                        </span>
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md">
                          {isKu ? 'چاوەڕوانی گەیاندن' : 'Pending Delivery'}
                        </span>
                        <span className="text-xs text-neutral-400">
                          {new Date(ord.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      <h4 className="font-bold text-neutral-900 text-sm">{ord.product_name}</h4>

                      <div className="text-xs text-neutral-600 flex flex-wrap items-center gap-3">
                        <span className="font-semibold text-neutral-800">
                          {isKu ? 'کڕیار:' : 'Buyer:'} {ord.customer_name}
                        </span>
                        <span>•</span>
                        <span>
                          {isKu ? 'تەلەفۆن:' : 'Phone:'} {ord.customer_phone}
                        </span>
                        <span>•</span>
                        <span>
                          {isKu ? 'ناونیشان:' : 'Address:'} {ord.customer_city} ({ord.customer_address})
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-4 pt-3 md:pt-0 border-t md:border-t-0 border-[#EAE7DF]">
                      <div className="text-start md:text-end">
                        <div className="text-xs text-neutral-500">{isKu ? 'بڕی گشتی:' : 'Total:'}</div>
                        <div className="text-base font-black text-neutral-950">
                          {Number(ord.total_amount).toLocaleString()} IQD
                        </div>
                      </div>

                      <a
                        href={`https://wa.me/${ord.customer_phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-2xs"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>{isKu ? 'پەیوەندی لە WhatsApp' : 'WhatsApp Buyer'}</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-[#EAE7DF] p-12 text-center text-neutral-500">
                <ShoppingBag className="w-12 h-12 mx-auto text-neutral-300 mb-2" />
                <p className="text-sm font-semibold">{isKu ? 'هیچ داواکارییەک تۆمار نەکراوە' : 'No orders placed yet'}</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Add Product Studio Modal */}
      {isAddModalOpen && (
        <AddProductModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          sellerId={selectedShop.id}
          sellerName={selectedShop.name}
          sellerSlug={selectedShop.slug}
          sellerLocation={selectedShop.location}
          sellerPhone={selectedShop.phone}
          onProductCreated={handleProductCreated}
        />
      )}

      <Footer />
    </div>
  );
}
