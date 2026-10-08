'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Product } from '../../types';
import { ProductCard } from '../product/ProductCard';
import { useLanguage } from '../../context/LanguageContext';
import { Store, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';

interface MoreFromSellerProps {
  sellerSlug?: string;
  sellerName: string;
  currentProductId: string;
}

export const MoreFromSeller: React.FC<MoreFromSellerProps> = ({
  sellerSlug,
  sellerName,
  currentProductId,
}) => {
  const { language } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const isRtl = language === 'ku' || language === 'ar';
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  useEffect(() => {
    let isMounted = true;
    async function loadMore() {
      if (!sellerSlug) {
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const res = await fetch(
          `/api/sellers/${encodeURIComponent(sellerSlug)}/products?excludeId=${encodeURIComponent(
            currentProductId
          )}&limit=4&lang=${language}`
        );
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setProducts(Array.isArray(data) ? data : []);
          }
        }
      } catch (err) {
        console.error('Failed to load more products from seller:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadMore();
    return () => {
      isMounted = false;
    };
  }, [sellerSlug, currentProductId, language]);

  if (!isLoading && products.length === 0) {
    return null;
  }

  const shopUrl = sellerSlug ? `/sellers/${sellerSlug}` : '/sellers';

  return (
    <section className="mt-12 pt-8 border-t border-[#EAE7DF]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#FFF5DD] text-[#8C5E00] flex items-center justify-center">
            <Store className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-neutral-900">
              {language === 'ku'
                ? `بەرهەمی زیاتر لە ${sellerName}`
                : language === 'ar'
                ? `المزيد من هذا التاجر (${sellerName})`
                : `More from ${sellerName}`}
            </h3>
            <p className="text-xs text-neutral-500">
              {language === 'ku'
                ? 'بەرهەمە بەردەستەکانی تر لە هەمان کۆگا'
                : 'Direct from this local Kurdish shop'}
            </p>
          </div>
        </div>

        <Link
          href={shopUrl}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#657A52] hover:text-[#8C5E00] transition-colors px-3 py-1.5 rounded-lg hover:bg-white border border-transparent hover:border-[#EAE7DF]"
        >
          <span>{language === 'ku' ? 'سەردانی فرۆشگا' : language === 'ar' ? 'زيارة المتجر' : 'Visit Shop'}</span>
          <ArrowIcon className="w-3.5 h-3.5" />
        </Link>
      </div>

      {isLoading ? (
        <div className="py-8 flex items-center justify-center gap-2 text-neutral-400">
          <Loader2 className="w-5 h-5 animate-spin text-[#F4B942]" />
          <span className="text-xs">Loading shop items...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
};

export default MoreFromSeller;
