import { AppNotification } from '../types';
import { getDB } from './database';
import { getTodayScripture } from './dailyScriptures';
import { getTodayApostleQuotation } from './apostleQuotations';

let memoryNotifications: AppNotification[] = [];

/**
 * Initializes and syncs real notifications based on today's live scripture & apostle quotes
 */
export const syncRealNotifications = async (): Promise<AppNotification[]> => {
  const db = await getDB();
  const todayScripture = getTodayScripture();
  const todayApostle = getTodayApostleQuotation();
  const todayDateStr = new Date().toISOString().slice(0, 10);

  const scriptureNotifId = `notif_scripture_${todayDateStr}`;
  const apostleNotifId = `notif_apostle_${todayDateStr}_${todayApostle.apostleId}`;
  const streakNotifId = `notif_streak_${todayDateStr}`;

  const currentList = await fetchAllNotifications();

  // 1. Ensure Today's Real Scripture Notification exists
  if (!currentList.some(n => n.id === scriptureNotifId)) {
    const scriptureNotif: AppNotification = {
      id: scriptureNotifId,
      title: 'Daily Scripture is Ready',
      message: `"${todayScripture.quote}" — ${todayScripture.reference}`,
      type: 'daily_scripture',
      icon: 'sunny',
      iconColor: '#F59E0B',
      targetParam: todayScripture.id,
      isRead: false,
      timestamp: Date.now()
    };
    await insertNotification(scriptureNotif);
  }

  // 2. Ensure Today's Real Apostle Word exists
  if (!currentList.some(n => n.id === apostleNotifId)) {
    const apostleNotif: AppNotification = {
      id: apostleNotifId,
      title: `${todayApostle.apostleName} sent a Word of Grace`,
      message: `"${todayApostle.quote.slice(0, 100)}..."`,
      type: 'apostle_word',
      icon: 'chatbubble-ellipses',
      iconColor: '#3B82F6',
      targetParam: todayApostle.apostleId,
      isRead: false,
      timestamp: Date.now() - 30 * 60 * 1000
    };
    await insertNotification(apostleNotif);
  }

  // 3. Ensure Sunday Sermon Workshop Notification exists on weekends or first load
  const sermonNotifId = `notif_sermon_${todayDateStr}`;
  if (!currentList.some(n => n.id === sermonNotifId)) {
    const sermonNotif: AppNotification = {
      id: sermonNotifId,
      title: 'Sunday Sermon Workshop',
      message: 'Prepare your next message or homily collaboratively with Apostle Paul.',
      type: 'sermon_workshop',
      icon: 'book',
      iconColor: '#8B5CF6',
      targetParam: 'paul',
      isRead: true,
      timestamp: Date.now() - 2 * 60 * 60 * 1000
    };
    await insertNotification(sermonNotif);
  }

  return await fetchAllNotifications();
};

export const fetchAllNotifications = async (): Promise<AppNotification[]> => {
  const db = await getDB();
  if (db) {
    try {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS notifications (
          id TEXT PRIMARY KEY NOT NULL,
          title TEXT NOT NULL,
          message TEXT NOT NULL,
          type TEXT NOT NULL,
          icon TEXT NOT NULL,
          icon_color TEXT NOT NULL,
          target_param TEXT,
          is_read INTEGER DEFAULT 0,
          timestamp INTEGER NOT NULL
        );
      `);

      const rows = await db.getAllAsync<{
        id: string;
        title: string;
        message: string;
        type: string;
        icon: string;
        icon_color: string;
        target_param: string | null;
        is_read: number;
        timestamp: number;
      }>('SELECT * FROM notifications ORDER BY timestamp DESC');

      if (rows && rows.length > 0) {
        return rows.map(r => ({
          id: r.id,
          title: r.title,
          message: r.message,
          type: r.type as any,
          icon: r.icon,
          iconColor: r.icon_color,
          targetParam: r.target_param || undefined,
          isRead: Boolean(r.is_read),
          timestamp: r.timestamp
        }));
      }
    } catch (e) {
      console.warn('Error querying notifications from DB:', e);
    }
  }

  return [...memoryNotifications].sort((a, b) => b.timestamp - a.timestamp);
};

export const insertNotification = async (item: AppNotification): Promise<void> => {
  memoryNotifications = [item, ...memoryNotifications.filter(n => n.id !== item.id)];

  const db = await getDB();
  if (db) {
    try {
      await db.runAsync(
        `INSERT OR REPLACE INTO notifications (id, title, message, type, icon, icon_color, target_param, is_read, timestamp)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          item.id,
          item.title,
          item.message,
          item.type,
          item.icon,
          item.iconColor,
          item.targetParam || null,
          item.isRead ? 1 : 0,
          item.timestamp
        ]
      );
    } catch (e) {
      console.warn('Error inserting notification to DB:', e);
    }
  }
};

export const markNotificationAsRead = async (id: string): Promise<void> => {
  const index = memoryNotifications.findIndex(n => n.id === id);
  if (index >= 0) {
    memoryNotifications[index].isRead = true;
  }

  const db = await getDB();
  if (db) {
    try {
      await db.runAsync('UPDATE notifications SET is_read = 1 WHERE id = ?', [id]);
    } catch (e) {
      console.warn('Error marking notification read:', e);
    }
  }
};

export const markAllNotificationsAsRead = async (): Promise<void> => {
  memoryNotifications = memoryNotifications.map(n => ({ ...n, isRead: true }));

  const db = await getDB();
  if (db) {
    try {
      await db.runAsync('UPDATE notifications SET is_read = 1');
    } catch (e) {
      console.warn('Error marking all notifications read:', e);
    }
  }
};

export const deleteNotification = async (id: string): Promise<void> => {
  memoryNotifications = memoryNotifications.filter(n => n.id !== id);

  const db = await getDB();
  if (db) {
    try {
      await db.runAsync('DELETE FROM notifications WHERE id = ?', [id]);
    } catch (e) {
      console.warn('Error deleting notification:', e);
    }
  }
};
