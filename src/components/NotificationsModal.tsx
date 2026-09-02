import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../theme/typography';
import { AppNotification } from '../types';
import {
  syncRealNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification
} from '../services/notificationService';
import { InteractiveGestureSheet } from './InteractiveGestureSheet';

interface NotificationsModalProps {
  visible: boolean;
  onClose: () => void;
  onOpenApostle?: (apostleId: string) => void;
  onOpenScripture?: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  visible,
  onClose,
  onOpenApostle,
  onOpenScripture
}) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [dailyRemindersEnabled, setDailyRemindersEnabled] = useState(true);

  useEffect(() => {
    if (visible) {
      loadNotifications();
    }
  }, [visible]);

  const loadNotifications = async () => {
    const list = await syncRealNotifications();
    setNotifications(list);
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleNotificationPress = async (item: AppNotification) => {
    await markNotificationAsRead(item.id);
    setNotifications(prev =>
      prev.map(n => (n.id === item.id ? { ...n, isRead: true } : n))
    );

    if (item.type === 'daily_scripture' && onOpenScripture) {
      onClose();
      onOpenScripture();
    } else if (item.targetParam && onOpenApostle) {
      onClose();
      onOpenApostle(item.targetParam);
    }
  };

  const handleDeleteItem = async (id: string, e: any) => {
    e.stopPropagation();
    await deleteNotification(id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const formatTimeAgo = (timestamp: number) => {
    const diffMin = Math.floor((Date.now() - timestamp) / 60000);
    if (diffMin < 2) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  return (
    <InteractiveGestureSheet
      visible={visible}
      onClose={onClose}
      initialSnap="mid"
      midHeightRatio={0.72}
      fullHeightRatio={0.92}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="close" size={22} color="#111111" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Notifications</Text>

          <TouchableOpacity onPress={handleMarkAllRead} style={styles.markReadBtn} activeOpacity={0.7}>
            <Text style={styles.markReadText}>Mark read</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Daily Reminder Preference Card */}
          <View style={styles.reminderCard}>
            <View style={styles.reminderInfo}>
              <Text style={styles.reminderTitle}>Daily Verse Notifications</Text>
              <Text style={styles.reminderSubtitle}>Receive today's Scripture every morning at 8:00 AM</Text>
            </View>
            <Switch
              value={dailyRemindersEnabled}
              onValueChange={setDailyRemindersEnabled}
              trackColor={{ false: '#D1D5DB', true: '#111111' }}
              thumbColor="#FFFFFF"
            />
          </View>

          {/* Notifications List */}
          <Text style={styles.sectionHeading}>Recent Updates</Text>

          {notifications.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="notifications-off-outline" size={44} color="#9E9EA7" />
              <Text style={styles.emptyTitle}>You're all caught up</Text>
              <Text style={styles.emptySubtitle}>No unread notifications at the moment.</Text>
            </View>
          ) : (
            notifications.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.notificationCard, !item.isRead && styles.notificationCardUnread]}
                onPress={() => handleNotificationPress(item)}
                activeOpacity={0.75}
              >
                <View style={styles.notificationLeft}>
                  <View style={styles.iconCircle}>
                    <Ionicons
                      name={item.type === 'daily_scripture' ? 'book' : 'chatbubble-ellipses'}
                      size={18}
                      color="#111111"
                    />
                  </View>
                  {!item.isRead && <View style={styles.unreadDot} />}
                </View>

                <View style={styles.notificationContent}>
                  <Text style={styles.notificationTitle}>{item.title}</Text>
                  <Text style={styles.notificationBody} numberOfLines={2}>
                    {item.message}
                  </Text>
                  <View style={styles.notificationFooter}>
                    <Text style={styles.timeAgoText}>{formatTimeAgo(item.timestamp)}</Text>
                    <TouchableOpacity
                      onPress={(e) => handleDeleteItem(item.id, e)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      style={styles.deleteBtn}
                    >
                      <Ionicons name="trash-outline" size={14} color="#999999" />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>
    </InteractiveGestureSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F3F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E6E6EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: Typography.fontSerif,
    fontSize: 26,
    color: '#111111',
  },
  markReadBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  markReadText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 13,
    color: '#2563EB',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 40,
  },
  reminderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#DCDCE1',
    borderRadius: 20,
    padding: 18,
    marginBottom: 24,
  },
  reminderInfo: {
    flex: 1,
    marginRight: 12,
  },
  reminderTitle: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 15,
    color: '#111111',
    marginBottom: 3,
  },
  reminderSubtitle: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 12,
    color: '#666666',
    lineHeight: 16,
  },
  sectionHeading: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 17,
    color: '#111111',
    marginBottom: 12,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#DCDCE1',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
  },
  notificationCardUnread: {
    borderLeftWidth: 3.5,
    borderLeftColor: '#2563EB',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  notifTitle: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 14.5,
    color: '#111111',
  },
  timeAgoText: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 11,
    color: '#888888',
  },
  notifMessage: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 13,
    color: '#333333',
    lineHeight: 18,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  tapToChatText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 12,
    color: '#2563EB',
  },
  deleteBtn: {
    padding: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 14,
    color: '#888888',
    marginTop: 10,
  }
});
