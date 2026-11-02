import { redirect } from 'next/navigation';

export default async function ExhibitionIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/exhibition/kitchen-appliances-super-deals`);
}
