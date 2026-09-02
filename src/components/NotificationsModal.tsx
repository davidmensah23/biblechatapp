import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../theme/typography';
import { AppNotification } from '../types';
import { MascotAssets } from '../services/mascotAssets';
import { getPersonaById } from '../services/personas';
import {
  syncRealNotifications,
  markNotificationAsRead
} from '../services/notificationService';

interface NotificationsModalProps {
  visible: boolean;
  onClose: () => void;
  onOpenApostle?: (apostleId: string) => void;
  onOpenBadge?: (badgeId: string) => void;
  onOpenScripture?: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  visible,
  onClose,
  onOpenApostle,
  onOpenBadge,
  onOpenScripture
}) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    if (visible) {
      loadNotifications();
    }
  }, [visible]);

  const loadNotifications = async () => {
    const list = await syncRealNotifications();
    setNotifications(list);
  };

  const handleNotificationPress = async (item: AppNotification) => {
    await markNotificationAsRead(item.id);
    setNotifications(prev =>
      prev.map(n => (n.id === item.id ? { ...n, isRead: true } : n))
    );

    // Origin deep-linking navigation
    if ((item.badgeId || item.type === 'badge_earned' || item.type === 'badge_level_up') && onOpenBadge) {
      onClose();
      onOpenBadge(item.badgeId || 'saved_verse');
    } else if (item.type === 'daily_scripture' && onOpenScripture) {
      onClose();
      onOpenScripture();
    } else if (item.targetParam && onOpenApostle) {
      onClose();
      onOpenApostle(item.targetParam);
    } else {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Top Header Bar matching Reference Image 1 */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              onPress={onClose}
              style={styles.headerBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color="#111111" />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Notifications</Text>
          </View>

          <TouchableOpacity
            onPress={onClose}
            style={styles.headerBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.7}
          >
            <Ionicons name="settings-outline" size={22} color="#111111" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {notifications.map((item) => {
            const isBadge = Boolean(item.badgeId || item.type === 'badge_earned' || item.type === 'badge_level_up');
            const isApostle = Boolean(
              item.targetParam && ['peter', 'john', 'paul', 'thomas', 'andrew'].includes(item.targetParam)
            );

            const mascotKey = (item.mascotKey as keyof typeof MascotAssets) || 'rock';
            const mascotImg = MascotAssets[mascotKey] || MascotAssets.bread;
            const apostle = isApostle ? getPersonaById(item.targetParam!) : null;

            return (
              <TouchableOpacity
                key={item.id}
                style={styles.notificationRow}
                onPress={() => handleNotificationPress(item)}
                activeOpacity={0.75}
              >
                {/* Left Emblem Avatar */}
                <View style={styles.leftEmblemContainer}>
                  {isBadge ? (
                    <View style={[styles.badgeEmblemCircle, { borderColor: item.iconColor || '#C27A4E' }]}>
                      <Image source={mascotImg} style={styles.emblemImage} resizeMode="cover" />
                    </View>
                  ) : isApostle && apostle ? (
                    <View style={styles.apostleAvatarCircle}>
                      <Image source={apostle.avatar} style={styles.emblemImage} resizeMode="cover" />
                    </View>
                  ) : (
                    <View style={styles.genericAvatarCircle}>
                      <Text style={styles.genericAvatarText}>
                        {item.title ? item.title.charAt(0).toUpperCase() : 'E'}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Middle Text Content */}
                <View style={styles.middleTextContainer}>
                  <Text style={styles.notifTitleText} numberOfLines={2}>
                    {item.title}
                  </Text>
                  {/* Show secondary message for apostle words, comments, etc */}
                  {!isBadge && item.message ? (
                    <Text style={styles.notifMessageText} numberOfLines={1}>
                      {item.message}
                    </Text>
                  ) : null}
                </View>

                {/* Right Relative Timestamp */}
                <View style={styles.rightTimeContainer}>
                  <Text style={styles.relativeTimeText}>
                    {item.relativeTime || 'Recent'}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerBtn: {
    padding: 6,
  },
  headerTitle: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 20,
    color: '#111111',
    marginLeft: 16,
    letterSpacing: -0.3,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  notificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  leftEmblemContainer: {
    marginRight: 14,
  },
  badgeEmblemCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  apostleAvatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1.5,
    borderColor: '#E5E5EA',
    overflow: 'hidden',
    backgroundColor: '#F3F3F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  genericAvatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#E2E2E7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  genericAvatarText: {
    fontFamily: Typography.fontSansBold,
    fontSize: 16,
    color: '#111111',
  },
  emblemImage: {
    width: '100%',
    height: '100%',
  },
  middleTextContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 12,
  },
  notifTitleText: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 14.5,
    lineHeight: 20,
    color: '#111111',
  },
  notifMessageText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 13,
    lineHeight: 18,
    color: '#6B7280',
    marginTop: 2,
  },
  rightTimeContainer: {
    alignItems: 'flex-end',
  },
  relativeTimeText: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 12,
    color: '#9CA3AF',
  }
});
