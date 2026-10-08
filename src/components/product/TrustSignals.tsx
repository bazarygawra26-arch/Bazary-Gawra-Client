'use client';

import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { CheckCircle2, AlertTriangle, Info, MapPin, ShieldCheck, Truck, RotateCcw, FileText } from 'lucide-react';
import { Product } from '../../types';
import { localizeProduct } from '../../lib/i18nData';

interface TrustSignalsProps {
  product?: Product;
}

export const TrustSignals: React.FC<TrustSignalsProps> = ({ product }) => {
  const { language, t } = useLanguage();
  const lp = product ? localizeProduct(product, language) : null;

  const signals = [
    {
      id: 'location',
      label: t('signalLocationLabel'),
      status: Boolean(lp ? lp.seller_location : true),
      desc: lp?.seller_location || t('signalLocationDesc'),
      icon: <MapPin className="w-4 h-4" />,
    },
    {
      id: 'warranty',
      label: t('signalWarrantyLabel'),
      status: Boolean(lp ? lp.warranty && lp.warranty !== 'Information unavailable' && !lp.warranty.includes('دیاری نەکراوە') && !lp.warranty.includes('غير محدد') : true),
      desc: lp?.warranty || t('signalWarrantyDesc'),
      icon: <ShieldCheck className="w-4 h-4" />,
    },
    {
      id: 'delivery',
      label: t('signalDeliveryLabel'),
      status: Boolean(lp ? lp.delivery_info && !lp.delivery_info.includes('دیاری نەکراوە') && !lp.delivery_info.includes('غير محدد') : true),
      desc: lp?.delivery_info || t('signalDeliveryDesc'),
      icon: <Truck className="w-4 h-4" />,
    },
    {
      id: 'return_policy',
      label: t('signalReturnLabel'),
      status: Boolean(lp ? lp.return_policy && lp.return_policy !== 'Not provided' && !lp.return_policy.includes('دیاری نەکراوە') && !lp.return_policy.includes('غير محدد') : true),
      desc: lp?.return_policy || t('signalReturnDesc'),
      icon: <RotateCcw className="w-4 h-4" />,
    },
    {
      id: 'specifications',
      label: t('signalSpecsLabel'),
      status: Boolean(lp ? lp.capacity || lp.power : true),
      desc: t('signalSpecsDesc'),
      icon: <FileText className="w-4 h-4" />,
    },
  ];

  return (
    <div className="rounded-2xl border border-[#EAE7DF] bg-white p-5 shadow-2xs">
      <div className="flex items-center justify-between gap-2 mb-3 pb-3 border-b border-[#EAE7DF]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#F2F5EF] text-[#657A52] flex items-center justify-center">
            <Info className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-neutral-900 text-sm">{t('trustTitle')}</h3>
            <p className="text-[11px] text-neutral-500">
              {t('trustAuditSubtitle')}
            </p>
          </div>
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded">
          {t('trustAuditBadge')}
        </span>
      </div>

      <p className="text-xs text-neutral-600 mb-4 leading-relaxed">
        {t('trustDisclaimer')}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {signals.map((sig) => (
          <div
            key={sig.id}
            className={`p-3 rounded-xl border text-xs transition-colors ${
              sig.status
                ? 'bg-[#F9FAF8] border-[#E2E8DC] text-neutral-800'
                : 'bg-amber-50/50 border-amber-200/80 text-amber-900'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              {sig.status ? (
                <CheckCircle2 className="w-4 h-4 text-[#657A52] shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              )}
              <span className="font-bold text-xs truncate">{sig.label}</span>
            </div>
            <p className="text-[11px] text-neutral-500 ps-6 truncate">{sig.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
