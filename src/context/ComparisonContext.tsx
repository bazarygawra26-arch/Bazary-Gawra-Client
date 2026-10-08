'use client';

import React, { createContext, useContext, useState } from 'react';
import { Product } from '../types';

interface ComparisonContextType {
  comparedProducts: Product[];
  addToCompare: (product: Product) => void;
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;
  isCompared: (productId: string) => boolean;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
}

const ComparisonContext = createContext<ComparisonContextType>({
  comparedProducts: [],
  addToCompare: () => {},
  removeFromCompare: () => {},
  clearCompare: () => {},
  isCompared: () => false,
  isDrawerOpen: false,
  setIsDrawerOpen: () => {},
});

export const ComparisonProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [comparedProducts, setComparedProducts] = useState<Product[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const addToCompare = (product: Product) => {
    if (comparedProducts.some((p) => p.id === product.id)) return;
    if (comparedProducts.length >= 3) {
      // keep max 3 products
      setComparedProducts((prev) => [...prev.slice(1), product]);
    } else {
      setComparedProducts((prev) => [...prev, product]);
    }
    setIsDrawerOpen(true);
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
      }}
    >
      {children}
    </ComparisonContext.Provider>
  );
};

export const useComparison = () => useContext(ComparisonContext);
