'use client';

import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Sparkles, FileSearch, Scale } from 'lucide-react';

export const WhyBazaryGawra: React.FC = () => {
  const { language } = useLanguage();

  const steps = [
    {
      num: '1',
      icon: <Sparkles className="w-5 h-5 text-neutral-950" />,
      title_en: 'Understands Kurdish Search',
      title_ku: 'تێگەیشتن لە گەڕانی کوردی',
      title_ar: 'فهم البحث الكردي والعربي',
      desc_en: 'Translates natural local queries into structured technical parameters without guessing.',
      desc_ku: 'پرسیار و داواکارییەکانت لە هەر شارێک بێت دەگۆڕێت بۆ تایبەتمەندی ڕوون و ورد.',
      desc_ar: 'تحويل الاستفسارات الطبيعية إلى معايير فنية منظمة ومحددة بدقة.',
    },
    {
      num: '2',
      icon: <FileSearch className="w-5 h-5 text-neutral-950" />,
      title_en: 'Audits Honest Disclosures',
      title_ku: 'پشکنینی شەفافیەتی زانیاری',
      title_ar: 'تدقيق الإفصاحات والضمان',
      desc_en: 'Flags missing warranties and delivery policies. Never hallucinates unprovided data.',
      desc_ku: 'ئاگادارت دەکاتەوە ئەگەر گەرەنتی یان گەیاندن نادیار بێت بەبێ هەڵبەستنی زانیاری.',
      desc_ar: 'تنبيهك في حال غياب معلومات الضمان أو التوصيل دون اختلاق أي بيانات غير متوفرة.',
    },
    {
      num: '3',
      icon: <Scale className="w-5 h-5 text-neutral-950" />,
      title_en: 'Objective Side-by-Side Comparison',
      title_ku: 'بەراوردکردنی ڕاستەقینە و بێلایەن',
      title_ar: 'مقارنة دقيقة ومحايدة',
      desc_en: 'Direct WhatsApp connection to local merchants in Sulaymaniyah, Erbil, and Duhok.',
      desc_ku: 'بەراوردی تایبەتمەندییەکان و پەیوەندی ڕاستەوخۆی واتسئەپ لەگەڵ فرۆشگاکان.',
      desc_ar: 'مقارنة جنب إلى جنب مع تواصل مباشر عبر واتساب مع المتاجر المحلية.',
    },
  ];

  return (
    <section className="py-14 bg-[#FAF9F6] border-b border-[#EAE7DF]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF5DD] text-[#8C5E00] text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#F4B942]" />
            <span>
              {language === 'ku' ? 'چۆن زیرەکی دەستکرد یارمەتیت دەدات؟' : 'How the AI Helps'}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
            {language === 'ku'
              ? 'سێ هەنگاو بۆ کڕینێکی دڵنیا و شەفاف'
              : 'Three Steps to Honest Local Discovery'}
          </h2>
        </div>

        {/* 3-Step Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step) => {
            const title =
              language === 'ku' ? step.title_ku : language === 'ar' ? step.title_ar : step.title_en;
            const desc =
              language === 'ku' ? step.desc_ku : language === 'ar' ? step.desc_ar : step.desc_en;

            return (
              <div
                key={step.num}
                className="bg-white rounded-2xl border border-[#EAE7DF] p-6 shadow-2xs hover:border-[#F4B942] transition-colors relative"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#F4B942] flex items-center justify-center font-black text-neutral-950 shadow-2xs">
                    {step.icon}
                  </div>
                  <span className="w-6 h-6 rounded-full bg-[#FAF9F6] border border-[#EAE7DF] text-xs font-black text-neutral-400 flex items-center justify-center">
                    {step.num}
                  </span>
                </div>

                <h3 className="text-base font-bold text-neutral-900 mb-2">{title}</h3>
                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">{desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyBazaryGawra;
