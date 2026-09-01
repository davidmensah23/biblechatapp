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

    // 3. Schedule Recurring Morning Scripture Devotion (7:30 AM)
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '☀️ Daily Morning Bread',
          body: '“Trust in the LORD with all your heart...” Open today\'s Scripture & reflect with Peter.',
          data: { type: 'daily_scripture' },
          sound: true,
          badge: 1
        },
        trigger: {
          hour: 7,
          minute: 30,
          repeats: true,
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
