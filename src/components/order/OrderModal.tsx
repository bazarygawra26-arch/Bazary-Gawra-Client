'use client';

import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Product } from '../../types';
import {
  X,
  CheckCircle2,
  Truck,
  ShieldCheck,
  Phone,
  User,
  MapPin,
  Banknote,
  MessageCircle,
  Loader2,
  Sparkles,
  AlertCircle,
  ShoppingBag,
} from 'lucide-react';

interface OrderModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export const OrderModal: React.FC<OrderModalProps> = ({ product, isOpen, onClose }) => {
  const { language, isKu } = useLanguage();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerCity, setCustomerCity] = useState(
    isKu ? 'سلێمانی' : language === 'ar' ? 'السليمانية' : 'Sulaymaniyah'
  );
  const [customerAddress, setCustomerAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash_on_delivery' | 'electronic'>('cash_on_delivery');
  const [orderNotes, setOrderNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [confirmedOrder, setConfirmedOrder] = useState<any | null>(null);

  if (!isOpen) return null;

  // Delivery fee logic
  const isFreeDelivery =
    product.delivery_info?.toLowerCase().includes('free') ||
    product.delivery_info?.includes('بێبەرامبەر') ||
    product.delivery_info?.includes('مجاني');
  const deliveryFee = isFreeDelivery ? 0 : 5000;
  const totalPrice = product.price + deliveryFee;

  const cities = isKu
    ? ['سلێمانی', 'هەولێر', 'دهۆک', 'هەڵەبجە', 'زاخۆ', 'کۆیە', 'کەلار', 'پێنجوێن', 'هەورامان']
    : language === 'ar'
    ? ['السليمانية', 'أربيل', 'دهوك', 'حلبجة', 'زاخو', 'كوية', 'كلار', 'بنجوين', 'هورامان']
    : ['Sulaymaniyah', 'Erbil', 'Duhok', 'Halabja', 'Zakho', 'Koya', 'Kalar', 'Penjwen', 'Hawraman'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!customerName.trim() || !customerPhone.trim() || !customerAddress.trim()) {
      setErrorMessage(
        isKu
          ? 'تکایە سەرجەم خانە پێویستەکان پڕبکەرەوە (ناو، ژمارەی تەلەفۆن، ناونیشان)'
          : language === 'ar'
          ? 'يرجى ملء جميع الحقول المطلوبة (الاسم، الهاتف، العنوان)'
          : 'Please fill in all required fields (Name, Phone, Address)'
      );
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: product.id,
          product_name: product.name,
          product_price: product.price,
          customer_name: customerName,
          customer_phone: customerPhone,
          customer_city: customerCity,
          customer_address: customerAddress,
          delivery_fee: deliveryFee,
          total_amount: totalPrice,
          payment_method: paymentMethod,
          order_notes: orderNotes,
          seller_id: product.seller_id,
          seller_name: product.seller_name,
          seller_phone: product.seller_phone,
          seller_whatsapp: product.seller_whatsapp,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to submit order');
      }

      const orderData = await res.json();
      setConfirmedOrder(orderData);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error creating order');
    } finally {
      setIsSubmitting(false);
    }
  };

  // WhatsApp Pre-filled link
  const sellerWhatsappNumber = (product.seller_whatsapp || product.seller_phone || '+9647701234567').replace(/[^0-9]/g, '');
  const whatsappMessage = confirmedOrder
    ? isKu
      ? `سڵاو، داواکاری نوێم لە بازاڕی گەورە تۆمارکرد:
کۆدی داواکاری: ${confirmedOrder.id}
بەرهەم: ${product.name}
بڕی گشتی: ${totalPrice.toLocaleString()} دینار
ناوی کڕیار: ${customerName}
ژمارەی مۆبایل: ${customerPhone}
شار و ناونیشان: ${customerCity} - ${customerAddress}
شێوازی پارەدان: ${paymentMethod === 'cash_on_delivery' ? 'کاش لە کاتی وەرگرتن' : 'پارەدانی ئەلیکترۆنی'}`
      : `مرحباً، قمت بتسجيل طلب جديد عبر بازاري گەورە:
رمز الطلب: ${confirmedOrder.id}
المنتج: ${product.name}
المبلغ الإجمالي: ${totalPrice.toLocaleString()} دينار
اسم العميل: ${customerName}
رقم الهاتف: ${customerPhone}
العنوان: ${customerCity} - ${customerAddress}`
    : '';

  const whatsappHref = `https://wa.me/${sellerWhatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-xl bg-white rounded-3xl border border-[#EAE7DF] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EAE7DF] bg-[#FAF9F6]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FFF5DD] text-[#8C5E00] flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-extrabold text-neutral-900 text-base leading-tight">
                {confirmedOrder
                  ? isKu
                    ? 'داواکارییەکەت تۆمارکرا'
                    : language === 'ar'
                    ? 'تم تسجيل طلبك'
                    : 'Order Confirmed'
                  : isKu
                  ? 'کڕینی دەستبەجێ (داواکردنی کاڵا)'
                  : language === 'ar'
                  ? 'الشراء المباشر (طلب المنتج)'
                  : 'Fast Direct Order'}
              </h2>
              <span className="text-[11px] text-[#657A52] font-semibold">
                {isKu ? 'پارەدان لە کاتی وەرگرتن • بێ پێشەکی' : 'Cash on Delivery • No upfront payment'}
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

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {confirmedOrder ? (
            /* STEP 2: ORDER SUCCESS CONFIRMATION */
            <div className="text-center py-4 space-y-5 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h3 className="text-xl font-black text-neutral-900 mb-1">
                  {isKu
                    ? 'سوپاس! داواکارییەکەت بە سەرکەوتوویی نێردرا'
                    : language === 'ar'
                    ? 'شكراً لك! تم استلام طلبك بنجاح'
                    : 'Thank you! Order Placed Successfully'}
                </h3>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                  {isKu
                    ? 'فرۆشیار لە کەمترین ماوەدا پەیوەندیت پێوە دەکات بۆ ئاگادارکردنەوە لە کاتی گەیاندنی کاڵاکەت.'
                    : language === 'ar'
                    ? 'سيتواصل معك البائع قريباً لتأكيد موعد التوصيل.'
                    : 'The seller will contact you shortly to coordinate your delivery window.'}
                </p>
              </div>

              {/* Order Reference Box */}
              <div className="bg-[#FAF9F6] border border-[#EAE7DF] rounded-2xl p-4 text-start space-y-2.5 max-w-md mx-auto">
                <div className="flex justify-between items-center pb-2 border-b border-[#EAE7DF]">
                  <span className="text-xs text-neutral-500 font-medium">
                    {isKu ? 'کۆدی داواکاری:' : 'Order ID:'}
                  </span>
                  <span className="text-sm font-black text-[#8C5E00] tracking-wide">
                    {confirmedOrder.id}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-neutral-500">{isKu ? 'بەرهەم:' : 'Product:'}</span>
                  <span className="font-bold text-neutral-800 truncate max-w-[220px]">
                    {product.name}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-neutral-500">{isKu ? 'بڕی گشتی:' : 'Total Amount:'}</span>
                  <span className="font-black text-neutral-900 text-sm">
                    {totalPrice.toLocaleString()} IQD
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-neutral-500">{isKu ? 'شوێنی گەیاندن:' : 'Destination:'}</span>
                  <span className="font-medium text-neutral-700">
                    {customerCity} - {customerAddress}
                  </span>
                </div>
              </div>

              {/* Actions: Send WhatsApp & Finish */}
              <div className="space-y-2.5 pt-2 max-w-md mx-auto">
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>
                    {isKu
                      ? 'پشتڕاستکردنەوە لە WhatsApp لەگەڵ فرۆشیار'
                      : language === 'ar'
                      ? 'تأكيد الطلب عبر واتساب مع البائع'
                      : 'Confirm via WhatsApp with Merchant'}
                  </span>
                </a>

                <button
                  onClick={onClose}
                  className="w-full py-2.5 px-4 rounded-xl border border-[#EAE7DF] bg-white hover:bg-neutral-50 text-neutral-700 font-bold text-xs transition-colors"
                >
                  {isKu ? 'گەڕانەوە بۆ بازاڕ' : language === 'ar' ? 'العودة للتسوق' : 'Continue Shopping'}
                </button>
              </div>
            </div>
          ) : (
            /* STEP 1: ORDER FORM */
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Product Mini Strip */}
              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-[#FAF9F6] border border-[#EAE7DF]">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-16 h-16 rounded-xl object-cover border border-[#EAE7DF] shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-xs text-neutral-900 truncate">{product.name}</h4>
                  <div className="text-[11px] text-neutral-500 mt-0.5">{product.seller_name}</div>
                  <div className="text-sm font-black text-neutral-950 mt-1">
                    {product.price.toLocaleString()} <span className="text-xs font-bold text-[#8C5E00]">IQD</span>
                  </div>
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Customer Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    <User className="w-3.5 h-3.5 inline me-1 text-neutral-400" />
                    {isKu ? 'ناوی تەواو' : language === 'ar' ? 'الاسم الكامل' : 'Full Name'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder={isKu ? 'ناوی کڕیار بنووسە' : 'Full Name'}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE7DF] text-xs focus:outline-none focus:border-[#F4B942] bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    <Phone className="w-3.5 h-3.5 inline me-1 text-neutral-400" />
                    {isKu ? 'ژمارەی مۆبایل' : language === 'ar' ? 'رقم الهاتف' : 'Phone Number'} *
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="0770 123 4567"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE7DF] text-xs focus:outline-none focus:border-[#F4B942] bg-white ltr:text-left rtl:text-right"
                  />
                </div>
              </div>

              {/* City & Address */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    <MapPin className="w-3.5 h-3.5 inline me-1 text-neutral-400" />
                    {isKu ? 'شار' : language === 'ar' ? 'المدينة' : 'City'} *
                  </label>
                  <select
                    value={customerCity}
                    onChange={(e) => setCustomerCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE7DF] text-xs focus:outline-none focus:border-[#F4B942] bg-white"
                  >
                    {cities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    {isKu ? 'ناونیشانی تەواو (گەڕەک، کۆڵان، شوێنی ناسراو)' : 'Full Address (Neighborhood, Street)'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    placeholder={isKu ? 'نموونە: گەڕەکی بەختیاری، نزیک بازاڕ...' : 'e.g. Ashti, near public park'}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE7DF] text-xs focus:outline-none focus:border-[#F4B942] bg-white"
                  />
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                  <Banknote className="w-3.5 h-3.5 inline me-1 text-neutral-400" />
                  {isKu ? 'شێوازی پارەدان' : language === 'ar' ? 'طريقة الدفع' : 'Payment Method'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <label
                    onClick={() => setPaymentMethod('cash_on_delivery')}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      paymentMethod === 'cash_on_delivery'
                        ? 'bg-[#FFFDF7] border-[#F4B942] ring-1 ring-[#F4B942]'
                        : 'bg-white border-[#EAE7DF]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={paymentMethod === 'cash_on_delivery'}
                        onChange={() => setPaymentMethod('cash_on_delivery')}
                        className="text-[#8C5E00]"
                      />
                      <span className="text-xs font-bold text-neutral-900">
                        {isKu ? 'کاش لە کاتی وەرگرتن' : 'Cash on Delivery'}
                      </span>
                    </div>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md">
                      {isKu ? 'باوترین' : 'Popular'}
                    </span>
                  </label>

                  <label
                    onClick={() => setPaymentMethod('electronic')}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      paymentMethod === 'electronic'
                        ? 'bg-[#FFFDF7] border-[#F4B942] ring-1 ring-[#F4B942]'
                        : 'bg-white border-[#EAE7DF]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={paymentMethod === 'electronic'}
                        onChange={() => setPaymentMethod('electronic')}
                        className="text-[#8C5E00]"
                      />
                      <span className="text-xs font-bold text-neutral-900">
                        {isKu ? 'FastPay / FIB' : 'FastPay / FIB'}
                      </span>
                    </div>
                    <span className="text-[10px] text-neutral-400 font-medium">
                      {isKu ? 'مۆبایل' : 'Mobile'}
                    </span>
                  </label>
                </div>
              </div>

              {/* Order Notes */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  {isKu ? 'تێبینی تایبەت بۆ گەیاندن (ئارەزوومەندانە)' : 'Delivery Notes (Optional)'}
                </label>
                <input
                  type="text"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder={isKu ? 'نموونە: تەنها دوای نیوەڕۆ بگەیەنرێت' : 'e.g. Please deliver after 4 PM'}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#EAE7DF] text-xs focus:outline-none focus:border-[#F4B942] bg-white"
                />
              </div>

              {/* Price Calculation Summary */}
              <div className="p-3.5 rounded-2xl bg-[#FAF9F6] border border-[#EAE7DF] space-y-1.5 text-xs">
                <div className="flex justify-between text-neutral-500">
                  <span>{isKu ? 'نرخی بەرهەم:' : 'Item Subtotal:'}</span>
                  <span className="font-semibold text-neutral-800">{product.price.toLocaleString()} IQD</span>
                </div>
                <div className="flex justify-between text-neutral-500">
                  <span>{isKu ? 'تێچووی گەیاندن:' : 'Delivery Fee:'}</span>
                  <span className="font-semibold text-neutral-800">
                    {deliveryFee === 0
                      ? isKu
                        ? 'بێبەرامبەر (Free)'
                        : 'Free'
                      : `${deliveryFee.toLocaleString()} IQD`}
                  </span>
                </div>
                <div className="pt-2 border-t border-[#EAE7DF] flex justify-between text-sm font-black text-neutral-900">
                  <span>{isKu ? 'کۆی گشتی بۆ پارەدان:' : 'Total due:'}</span>
                  <span className="text-[#8C5E00] text-base">{totalPrice.toLocaleString()} IQD</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 rounded-xl bg-[#F4B942] hover:bg-[#E2A732] text-neutral-950 font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{isKu ? 'تۆمارکردنی داواکاری...' : 'Submitting Order...'}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-800" />
                    <span>
                      {isKu
                        ? 'تەواوکردنی داواکاری (کاش لەکاتی وەرگرتن)'
                        : language === 'ar'
                        ? 'إتمام الطلب (الدفع عند الاستلام)'
                        : 'Confirm Order (Cash on Delivery)'}
                    </span>
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
