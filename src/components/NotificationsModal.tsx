import React, { useState } from 'react';
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
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';

interface NotificationsModalProps {
  visible: boolean;
  onClose: () => void;
}

interface NotificationItem {
  id: string;
  icon: string;
  iconColor: string;
  title: string;
  message: string;
  timeAgo: string;
  isUnread: boolean;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: '1',
    icon: 'sunny',
    iconColor: '#F59E0B',
    title: 'Daily Scripture is Ready',
    message: '"Let the wise listen and add to their learning..." — Proverbs 1:5',
    timeAgo: '2h ago',
    isUnread: true,
  },
  {
    id: '2',
    icon: 'flame',
    iconColor: '#EF4444',
    title: '3-Day Faith Streak!',
    message: 'You have been reflecting with the Apostles 3 days in a row. Keep walking in faith!',
    timeAgo: '1d ago',
    isUnread: false,
  },
  {
    id: '3',
    icon: 'chatbubble-ellipses',
    iconColor: '#3B82F6',
    title: 'Simon Peter’s Word of Grace',
    message: 'Remember: Christ restores us even when we stumble. Cast all your anxiety on Him.',
    timeAgo: '2d ago',
    isUnread: false,
  }
];

export const NotificationsModal: React.FC<NotificationsModalProps> = ({ visible, onClose }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [dailyRemindersEnabled, setDailyRemindersEnabled] = useState(true);

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isUnread: false })));
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
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
              trackColor={{ false: '#D1D5DB', true: '#2563EB' }}
              thumbColor="#FFFFFF"
            />
          </View>

          {/* Notifications List */}
          <Text style={styles.sectionHeading}>Recent</Text>

          {notifications.map((item) => (
            <View key={item.id} style={[styles.notificationCard, item.isUnread && styles.notificationCardUnread]}>
              <View style={[styles.iconContainer, { backgroundColor: `${item.iconColor}15` }]}>
                <Ionicons name={item.icon as any} size={20} color={item.iconColor} />
              </View>

              <View style={styles.textContainer}>
                <View style={styles.titleRow}>
                  <Text style={styles.notifTitle}>{item.title}</Text>
                  <Text style={styles.timeAgoText}>{item.timeAgo}</Text>
                </View>
                <Text style={styles.notifMessage}>{item.message}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.cardSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: Typography.fontSerif,
    fontSize: 26,
    color: Colors.textPrimary,
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
    backgroundColor: Colors.cardSecondary,
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
    color: Colors.textPrimary,
    marginBottom: 3,
  },
  reminderSubtitle: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 16,
  },
  sectionHeading: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 17,
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.cardSecondary,
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
    color: Colors.textPrimary,
  },
  timeAgoText: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 11,
    color: Colors.textLight,
  },
  notifMessage: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  }
});
