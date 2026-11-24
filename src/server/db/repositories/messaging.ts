import 'server-only';
import { supabaseAdmin } from '../supabaseAdmin';
import { Conversation, Message } from '../../../types';

const conversationsFallbackStore: Conversation[] = [];
const messagesFallbackStore: Message[] = [];

export async function getConversations(userId: string): Promise<Conversation[]> {
  if (supabaseAdmin) {
    try {
      const { data, error } = await (supabaseAdmin as any)
        .from('conversations')
        .select(`
          id,
          participant_one_id,
          participant_two_id,
          subject,
          reference_type,
          reference_id,
          last_message_at,
          created_at
        `)
        .or(`participant_one_id.eq.${userId},participant_two_id.eq.${userId}`)
        .order('last_message_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        return data as Conversation[];
      }
    } catch (err) {
      console.warn('getConversations DB error:', err);
    }
  }

  return conversationsFallbackStore.filter(
    (c) => c.participant_one_id === userId || c.participant_two_id === userId
  );
}

export async function getMessages(conversationId: string, userId: string): Promise<Message[]> {
  if (supabaseAdmin) {
    try {
      // First verify participant
      const { data: conv } = await (supabaseAdmin as any)
        .from('conversations')
        .select('participant_one_id, participant_two_id')
        .eq('id', conversationId)
        .maybeSingle();

      if (!conv || (conv.participant_one_id !== userId && conv.participant_two_id !== userId)) {
        return [];
      }

      const { data, error } = await (supabaseAdmin as any)
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (!error && Array.isArray(data)) {
        return data as Message[];
      }
    } catch (err) {
      console.warn('getMessages DB error:', err);
    }
  }

  return messagesFallbackStore.filter((m) => m.conversation_id === conversationId);
}

export async function sendMessage(
  conversationId: string,
  senderId: string,
  text: string
): Promise<Message | null> {
  const trimmed = text.trim();
  if (!trimmed) return null;

  if (supabaseAdmin) {
    try {
      const { data, error } = await (supabaseAdmin as any)
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: senderId,
          message_text: trimmed,
          is_read: false,
        })
        .select('*')
        .maybeSingle();

      if (!error && data) {
        // Update conversation last_message_at
        await (supabaseAdmin as any)
          .from('conversations')
          .update({ last_message_at: new Date().toISOString() })
          .eq('id', conversationId);

        return data as Message;
      }
    } catch (err) {
      console.warn('sendMessage DB error:', err);
    }
  }

  const fallbackMsg: Message = {
    id: `msg-${Date.now()}`,
    conversation_id: conversationId,
    sender_id: senderId,
    message_text: trimmed,
    is_read: false,
    created_at: new Date().toISOString(),
  };

  messagesFallbackStore.push(fallbackMsg);
  return fallbackMsg;
}

export async function startConversation(
  senderId: string,
  recipientId: string,
  subject?: string,
  referenceType?: 'product' | 'order' | 'rfq' | 'quotation' | 'general',
  referenceId?: string,
  initialMessage?: string
): Promise<{ conversation: Conversation; message?: Message }> {
  if (supabaseAdmin) {
    try {
      // Check for existing conversation
      const { data: existing } = await (supabaseAdmin as any)
        .from('conversations')
        .select('*')
        .or(
          `and(participant_one_id.eq.${senderId},participant_two_id.eq.${recipientId}),and(participant_one_id.eq.${recipientId},participant_two_id.eq.${senderId})`
        )
        .maybeSingle();

      let convId = existing?.id;
      let conv = existing as Conversation;

      if (!convId) {
        const { data: created, error } = await (supabaseAdmin as any)
          .from('conversations')
          .insert({
            participant_one_id: senderId,
            participant_two_id: recipientId,
            subject: subject || null,
            reference_type: referenceType || 'general',
            reference_id: referenceId || null,
          })
          .select('*')
          .maybeSingle();

        if (!error && created) {
          convId = created.id;
          conv = created as Conversation;
        }
      }

      let msg: Message | undefined = undefined;
      if (convId && initialMessage) {
        msg = (await sendMessage(convId, senderId, initialMessage)) || undefined;
      }

      if (conv) {
        return { conversation: conv, message: msg };
      }
    } catch (err) {
      console.warn('startConversation DB error:', err);
    }
  }

  const fallbackConv: Conversation = {
    id: `conv-${Date.now()}`,
    participant_one_id: senderId,
    participant_two_id: recipientId,
    subject: subject || 'Conversation',
    reference_type: referenceType || 'general',
    reference_id: referenceId,
    last_message: initialMessage,
    last_message_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  };

  conversationsFallbackStore.unshift(fallbackConv);
  let fallbackMsg: Message | undefined;
  if (initialMessage) {
    fallbackMsg = {
      id: `msg-${Date.now()}`,
      conversation_id: fallbackConv.id,
      sender_id: senderId,
      message_text: initialMessage,
      is_read: false,
      created_at: new Date().toISOString(),
    };
    messagesFallbackStore.push(fallbackMsg);
  }

  return { conversation: fallbackConv, message: fallbackMsg };
}
