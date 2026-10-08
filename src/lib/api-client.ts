import { AISearchResponse } from './schemas/ai-search';
import { AICompareResponse } from './schemas/ai-compare';
import { AIProductChatResponse } from './schemas/ai-chat';
import { AIImageAnalyzeResponse } from './schemas/ai-image';
import { Product } from '../types';

export const apiClient = {
  async aiSearch(query: string, language: string = 'ku'): Promise<AISearchResponse> {
    const res = await fetch('/api/ai/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, language }),
    });
    if (!res.ok) {
      throw new Error(`AI Search failed: ${res.statusText}`);
    }
    return res.json();
  },

  async aiCompare(productIds: string[], language: string = 'ku'): Promise<AICompareResponse> {
    const res = await fetch('/api/ai/compare', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productIds, language }),
    });
    if (!res.ok) {
      throw new Error(`AI Compare failed: ${res.statusText}`);
    }
    return res.json();
  },

  async aiProductChat(
    productId: string,
    question: string,
    language: string = 'ku'
  ): Promise<AIProductChatResponse> {
    const res = await fetch('/api/ai/product-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, question, language }),
    });
    if (!res.ok) {
      throw new Error(`AI Product Chat failed: ${res.statusText}`);
    }
    return res.json();
  },

  async aiImageAnalyze(
    image: string,
    mimeType: string = 'image/jpeg',
    locale: string = 'ku'
  ): Promise<AIImageAnalyzeResponse> {
    const res = await fetch('/api/ai/image-analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image, mimeType, locale }),
    });
    if (!res.ok) {
      throw new Error(`AI Image Analyze failed: ${res.statusText}`);
    }
    return res.json();
  },

  async getProducts(params?: Record<string, string | number>): Promise<Product[]> {
    const query = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    const res = await fetch(`/api/products${query}`);
    if (!res.ok) {
      throw new Error(`Get products failed: ${res.statusText}`);
    }
    return res.json();
  },

  async getProductBySlug(slug: string): Promise<Product> {
    const res = await fetch(`/api/products/${slug}`);
    if (!res.ok) {
      throw new Error(`Get product failed: ${res.statusText}`);
    }
    return res.json();
  },
};
