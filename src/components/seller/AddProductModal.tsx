'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Product, Category } from '../../types';
import {
  X,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Layers,
  ExternalLink,
  Upload,
  Trash2,
  Camera,
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

export const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  sellerId = '',
  sellerName = '',
  sellerSlug = '',
  sellerLocation = '',
  sellerPhone = '',
  onProductCreated,
}) => {
  const { language, isKu } = useLanguage();

  // Dynamic Categories from API/DB
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [nameCkb, setNameCkb] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState<string>('');
  const [originalPrice, setOriginalPrice] = useState<string>('');
  const [location, setLocation] = useState(sellerLocation);
  const [warranty, setWarranty] = useState('');
  const [deliveryInfo, setDeliveryInfo] = useState('');
  const [returnPolicy, setReturnPolicy] = useState('');
  const [capacity, setCapacity] = useState('');
  const [power, setPower] = useState('');
  const [brand, setBrand] = useState('');
  const [description, setDescription] = useState('');

  // Dynamic Image Uploads
  const [imageUrl, setImageUrl] = useState<string>('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [createdProduct, setCreatedProduct] = useState<Product | null>(null);

  // Sync seller location whenever props change
  useEffect(() => {
    if (sellerLocation) {
      setLocation(sellerLocation);
    }
  }, [sellerLocation]);

  // Fetch dynamic categories from Database when modal opens or language changes
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsLoadingCategories(true);

    fetch(`/api/categories?lang=${language}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (Array.isArray(data) && data.length > 0) {
          setCategories(data);
          // Set initial category if not set or not in list
          if (!category) {
            setCategory(data[0].slug || data[0].name);
          }
        }
      })
      .catch((err) => {
        console.warn('Failed to fetch dynamic categories:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingCategories(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, language]);

  if (!isOpen) return null;

  const handleFilesUpload = async (files: FileList | File[] | null) => {
    if (!files || files.length === 0) return;

    const validFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        validFiles.push(file);
      }
    }

    if (validFiles.length === 0) {
      setErrorMessage(
        isKu
          ? 'تکایە تەنها پەڕگەی وێنە (PNG, JPG, WebP) هەڵبژێرە.'
          : 'Please select valid image files (PNG, JPG, WebP).'
      );
      return;
    }

    setIsUploading(true);
    setErrorMessage('');

    try {
      const formData = new FormData();
      validFiles.forEach((file) => formData.append('files', file));

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Upload failed');
      }

      const data = await res.json();
      const newUrls: string[] = Array.isArray(data.urls) ? data.urls : [data.url];

      setUploadedImages((prev) => {
        const combined = [...prev, ...newUrls];
        if (!imageUrl) {
          setImageUrl(combined[0]);
        }
        return combined;
      });

      if (!imageUrl && newUrls.length > 0) {
        setImageUrl(newUrls[0]);
      }
    } catch (err: any) {
      console.error('File upload error:', err);
      setErrorMessage(
        isKu
          ? 'بارکردنی وێنە سەرکەوتوو نەبوو، تکایە دووبارە هەوڵبدەرەوە.'
          : 'Image upload failed, please try again.'
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = (urlToRemove: string) => {
    const nextUploaded = uploadedImages.filter((u) => u !== urlToRemove);
    setUploadedImages(nextUploaded);

    if (imageUrl === urlToRemove) {
      setImageUrl(nextUploaded[0] || '');
    }
  };

  const handleSetPrimaryImage = (url: string) => {
    setImageUrl(url);
  };

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

    const primaryImage = imageUrl || uploadedImages[0];
    if (!primaryImage) {
      setErrorMessage(
        isKu
          ? 'تکایە لانیکەم وێنەیەک بۆ بەرهەمەکە باربکە'
          : 'Please upload at least one image for the product'
      );
      return;
    }

    const allImages = uploadedImages.length > 0 ? uploadedImages : [primaryImage];

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          name_ckb: nameCkb.trim() || name.trim(),
          name_ar: name.trim(),
          category: category || (categories[0]?.slug || 'general'),
          price: Number(price),
          original_price: originalPrice && !isNaN(Number(originalPrice)) ? Number(originalPrice) : undefined,
          image_url: primaryImage,
          images: allImages,
          location: location || sellerLocation,
          seller_name: sellerName,
          seller_location: sellerLocation || location,
          seller_id: sellerId,
          seller_slug: sellerSlug,
          seller_phone: sellerPhone,
          seller_whatsapp: sellerPhone,
          warranty: warranty.trim() || undefined,
          delivery_info: deliveryInfo.trim() || undefined,
          return_policy: returnPolicy.trim() || undefined,
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
                {sellerName ? `${sellerName} • ` : ''}
                {isKu ? 'تۆمارکردن بە زانیاری شەفاف' : 'Transparent listing standards'}
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
                {createdProduct.image_url && (
                  <img
                    src={createdProduct.image_url}
                    alt={createdProduct.name}
                    className="w-20 h-20 rounded-xl object-cover border border-[#EAE7DF]"
                  />
                )}
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
                    setOriginalPrice('');
                    setImageUrl('');
                    setUploadedImages([]);
                    setBrand('');
                    setCapacity('');
                    setPower('');
                    setDescription('');
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
                    placeholder={isKu ? 'ناوی بەرهەمەکە بە کوردی بنووسە...' : 'Product name in Kurdish...'}
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
                    placeholder={isKu ? 'مۆدێل یان ناوی ئینگلیزی بەرهەم...' : 'Model or English product name...'}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE7DF] focus:outline-none focus:border-[#F4B942] bg-white"
                  />
                </div>
              </div>

              {/* Category, Selling Price, Original Price (Discount), Brand */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
                    {isLoadingCategories ? (
                      <option value="">{isKu ? 'باردەکرێت...' : 'Loading categories...'}</option>
                    ) : (
                      categories.map((c) => (
                        <option key={c.id || c.slug} value={c.slug || c.name}>
                          {isKu ? (c.name_ckb || c.name) : c.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">
                    {isKu ? 'نرخی فرۆشتن (IQD)' : 'Selling Price (IQD)'} *
                  </label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder={isKu ? 'نرخی فرۆشتن بنووسە...' : 'Selling price...'}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE7DF] focus:outline-none focus:border-[#F4B942] bg-white font-bold text-neutral-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">
                    {isKu ? 'نرخی پێش داشکاندن' : 'Original Price (Optional)'}
                    {originalPrice && Number(originalPrice) > (Number(price) || 0) && (
                      <span className="ms-1.5 text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-black">
                        -{Math.round(((Number(originalPrice) - Number(price)) / Number(originalPrice)) * 100)}%
                      </span>
                    )}
                  </label>
                  <input
                    type="number"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    placeholder={isKu ? 'ئەگەر داشکاندن هەبێت...' : 'If discounted...'}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE7DF] focus:outline-none focus:border-[#F4B942] bg-white font-medium text-neutral-600"
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
                    placeholder={isKu ? 'ناوی براند (ئارەزوومەندانە)...' : 'Brand name (optional)...'}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE7DF] focus:outline-none focus:border-[#F4B942] bg-white"
                  />
                </div>
              </div>

              {/* Product Image Upload Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-neutral-900 text-xs flex items-center gap-1.5">
                    <Upload className="w-4 h-4 text-[#8C5E00]" />
                    <span>{isKu ? 'بارکردنی وێنەی بەرهەم لە ئامێرەکەت' : 'Upload Product Images from Device'}</span>
                    <span className="text-neutral-400 font-normal text-[11px]">
                      ({isKu ? 'دەتوانیت یەک یان چەند وێنەیەک هەڵبژێریت' : 'Select one or more photos'}) *
                    </span>
                  </label>
                  {uploadedImages.length > 0 && (
                    <span className="text-[11px] font-bold text-[#657A52] bg-[#FAF9F6] px-2 py-0.5 rounded-md border border-[#EAE7DF]">
                      {uploadedImages.length} {isKu ? 'وێنە بارکراوە' : 'uploaded'}
                    </span>
                  )}
                </div>

                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/png,image/jpeg,image/webp,image/jpg"
                  multiple
                  onChange={(e) => handleFilesUpload(e.target.files)}
                  className="hidden"
                />

                {/* Dropzone Area */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    handleFilesUpload(e.dataTransfer.files);
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                    isDragging
                      ? 'border-[#F4B942] bg-amber-50/50 scale-[1.01]'
                      : 'border-[#EAE7DF] hover:border-[#F4B942] bg-[#FAF9F6] hover:bg-white'
                  }`}
                >
                  {isUploading ? (
                    <div className="py-2 flex flex-col items-center gap-2">
                      <Loader2 className="w-7 h-7 text-[#8C5E00] animate-spin" />
                      <span className="font-bold text-neutral-700 text-xs">
                        {isKu ? 'وێنەکان باردەکرێن بۆ داتابەیسی بازاڕی گەورە...' : 'Uploading images to storage...'}
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-2xl bg-[#FFF5DD] text-[#8C5E00] flex items-center justify-center shadow-xs">
                        <Camera className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="font-bold text-neutral-900 text-xs block">
                          {isKu
                            ? 'لێرە دابنێ یان کلیك بکە بۆ هەڵبژاردنی وێنە لە مۆبایل یان کۆمپیوتەرەکەت'
                            : 'Click to upload or drag & drop photos here'}
                        </span>
                        <span className="text-[11px] text-neutral-500 mt-0.5 block">
                          {isKu
                            ? 'پشتگیری لە فۆرماتی JPG, PNG, WebP دەکات • تا ٥ مێگابایت'
                            : 'Supports JPG, PNG, WebP • up to 5MB'}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* Uploaded Images Gallery */}
                {uploadedImages.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-semibold text-neutral-600 block">
                      {isKu
                        ? 'وێنە هەڵبژێردراوەکان (کلیك لەسەر هەر وێنەیەک بکە بۆ ئەوەی ببێتە وێنەی سەرەکی):'
                        : 'Uploaded photos (Click any to set as Main Cover):'}
                    </span>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
                      {uploadedImages.map((url, idx) => {
                        const isPrimary = (imageUrl || uploadedImages[0]) === url;
                        return (
                          <div
                            key={idx}
                            onClick={() => handleSetPrimaryImage(url)}
                            className={`group relative aspect-square rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                              isPrimary
                                ? 'border-[#F4B942] ring-2 ring-[#F4B942]/40 scale-105'
                                : 'border-[#EAE7DF] hover:border-neutral-400'
                            }`}
                          >
                            <img src={url} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                            {isPrimary && (
                              <div className="absolute top-1 start-1 px-1.5 py-0.5 rounded-md bg-[#F4B942] text-neutral-950 font-black text-[9px] shadow-xs">
                                {isKu ? 'سەرەکی' : 'Cover'}
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveImage(url);
                              }}
                              className="absolute top-1 end-1 p-1 rounded-full bg-black/60 hover:bg-red-600 text-white transition-colors"
                              title={isKu ? 'سڕینەوەی وێنە' : 'Remove photo'}
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
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
                      placeholder={isKu ? 'نموونە: ١٢ مانگ گەرەنتی فەرمی' : 'e.g. 12 Months Official Warranty'}
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
                      placeholder={isKu ? 'نموونە: گەیاندنی هەمان ڕۆژ' : 'e.g. Same-day delivery'}
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
                      placeholder={isKu ? 'نموونە: ٧ ڕۆژ مافی پشکنین' : 'e.g. 7 days inspection & return'}
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
                      placeholder={isKu ? 'نموونە: ٥.٥ لیتر، یان ٣٤٠ لاپەڕە...' : 'e.g. 5.5L, 340 Pages, 150x200cm...'}
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
                      placeholder={isKu ? 'نموونە: 1800W، 15 Bar...' : 'e.g. 1800W, 15 Bar, N/A...'}
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
