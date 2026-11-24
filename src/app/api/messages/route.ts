import { NextRequest, NextResponse } from 'next/server';
import {
  getConversations,
  getMessages,
  sendMessage,
  startConversation,
} from '@/server/db/repositories/messaging';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const conversationId = searchParams.get('conversationId');

    if (conversationId && userId) {
      const messages = await getMessages(conversationId, userId);
      return NextResponse.json({ success: true, messages });
    }

    if (userId) {
      const conversations = await getConversations(userId);
      return NextResponse.json({ success: true, conversations });
    }

    return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  } catch (error: any) {
    console.error('Failed to fetch messaging data:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, conversationId, senderId, senderRole, content, participant1Id, participant2Id, subject, referenceType, referenceId } = body;

    if (action === 'start') {
      if (!participant1Id || !participant2Id) {
        return NextResponse.json({ error: 'participant1Id and participant2Id are required' }, { status: 400 });
      }
      const conversation = await startConversation(
        participant1Id,
        participant2Id,
        subject,
        referenceType,
        referenceId
      );
      return NextResponse.json({ success: true, conversation });
    }

    // Default: send message
    if (!conversationId || !senderId || !senderRole || !content) {
      return NextResponse.json(
        { error: 'conversationId, senderId, senderRole, and content are required' },
        { status: 400 }
      );
    }

    const message = await sendMessage(conversationId, senderId, senderRole, content);
    return NextResponse.json({ success: true, message }, { status: 201 });
  } catch (error: any) {
    console.error('Failed to handle messaging request:', error);
    return NextResponse.json({ error: error.message || 'Failed to process message' }, { status: 400 });
  }
}
