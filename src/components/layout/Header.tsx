'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { BriefcaseBusiness, Home, Menu, ShoppingBag, Sparkles, X, ArrowLeftRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { AccountMenu } from './AccountMenu';

export function Header() {
  const { language, dir, t } = useLanguage();
  const pathname = usePathname();
  const locale = language === 'ckb' ? 'ku' : language;
  const isKu = locale === 'ku';
  const isAr = locale === 'ar';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true);
  const localized = (path: string) => `/${locale}${path}`;
  const isHome = pathname === `/${locale}` || pathname === '/';

  const copy = {
    products: isKu ? 'بەرهەمەکان' : isAr ? 'المنتجات' : 'Products',
    compare: isKu ? 'بەراورد' : isAr ? 'مقارنة' : 'Compare',
    aiSearch: isKu ? 'گەڕانی زیرەک' : isAr ? 'البحث الذكي' : 'AI Search',
    b2b: isKu ? 'بازاڕی بازرگانی' : isAr ? 'سوق الأعمال' : 'B2B Marketplace',
    openMenu: isKu ? 'کردنەوەی لیستی ڕێنیشاندەر' : isAr ? 'فتح قائمة التنقل' : 'Open navigation menu',
    closeMenu: isKu ? 'داخستنی لیستی ڕێنیشاندەر' : isAr ? 'إغلاق قائمة التنقل' : 'Close navigation menu',
    navigation: isKu ? 'ڕێنیشاندەر' : isAr ? 'التنقل' : 'Main navigation',
  };

  useEffect(() => {
    let previousScrollY = window.scrollY;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - previousScrollY;

      if (currentScrollY < 80 || delta < -8 || mobileMenuOpen) {
        setHeaderVisible(true);
      } else if (delta > 8) {
        setHeaderVisible(false);
      }
      previousScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [mobileMenuOpen]);

  const linkClass = (active: boolean) =>
    `inline-flex min-h-10 items-center gap-2 rounded-xl px-2.5 xl:px-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8C5E00] ${
      active
        ? 'bg-[#FFF5DD] text-[#704B00]'
        : 'text-neutral-700 hover:bg-[#FAF9F6] hover:text-neutral-950'
    }`;

  const navigationLinks = (
    <nav aria-label={copy.navigation} className="flex flex-col gap-1 lg:flex-row lg:items-center lg:gap-0.5">
      <Link
        href={localized('/')}
        onClick={() => setMobileMenuOpen(false)}
        aria-current={isHome ? 'page' : undefined}
        className={`${linkClass(isHome)} w-full lg:w-auto`}
      >
        <Home className="h-4 w-4 lg:hidden" aria-hidden="true" />
        {t('navHome')}
      </Link>
      <Link
        href={localized('/products')}
        onClick={() => setMobileMenuOpen(false)}
        aria-current={pathname?.includes('/products') ? 'page' : undefined}
        className={`${linkClass(!!pathname?.includes('/products'))} w-full lg:w-auto`}
      >
        <ShoppingBag className="h-4 w-4 lg:hidden" aria-hidden="true" />
        {copy.products}
      </Link>
      <Link
        href={localized('/compare')}
        onClick={() => setMobileMenuOpen(false)}
        aria-current={pathname?.includes('/compare') ? 'page' : undefined}
        className={`${linkClass(!!pathname?.includes('/compare'))} w-full lg:w-auto`}
      >
        <ArrowLeftRight className="h-4 w-4 lg:hidden" aria-hidden="true" />
        {copy.compare}
      </Link>
      <Link
        href={localized('/search')}
        onClick={() => setMobileMenuOpen(false)}
        aria-current={pathname?.includes('/search') ? 'page' : undefined}
        className={`${linkClass(!!pathname?.includes('/search'))} w-full lg:w-auto`}
      >
        <Sparkles className="h-4 w-4 text-[#8C5E00]" aria-hidden="true" />
        {copy.aiSearch}
      </Link>
      <Link
        href={localized('/b2b')}
        onClick={() => setMobileMenuOpen(false)}
        aria-current={pathname?.includes('/b2b') ? 'page' : undefined}
        className={`${linkClass(!!pathname?.includes('/b2b'))} w-full lg:w-auto`}
      >
        <BriefcaseBusiness className="h-4 w-4 lg:hidden" aria-hidden="true" />
        {copy.b2b}
      </Link>
    </nav>
  );

  return (
    <header
      className={`sticky top-0 z-40 border-b border-[#EAE7DF] bg-white/95 shadow-xs backdrop-blur-md transition-transform duration-300 ${
        headerVisible || mobileMenuOpen ? 'translate-y-0' : '-translate-y-full'
      }`}
      dir={dir}
    >
      <div className="mx-auto w-full max-w-[1600px] px-3 sm:px-5 lg:px-7">
        <div className="flex min-h-16 items-center justify-between gap-2 sm:min-h-[4.5rem]">
          <Link
            href={localized('/')}
            onClick={() => setMobileMenuOpen(false)}
            className="flex min-w-0 shrink-0 items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8C5E00] rounded-lg"
            aria-label="Bazary Gawra home"
          >
            <Image
              src="/images/logo.png"
              alt=""
              width={42}
              height={42}
              priority
              className="h-9 w-9 object-contain sm:h-10 sm:w-10"
            />
            <span className="hidden whitespace-nowrap text-sm font-black tracking-tight text-neutral-950 min-[380px]:inline sm:text-base xl:text-lg">
              {isKu ? 'بازاڕی گەورە' : isAr ? 'بازاري گەورە' : 'BAZARY GAWRA'}
            </span>
          </Link>

          <div className="hidden min-w-0 flex-1 justify-center lg:flex">
            {navigationLinks}
          </div>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <LanguageSwitcher />
            <AccountMenu />
            <button
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#EAE7DF] bg-white text-neutral-800 transition hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8C5E00] lg:hidden"
              aria-label={mobileMenuOpen ? copy.closeMenu : copy.openMenu}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div id="mobile-navigation" className="border-t border-[#EAE7DF] py-3 pb-4 lg:hidden">
            {navigationLinks}
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
