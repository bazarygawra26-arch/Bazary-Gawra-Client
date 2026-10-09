import { redirect } from 'next/navigation';

export default async function LocalizedSellerAdminRedirect({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale || 'ku'}/seller/dashboard?tab=admin`);
}
