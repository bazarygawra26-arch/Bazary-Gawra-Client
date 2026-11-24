import 'server-only';
import { supabaseAdmin } from '../supabaseAdmin';
import { MarketplaceNotification, NotificationType } from '../../../types';

const notificationsFallbackStore: MarketplaceNotification[] = [
  {
    id: 'notif-welcome',
    user_id: 'default-user',
    title_en: 'Welcome to Bazary Gawra',
    title_ku: 'بەخێربێیت بۆ بازاڕی گەورە',
    title_ar: 'مرحباً بك في بازاري گەورە',
    message_en: 'Your account is active. Discover verified products and connect with local stores.',
    message_ku: 'هەژمارەکەت چالاکە. کاڵای پشتڕاستکراو بدۆزەرەوە و پەیوەندی بە فرۆشگاکانەوە بکە.',
    message_ar: 'حسابك مفعل. اكتشف المنتجات المعتمدة وتواصل مع المتاجر المحلية.',
    type: 'general',
    reference_id: null,
    is_read: false,
    created_at: new Date().toISOString(),
  },
];

export interface CreateNotificationInput {
  user_id: string;
  title_en: string;
  title_ku: string;
  title_ar: string;
  message_en: string;
  message_ku: string;
  message_ar: string;
  type: NotificationType;
  reference_id?: string | null;
}

export async function createNotification(input: CreateNotificationInput): Promise<MarketplaceNotification> {
  if (supabaseAdmin) {
    try {
      const { data, error } = await (supabaseAdmin as any)
        .from('notifications')
        .insert({
          user_id: input.user_id,
          title_en: input.title_en,
          title_ku: input.title_ku,
          title_ar: input.title_ar,
          message_en: input.message_en,
          message_ku: input.message_ku,
          message_ar: input.message_ar,
          type: input.type,
          reference_id: input.reference_id || null,
          is_read: false,
        })
        .select('*')
        .maybeSingle();

      if (!error && data) {
        return data as MarketplaceNotification;
      }
    } catch (err) {
      console.warn('createNotification DB error:', err);
    }
  }

  const newNotif: MarketplaceNotification = {
    id: `notif-${Date.now()}`,
    ...input,
    is_read: false,
    created_at: new Date().toISOString(),
  };

  notificationsFallbackStore.unshift(newNotif);
  return newNotif;
}

export async function getNotifications(userId: string, unreadOnly: boolean = false): Promise<MarketplaceNotification[]> {
  if (supabaseAdmin) {
    try {
      let query = (supabaseAdmin as any)
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (unreadOnly) {
        query = query.eq('is_read', false);
      }

      const { data, error } = await query;
      if (!error && Array.isArray(data)) {
        return data as MarketplaceNotification[];
      }
    } catch (err) {
      console.warn('getNotifications DB error:', err);
    }
  }

  return notificationsFallbackStore.filter((n) => {
    if (n.user_id !== userId && n.user_id !== 'default-user') return false;
    if (unreadOnly && n.is_read) return false;
    return true;
  });
}

export async function markNotificationRead(notificationId: string, userId: string): Promise<boolean> {
  if (supabaseAdmin) {
    try {
      const { error } = await (supabaseAdmin as any)
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', userId);

      if (!error) return true;
    } catch (err) {
      console.warn('markNotificationRead DB error:', err);
    }
  }

  const notif = notificationsFallbackStore.find((n) => n.id === notificationId);
  if (notif) {
    notif.is_read = true;
    return true;
  }
  return false;
}

export async function markAllNotificationsRead(userId: string): Promise<boolean> {
  if (supabaseAdmin) {
    try {
      const { error } = await (supabaseAdmin as any)
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId);

      if (!error) return true;
    } catch (err) {
      console.warn('markAllNotificationsRead DB error:', err);
    }
  }

  notificationsFallbackStore.forEach((n) => {
    if (n.user_id === userId || n.user_id === 'default-user') {
      n.is_read = true;
    }
  });
  return true;
}
