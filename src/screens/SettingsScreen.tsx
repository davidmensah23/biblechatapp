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
  Switch,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../theme/typography';
import { clearChatHistory, saveUserProfile } from '../services/database';
import { UserProfile } from '../types';

interface SettingsScreenProps {
  visible: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onLogout?: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  visible,
  onClose,
  userProfile,
  onUpdateProfile,
  onLogout
}) => {
  const [activeSubModal, setActiveSubModal] = useState<string | null>(null);

  // Settings states
  const [fontSizeScale, setFontSizeScale] = useState<'Small' | 'Normal' | 'Large' | 'Extra Large'>('Normal');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('English (US)');
  const [dailyReminders, setDailyReminders] = useState(true);
  const [hapticFeedback, setHapticFeedback] = useState(true);
  const [audioSpeed, setAudioSpeed] = useState<'0.75x' | '1.0x' | '1.25x' | '1.5x'>('1.0x');
  const [plainLanguageMode, setPlainLanguageMode] = useState(false);

  // Profile edit draft inside settings
  const [draftProfile, setDraftProfile] = useState<UserProfile>(userProfile);

  const handleSaveAccount = async () => {
    onUpdateProfile(draftProfile);
    await saveUserProfile(draftProfile);
    Alert.alert('Saved', 'Account changes have been saved.');
    setActiveSubModal(null);
  };

  const handleLogoutPress = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out? Your conversations will remain saved locally on this device.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: () => {
            onClose();
            if (onLogout) onLogout();
          }
        }
      ]
    );
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Clear All Conversations',
      'This will delete all message history with all Apostles. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            await clearChatHistory();
            Alert.alert('Cleared', 'All conversation history has been cleared.');
          }
        }
      ]
    );
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
            {/* SECTION 1: General */}
            <Text style={styles.sectionHeading}>General</Text>
            <View style={styles.group}>
              <TouchableOpacity
                style={styles.pillRow}
                onPress={() => {
                  setDraftProfile(userProfile);
                  setActiveSubModal('Account');
                }}
                activeOpacity={0.75}
              >
                <Text style={styles.pillText}>Account</Text>
                <Ionicons name="chevron-forward" size={18} color="#111111" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.pillRow}
                onPress={() => setActiveSubModal('Notifications')}
                activeOpacity={0.75}
              >
                <Text style={styles.pillText}>Notifications</Text>
                <Ionicons name="chevron-forward" size={18} color="#111111" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.pillRow}
                onPress={() => setActiveSubModal('Languages')}
                activeOpacity={0.75}
              >
                <Text style={styles.pillText}>Languages</Text>
                <Ionicons name="chevron-forward" size={18} color="#111111" />
              </TouchableOpacity>
            </View>

            {/* SECTION 2: Accessibility */}
            <Text style={styles.sectionHeading}>Accessibility</Text>
            <View style={styles.group}>
              <TouchableOpacity
                style={styles.pillRow}
                onPress={() => setActiveSubModal('Text and Display')}
                activeOpacity={0.75}
              >
                <Text style={styles.pillText}>Text and Display</Text>
                <Ionicons name="chevron-forward" size={18} color="#111111" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.pillRow}
                onPress={() => setActiveSubModal('Audio and Visual aids')}
                activeOpacity={0.75}
              >
                <Text style={styles.pillText}>Audio and Visual aids</Text>
                <Ionicons name="chevron-forward" size={18} color="#111111" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.pillRow}
                onPress={() => setActiveSubModal('Navigations')}
                activeOpacity={0.75}
              >
                <Text style={styles.pillText}>Navigations</Text>
                <Ionicons name="chevron-forward" size={18} color="#111111" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.pillRow}
                onPress={() => setActiveSubModal('Cognitive Support')}
                activeOpacity={0.75}
              >
                <Text style={styles.pillText}>Cognitive Support</Text>
                <Ionicons name="chevron-forward" size={18} color="#111111" />
              </TouchableOpacity>
            </View>

            {/* SECTION 3: Security */}
            <Text style={styles.sectionHeading}>Security</Text>
            <View style={styles.group}>
              <TouchableOpacity
                style={styles.pillRow}
                onPress={() => setActiveSubModal('Devices')}
                activeOpacity={0.75}
              >
                <Text style={styles.pillText}>Devices</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.pillRow}
                onPress={() => setActiveSubModal('Privacy')}
                activeOpacity={0.75}
              >
                <Text style={styles.pillText}>Privacy</Text>
                <Ionicons name="chevron-forward" size={18} color="#111111" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.pillRow}
                onPress={() => setActiveSubModal('Documentation')}
                activeOpacity={0.75}
              >
                <Text style={styles.pillText}>Documentation</Text>
              </TouchableOpacity>
            </View>

            {/* LOG OUT BUTTON (Soft Red/Salmon Pill) */}
            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={handleLogoutPress}
              activeOpacity={0.8}
            >
              <Text style={styles.logoutBtnText}>Log out</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </View>

      {/* ========================================================================= */}
      {/* FUNCTIONAL SUB-MODALS */}
      {/* ========================================================================= */}

      {/* 1. Account Modal */}
      <Modal visible={activeSubModal === 'Account'} animationType="slide" transparent={false}>
        <SafeAreaView style={styles.subModalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setActiveSubModal(null)} style={styles.modalBackBtn}>
              <Ionicons name="arrow-back" size={22} color="#111111" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Account</Text>
            <TouchableOpacity onPress={handleSaveAccount} style={styles.modalSaveBtn}>
              <Text style={styles.modalSaveText}>Save</Text>
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
              <Text style={styles.inputLabel}>Email Address</Text>
              <TextInput
                style={styles.inputField}
                value={draftProfile.email}
                onChangeText={(t) => setDraftProfile({ ...draftProfile, email: t })}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Location</Text>
              <TextInput
                style={styles.inputField}
                value={draftProfile.location}
                onChangeText={(t) => setDraftProfile({ ...draftProfile, location: t })}
                placeholder="City, Country"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Faith Journey & Background Note</Text>
              <TextInput
                style={[styles.inputField, styles.inputTextArea]}
                value={draftProfile.bio}
                onChangeText={(t) => setDraftProfile({ ...draftProfile, bio: t })}
                multiline
                numberOfLines={3}
                placeholder="Tell the Apostles about your walk..."
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* 2. Notifications Modal */}
      <Modal visible={activeSubModal === 'Notifications'} animationType="slide" transparent={false}>
        <SafeAreaView style={styles.subModalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setActiveSubModal(null)} style={styles.modalBackBtn}>
              <Ionicons name="arrow-back" size={22} color="#111111" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Notifications</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView contentContainerStyle={styles.modalContent}>
            <View style={styles.settingCard}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Daily Scripture Verse</Text>
                <Text style={styles.settingSubtitle}>Receive today's verse each morning at 8:00 AM</Text>
              </View>
              <Switch
                value={dailyReminders}
                onValueChange={setDailyReminders}
                trackColor={{ false: '#D1D5DB', true: '#2563EB' }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.settingCard}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Apostolic Words of Encouragement</Text>
                <Text style={styles.settingSubtitle}>Spiritual reflections from the Apostles</Text>
              </View>
              <Switch
                value={true}
                onValueChange={() => {}}
                trackColor={{ false: '#D1D5DB', true: '#2563EB' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* 3. Languages Modal */}
      <Modal visible={activeSubModal === 'Languages'} animationType="slide" transparent={false}>
        <SafeAreaView style={styles.subModalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setActiveSubModal(null)} style={styles.modalBackBtn}>
              <Ionicons name="arrow-back" size={22} color="#111111" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Languages</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView contentContainerStyle={styles.modalContent}>
            {[
              'English (US)',
              'English (UK)',
              'Español (Spanish)',
              'Français (French)',
              'Português (Portuguese)',
              'Deutsch (German)',
              'Tagalog (Filipino)',
              'Kiswahili (Swahili)'
            ].map((lang) => (
              <TouchableOpacity
                key={lang}
                style={[styles.pillRow, selectedLanguage === lang && styles.pillRowSelected]}
                onPress={() => {
                  setSelectedLanguage(lang);
                  Alert.alert('Language Set', `App language set to ${lang}`);
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
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* 4. Text and Display Modal */}
      <Modal visible={activeSubModal === 'Text and Display'} animationType="slide" transparent={false}>
        <SafeAreaView style={styles.subModalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setActiveSubModal(null)} style={styles.modalBackBtn}>
              <Ionicons name="arrow-back" size={22} color="#111111" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Text and Display</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView contentContainerStyle={styles.modalContent}>
            <Text style={styles.sectionHeading}>App Font Scaling</Text>
            <View style={styles.group}>
              {(['Small', 'Normal', 'Large', 'Extra Large'] as const).map((scale) => (
                <TouchableOpacity
                  key={scale}
                  style={[styles.pillRow, fontSizeScale === scale && styles.pillRowSelected]}
                  onPress={() => setFontSizeScale(scale)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.pillText, fontSizeScale === scale && styles.pillTextSelected]}>
                    {scale} {scale === 'Normal' ? '(Recommended)' : ''}
                  </Text>
                  {fontSizeScale === scale && (
                    <Ionicons name="checkmark-circle" size={20} color="#2563EB" />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.sectionHeading, { marginTop: 18 }]}>Live Preview</Text>
            <View style={styles.previewBox}>
              <Text
                style={[
                  styles.previewVerse,
                  fontSizeScale === 'Small' && { fontSize: 13, lineHeight: 19 },
                  fontSizeScale === 'Normal' && { fontSize: 15.5, lineHeight: 23 },
                  fontSizeScale === 'Large' && { fontSize: 18, lineHeight: 26 },
                  fontSizeScale === 'Extra Large' && { fontSize: 21, lineHeight: 30 }
                ]}
              >
                "Cast all your anxiety on him because he cares for you."
              </Text>
              <Text style={styles.previewReference}>— 1 Peter 5:7</Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* 5. Audio and Visual Aids Modal */}
      <Modal visible={activeSubModal === 'Audio and Visual aids'} animationType="slide" transparent={false}>
        <SafeAreaView style={styles.subModalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setActiveSubModal(null)} style={styles.modalBackBtn}>
              <Ionicons name="arrow-back" size={22} color="#111111" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Audio & Visual</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView contentContainerStyle={styles.modalContent}>
            <Text style={styles.sectionHeading}>Apostle Speech Pace</Text>
            <View style={styles.group}>
              {(['0.75x', '1.0x', '1.25x', '1.5x'] as const).map((spd) => (
                <TouchableOpacity
                  key={spd}
                  style={[styles.pillRow, audioSpeed === spd && styles.pillRowSelected]}
                  onPress={() => setAudioSpeed(spd)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.pillText, audioSpeed === spd && styles.pillTextSelected]}>
                    {spd} {spd === '1.0x' ? '(Natural Pace)' : ''}
                  </Text>
                  {audioSpeed === spd && (
                    <Ionicons name="checkmark-circle" size={20} color="#2563EB" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* 6. Navigations Modal */}
      <Modal visible={activeSubModal === 'Navigations'} animationType="slide" transparent={false}>
        <SafeAreaView style={styles.subModalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setActiveSubModal(null)} style={styles.modalBackBtn}>
              <Ionicons name="arrow-back" size={22} color="#111111" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Navigations</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView contentContainerStyle={styles.modalContent}>
            <View style={styles.settingCard}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Haptic Touch Feedback</Text>
                <Text style={styles.settingSubtitle}>Gentle vibrations when tapping tabs and buttons</Text>
              </View>
              <Switch
                value={hapticFeedback}
                onValueChange={setHapticFeedback}
                trackColor={{ false: '#D1D5DB', true: '#2563EB' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* 7. Cognitive Support Modal */}
      <Modal visible={activeSubModal === 'Cognitive Support'} animationType="slide" transparent={false}>
        <SafeAreaView style={styles.subModalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setActiveSubModal(null)} style={styles.modalBackBtn}>
              <Ionicons name="arrow-back" size={22} color="#111111" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Cognitive Support</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView contentContainerStyle={styles.modalContent}>
            <View style={styles.settingCard}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Plain Language Explanations</Text>
                <Text style={styles.settingSubtitle}>Simplifies complex ancient theological concepts</Text>
              </View>
              <Switch
                value={plainLanguageMode}
                onValueChange={setPlainLanguageMode}
                trackColor={{ false: '#D1D5DB', true: '#2563EB' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* 8. Devices Modal */}
      <Modal visible={activeSubModal === 'Devices'} animationType="slide" transparent={false}>
        <SafeAreaView style={styles.subModalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setActiveSubModal(null)} style={styles.modalBackBtn}>
              <Ionicons name="arrow-back" size={22} color="#111111" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Devices</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView contentContainerStyle={styles.modalContent}>
            <View style={styles.pillRow}>
              <View>
                <Text style={styles.pillText}>Current Mobile Device</Text>
                <Text style={{ fontSize: 12, color: '#777', marginTop: 2 }}>Android • App Build v1.0.0</Text>
              </View>
              <Text style={{ fontSize: 13, color: '#059669', fontFamily: Typography.fontSansMedium }}>Active</Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* 9. Privacy Modal */}
      <Modal visible={activeSubModal === 'Privacy'} animationType="slide" transparent={false}>
        <SafeAreaView style={styles.subModalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setActiveSubModal(null)} style={styles.modalBackBtn}>
              <Ionicons name="arrow-back" size={22} color="#111111" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Privacy & Data</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView contentContainerStyle={styles.modalContent}>
            <TouchableOpacity
              style={[styles.pillRow, { backgroundColor: '#FEE2E2', marginBottom: 16 }]}
              onPress={handleClearHistory}
              activeOpacity={0.7}
            >
              <Text style={[styles.pillText, { color: '#DC2626' }]}>Clear All Chat History</Text>
              <Ionicons name="trash-outline" size={18} color="#DC2626" />
            </TouchableOpacity>

            <View style={styles.previewBox}>
              <Text style={styles.previewVerse}>
                Your conversations with the Apostles are stored locally in your private SQLite database on this device. We never sell your personal data.
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* 10. Documentation Modal */}
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
            <View style={styles.previewBox}>
              <Text style={[styles.sectionHeading, { fontSize: 16, marginBottom: 8 }]}>Theological Grounding</Text>
              <Text style={styles.previewVerse}>
                BibleChat connects you with the wisdom of the Apostles through faithful biblical scholarship and thoughtful AI conversational design. All Scripture references are grounded in the historical biblical text.
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
    fontSize: 13.5,
    color: '#111111',
    marginTop: 14,
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  group: {
    gap: 8,
    marginBottom: 8,
  },
  pillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#DCDCE1',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  pillRowSelected: {
    borderWidth: 1.5,
    borderColor: '#2563EB',
    backgroundColor: '#EBF1FE',
  },
  pillText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 14.5,
    color: '#111111',
  },
  pillTextSelected: {
    color: '#2563EB',
    fontFamily: Typography.fontSansSemiBold,
  },
  logoutBtn: {
    backgroundColor: '#EAA9A9',
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    marginBottom: 20,
  },
  logoutBtnText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 15,
    color: '#111111',
  },
  subModalContainer: {
    flex: 1,
    backgroundColor: '#F3F3F5',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  modalBackBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E6E6EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontFamily: Typography.fontSerif,
    fontSize: 26,
    color: '#111111',
  },
  modalSaveBtn: {
    backgroundColor: '#111111',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
  },
  modalSaveText: {
    color: '#FFFFFF',
    fontFamily: Typography.fontSansMedium,
    fontSize: 13.5,
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    gap: 12,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 13,
    color: '#444444',
    marginBottom: 6,
  },
  inputField: {
    backgroundColor: '#DCDCE1',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontFamily: Typography.fontSansRegular,
    fontSize: 15,
    color: '#111111',
  },
  inputTextArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  settingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#DCDCE1',
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
  },
  settingInfo: {
    flex: 1,
    marginRight: 12,
  },
  settingTitle: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 14.5,
    color: '#111111',
    marginBottom: 3,
  },
  settingSubtitle: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 12,
    color: '#666666',
    lineHeight: 16,
  },
  previewBox: {
    backgroundColor: '#DCDCE1',
    borderRadius: 16,
    padding: 18,
  },
  previewVerse: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 15,
    color: '#111111',
    lineHeight: 22,
  },
  previewReference: {
    fontFamily: Typography.fontSerifItalic,
    fontSize: 14,
    color: '#284682',
    marginTop: 8,
  }
});
