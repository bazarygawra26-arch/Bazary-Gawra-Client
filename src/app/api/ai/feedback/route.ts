import { NextRequest, NextResponse } from 'next/server';
import { logAiFeedback } from '../../../../server/db/repositories/aiLogs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { request_id, helpful, comment, reason, feature } = body;

    await logAiFeedback({
      request_id,
      helpful: typeof helpful === 'boolean' ? helpful : true,
      comment,
      reason,
      feature,
    });

    return NextResponse.json({ success: true, message: 'AI feedback recorded successfully' });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to log feedback' },
      { status: 500 }
    );
  }
}
