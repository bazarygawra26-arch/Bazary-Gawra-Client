'use client';

import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Sparkles, FileSearch, ShieldCheck, MapPin, Zap, Eye } from 'lucide-react';

export const WhyBazaryGawra: React.FC = () => {
  const { t } = useLanguage();

  const pillars = [
    {
      icon: <Sparkles className="w-6 h-6 text-neutral-950" />,
      title: 'Conversational Kurdish AI',
      desc: 'Type naturally in Kurdish Sorani, Arabic, or English. Bazary Gawra extracts product types, city locations, and price limits effortlessly.',
      badge: 'Multilingual NLP',
    },
    {
      icon: <FileSearch className="w-6 h-6 text-neutral-950" />,
      title: 'Information Gap Analysis',
      desc: 'We highlight what vendors state and what is omitted — missing warranties, return policies, or specifications are flagged clearly.',
      badge: 'Transparency',
    },
    {
      icon: <MapPin className="w-6 h-6 text-neutral-950" />,
      title: 'Hyper-Local Kurdistan Focus',
      desc: 'Accurate IQD pricing and neighborhood inventory across Sulaymaniyah (Salim St, Mawlawi), Erbil (Gulan, Ankawa), and Duhok.',
      badge: 'Regional Stores',
    },
    {
      icon: <Eye className="w-6 h-6 text-neutral-950" />,
      title: 'Unbiased Comparisons',
      desc: 'No fake reviews or inflated 5-star ratings. Products are compared based on verifiable technical specs and seller commitments.',
      badge: 'Zero Fake Reviews',
    },
  ];

  return (
    <section className="py-16 bg-[#FAF9F6] border-b border-[#EAE7DF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F2F5EF] text-[#657A52] text-xs font-bold mb-3">
            <Zap className="w-3.5 h-3.5" />
            <span>The Bazary Gawra Standard</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">
            {t('whyBazaryGawraTitle')}
          </h2>
          <p className="text-neutral-600 mt-2 text-sm sm:text-base">
            Making local product discovery simpler, clearer, and more informed with artificial intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-[#EAE7DF] p-6 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#F4B942] flex items-center justify-center shadow-2xs">
                    {item.icon}
                  </div>
                  <span className="text-[11px] font-bold text-[#657A52] bg-[#F2F5EF] px-2.5 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                </div>
                <h3 className="font-extrabold text-neutral-900 text-base mb-2">
                  {item.title}
                </h3>
                <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
