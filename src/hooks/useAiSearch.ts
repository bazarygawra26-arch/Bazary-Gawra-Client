'use client';

import { useState } from 'react';
import { apiClient } from '../lib/api-client';
import { AISearchInterpretation, Product } from '../types';

export function useAiSearch() {
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<Product[]>([]);
  const [interpretation, setInterpretation] = useState<AISearchInterpretation | null>(null);

  const search = async (query: string, language: string = 'ku') => {
    if (!query.trim()) return;
    setIsSearching(true);
    setError(null);

    try {
      const data = await apiClient.aiSearch(query, language);
      setInterpretation(data.interpretation);
      setResults(data.products);
      return data;
    } catch (err: any) {
      setError(err.message || 'AI Search request failed');
    } finally {
      setIsSearching(false);
    }
  };

  const clear = () => {
    setResults([]);
    setInterpretation(null);
    setError(null);
  };

  return {
    isSearching,
    error,
    results,
    interpretation,
    search,
    clear,
  };
}
