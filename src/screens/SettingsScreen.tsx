import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../theme/typography';
import { clearChatHistory, saveUserProfile, deleteAllUserData } from '../services/database';
import { updateUserPassword, deleteUserAccount, getUserAuthProvider, updateRemoteProfile, supabase } from '../services/supabase';
import { UserProfile } from '../types';
import { CustomActionModal } from '../components/CustomActionModal';
import { InviteFriendsBanner } from '../components/InviteFriendsBanner';
import { CardStyles } from '../theme/cardStyles';

interface SettingsScreenProps {
  visible: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onLogout?: () => void;
}

interface ActionModalState {
  visible: boolean;
  type: 'signout' | 'confirm';
  title?: string;
  message?: string;
  confirmText?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  visible,
  onClose,
  userProfile,
  onUpdateProfile,
  onLogout
}) => {
  const [activeSubModal, setActiveSubModal] = useState<string | null>(null);

  // Custom in-app modal state (replacing native Alert)
  const [actionModal, setActionModal] = useState<ActionModalState>({
    visible: false,
    type: 'confirm',
    onConfirm: () => {}
  });

  // Auth provider info
  const [authInfo, setAuthInfo] = useState<{ provider: 'google' | 'email' | 'guest'; email?: string }>({ provider: 'guest' });
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Settings states
  const [fontSizeScale, setFontSizeScale] = useState<'Small' | 'Normal' | 'Large' | 'Extra Large'>('Normal');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('English (US)');
  const [dailyReminders, setDailyReminders] = useState(true);
  const [hapticFeedback, setHapticFeedback] = useState(true);
  const [audioSpeed, setAudioSpeed] = useState<'0.75x' | '1.0x' | '1.25x' | '1.5x'>('1.0x');
  const [plainLanguageMode, setPlainLanguageMode] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);

  // Profile edit draft inside settings
  const [draftProfile, setDraftProfile] = useState<UserProfile>(userProfile);

  React.useEffect(() => {
    if (visible) {
      getUserAuthProvider().then(setAuthInfo);
      setDraftProfile(userProfile);
    }
  }, [visible, userProfile]);

  const handleCloudBackup = async () => {
    setIsBackingUp(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await updateRemoteProfile(user.id, userProfile);
        setActionModal({
          visible: true,
          type: 'confirm',
          title: 'Cloud Backup Complete',
          message: 'Your profile, faith streaks, equipped Armor of God, and bookmarks are safely backed up to the cloud.',
          confirmText: 'Great',
          onConfirm: () => setActionModal(prev => ({ ...prev, visible: false }))
        });
      } else {
        setActionModal({
          visible: true,
          type: 'confirm',
          title: 'Sign In Required',
          message: 'Please sign in or create an account to back up your journey to the cloud.',
          confirmText: 'OK',
          onConfirm: () => setActionModal(prev => ({ ...prev, visible: false }))
        });
      }
    } catch (e) {
      setActionModal({
        visible: true,
        type: 'confirm',
        title: 'Backup Notice',
        message: 'Your data is securely preserved locally on your phone.',
        confirmText: 'OK',
        onConfirm: () => setActionModal(prev => ({ ...prev, visible: false }))
      });
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleSaveAccount = async () => {
    onUpdateProfile(draftProfile);
    await saveUserProfile(draftProfile);
    setActionModal({
      visible: true,
      type: 'confirm',
      title: 'Account Updated',
      message: 'Your profile settings have been saved successfully.',
      confirmText: 'Done',
      onConfirm: () => {
        setActionModal(prev => ({ ...prev, visible: false }));
        setActiveSubModal(null);
      }
    });
  };

  const handleChangePassword = async () => {
    if (!currentPassword) {
      setActionModal({
        visible: true,
        type: 'confirm',
        title: 'Current Password Required',
        message: 'Please enter your current password to verify your identity.',
        confirmText: 'OK',
        onConfirm: () => setActionModal(prev => ({ ...prev, visible: false }))
      });
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setActionModal({
        visible: true,
        type: 'confirm',
        title: 'Password Length',
        message: 'New password must be at least 6 characters.',
        confirmText: 'OK',
        onConfirm: () => setActionModal(prev => ({ ...prev, visible: false }))
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      setActionModal({
        visible: true,
        type: 'confirm',
        title: 'Password Mismatch',
        message: 'The new passwords do not match. Please re-enter.',
        confirmText: 'OK',
        onConfirm: () => setActionModal(prev => ({ ...prev, visible: false }))
      });
      return;
    }
    setPasswordLoading(true);
    try {
      const { error } = await updateUserPassword(newPassword, currentPassword);
      if (error) {
        setActionModal({
          visible: true,
          type: 'confirm',
          title: 'Update Failed',
          message: error.message,
          confirmText: 'OK',
          isDestructive: true,
          onConfirm: () => setActionModal(prev => ({ ...prev, visible: false }))
        });
      } else {
        setActionModal({
          visible: true,
          type: 'confirm',
          title: 'Password Changed',
          message: 'Your password has been changed successfully.',
          confirmText: 'Done',
          onConfirm: () => {
            setActionModal(prev => ({ ...prev, visible: false }));
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setActiveSubModal('Account');
          }
        });
      }
    } catch (e: any) {
      setActionModal({
        visible: true,
        type: 'confirm',
        title: 'Error',
        message: e?.message || 'Could not update password.',
        confirmText: 'OK',
        isDestructive: true,
        onConfirm: () => setActionModal(prev => ({ ...prev, visible: false }))
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    setActionModal({
      visible: true,
      type: 'confirm',
      title: 'Delete Account & Data',
      message: 'This will permanently delete your account, saved reflections, and conversation history. This action cannot be undone.',
      confirmText: 'Delete Permanently',
      isDestructive: true,
      onConfirm: async () => {
        setActionModal(prev => ({ ...prev, visible: false }));
        await deleteUserAccount();
        await deleteAllUserData();
        onClose();
        if (onLogout) onLogout();
      }
    });
  };

  const handleLogoutPress = () => {
    setActionModal({
      visible: true,
      type: 'signout',
      onConfirm: () => {
        setActionModal(prev => ({ ...prev, visible: false }));
        onClose();
        if (onLogout) onLogout();
      }
    });
  };

  const handleClearHistory = () => {
    setActionModal({
      visible: true,
      type: 'confirm',
      title: 'Clear All Conversations',
      message: 'This will delete all message history with all Apostles. This cannot be undone.',
      confirmText: 'Clear All History',
      isDestructive: true,
      onConfirm: async () => {
        await clearChatHistory();
        setActionModal({
          visible: true,
          type: 'confirm',
          title: 'Cleared',
          message: 'All conversation history has been cleared.',
          confirmText: 'Done',
          onConfirm: () => setActionModal(prev => ({ ...prev, visible: false }))
        });
      }
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.backdrop}>
        <SafeAreaView style={styles.sheetModal}>
          {/* Top Grab Handle */}
          <View style={styles.grabHandleWrap}>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7} style={styles.grabHandleTouch}>
              <View style={styles.grabHandle} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Chromatic Aura Invite Friends Banner */}
            <InviteFriendsBanner userName={userProfile.fullName || 'Pilgrim'} />

            {/* SECTION 1: General */}
            <Text style={styles.sectionHeading}>General</Text>
            <View style={styles.group}>
              <TouchableOpacity
                style={styles.pillRow}
                onPress={() => {
                  setDraftProfile(userProfile);
                  setActiveSubModal('Account');
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.pillText}>Account</Text>
                <Ionicons name="chevron-forward" size={18} color="#C4C4C8" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.pillRow}
                onPress={() => setActiveSubModal('Privacy')}
                activeOpacity={0.7}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="shield-checkmark-outline" size={17} color="#2563EB" style={{ marginRight: 8 }} />
                  <Text style={styles.pillText}>Privacy & Data Storage</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#C4C4C8" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.pillRow}
                onPress={() => setActiveSubModal('Appearance')}
                activeOpacity={0.7}
              >
                <Text style={styles.pillText}>Appearance</Text>
                <Ionicons name="chevron-forward" size={18} color="#C4C4C8" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.pillRow}
                onPress={() => setActiveSubModal('Audio and Visual aids')}
                activeOpacity={0.7}
              >
                <Text style={styles.pillText}>Audio and Visual aids</Text>
                <Ionicons name="chevron-forward" size={18} color="#C4C4C8" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.pillRow}
                onPress={() => setActiveSubModal('Navigations')}
                activeOpacity={0.7}
              >
                <Text style={styles.pillText}>Navigations</Text>
                <Ionicons name="chevron-forward" size={18} color="#C4C4C8" />
              </TouchableOpacity>
            </View>

            {/* SECTION 2: Chat Preferences */}
            <Text style={styles.sectionHeading}>Chat</Text>
            <View style={styles.group}>
              <TouchableOpacity
                style={styles.pillRow}
                onPress={() => setActiveSubModal('Language')}
                activeOpacity={0.7}
              >
                <Text style={styles.pillText}>Language</Text>
                <Text style={styles.subValueText}>{selectedLanguage}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.pillRow}
                onPress={() => setActiveSubModal('Accessibility')}
                activeOpacity={0.7}
              >
                <Text style={styles.pillText}>Accessibility</Text>
                <Ionicons name="chevron-forward" size={18} color="#C4C4C8" />
              </TouchableOpacity>

              <View style={styles.pillRow}>
                <View style={styles.toggleTextWrap}>
                  <Text style={styles.pillText}>Plain Language Mode</Text>
                  <Text style={styles.pillSubText}>Simpler terms for younger readers</Text>
                </View>
                <Switch
                  value={plainLanguageMode}
                  onValueChange={setPlainLanguageMode}
                  trackColor={{ false: '#E5E5EA', true: '#2563EB' }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>

            {/* SECTION 3: Notifications & Storage */}
            <Text style={styles.sectionHeading}>Preferences & Data</Text>
            <View style={styles.group}>
              <View style={styles.pillRow}>
                <Text style={styles.pillText}>Daily Scripture Reminders</Text>
                <Switch
                  value={dailyReminders}
                  onValueChange={setDailyReminders}
                  trackColor={{ false: '#E5E5EA', true: '#2563EB' }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <View style={styles.pillRow}>
                <Text style={styles.pillText}>Haptic Touch Feedback</Text>
                <Switch
                  value={hapticFeedback}
                  onValueChange={setHapticFeedback}
                  trackColor={{ false: '#E5E5EA', true: '#2563EB' }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <TouchableOpacity
                style={styles.pillRow}
                onPress={handleClearHistory}
                activeOpacity={0.7}
              >
                <Text style={[styles.pillText, { color: '#DC2626' }]}>Clear All Chat History</Text>
                <Ionicons name="trash-outline" size={18} color="#DC2626" />
              </TouchableOpacity>
            </View>

            {/* SECTION 4: About & Account Actions */}
            <Text style={styles.sectionHeading}>About & Account</Text>
            <View style={styles.group}>
              <TouchableOpacity
                style={styles.pillRow}
                onPress={() => setActiveSubModal('Documentation')}
                activeOpacity={0.7}
              >
                <Text style={styles.pillText}>Documentation & Theology</Text>
                <Ionicons name="chevron-forward" size={18} color="#C4C4C8" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.pillRow}
                onPress={handleLogoutPress}
                activeOpacity={0.7}
              >
                <Text style={[styles.pillText, { color: '#DC2626' }]}>Log Out</Text>
                <Ionicons name="log-out-outline" size={18} color="#DC2626" />
              </TouchableOpacity>
            </View>

            <View style={{ height: 40 }} />
          </ScrollView>
        </SafeAreaView>
      </View>

      {/* Privacy & Data Storage Sub-Modal */}
      <Modal visible={activeSubModal === 'Privacy'} animationType="slide" transparent={false}>
        <SafeAreaView style={styles.subModalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setActiveSubModal(null)} style={styles.modalBackBtn}>
              <Ionicons name="arrow-back" size={22} color="#111111" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Privacy & Data Storage</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView contentContainerStyle={styles.modalContent}>
            {/* Privacy Card 1: Local-First Storage */}
            <View style={styles.privacyCard}>
              <View style={styles.privacyIconWrap}>
                <Ionicons name="lock-closed" size={22} color="#2563EB" />
              </View>
              <Text style={styles.privacyCardTitle}>On-Device Private Storage</Text>
              <Text style={styles.privacyCardBody}>
                All conversations with the Apostles are stored locally in your phone's protected internal SQLite database. We do not sell, harvest, or monetize your prayers, reflections, or chats.
              </Text>
            </View>

            {/* Privacy Card 2: Cleaner App Protection */}
            <View style={styles.privacyCard}>
              <View style={styles.privacyIconWrap}>
                <Ionicons name="shield-checkmark" size={22} color="#059669" />
              </View>
              <Text style={styles.privacyCardTitle}>Protection from Cleaner Apps</Text>
              <Text style={styles.privacyCardBody}>
                Your database is stored in secure internal app memory. Android system cleaner apps (such as CCleaner, Samsung Device Care, or Xiaomi Cleaner) only wipe temporary caches and cannot delete your conversation database.
              </Text>
            </View>

            {/* Cloud Backup Action */}
            <View style={styles.backupBox}>
              <Text style={styles.backupBoxTitle}>Cloud Backup & Sync</Text>
              <Text style={styles.backupBoxBody}>
                Back up your Spiritual Level, equipped Armor of God, and bookmarks to your secure Supabase account so you can restore them on any device.
              </Text>
              <TouchableOpacity
                style={[styles.savePasswordBtn, { marginTop: 12, backgroundColor: '#2563EB' }]}
                onPress={handleCloudBackup}
                disabled={isBackingUp}
                activeOpacity={0.85}
              >
                <Text style={styles.savePasswordBtnText}>
                  {isBackingUp ? 'Backing Up...' : '☁️ Back Up Faith Journey'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Privacy Card 3: Account Deletion */}
            <View style={[styles.privacyCard, { borderColor: '#FCA5A5', backgroundColor: '#FEF2F2' }]}>
              <Text style={[styles.privacyCardTitle, { color: '#991B1B' }]}>Zero Residual Footprint</Text>
              <Text style={[styles.privacyCardBody, { color: '#B91C1C' }]}>
                If you choose to delete your account or clear app storage in phone settings, all messages, bookmarks, and cloud profiles are permanently destroyed with zero residual data.
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Sub-Modals (Account, Appearance, Audio, Language, etc.) */}
      <Modal visible={activeSubModal === 'Account'} animationType="slide" transparent={false}>
        <SafeAreaView style={styles.subModalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setActiveSubModal(null)} style={styles.modalBackBtn}>
              <Ionicons name="arrow-back" size={22} color="#111111" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Account</Text>
            <TouchableOpacity onPress={handleSaveAccount} style={styles.modalSaveBtn}>
              <Text style={styles.modalSaveBtnText}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.inputField}
                value={draftProfile.fullName}
                onChangeText={(t) => setDraftProfile({ ...draftProfile, fullName: t })}
                placeholder="Enter your name"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Spiritual Address (How Apostles greet you)</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                <TouchableOpacity
                  style={[
                    styles.optionPill,
                    draftProfile.gender === 'brother' && styles.optionPillActive
                  ]}
                  onPress={() => setDraftProfile({ ...draftProfile, gender: 'brother' })}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.optionPillText, draftProfile.gender === 'brother' && styles.optionPillTextActive]}>
                    🧔 Brother
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.optionPill,
                    draftProfile.gender === 'sister' && styles.optionPillActive
                  ]}
                  onPress={() => setDraftProfile({ ...draftProfile, gender: 'sister' })}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.optionPillText, draftProfile.gender === 'sister' && styles.optionPillTextActive]}>
                    🧕 Sister
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.optionPill,
                    (!draftProfile.gender || draftProfile.gender === 'neutral') && styles.optionPillActive
                  ]}
                  onPress={() => setDraftProfile({ ...draftProfile, gender: 'neutral' })}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.optionPillText, (!draftProfile.gender || draftProfile.gender === 'neutral') && styles.optionPillTextActive]}>
                    🕊️ Pilgrim
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.inputField}
                value={draftProfile.email}
                onChangeText={(t) => setDraftProfile({ ...draftProfile, email: t })}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Faith Bio</Text>
              <TextInput
                style={[styles.inputField, { height: 80, textAlignVertical: 'top' }]}
                value={draftProfile.bio}
                onChangeText={(t) => setDraftProfile({ ...draftProfile, bio: t })}
                multiline
                numberOfLines={3}
              />
            </View>

            {authInfo.provider === 'email' && (
              <TouchableOpacity
                style={styles.changePasswordBtn}
                onPress={() => setActiveSubModal('ChangePassword')}
                activeOpacity={0.8}
              >
                <Ionicons name="key-outline" size={16} color="#2563EB" style={{ marginRight: 6 }} />
                <Text style={styles.changePasswordBtnText}>Change Password</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.pillRow, { marginTop: 24, backgroundColor: '#FEE2E2', borderRadius: 14, padding: 14 }]}
              onPress={handleDeleteAccount}
              activeOpacity={0.8}
            >
              <Text style={[styles.pillText, { color: '#DC2626' }]}>Delete Account & Data</Text>
              <Ionicons name="trash-outline" size={18} color="#DC2626" />
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Change Password Sub-Modal */}
      <Modal visible={activeSubModal === 'ChangePassword'} animationType="slide" transparent={false}>
        <SafeAreaView style={styles.subModalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setActiveSubModal('Account')} style={styles.modalBackBtn}>
              <Ionicons name="arrow-back" size={22} color="#111111" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Change Password</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView contentContainerStyle={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Current Password</Text>
              <TextInput
                style={styles.inputField}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Enter current password"
                secureTextEntry
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>New Password</Text>
              <TextInput
                style={styles.inputField}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="At least 6 characters"
                secureTextEntry
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirm New Password</Text>
              <TextInput
                style={styles.inputField}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Re-enter new password"
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              style={[styles.savePasswordBtn, passwordLoading && styles.submitBtnDisabled]}
              onPress={handleChangePassword}
              disabled={passwordLoading}
              activeOpacity={0.85}
            >
              <Text style={styles.savePasswordBtnText}>
                {passwordLoading ? 'Updating...' : 'Update Password'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Appearance Sub-Modal */}
      <Modal visible={activeSubModal === 'Appearance'} animationType="slide" transparent={false}>
        <SafeAreaView style={styles.subModalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setActiveSubModal(null)} style={styles.modalBackBtn}>
              <Ionicons name="arrow-back" size={22} color="#111111" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Appearance</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView contentContainerStyle={styles.modalContent}>
            <Text style={styles.sectionHeading}>Scripture Reading Size</Text>
            <View style={styles.group}>
              {(['Small', 'Normal', 'Large', 'Extra Large'] as const).map((scale) => (
                <TouchableOpacity
                  key={scale}
                  style={[styles.pillRow, fontSizeScale === scale && styles.pillRowSelected]}
                  onPress={() => setFontSizeScale(scale)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.pillText, fontSizeScale === scale && styles.pillTextSelected]}>
                    {scale}
                  </Text>
                  {fontSizeScale === scale && (
                    <Ionicons name="checkmark-circle" size={20} color="#2563EB" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Language Sub-Modal */}
      <Modal visible={activeSubModal === 'Language'} animationType="slide" transparent={false}>
        <SafeAreaView style={styles.subModalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setActiveSubModal(null)} style={styles.modalBackBtn}>
              <Ionicons name="arrow-back" size={22} color="#111111" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Language</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView contentContainerStyle={styles.modalContent}>
            <View style={styles.group}>
              {['English (US)', 'Spanish (Español)', 'French (Français)', 'Portuguese (Português)', 'Twi (Akan)', 'Swahili (Kiswahili)'].map((lang) => (
                <TouchableOpacity
                  key={lang}
                  style={[styles.pillRow, selectedLanguage === lang && styles.pillRowSelected]}
                  onPress={() => {
                    setSelectedLanguage(lang);
                    setActiveSubModal(null);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.pillText, selectedLanguage === lang && styles.pillTextSelected]}>
                    {lang}
                  </Text>
                  {selectedLanguage === lang && (
                    <Ionicons name="checkmark-circle" size={20} color="#2563EB" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Documentation Sub-Modal */}
      <Modal visible={activeSubModal === 'Documentation'} animationType="slide" transparent={false}>
        <SafeAreaView style={styles.subModalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setActiveSubModal(null)} style={styles.modalBackBtn}>
              <Ionicons name="arrow-back" size={22} color="#111111" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Documentation</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView contentContainerStyle={styles.modalContent}>
            {/* 1. Theological Grounding */}
            <View style={styles.previewBox}>
              <Text style={[styles.sectionHeading, { fontSize: 15, marginBottom: 6, marginTop: 0 }]}>Theological Grounding</Text>
              <Text style={styles.previewVerse}>
                BibleChat connects you with the wisdom of the Apostles through faithful biblical scholarship and thoughtful AI conversational design. All Scripture citations are grounded in the historical biblical text.
              </Text>
            </View>

            {/* 2. AI Processing & Third-Party Disclosure (Apple 2026 AI Guideline) */}
            <View style={styles.previewBox}>
              <Text style={[styles.sectionHeading, { fontSize: 15, marginBottom: 6, marginTop: 0 }]}>AI Processing Transparency</Text>
              <Text style={styles.previewVerse}>
                Conversational companion responses are generated using secure server-side neural models. Your queries are encrypted in transit and never used to train public commercial AI models.
              </Text>
            </View>

            {/* 3. Account Deletion & 90-Day Recovery Policy (Apple Guideline 5.1.1(v)) */}
            <View style={styles.previewBox}>
              <Text style={[styles.sectionHeading, { fontSize: 15, marginBottom: 6, marginTop: 0 }]}>90-Day Account Recovery Policy</Text>
              <Text style={styles.previewVerse}>
                When you delete your account, your local chats are wiped immediately. Your cloud profile is retained in a dormant state for 90 days. If you return within 90 days, you can restore your spiritual progress via verified email OTP. After 90 days, all cloud records are permanently destroyed.
              </Text>
            </View>

            {/* 4. Terms of Service & Privacy Statement */}
            <View style={styles.previewBox}>
              <Text style={[styles.sectionHeading, { fontSize: 15, marginBottom: 6, marginTop: 0 }]}>Privacy & Terms of Service</Text>
              <Text style={styles.previewVerse}>
                By using BibleChat, you agree that this application is designed for spiritual companion reflection, bible study, and devotional growth. It does not replace professional pastoral counseling or medical care.
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Custom Action Confirmation Modal (No Native Alerts) */}
      <CustomActionModal
        visible={actionModal.visible}
        type={actionModal.type}
        title={actionModal.title}
        message={actionModal.message}
        confirmText={actionModal.confirmText}
        isDestructive={actionModal.isDestructive}
        onConfirm={actionModal.onConfirm}
        onClose={() => setActionModal(prev => ({ ...prev, visible: false }))}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheetModal: {
    backgroundColor: '#F8F8FA',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '90%',
    minHeight: '75%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 20,
  },
  grabHandleWrap: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 6,
  },
  grabHandleTouch: {
    padding: 8,
  },
  grabHandle: {
    width: 72,
    height: 3.5,
    borderRadius: 2,
    backgroundColor: '#111111',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 40,
  },
  sectionHeading: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 13,
    color: '#8E8E93',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 8,
    marginTop: 18,
    marginLeft: 4,
  },
  group: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.04)',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.03,
    shadowRadius: 14,
    elevation: 2,
  },
  pillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  pillRowSelected: {
    backgroundColor: '#EFF6FF',
  },
  pillText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 15,
    color: '#111111',
  },
  pillTextSelected: {
    color: '#2563EB',
    fontFamily: Typography.fontSansSemiBold,
  },
  subValueText: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 14,
    color: '#8E8E93',
  },
  toggleTextWrap: {
    flex: 1,
    marginRight: 10,
  },
  pillSubText: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  subModalContainer: {
    flex: 1,
    backgroundColor: '#F8F8FA',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    backgroundColor: '#FFFFFF',
  },
  modalBackBtn: {
    padding: 6,
  },
  modalTitle: {
    fontFamily: Typography.fontSerif,
    fontSize: 20,
    color: '#111111',
  },
  modalSaveBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
  },
  modalSaveBtnText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 13,
    color: '#FFFFFF',
  },
  modalContent: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 13,
    color: '#374151',
    marginBottom: 6,
  },
  inputField: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontFamily: Typography.fontSansRegular,
    fontSize: 14,
    color: '#111111',
  },
  changePasswordBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 6,
  },
  changePasswordBtnText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 13.5,
    color: '#2563EB',
  },
  savePasswordBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  savePasswordBtnText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 14.5,
    color: '#FFFFFF',
  },
  submitBtnDisabled: {
    backgroundColor: '#9CA3AF',
  },
  previewBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  previewVerse: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
  },
  privacyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  privacyIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  privacyCardTitle: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 15,
    color: '#111827',
    marginBottom: 4,
  },
  privacyCardBody: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  backupBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  backupBoxTitle: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 15,
    color: '#111827',
    marginBottom: 4,
  },
  backupBoxBody: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  optionPill: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionPillActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#16A34A',
  },
  optionPillText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 12.5,
    color: '#4B5563',
  },
  optionPillTextActive: {
    fontFamily: Typography.fontSansSemiBold,
    color: '#16A34A',
  },
});
