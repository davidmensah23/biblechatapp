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
      relativeTime: 'Today',
      isRead: false,
      timestamp: Date.now()
    };
    await insertNotification(scriptureNotif);
  }

  // 2. Ensure Simon Peter's Real Apostle Chat Notification exists
  if (!currentList.some(n => n.id === apostleNotifId)) {
    const apostleNotif: AppNotification = {
      id: apostleNotifId,
      title: `${todayApostle.apostleName} sent you a message`,
      message: `"${todayApostle.quote.slice(0, 85)}..."`,
      type: 'apostle_word',
      icon: 'chatbubble-ellipses',
      iconColor: '#3B82F6',
      targetParam: todayApostle.apostleId,
      relativeTime: '2h',
      isRead: false,
      timestamp: Date.now() - 30 * 60 * 1000
    };
    await insertNotification(apostleNotif);
  }

  // 3. Ensure Badge Notifications matching Reference Image 1
  const badgeNotifSeed: AppNotification[] = [
    {
      id: 'notif_badge_saved_verse_level',
      title: 'You leveled up your Saved Verse Badge',
      message: 'Keep anchoring in the Word of God.',
      type: 'badge_level_up',
      icon: 'bookmark',
      iconColor: '#C27A4E',
      badgeId: 'saved_verse',
      mascotKey: 'rock',
      badgeLevel: 5,
      relativeTime: '41w',
      isRead: true,
      timestamp: Date.now() - 41 * 7 * 24 * 3600 * 1000
    },
    {
      id: 'notif_badge_plan_sub',
      title: 'You earned the Plan Subscription Badge',
      message: 'Started devotional walk through Scripture.',
      type: 'badge_earned',
      icon: 'checkbox',
      iconColor: '#D35B5B',
      badgeId: 'plan_subscription',
      mascotKey: 'blossom',
      badgeLevel: 1,
      relativeTime: '4/18/24',
      isRead: true,
      timestamp: Date.now() - 60 * 24 * 3600 * 1000
    },
    {
      id: 'notif_badge_highlight_level',
      title: 'You leveled up your Highlight Badge',
      message: 'Reached Level 10 illuminating key verses.',
      type: 'badge_level_up',
      icon: 'create',
      iconColor: '#D99B38',
      badgeId: 'highlight',
      mascotKey: 'flame',
      badgeLevel: 10,
      relativeTime: '4/7/24',
      isRead: true,
      timestamp: Date.now() - 70 * 24 * 3600 * 1000
    },
    {
      id: 'notif_badge_saved_verse_earned',
      title: 'You earned the Saved Verse Badge',
      message: 'Treasury of promises stored in your heart.',
      type: 'badge_earned',
      icon: 'bookmark',
      iconColor: '#C27A4E',
      badgeId: 'saved_verse',
      mascotKey: 'rock',
      badgeLevel: 1,
      relativeTime: '3/29/24',
      isRead: true,
      timestamp: Date.now() - 80 * 24 * 3600 * 1000
    },
    {
      id: 'notif_badge_highlight_earned',
      title: 'You earned the Highlight Badge',
      message: 'Your first verse illuminated.',
      type: 'badge_earned',
      icon: 'create',
      iconColor: '#D99B38',
      badgeId: 'highlight',
      mascotKey: 'flame',
      badgeLevel: 1,
      relativeTime: '3/29/24',
      isRead: true,
      timestamp: Date.now() - 80 * 24 * 3600 * 1000
    },
    {
      id: 'notif_badge_guided_scripture',
      title: 'You earned the Guided Scripture Badge',
      message: 'Deep reflection with Apostolic companions.',
      type: 'badge_earned',
      icon: 'cloud',
      iconColor: '#4A8DB7',
      badgeId: 'guided_scripture',
      mascotKey: 'cloud',
      badgeLevel: 1,
      relativeTime: '3/25/24',
      isRead: true,
      timestamp: Date.now() - 85 * 24 * 3600 * 1000
    },
    {
      id: 'notif_friend_comment',
      title: 'Esther Kim also commented on your note:',
      message: '"Thank you 🙌"',
      type: 'friend_activity',
      icon: 'chatbubble',
      iconColor: '#10B981',
      targetParam: 'john',
      relativeTime: '9w',
      isRead: true,
      timestamp: Date.now() - 9 * 7 * 24 * 3600 * 1000
    }
  ];

  for (const bNotif of badgeNotifSeed) {
    if (!currentList.some(n => n.id === bNotif.id)) {
      await insertNotification(bNotif);
    }
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
          badge_id TEXT,
          mascot_key TEXT,
          badge_level INTEGER,
          relative_time TEXT,
          is_read INTEGER DEFAULT 0,
          timestamp INTEGER NOT NULL
        );
      `);

      try {
        await db.execAsync('ALTER TABLE notifications ADD COLUMN badge_id TEXT;');
        await db.execAsync('ALTER TABLE notifications ADD COLUMN mascot_key TEXT;');
        await db.execAsync('ALTER TABLE notifications ADD COLUMN badge_level INTEGER;');
        await db.execAsync('ALTER TABLE notifications ADD COLUMN relative_time TEXT;');
      } catch (e) {}

      const rows = await db.getAllAsync<{
        id: string;
        title: string;
        message: string;
        type: string;
        icon: string;
        icon_color: string;
        target_param: string | null;
        badge_id?: string | null;
        mascot_key?: string | null;
        badge_level?: number | null;
        relative_time?: string | null;
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
          badgeId: r.badge_id || undefined,
          mascotKey: r.mascot_key || undefined,
          badgeLevel: r.badge_level ?? undefined,
          relativeTime: r.relative_time || undefined,
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
        `INSERT OR REPLACE INTO notifications (id, title, message, type, icon, icon_color, target_param, badge_id, mascot_key, badge_level, relative_time, is_read, timestamp)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          item.id,
          item.title,
          item.message,
          item.type,
          item.icon,
          item.iconColor,
          item.targetParam || null,
          item.badgeId || null,
          item.mascotKey || null,
          item.badgeLevel ?? null,
          item.relativeTime || null,
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
