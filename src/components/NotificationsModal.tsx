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
import { Typography } from '../theme/typography';
import { getTodayScripture } from '../services/dailyScriptures';
import { getTodayApostleQuotation } from '../services/apostleQuotations';

interface NotificationsModalProps {
  visible: boolean;
  onClose: () => void;
  onOpenApostle?: (apostleId: string) => void;
}

interface NotificationItem {
  id: string;
  icon: string;
  iconColor: string;
  title: string;
  message: string;
  timeAgo: string;
  isUnread: boolean;
  apostleId?: string;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({ visible, onClose, onOpenApostle }) => {
  const todayScripture = getTodayScripture();
  const todayApostle = getTodayApostleQuotation();

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif_scripture',
      icon: 'sunny',
      iconColor: '#F59E0B',
      title: 'Daily Scripture is Ready',
      message: `"${todayScripture.quote}" — ${todayScripture.reference}`,
      timeAgo: 'Just now',
      isUnread: true,
    },
    {
      id: 'notif_apostle',
      icon: 'chatbubble-ellipses',
      iconColor: '#3B82F6',
      title: `${todayApostle.apostleName} sent a Word of Grace`,
      message: `"${todayApostle.quote.substring(0, 110)}..."`,
      timeAgo: '1h ago',
      isUnread: true,
      apostleId: todayApostle.apostleId
    },
    {
      id: 'notif_streak',
      icon: 'flame',
      iconColor: '#EF4444',
      title: 'Faith Journey Active',
      message: 'You have been reflecting with the Apostles. Keep abiding in the Word today!',
      timeAgo: '1d ago',
      isUnread: false,
    }
  ]);
  const [dailyRemindersEnabled, setDailyRemindersEnabled] = useState(true);

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isUnread: false })));
  };

  const handleNotificationPress = (item: NotificationItem) => {
    if (item.apostleId && onOpenApostle) {
      onClose();
      onOpenApostle(item.apostleId);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={22} color="#111111" />
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
          <Text style={styles.sectionHeading}>Today's Updates</Text>

          {notifications.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.notificationCard, item.isUnread && styles.notificationCardUnread]}
              onPress={() => handleNotificationPress(item)}
              activeOpacity={item.apostleId ? 0.75 : 1}
            >
              <View style={[styles.iconContainer, { backgroundColor: `${item.iconColor}15` }]}>
                <Ionicons name={item.icon as any} size={20} color={item.iconColor} />
              </View>

              <View style={styles.textContainer}>
                <View style={styles.titleRow}>
                  <Text style={styles.notifTitle}>{item.title}</Text>
                  <Text style={styles.timeAgoText}>{item.timeAgo}</Text>
                </View>
                <Text style={styles.notifMessage}>{item.message}</Text>
                {item.apostleId && (
                  <Text style={styles.tapToChatText}>Tap to reply in chat $\rightarrow$</Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    </Modal>
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
  tapToChatText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 12,
    color: '#2563EB',
    marginTop: 6,
  }
});
