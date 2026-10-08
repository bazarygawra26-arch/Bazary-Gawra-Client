'use client';

import { useComparison } from '../context/ComparisonContext';
import { Product } from '../types';

export function useCompareSelection() {
  const {
    comparedProducts,
    addToCompare,
    removeFromCompare,
    clearCompare,
    isCompared,
    isDrawerOpen,
    setIsDrawerOpen,
  } = useComparison();

  const toggleCompare = (product: Product) => {
    if (isCompared(product.id)) {
      removeFromCompare(product.id);
    } else {
      addToCompare(product);
    }
  };

  return {
    comparedProducts,
    addToCompare,
    removeFromCompare,
    toggleCompare,
    clearCompare,
    isCompared,
    isDrawerOpen,
    setIsDrawerOpen,
    canCompare: comparedProducts.length >= 2,
    count: comparedProducts.length,
  };
}
