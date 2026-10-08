'use client';

import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { CheckCircle2, AlertTriangle, Info, MapPin, ShieldCheck, Truck, RotateCcw, FileText } from 'lucide-react';
import { Product } from '../types';

interface TrustSignalsProps {
  product?: Product;
}

export const TrustSignals: React.FC<TrustSignalsProps> = ({ product }) => {
  const { t } = useLanguage();

  const signals = [
    {
      id: 'location',
      label: 'Seller location disclosed',
      status: Boolean(product ? product.seller_location : true),
      desc: product?.seller_location || 'Physical district in Sulaymaniyah / Erbil / Duhok',
      icon: <MapPin className="w-4 h-4" />,
    },
    {
      id: 'warranty',
      label: 'Warranty coverage stated',
      status: Boolean(product ? product.warranty && product.warranty !== 'Information unavailable' : true),
      desc: product?.warranty || 'Documented warranty terms provided by seller',
      icon: <ShieldCheck className="w-4 h-4" />,
    },
    {
      id: 'delivery',
      label: 'Delivery options specified',
      status: Boolean(product ? product.delivery_info : true),
      desc: product?.delivery_info || 'Clear regional shipping costs and timelines',
      icon: <Truck className="w-4 h-4" />,
    },
    {
      id: 'return_policy',
      label: 'Return policy provided',
      status: Boolean(product ? product.return_policy && product.return_policy !== 'Not provided' : true),
      desc: product?.return_policy || 'Explicit replacement or refund timeframe',
      icon: <RotateCcw className="w-4 h-4" />,
    },
    {
      id: 'specifications',
      label: 'Technical specifications provided',
      status: Boolean(product ? product.capacity || product.power : true),
      desc: 'Capacity, wattage, or dimensions clearly detailed',
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
              Neutral audit of data disclosed by the merchant
            </p>
          </div>
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded">
          Transparency Audit
        </span>
      </div>

      <p className="text-xs text-neutral-600 mb-4 leading-relaxed">
        Bazary Gawra does not endorse or certify sellers without physical inspection. Instead, we highlight available versus omitted information so you can make informed decisions.
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
