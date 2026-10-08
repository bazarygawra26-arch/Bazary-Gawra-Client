'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../types';

interface ComparisonContextType {
  comparedProducts: Product[];
  addToCompare: (product: Product) => void;
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;
  isCompared: (productId: string) => boolean;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  sessionKey: string;
}

const ComparisonContext = createContext<ComparisonContextType>({
  comparedProducts: [],
  addToCompare: () => {},
  removeFromCompare: () => {},
  clearCompare: () => {},
  isCompared: () => false,
  isDrawerOpen: false,
  setIsDrawerOpen: () => {},
  sessionKey: '',
});

export const ComparisonProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [comparedProducts, setComparedProducts] = useState<Product[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [sessionKey, setSessionKey] = useState<string>('');

  // 1. Initialize session_key and restore compare items from localStorage
  useEffect(() => {
    try {
      // Session key
      let key = localStorage.getItem('bazary_session_key');
      if (!key) {
        key = `bg_session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        localStorage.setItem('bazary_session_key', key);
      }
      setSessionKey(key);

      // Restore saved products
      const saved = localStorage.getItem('bazary_compare_products');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setComparedProducts(parsed);
        }
      }
    } catch (e) {
      // quiet fallback
    }
  }, []);

  // 2. Persist compare items to localStorage whenever changed
  useEffect(() => {
    try {
      localStorage.setItem('bazary_compare_products', JSON.stringify(comparedProducts));
    } catch (e) {
      // quiet fallback
    }
  }, [comparedProducts]);

  const addToCompare = (product: Product) => {
    if (comparedProducts.some((p) => p.id === product.id)) return;
    if (comparedProducts.length >= 3) {
      setComparedProducts((prev) => [...prev.slice(1), product]);
    } else {
      setComparedProducts((prev) => [...prev, product]);
    }
  };

  const removeFromCompare = (productId: string) => {
    setComparedProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const clearCompare = () => {
    setComparedProducts([]);
    setIsDrawerOpen(false);
  };

  const isCompared = (productId: string) => {
    return comparedProducts.some((p) => p.id === productId);
  };

  return (
    <ComparisonContext.Provider
      value={{
        comparedProducts,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isCompared,
        isDrawerOpen,
        setIsDrawerOpen,
        sessionKey,
      }}
    >
      {children}
    </ComparisonContext.Provider>
  );
};

export const useComparison = () => useContext(ComparisonContext);
