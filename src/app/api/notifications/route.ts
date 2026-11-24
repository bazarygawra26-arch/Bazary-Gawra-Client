import { NextRequest, NextResponse } from 'next/server';
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '@/server/db/repositories/notifications';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const notifications = await getNotifications(userId, unreadOnly);
    return NextResponse.json({ success: true, notifications });
  } catch (error: any) {
    console.error('Failed to fetch notifications:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { notificationId, userId, markAll } = body;

    if (markAll && userId) {
      await markAllNotificationsRead(userId);
      return NextResponse.json({ success: true, message: 'All notifications marked as read' });
    }

    if (notificationId && userId) {
      await markNotificationRead(notificationId, userId);
      return NextResponse.json({ success: true, message: 'Notification marked as read' });
    }

    return NextResponse.json({ error: 'notificationId+userId or (userId+markAll) is required' }, { status: 400 });
  } catch (error: any) {
    console.error('Failed to update notifications:', error);
    return NextResponse.json({ error: error.message || 'Failed to update notifications' }, { status: 400 });
  }
}
