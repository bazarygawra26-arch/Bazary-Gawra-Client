'use client';

import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import {
  X,
  ShieldAlert,
  CreditCard,
  QrCode,
  Smartphone,
  CheckCircle2,
  Sparkles,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Building2,
} from 'lucide-react';

interface DemoCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  priceIqd: number;
  billingTerm?: string;
  type: 'subscription' | 'promotion';
  metadata?: Record<string, any>;
  onConfirmSuccess: (paymentMethod: string) => Promise<void>;
}

export const DemoCheckoutModal: React.FC<DemoCheckoutModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  priceIqd,
  billingTerm = '7 ڕۆژ',
  type,
  metadata,
  onConfirmSuccess,
}) => {
  const { language, isKu } = useLanguage();
  const isAr = language === 'ar';

  const [selectedMethod, setSelectedMethod] = useState<'fib' | 'fastpay' | 'zaincash'>('fib');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      await onConfirmSuccess(selectedMethod);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1800);
    } catch (err) {
      console.error('Checkout error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl border border-[#EAE7DF] shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 text-start animate-scaleUp">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#EAE7DF]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-[#FFF5DD] text-[#8C5E00] border border-[#F4B942]/50">
                {isKu ? 'دەروازەی پارەدان (تاقیکاری)' : isAr ? 'بوابة الدفع (تجريبية)' : 'Payment Checkout (Demo)'}
              </span>
              <span className="text-xs font-bold text-neutral-400">Bazary Gawra</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-neutral-900 mt-1">
              {title}
            </h3>
            <p className="text-xs text-neutral-500">{subtitle}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-900 p-1.5 rounded-xl hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Honest Disclosure Banner (Hackathon Criteria Requirement) */}
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-black text-amber-900">
              {isKu
                ? 'تاقیکاری داوەران — هیچ پارەیەکی ڕاستەقینە نابڕدرێت'
                : isAr
                ? 'معاينة تجريبية للتحكيم — لا يتم خصم أموال حقيقية'
                : 'Judges Demo Checkout — No Real Money Charged'}
            </div>
            <p className="text-[11px] leading-relaxed text-neutral-700">
              {isKu
                ? 'ئەم لاپەڕەیە مۆدێلی دروستکردنی داهاتی بازاڕی گەورە ڕووندەکاتەوە. ئەندازیاری سیستمەکە ئامادەیە بۆ بەستنەوە بە دەروازە ناوخۆییەکانی عێراق و هەرێمی کوردستان وەک FIB و FastPay و ZainCash.'
                : isAr
                ? 'توضح هذه الصفحة نموذج تحقيق الإيرادات لبازاري گەورە. تم تصميم الهيكلية لتكون جاهزة للربط مع بوابات الدفع في العراق مثل FIB و FastPay و ZainCash.'
                : 'This demonstrates the revenue model for Bazary Gawra. The architecture is structured for plug-and-play local Iraq gateways (FIB, FastPay, ZainCash) with server-side webhook verification.'}
            </p>
          </div>
        </div>

        {/* Order Summary Box */}
        <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#EAE7DF] space-y-2.5">
          <div className="flex items-center justify-between text-xs text-neutral-600">
            <span>{isKu ? 'خزمەتگوزاری:' : isAr ? 'الخدمة:' : 'Item:'}</span>
            <span className="font-bold text-neutral-900">{title}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-neutral-600">
            <span>{isKu ? 'ماوە / خول:' : isAr ? 'المدة:' : 'Duration / Term:'}</span>
            <span className="font-bold text-neutral-900">{billingTerm}</span>
          </div>
          <div className="pt-2 border-t border-[#EAE7DF] flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-800">
              {isKu ? 'بڕی پارە بە دیناری عێراقی:' : isAr ? 'المبلغ الإجمالي:' : 'Total Amount (IQD):'}
            </span>
            <div className="text-xl font-black text-neutral-950">
              {priceIqd.toLocaleString()} <span className="text-xs text-[#8C5E00]">IQD</span>
            </div>
          </div>
        </div>

        {/* Payment Gateway Options (Preview Architecture) */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-neutral-700 block">
            {isKu ? 'دەروازەی پارەدانی ناوخۆیی هەڵبژێرە:' : isAr ? 'اختر بوابة الدفع المحلية:' : 'Select Local Payment Gateway:'}
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <button
              type="button"
              onClick={() => setSelectedMethod('fib')}
              className={`p-3 rounded-2xl border text-start transition-all cursor-pointer ${
                selectedMethod === 'fib'
                  ? 'border-[#F4B942] bg-[#FFF5DD] shadow-2xs font-bold text-neutral-950 ring-2 ring-[#F4B942]/40'
                  : 'border-[#EAE7DF] bg-white text-neutral-700 hover:bg-[#FAF9F6]'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold mb-1">
                <Building2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span className="text-xs font-black">FIB Bank</span>
              </div>
              <p className="text-[10px] text-neutral-500 leading-tight">
                {isKu ? 'بانکی یەکەمی عێراق' : 'First Iraqi Bank'}
              </p>
            </button>

            <button
              type="button"
              onClick={() => setSelectedMethod('fastpay')}
              className={`p-3 rounded-2xl border text-start transition-all cursor-pointer ${
                selectedMethod === 'fastpay'
                  ? 'border-[#F4B942] bg-[#FFF5DD] shadow-2xs font-bold text-neutral-950 ring-2 ring-[#F4B942]/40'
                  : 'border-[#EAE7DF] bg-white text-neutral-700 hover:bg-[#FAF9F6]'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold mb-1">
                <Smartphone className="w-4 h-4 text-[#657A52] shrink-0" />
                <span className="text-xs font-black">FastPay</span>
              </div>
              <p className="text-[10px] text-neutral-500 leading-tight">
                {isKu ? 'فاستپەی (کوردستان)' : 'Kurdistan Wallet'}
              </p>
            </button>

            <button
              type="button"
              onClick={() => setSelectedMethod('zaincash')}
              className={`p-3 rounded-2xl border text-start transition-all cursor-pointer ${
                selectedMethod === 'zaincash'
                  ? 'border-[#F4B942] bg-[#FFF5DD] shadow-2xs font-bold text-neutral-950 ring-2 ring-[#F4B942]/40'
                  : 'border-[#EAE7DF] bg-white text-neutral-700 hover:bg-[#FAF9F6]'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold mb-1">
                <CreditCard className="w-4 h-4 text-purple-700 shrink-0" />
                <span className="text-xs font-black">ZainCash</span>
              </div>
              <p className="text-[10px] text-neutral-500 leading-tight">
                {isKu ? 'زین کاش عێراق' : 'ZainCash Iraq'}
              </p>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#EAE7DF]">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2.5 rounded-xl border border-[#EAE7DF] hover:bg-neutral-100 text-neutral-700 text-xs font-bold transition-colors cursor-pointer"
          >
            {isKu ? 'پەشیمانبوونەوە' : isAr ? 'إلغاء' : 'Cancel'}
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={isProcessing}
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#F4B942] hover:bg-[#E2A732] active:scale-95 text-neutral-950 text-xs sm:text-sm font-black shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{isKu ? 'خەریکی پشتڕاستکردنەوەیە...' : 'Processing...'}</span>
              </>
            ) : isSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-800" />
                <span>{isKu ? 'بە سەرکەوتوویی تۆمارکرا!' : 'Demo Activated!'}</span>
              </>
            ) : (
              <>
                <span>
                  {isKu
                    ? `پشتڕاستکردنەوە (${priceIqd.toLocaleString()} IQD)`
                    : isAr
                    ? `تأكيد المعاينة (${priceIqd.toLocaleString()} IQD)`
                    : `Confirm Demo (${priceIqd.toLocaleString()} IQD)`}
                </span>
                <Sparkles className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
