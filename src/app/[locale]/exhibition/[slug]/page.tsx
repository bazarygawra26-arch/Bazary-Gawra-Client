import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { findExhibitionBySlug } from '../../../../server/db/repositories/exhibitions';
import { ExhibitionDetailView } from '../../../../components/exhibition/ExhibitionDetailView';

interface PageProps {
  params: Promise<{ slug: string; locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, locale } = await params;
  const exhibition = await findExhibitionBySlug(slug);

  if (!exhibition) {
    return {
      title: 'Exhibition Not Found | Bazary Gawra',
    };
  }

  const isKu = locale === 'ku' || locale === 'ckb';
  const isAr = locale === 'ar';

  const title = isKu ? exhibition.title_ku : isAr ? exhibition.title_ar : exhibition.title_en;
  const subtitle = isKu ? exhibition.subtitle_ku : isAr ? exhibition.subtitle_ar : exhibition.subtitle_en;

  return {
    title: `${title} | Bazary Gawra`,
    description: subtitle,
    openGraph: {
      title: `${title} | Bazary Gawra`,
      description: subtitle,
      images: [exhibition.hero_image],
    },
  };
}

export default async function ExhibitionPage({ params }: PageProps) {
  const { slug, locale } = await params;
  const exhibition = await findExhibitionBySlug(slug);

  if (!exhibition) {
    notFound();
  }

  return <ExhibitionDetailView initialExhibition={exhibition} locale={locale} />;
}
