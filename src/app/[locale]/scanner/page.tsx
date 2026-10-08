'use client';

import React, { useState } from 'react';
import { Header } from '../../../components/layout/Header';
import { Footer } from '../../../components/layout/Footer';
import { Scanner } from '../../../components/ai/Scanner';
import { ProductDetailModal } from '../../../components/ProductDetailModal';
import { ProductComparisonDrawer } from '../../../components/ProductComparisonDrawer';
import { Product } from '../../../types';

export default function ScannerPage() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-neutral-900">
      <Header />
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <Scanner onViewProduct={(p) => setSelectedProduct(p)} />
      </main>
      <Footer />

      <ProductComparisonDrawer />
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}
