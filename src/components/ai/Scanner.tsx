'use client';

import React from 'react';
import { AIProductScanner } from '../AIProductScanner';
import { Product } from '../../types';

interface ScannerProps {
  onViewProduct?: (product: Product) => void;
}

export const Scanner: React.FC<ScannerProps> = ({ onViewProduct }) => {
  return <AIProductScanner onViewProduct={onViewProduct} />;
};
