'use client';

import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Product } from '../../types';
import {
  X,
  PlusCircle,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Tag,
  ShieldCheck,
  Truck,
  RotateCcw,
  Store,
  Layers,
  Sparkles,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  sellerId?: string;
  sellerName?: string;
  sellerSlug?: string;
  sellerLocation?: string;
  sellerPhone?: string;
  onProductCreated?: (product: Product) => void;
}

const PRESET_IMAGES = [
  {
    label: 'Espresso / Coffee',
    url: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80',
    ],
  },
  {
    label: 'Home Kitchen / Airfryer',
    url: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80',
    ],
  },
  {
    label: 'Natural Honey / Food',
    url: 'https://images.unsplash.com/photo-1587049352847-4a222e784d38?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1587049352847-4a222e784d38?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1471943311424-646960669fbc?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=1200&q=80',
    ],
  },
  {
    label: 'Handmade Kelim / Crafts',
    url: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1579656381226-5fc0f0100c3b?auto=format&fit=crop&w=1200&q=80',
    ],
  },
  {
    label: 'Vacuum / Electronics',
    url: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80',
    ],
  },
  {
    label: 'Books & Literature',
    url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1200&q=80',
    ],
  },
];

export const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  sellerId = 'seller-01',
  sellerName = 'Sulaymaniyah Home Tech',
  sellerSlug = 'sulaymaniyah-home-tech',
  sellerLocation = 'Sulaymaniyah, Ashti District',
  sellerPhone = '+964 770 123 4567',
  onProductCreated,
}) => {
  const { language, isKu } = useLanguage();

  const [name, setName] = useState('');
  const [nameCkb, setNameCkb] = useState('');
  const [category, setCategory] = useState('Kitchen & Home');
  const [price, setPrice] = useState<string>('');
  const [imageUrl, setImageUrl] = useState(PRESET_IMAGES[1].url);
  const [selectedImages, setSelectedImages] = useState<string[]>(PRESET_IMAGES[1].images);
  const [location, setLocation] = useState(sellerLocation);
  const [warranty, setWarranty] = useState(
    isKu ? '١٢ مانگ گەرەنتی فەرمی ناوخۆیی' : '12 Months Official Warranty'
  );
  const [deliveryInfo, setDeliveryInfo] = useState(
    isKu ? 'گەیاندنی هەمان ڕۆژ (٣,٠٠٠ دینار)' : 'Same-day delivery (3,000 IQD)'
  );
  const [returnPolicy, setReturnPolicy] = useState(
    isKu ? '٧ ڕۆژ مافی پشکنین و گەڕاندنەوە' : '7 days inspection and return'
  );
  const [capacity, setCapacity] = useState('');
  const [power, setPower] = useState('');
  const [brand, setBrand] = useState('');
  const [description, setDescription] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [createdProduct, setCreatedProduct] = useState<Product | null>(null);

  if (!isOpen) return null;

  const categories = [
    { en: 'Local Food & Products', ku: 'خۆراک و بەرهەمی خۆماڵی', ar: 'الأغذية والمنتجات المحلية' },
    { en: 'Handmade & Heritage', ku: 'دەستکرد و کەلەپوور', ar: 'الحرف اليدوية والتراث' },
    { en: 'Kitchen Appliances & Supplies', ku: 'ئامێر و پێداویستییەکانی چێشتخانە', ar: 'أجهزة ومستلزمات المطبخ' },
    { en: 'Home Appliances', ku: 'ئامێرەکانی ماڵ', ar: 'الأجهزة المنزلية' },
    { en: 'Electronics', ku: 'ئەلیکترۆنیات', ar: 'الإلكترونيات' },
    { en: 'Beauty & Personal Care', ku: 'جوانی و چاودێری کەسی', ar: 'الجمال والعناية الشخصية' },
    { en: 'Books', ku: 'کتێب', ar: 'الكتب' },
    { en: 'Other', ku: 'هی تر', ar: 'أخرى' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim() || !price || isNaN(Number(price))) {
      setErrorMessage(
        isKu
          ? 'تکایە ناوی بەرهەم و نرخ بە دروستی بنووسە'
          : 'Please enter a valid product name and price'
      );
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          name_ckb: nameCkb.trim() || name.trim(),
          name_ar: name.trim(),
          category,
          price: Number(price),
          image_url: imageUrl,
          images: selectedImages && selectedImages.length > 0 ? selectedImages : [imageUrl],
          location,
          seller_name: sellerName,
          seller_location: sellerLocation,
          seller_id: sellerId,
          seller_slug: sellerSlug,
          seller_phone: sellerPhone,
          seller_whatsapp: sellerPhone,
          warranty,
          delivery_info: deliveryInfo,
          return_policy: returnPolicy,
          capacity: capacity.trim() || undefined,
          power: power.trim() || undefined,
          brand: brand.trim() || undefined,
          description: description.trim(),
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to create product');
      }

      const newProduct = (await res.json()) as Product;
      setCreatedProduct(newProduct);
      if (onProductCreated) {
        onProductCreated(newProduct);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error creating product');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl border border-[#EAE7DF] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EAE7DF] bg-[#FAF9F6]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FFF5DD] text-[#8C5E00] flex items-center justify-center">
              <PlusCircle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-extrabold text-neutral-900 text-base leading-tight">
                {createdProduct
                  ? isKu
                    ? 'بەرهەمەکە بڵاوکرایەوە'
                    : 'Product Published!'
                  : isKu
                  ? 'زیادکردنی بەرهەمی نوێ بۆ فرۆشگاکەم'
                  : 'Add New Product to My Shop'}
              </h2>
              <span className="text-[11px] text-neutral-500 font-medium">
                {sellerName} • {isKu ? 'تۆمارکردن بە زانیاری شەفاف' : 'Transparent listing standards'}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-[#EAE7DF] bg-white flex items-center justify-center text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {createdProduct ? (
            /* SUCCESS VIEW */
            <div className="text-center py-6 space-y-5 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h3 className="text-xl font-black text-neutral-900 mb-1">
                  {isKu
                    ? 'بەرهەمەکەت بە سەرکەوتوویی زیادکرا بۆ فرۆشگاکەت!'
                    : 'Product successfully added to your shop!'}
                </h3>
                <p className="text-xs text-neutral-500 max-w-md mx-auto">
                  {isKu
                    ? 'ئێستا ئەم بەرهەمە لە لاپەڕەی فرۆشگاکەت و لە کەتەلۆکی گشتی بازاڕی گەورەدا ڕاستەوخۆ دەبینرێت.'
                    : 'The product is now live on your shopfront and visible to buyers in the marketplace.'}
                </p>
              </div>

              {/* Product Preview Card */}
              <div className="bg-[#FAF9F6] border border-[#EAE7DF] rounded-2xl p-4 text-start flex items-center gap-4 max-w-md mx-auto">
                <img
                  src={createdProduct.image_url}
                  alt={createdProduct.name}
                  className="w-20 h-20 rounded-xl object-cover border border-[#EAE7DF]"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold text-[#8C5E00] bg-[#FFF5DD] px-2 py-0.5 rounded">
                    {createdProduct.category}
                  </span>
                  <h4 className="font-bold text-sm text-neutral-900 truncate mt-1">
                    {createdProduct.name_ckb || createdProduct.name}
                  </h4>
                  <div className="text-sm font-black text-neutral-950 mt-1">
                    {createdProduct.price.toLocaleString()} IQD
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto pt-2">
                <a
                  href={`/products/${createdProduct.slug || createdProduct.id}`}
                  className="w-full sm:w-auto flex-1 py-3 px-4 rounded-xl bg-[#F4B942] hover:bg-[#E2A732] text-neutral-950 font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>{isKu ? 'بینینی بەرهەم لە بازاڕدا' : 'View Live in Marketplace'}</span>
                </a>

                <button
                  onClick={() => {
                    setCreatedProduct(null);
                    setName('');
                    setNameCkb('');
                    setPrice('');
                  }}
                  className="w-full sm:w-auto flex-1 py-3 px-4 rounded-xl border border-[#EAE7DF] bg-white hover:bg-neutral-50 text-neutral-800 font-bold text-xs transition-colors"
                >
                  {isKu ? '+ زیادکردنی دانەیەکی تر' : '+ Add Another Item'}
                </button>
              </div>
            </div>
          ) : (
            /* FORM VIEW */
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Titles: English & Kurdish */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">
                    {isKu ? 'ناوی بەرهەم (بە کوردی)' : 'Product Name (Kurdish)'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={nameCkb}
                    onChange={(e) => setNameCkb(e.target.value)}
                    placeholder={isKu ? 'نموونە: ئێرفرایەری نینجا ٨ لیتر' : 'e.g. Ninja Airfryer 8L'}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE7DF] focus:outline-none focus:border-[#F4B942] bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">
                    {isKu ? 'ناوی بەرهەم (بە ئینگلیزی / مۆدێل)' : 'Product Name (English / Model)'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ninja DualBasket Air Fryer XL"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE7DF] focus:outline-none focus:border-[#F4B942] bg-white"
                  />
                </div>
              </div>

              {/* Category & Price */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">
                    <Layers className="w-3.5 h-3.5 inline me-1 text-neutral-400" />
                    {isKu ? 'پۆل' : 'Category'} *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE7DF] focus:outline-none focus:border-[#F4B942] bg-white font-medium"
                  >
                    {categories.map((c) => (
                      <option key={c.en} value={c.en}>
                        {isKu ? c.ku : c.en}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">
                    {isKu ? 'نرخ (دیناری عێراقی IQD)' : 'Price (IQD)'} *
                  </label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g. 185000"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE7DF] focus:outline-none focus:border-[#F4B942] bg-white font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">
                    {isKu ? 'براند / مارکە' : 'Brand'}
                  </label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="e.g. Philips, Braun, Dyson..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE7DF] focus:outline-none focus:border-[#F4B942] bg-white"
                  />
                </div>
              </div>

              {/* Product Image Presets & URL */}
              <div>
                <label className="block font-bold text-neutral-700 mb-1.5">
                  <ImageIcon className="w-3.5 h-3.5 inline me-1 text-neutral-400" />
                  {isKu ? 'وێنەی بەرهەم (هەڵبژاردنی نموونە یان بەستەر)' : 'Product Image (Presets or URL)'}
                </label>
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  {PRESET_IMAGES.map((preset, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => {
                        setImageUrl(preset.url);
                        setSelectedImages(preset.images);
                      }}
                      className={`relative w-14 h-14 rounded-xl border-2 overflow-hidden shrink-0 transition-all ${
                        imageUrl === preset.url
                          ? 'border-[#F4B942] ring-2 ring-[#F4B942]/30 scale-105'
                          : 'border-[#EAE7DF] opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    setSelectedImages([e.target.value]);
                  }}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2 rounded-xl border border-[#EAE7DF] focus:outline-none focus:border-[#F4B942] bg-white text-[11px]"
                />
              </div>

              {/* Radical Transparency Signals */}
              <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#EAE7DF] space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#657A52]" />
                  <span className="font-bold text-neutral-900 text-xs">
                    {isKu ? 'زانیارییە ڕوون و شەفافەکان (مەرجی بازاڕی گەورە)' : 'Radical Transparency Signals'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-neutral-600 mb-1 text-[11px]">
                      {isKu ? 'ماوەی گەرەنتی' : 'Warranty Terms'}
                    </label>
                    <input
                      type="text"
                      value={warranty}
                      onChange={(e) => setWarranty(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#EAE7DF] bg-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-600 mb-1 text-[11px]">
                      {isKu ? 'گەیاندن و تێچوو' : 'Delivery Coverage'}
                    </label>
                    <input
                      type="text"
                      value={deliveryInfo}
                      onChange={(e) => setDeliveryInfo(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#EAE7DF] bg-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-600 mb-1 text-[11px]">
                      {isKu ? 'مەرجی گەڕاندنەوە' : 'Return Policy'}
                    </label>
                    <input
                      type="text"
                      value={returnPolicy}
                      onChange={(e) => setReturnPolicy(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#EAE7DF] bg-white text-xs"
                    />
                  </div>
                </div>

                {/* Technical specs: capacity and power */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block font-bold text-neutral-600 mb-1 text-[11px]">
                      {isKu ? 'قەبارە / پێوانە' : 'Capacity / Dimensions'}
                    </label>
                    <input
                      type="text"
                      value={capacity}
                      onChange={(e) => setCapacity(e.target.value)}
                      placeholder="e.g. 5.5L, 150cm x 200cm..."
                      className="w-full px-3 py-2 rounded-xl border border-[#EAE7DF] bg-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-600 mb-1 text-[11px]">
                      {isKu ? 'توانا (وات / باڕ)' : 'Power (Watts / Pressure)'}
                    </label>
                    <input
                      type="text"
                      value={power}
                      onChange={(e) => setPower(e.target.value)}
                      placeholder="e.g. 1800W, 15 Bar, N/A..."
                      className="w-full px-3 py-2 rounded-xl border border-[#EAE7DF] bg-white text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-neutral-700 mb-1">
                  {isKu ? 'وەسفی وردی بەرهەم' : 'Product Description'}
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={
                    isKu
                      ? 'وەسفی تایبەتمەندییە سەرەکییەکان، دۆخی کاڵا، و زانیاری زیاتر بنووسە...'
                      : 'Detailed product description and specs...'
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE7DF] focus:outline-none focus:border-[#F4B942] bg-white"
                />
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 rounded-xl bg-[#F4B942] hover:bg-[#E2A732] text-neutral-950 font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{isKu ? 'بڵاوکردنەوە لە فرۆشگاکەم...' : 'Publishing to My Shop...'}</span>
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4" />
                    <span>{isKu ? 'بڵاوکردنەوەی بەرهەم لە فرۆشگاکەم' : 'Publish Product to My Shop'}</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
