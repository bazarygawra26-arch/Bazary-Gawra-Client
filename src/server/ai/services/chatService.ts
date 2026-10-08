import 'server-only';
import { generateJson } from '../gemini';
import { buildChatPrompt } from '../prompts/chat';
import { findProductById } from '../../db/repositories/products';
import { logChatInteraction } from '../../db/repositories/aiLogs';

export async function processProductChat(
  productId: string,
  question: string,
  language: string = 'ku'
): Promise<{ answer: string; isInformationGap: boolean; verifiedAttributes?: string[] }> {
  const startTime = Date.now();
  const product = await findProductById(productId, language === 'ar' ? 'ar' : language === 'en' ? 'en' : 'ku');
  if (!product) {
    return {
      answer: 'Product not found.',
      isInformationGap: false,
    };
  }

  const prompt = buildChatPrompt(product, question, language);
  let result = await generateJson<{
    answer: string;
    isInformationGap: boolean;
    verifiedAttributes?: string[];
  }>(prompt);

  if (!result) {
    // Fallback programmatic audit answer
    const lower = question.toLowerCase();
    const isWarranty = lower.includes('warranty') || question.includes('گەرەنتی') || question.includes('ضمان');
    const isDelivery = lower.includes('delivery') || question.includes('گەیاندن') || question.includes('توصيل');
    const isUsage =
      lower.includes('used for') ||
      lower.includes('use') ||
      lower.includes('what is') ||
      lower.includes('how to') ||
      question.includes('بەکاردێت') ||
      question.includes('چۆن') ||
      question.includes('یستخدم') ||
      question.includes('كيف');

    if (isWarranty) {
      result = {
        answer: product.warranty
          ? `Stated warranty: "${product.warranty}".`
          : 'Information Gap: The seller has not provided warranty terms for this listing.',
        isInformationGap: !product.warranty,
      };
    } else if (isDelivery) {
      result = {
        answer: product.delivery_info
          ? `Delivery details: "${product.delivery_info}".`
          : 'Information Gap: Seller delivery terms are unverified.',
        isInformationGap: !product.delivery_info,
      };
    } else if (isUsage) {
      const isKu = language === 'ku' || language === 'ckb';
      const isAr = language === 'ar';
      let usageText = '';

      if (isKu) {
        usageText = `بەرهەمی "${product.name}" لە پۆلی (${product.category}) بەکاردێت بۆ پێداویستی ڕۆژانەی ماڵ و کارئاسانی. ${
          product.description ? `وەسفی فرۆشیار: "${product.description}". ` : ''
        }تێبینی: فرۆشیار هەموو وردەکارییە دەستییەکانی بۆ ئەم لیستە دیاری نەکردووە، بەڵام ئەم جۆرە بەرهەمانە بە گشتی بەپێی تایبەتمەندی (${product.capacity || product.power || 'ستاندارد'}) بەکاردێن.`;
      } else if (isAr) {
        usageText = `يُستخدم منتج "${product.name}" ضمن فئة (${product.category}) للأغراض المنزلية والاستخدام اليومي. ${
          product.description ? `وصف البائع: "${product.description}". ` : ''
        }ملاحظة: البائع لم يذكر تفاصيل الاستخدام الكاملة في الإعلان، لكن هذا النوع من المنتجات يُستخدم عادة وفق مواصفات (${product.capacity || product.power || 'القياسية'}).`;
      } else {
        usageText = `The product "${product.name}" in category (${product.category}) is generally used for everyday household and preparation tasks. ${
          product.description ? `Seller description: "${product.description}". ` : ''
        }Note: While the seller has not detailed all specific use-cases in this listing, this category of device typically functions based on its specifications (${product.capacity || product.power || 'standard'}).`;
      }

      result = {
        answer: usageText,
        isInformationGap: false,
        verifiedAttributes: [product.category, product.location],
      };
    } else {
      result = {
        answer: `Listing details: ${product.name} from ${product.seller_name} in ${product.location} (${product.price} ${product.currency}).`,
        isInformationGap: false,
      };
    }
  }

  const latencyMs = Date.now() - startTime;

  // Persist conversation to Supabase ai_requests, ai_chat_sessions, and ai_chat_messages for future model training
  await logChatInteraction({
    productId: product.id,
    question,
    answer: result.answer,
    isInformationGap: result.isInformationGap,
    verifiedAttributes: result.verifiedAttributes,
    language,
    latency_ms: latencyMs,
  });

  return result;
}
