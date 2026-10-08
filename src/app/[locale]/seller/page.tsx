import { redirect } from 'next/navigation';

export default async function SellerIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/seller/dashboard`);
}
