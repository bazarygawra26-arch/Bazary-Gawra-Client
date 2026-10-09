import { NextRequest, NextResponse } from 'next/server';
import { getSellerProfile } from '@/server/db/repositories/sellers';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(req.url);
    const rawLang = searchParams.get('lang') || 'ku';
    const lang = (rawLang === 'ckb' || rawLang === 'ku' ? 'ku' : rawLang === 'ar' ? 'ar' : 'en') as 'en' | 'ku' | 'ar';

    const profile = await getSellerProfile(slug, lang);

    if (!profile) {
      return NextResponse.json({ error: 'Seller not found' }, { status: 404 });
    }

    return NextResponse.json(profile);
  } catch (err: any) {
    console.error('Error in /api/sellers/[slug]:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to fetch seller profile' },
      { status: 500 }
    );
  }
}
