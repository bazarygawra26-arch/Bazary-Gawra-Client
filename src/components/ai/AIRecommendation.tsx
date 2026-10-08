'use client';

import React from 'react';
import { AIRecommendations as OriginalAIRecommendations } from '../AIRecommendations';
import { Product } from '../../types';

interface AIRecommendationProps {
  products: Product[];
  onViewProduct?: (product: Product) => void;
}

export const AIRecommendation: React.FC<AIRecommendationProps> = ({ products, onViewProduct }) => {
  return <OriginalAIRecommendations products={products} onViewProduct={onViewProduct} />;
};
