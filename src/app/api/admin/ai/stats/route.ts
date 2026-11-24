import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/server/db/supabaseAdmin';

/** GET /api/admin/ai/stats — AI usage statistics for the admin panel */
export async function GET(request: NextRequest) {
  try {
    if (!supabaseAdmin) return NextResponse.json({ error: 'Database not configured.' }, { status: 503 });

    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get('page') || 1);
    const limit = Math.min(100, Number(searchParams.get('limit') || 50));
    const offset = (page - 1) * limit;

    // Top-level stats
    const [
      { count: totalPrompts },
      { count: successCount },
      { count: errorCount },
      { count: blockedCount },
      { data: featureBreakdown },
      { data: langBreakdown },
      { data: recentLogs },
    ] = await Promise.all([
      supabaseAdmin.from('ai_prompt_logs').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('ai_prompt_logs').select('id', { count: 'exact', head: true }).eq('status', 'success'),
      supabaseAdmin.from('ai_prompt_logs').select('id', { count: 'exact', head: true }).eq('status', 'error'),
      supabaseAdmin.from('ai_prompt_logs').select('id', { count: 'exact', head: true }).eq('status', 'quota_exceeded'),
      supabaseAdmin
        .from('ai_prompt_logs')
        .select('feature')
        .then(async ({ data }) => {
          if (!data) return { data: [] };
          const counts: Record<string, number> = {};
          for (const row of data) counts[row.feature] = (counts[row.feature] || 0) + 1;
          return { data: Object.entries(counts).map(([feature, count]) => ({ feature, count })) };
        }),
      supabaseAdmin
        .from('ai_prompt_logs')
        .select('detected_language')
        .then(async ({ data }) => {
          if (!data) return { data: [] };
          const counts: Record<string, number> = {};
          for (const row of data) {
            const l = row.detected_language || 'unknown';
            counts[l] = (counts[l] || 0) + 1;
          }
          return { data: Object.entries(counts).map(([language, count]) => ({ language, count })) };
        }),
      supabaseAdmin
        .from('ai_prompt_logs')
        .select('id, user_id, feature, detected_language, status, processing_ms, created_at')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1),
    ]);

    // Top users by quota used
    const { data: topUsers } = await supabaseAdmin
      .from('ai_prompt_quotas')
      .select('user_id, used_count, quota_limit')
      .order('used_count', { ascending: false })
      .limit(10);

    return NextResponse.json({
      success: true,
      stats: {
        totalPrompts: totalPrompts || 0,
        successCount: successCount || 0,
        errorCount: errorCount || 0,
        blockedCount: blockedCount || 0,
        featureBreakdown: featureBreakdown || [],
        langBreakdown: langBreakdown || [],
      },
      recentLogs: recentLogs || [],
      topUsers: topUsers || [],
      page,
      limit,
    });
  } catch (error: any) {
    console.error('[admin/ai/stats] error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch AI stats.' }, { status: 500 });
  }
}
