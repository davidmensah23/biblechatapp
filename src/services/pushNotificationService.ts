import { Platform } from 'react-native';

let Notifications: any = null;
try {
  Notifications = require('expo-notifications');
  if (Notifications && Notifications.setNotificationHandler) {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true
      }),
    });
  }
} catch (e) {}

/**
 * Initializes Android Notification Channels & Schedules Daily Faith Reminders
 */
export const initializePushNotifications = async (): Promise<boolean> => {
  if (!Notifications) return false;

  try {
    // 1. Request OS Notification Permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Notification permission not granted');
      return false;
    }

    // 2. Android Notification Channels
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('daily-devotion', {
        name: 'Daily Scripture & Apostle Word',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#2563EB',
        sound: 'default'
      });

      await Notifications.setNotificationChannelAsync('faith-streaks', {
        name: 'Streaks & Milestones',
        importance: Notifications.AndroidImportance.HIGH,
        lightColor: '#F59E0B',
        sound: 'default'
      });
    }

    // 3. Schedule 3-Moment Daily Rhythm: Morning (5:30 AM), Midday (12:30 PM), Evening (6:00 PM)
    try {
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      const existingIds = new Set((scheduled || []).map((n: any) => n.identifier));

      const hasMorning = existingIds.has('daily_prayer_morning');
      const hasMidday = existingIds.has('daily_prayer_midday');
      const hasEvening = existingIds.has('daily_prayer_evening');

      // If all three daily prayers are already scheduled, keep them active without churn
      if (hasMorning && hasMidday && hasEvening) {
        return true;
      }

      // Cancel any legacy or malformed notifications
      await Notifications.cancelAllScheduledNotificationsAsync();

      const dailyTriggerType = Notifications.SchedulableTriggerInputTypes?.DAILY || 'daily';

      // 🌅 Early Morning Prayer (5:30 AM)
      await Notifications.scheduleNotificationAsync({
        identifier: 'daily_prayer_morning',
        content: {
          title: '🌅 Morning Prayer',
          body: 'Start your day with peace. Tap for your 2-minute morning prayer.',
          data: { type: 'daily_prayer', period: 'morning' },
          sound: 'default',
          badge: 1
        },
        trigger: {
          type: dailyTriggerType,
          hour: 5,
          minute: 30,
          channelId: 'daily-devotion'
        } as any
      });

      // ☀️ Midday Pause with God (12:30 PM)
      await Notifications.scheduleNotificationAsync({
        identifier: 'daily_prayer_midday',
        content: {
          title: '☀️ Midday Pause with God',
          body: 'Take a 60-second breather. God is with you in the middle of your busy day.',
          data: { type: 'daily_prayer', period: 'midday' },
          sound: 'default',
          badge: 1
        },
        trigger: {
          type: dailyTriggerType,
          hour: 12,
          minute: 30,
          channelId: 'daily-devotion'
        } as any
      });

      // 🌙 Evening Prayer & Rest (6:00 PM)
      await Notifications.scheduleNotificationAsync({
        identifier: 'daily_prayer_evening',
        content: {
          title: '🌙 Evening Prayer & Rest',
          body: 'Unwind and let go of today\'s worries. Rest in God\'s peace tonight.',
          data: { type: 'daily_prayer', period: 'evening' },
          sound: 'default',
          badge: 1
        },
        trigger: {
          type: dailyTriggerType,
          hour: 18,
          minute: 0,
          channelId: 'daily-devotion'
        } as any
      });
    } catch (e) {}

    return true;
  } catch (e) {
    console.warn('Push notification initialization error:', e);
    return false;
  }
};

/**
 * Triggers a real, native OS push notification immediately
 */
export const triggerInstantMilestonePush = async (
  title: string,
  body: string,
  data: Record<string, any> = {}
) => {
  if (!Notifications) return;

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
        badge: 1
      },
      trigger: null // null triggers immediately in the OS notification tray
    });
  } catch (e) {
    console.warn('Instant push trigger error:', e);
  }
};
