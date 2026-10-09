import { NextRequest, NextResponse } from 'next/server';
import { getAdminMonetizationSummary } from '../../../../server/db/repositories/monetization';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const summary = await getAdminMonetizationSummary();
    return NextResponse.json(summary, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error: any) {
    console.error('API /api/admin/monetization error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to fetch admin monetization summary' }, { status: 500 });
  }
}
