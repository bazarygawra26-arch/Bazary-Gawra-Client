'use client';

import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useProductChat } from '../../hooks/useProductChat';
import { Sparkles, Send, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Product } from '../../types';

interface AIAssistantProps {
  product: Product;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ product }) => {
  const { language, t } = useLanguage();
  const [input, setInput] = useState('');
  const { messages, isLoading, ask } = useProductChat(product.id);

  const sampleQuestions = [
    {
      en: 'What is the exact warranty on this item?',
      ckb: 'ئەم ئامێرە گەرەنتییەکەی چۆنە؟',
      ar: 'ما هو الضمان الدقيق لهذا الجهاز؟',
    },
    {
      en: 'Can this be delivered same-day to Sulaymaniyah?',
      ckb: 'ئایا ئەمڕۆ دەگات لە سلێمانی؟',
      ar: 'هل يمكن التوصيل بنفس اليوم في السليمانية؟',
    },
    {
      en: 'What is the power wattage and capacity?',
      ckb: 'توانای کارەبا و قەبارەکەی چەندە؟',
      ar: 'ما هي قدرة الواط والسعة؟',
    },
  ];

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    ask(text, language);
    setInput('');
  };

  return (
    <div className="rounded-2xl border border-[#F4B942]/60 bg-gradient-to-br from-[#FFFBF0] to-white p-5 shadow-sm text-start">
      <div className="flex items-center justify-between pb-3 border-b border-[#EAE7DF] mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#F4B942] flex items-center justify-center text-neutral-900 shadow-2xs">
            <Sparkles className="w-4 h-4 fill-neutral-900" />
          </div>
          <div>
            <h4 className="font-extrabold text-neutral-900 text-sm">{t('askAiAboutProduct')}</h4>
            <p className="text-[11px] text-neutral-500">
              Verifies answers against seller disclosures
            </p>
          </div>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFF5DD] text-[#8C5E00]">
          Verified Answers Only
        </span>
      </div>

      {/* Suggested quick chips */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {sampleQuestions.map((sq, idx) => {
          const qText = language === 'ckb' ? sq.ckb : language === 'ar' ? sq.ar : sq.en;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(qText)}
              className="text-xs px-2.5 py-1 rounded-lg bg-white border border-[#EAE7DF] text-neutral-700 hover:text-neutral-950 hover:border-[#F4B942] hover:bg-[#FFF5DD]/50 transition-colors"
            >
              &ldquo;{qText}&rdquo;
            </button>
          );
        })}
      </div>

      {/* Chat Messages */}
      <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-3 rounded-xl text-xs ${
              msg.sender === 'user'
                ? 'bg-white border border-[#EAE7DF] text-neutral-900 ms-8'
                : msg.isInformationGap
                ? 'bg-amber-50/80 border border-amber-200 text-amber-900 me-8'
                : 'bg-[#F2F5EF] border border-[#E2E8DC] text-neutral-800 me-8'
            }`}
          >
            <div className="font-bold mb-1 flex items-center gap-1.5 text-[11px]">
              {msg.sender === 'user' ? (
                <span>You</span>
              ) : msg.isInformationGap ? (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span className="text-amber-800 font-bold">Information Gap Detected</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#657A52]" />
                  <span className="text-[#657A52] font-bold">Bazary Gawra AI</span>
                </>
              )}
            </div>
            <p className="leading-relaxed">{msg.text}</p>
          </div>
        ))}
      </div>

      {/* Input box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(input);
        }}
        className="flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('askAiPlaceholder')}
          className="flex-1 rounded-xl bg-white border border-[#EAE7DF] px-3.5 py-2 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#F4B942]"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="px-4 py-2 rounded-xl bg-[#F4B942] hover:bg-[#E2A732] text-neutral-950 font-bold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
        >
          {isLoading ? (
            <div className="w-3.5 h-3.5 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-3.5 h-3.5" />
          )}
          <span>{t('askAiBtn')}</span>
        </button>
      </form>
    </div>
  );
};
