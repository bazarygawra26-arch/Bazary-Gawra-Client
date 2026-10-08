import { NextRequest, NextResponse } from 'next/server';
import { aiProductChatRequestSchema } from '../../../../lib/schemas/ai-chat';
import { processProductChat } from '../../../../server/ai/services/chatService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = aiProductChatRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
    }

    const { productId, question, language } = parsed.data;
    const result = await processProductChat(productId, question, language);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('API /api/ai/product-chat error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
