'use client';

import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useProductChat } from '../../hooks/useProductChat';
import { Sparkles, Send, AlertTriangle, CheckCircle2, ThumbsUp, ThumbsDown, Loader2 } from 'lucide-react';
import { Product } from '../../types';

interface AIAssistantProps {
  product: Product;
  onClose?: () => void;
  isDrawer?: boolean;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ product, onClose, isDrawer = false }) => {
  const { language, t } = useLanguage();
  const [input, setInput] = useState('');
  const [feedbackGiven, setFeedbackGiven] = useState<Record<number, boolean>>({});
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

  const handleFeedback = async (msgIndex: number, helpful: boolean) => {
    setFeedbackGiven((prev) => ({ ...prev, [msgIndex]: true }));
    try {
      await fetch('/api/ai/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request_id: `product-chat-${product.id}-${msgIndex}`,
          helpful,
        }),
      });
    } catch (e) {
      // quiet fallback
    }
  };

  return (
    <div
      className={`rounded-2xl border border-[#F4B942]/60 bg-gradient-to-br from-[#FFFBF0] to-white p-5 shadow-sm text-start flex flex-col ${
        isDrawer ? 'h-full max-h-[85vh]' : ''
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#EAE7DF] mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#F4B942] flex items-center justify-center text-neutral-900 shadow-2xs">
            <Sparkles className="w-4 h-4 fill-neutral-900" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-extrabold text-neutral-900 text-sm">
                {t('askAiAboutProduct')}
              </h4>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-[#F4B942] text-neutral-950">
                AI
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              {language === 'ku'
                ? 'وەڵامدانەوە بەپێی بەڵگەنامە و زانیاری ڕاستەقینەی فرۆشگا'
                : 'Verifies answers against seller disclosures'}
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-900 p-1.5 rounded-lg text-xs font-bold"
          >
            ✕
          </button>
        )}
      </div>

      {/* Suggested quick chips */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {sampleQuestions.map((sq, idx) => {
          const qText = language === 'ckb' || language === 'ku' ? sq.ckb : language === 'ar' ? sq.ar : sq.en;
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
      <div className={`space-y-3 mb-4 overflow-y-auto ${isDrawer ? 'flex-1 min-h-[220px]' : 'max-h-72'}`}>
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-3.5 rounded-2xl text-xs space-y-1.5 ${
              msg.sender === 'user'
                ? 'bg-white border border-[#EAE7DF] text-neutral-900 ms-8'
                : msg.isInformationGap
                ? 'bg-amber-50/90 border border-amber-200 text-amber-900 me-6'
                : 'bg-[#F2F5EF] border border-[#E2E8DC] text-neutral-800 me-6'
            }`}
          >
            <div className="font-bold flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5">
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

              {msg.sender !== 'user' && (
                <span className="text-[10px] text-neutral-400 font-normal italic">
                  Based on the available information
                </span>
              )}
            </div>

            <p className="leading-relaxed">{msg.text}</p>

            {/* Thumbs up/down feedback for AI responses */}
            {msg.sender !== 'user' && (
              <div className="pt-2 border-t border-black/5 flex items-center justify-between text-[11px] text-neutral-500">
                <span className="text-[10px] text-neutral-400">
                  {language === 'ku' ? 'ئەم وەڵامە بەسوود بوو؟' : 'Was this response helpful?'}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleFeedback(i, true)}
                    disabled={feedbackGiven[i]}
                    className={`p-1 rounded hover:bg-neutral-200/60 transition-colors ${
                      feedbackGiven[i] ? 'text-emerald-700' : 'text-neutral-500'
                    }`}
                    title="Helpful"
                  >
                    <ThumbsUp className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleFeedback(i, false)}
                    disabled={feedbackGiven[i]}
                    className={`p-1 rounded hover:bg-neutral-200/60 transition-colors ${
                      feedbackGiven[i] ? 'text-amber-700' : 'text-neutral-500'
                    }`}
                    title="Not helpful"
                  >
                    <ThumbsDown className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Skeleton loading when waiting for response */}
        {isLoading && (
          <div className="p-3.5 rounded-2xl bg-white border border-[#EAE7DF] text-xs space-y-2 me-6 animate-pulse">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#F4B942]" />
              <div className="h-3 w-24 bg-neutral-200 rounded" />
            </div>
            <div className="space-y-1.5">
              <div className="h-2.5 w-full bg-neutral-200 rounded" />
              <div className="h-2.5 w-4/5 bg-neutral-200 rounded" />
            </div>
            <div className="text-[10px] text-neutral-400 italic">
              Based on the available information...
            </div>
          </div>
        )}
      </div>

      {/* Input box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(input);
        }}
        className="flex items-center gap-2 mt-auto"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('askAiPlaceholder')}
          className="flex-1 rounded-xl bg-white border border-[#EAE7DF] px-3.5 py-2.5 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#F4B942]"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="px-4 py-2.5 rounded-xl bg-[#F4B942] hover:bg-[#E2A732] text-neutral-950 font-bold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50 shrink-0 shadow-2xs"
        >
          {isLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Send className="w-3.5 h-3.5" />
          )}
          <span>{t('askAiBtn')}</span>
        </button>
      </form>
    </div>
  );
};

export default AIAssistant;
