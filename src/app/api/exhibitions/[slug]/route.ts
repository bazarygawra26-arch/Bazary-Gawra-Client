import { NextRequest, NextResponse } from 'next/server';
import { findExhibitionBySlug } from '../../../../server/db/repositories/exhibitions';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    const exhibition = await findExhibitionBySlug(slug);

    if (!exhibition) {
      return NextResponse.json({ error: 'Exhibition not found' }, { status: 404 });
    }

    return NextResponse.json(exhibition);
  } catch (err: any) {
    console.error('API /api/exhibitions/[slug] error:', err);
    return NextResponse.json({ error: err?.message || 'Failed to fetch exhibition' }, { status: 500 });
  }
}
