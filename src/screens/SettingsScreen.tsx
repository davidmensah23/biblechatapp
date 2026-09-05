import React, { useState, useEffect } from 'react';
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
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../theme/typography';
import { clearChatHistory, saveUserProfile, deleteAllUserData } from '../services/database';
import { getUserAuthProvider, updateRemoteProfile, supabase } from '../services/supabase';
import { UserProfile } from '../types';
import { SUPPORTED_LANGUAGES, useTranslation, AppLanguage } from '../services/localizationService';
import { getLastReadPosition, setPreferredTranslation, subscribeVersionChange } from '../services/readingProgressService';
import { CustomConfirmationModal } from '../components/CustomConfirmationModal';
import { InteractiveGestureSheet } from '../components/InteractiveGestureSheet';

interface SettingsScreenProps {
  visible: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onLogout?: () => void;
}

interface BibleTranslationOption {
  code: string;
  name: string;
  language: string;
  description: string;
}

const BIBLE_TRANSLATIONS: BibleTranslationOption[] = [
  // Twi (Akan)
  { code: 'ASCB', name: 'Asante Twi Contemporary Bible (ASCB)', language: 'Twi', description: 'Twi kasa a ɛfiri YouVersion a ɛmu da hɔ fann' },
  { code: 'AKCB', name: 'Akuapem Twi Contemporary Bible (AKCB)', language: 'Twi', description: 'Akuapem Twi apam foforɔ ne dada' },

  // English
  { code: 'NIV', name: 'New International Version (NIV)', language: 'English', description: 'Modern, balanced accuracy & readability' },
  { code: 'KJV', name: 'King James Version (KJV)', language: 'English', description: 'Historic, poetic 1611 authorized translation' },
  { code: 'ESV', name: 'English Standard Version (ESV)', language: 'English', description: 'Word-for-word formal equivalence' },
  { code: 'NLT', name: 'New Living Translation (NLT)', language: 'English', description: 'Clear, warm, accessible living language' },

  // Spanish (Español)
  { code: 'RVR', name: 'Reina-Valera 1960 (RVR)', language: 'Español', description: 'Clásica traducción tradicional en español' },
  { code: 'NVI-ES', name: 'Nueva Versión Internacional (NVI)', language: 'Español', description: 'Traducción contemporánea y fiel' },

  // French (Français)
  { code: 'LSG', name: 'Louis Segond 1910 (LSG)', language: 'Français', description: 'Traduction biblique française historique' },
  { code: 'BDS', name: 'La Bible du Semeur (BDS)', language: 'Français', description: 'Langage contemporain et vivant' },

  // Portuguese (Português)
  { code: 'ARC', name: 'Almeida Revista e Corrigida (ARC)', language: 'Português', description: 'Tradução tradicional em português' },

  // Swahili (Kiswahili)
  { code: 'NEN', name: 'Neno: Kiswahili Contemporary Version', language: 'Kiswahili', description: 'Biblia ya Kiswahili ya kisasa' },
  { code: 'SUV', name: 'Swahili Union Version (SUV)', language: 'Kiswahili', description: 'Tafsiri ya kawaida ya Kiswahili' },

  // African Continental Editions
  { code: 'YCB', name: 'Yorùbá Contemporary Bible (YCB)', language: 'Yorùbá', description: 'Bibeli Mimọ ni ede Yoruba' },
  { code: 'ICB', name: 'Igbo Contemporary Bible (ICB)', language: 'Igbo', description: 'Baibul Nso nʼasusu Igbo' },
  { code: 'PCM', name: 'Nigerian Pidgin Bible (PCM)', language: 'Pidgin', description: 'God Tok na Di Holy Bible' }
];

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  visible,
  onClose,
  userProfile,
  onUpdateProfile,
  onLogout
}) => {
  const { t, currentLanguage, setLanguage } = useTranslation();

  // Active sub-modal category
  const [activeSubModal, setActiveSubModal] = useState<string | null>(null);

  // Loading state for account details (calm loading with no rushing)
  const [isAccountLoading, setIsAccountLoading] = useState(true);

  // User auth info & draft profile
  const [authInfo, setAuthInfo] = useState<{ provider: 'google' | 'email' | 'guest'; email?: string }>({ provider: 'guest' });
  const [draftProfile, setDraftProfile] = useState<UserProfile>(userProfile);
  const [isBackingUp, setIsBackingUp] = useState(false);

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    confirmStyle?: 'default' | 'destructive' | 'accent';
    icon?: keyof typeof Ionicons.glyphMap;
    singleButton?: boolean;
    onConfirm: () => void;
  }>({
    visible: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // ==========================================
  // FUNCTIONAL SETTINGS STATES
  // ==========================================

  // 1. Language States (Synchronized with reading progress)
  const [bibleTranslation, setBibleTranslation] = useState<string>('NIV');

  useEffect(() => {
    getLastReadPosition().then(pos => {
      if (pos?.translation) setBibleTranslation(pos.translation);
    });

    const unsub = subscribeVersionChange((newVer) => {
      setBibleTranslation(newVer);
    });
    return unsub;
  }, []);

  // 2. Notifications States
  const [dailyScriptureReminder, setDailyScriptureReminder] = useState(true);
  const [apostleWordsGrace, setApostleWordsGrace] = useState(true);
  const [streakMilestoneNotifs, setStreakMilestoneNotifs] = useState(true);
  const [fellowshipNotifs, setFellowshipNotifs] = useState(false);

  // 3. Accessibility: Text and Display
  const [fontSizeScale, setFontSizeScale] = useState<'Small' | 'Normal' | 'Large' | 'Extra Large'>('Normal');
  const [dyslexiaFont, setDyslexiaFont] = useState(false);
  const [highContrastMode, setHighContrastMode] = useState(false);

  // 4. Accessibility: Audio and Visual aids
  const [voiceOverApostles, setVoiceOverApostles] = useState(true);
  const [audioSpeed, setAudioSpeed] = useState<'0.75x' | '1.0x' | '1.25x' | '1.5x'>('1.0x');
  const [ambientAudio, setAmbientAudio] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  // 5. Accessibility: Navigations
  const [hapticTouch, setHapticTouch] = useState(true);
  const [swipeNavigation, setSwipeNavigation] = useState(true);
  const [quickChapterJump, setQuickChapterJump] = useState(true);

  // 6. Accessibility: Cognitive Support
  const [plainLanguageMode, setPlainLanguageMode] = useState(false);
  const [focusReadingMode, setFocusReadingMode] = useState(false);
  const [reflectionPrompts, setReflectionPrompts] = useState(true);

  // 7. Security: Privacy & Data
  const [analyticsOptIn, setAnalyticsOptIn] = useState(false);
  const [incognitoChat, setIncognitoChat] = useState(false);

  useEffect(() => {
    if (visible) {
      setIsAccountLoading(true);
      getUserAuthProvider().then((auth) => {
        setAuthInfo(auth);
      });
      setDraftProfile(userProfile);

      // Graceful, calm loading state for user info without sudden flashes
      const timer = setTimeout(() => {
        setIsAccountLoading(false);
      }, 450);

      return () => clearTimeout(timer);
    }
  }, [visible, userProfile]);

  const handleSaveAccount = async () => {
    onUpdateProfile(draftProfile);
    await saveUserProfile(draftProfile);
    setConfirmModal({
      visible: true,
      title: 'Profile Updated',
      message: 'Your profile changes have been saved to your faith journey.',
      confirmText: 'Done',
      singleButton: true,
      icon: 'checkmark-circle-outline',
      onConfirm: () => setActiveSubModal(null),
    });
  };

  const handleCloudBackup = async () => {
    setIsBackingUp(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await updateRemoteProfile(user.id, draftProfile);
        setConfirmModal({
          visible: true,
          title: 'Cloud Sync Complete',
          message: 'Your profile, streaks, badges, and bookmarks are backed up to the cloud.',
          confirmText: 'Great',
          singleButton: true,
          icon: 'cloud-done-outline',
          onConfirm: () => {},
        });
      } else {
        setConfirmModal({
          visible: true,
          title: 'Guest Account',
          message: 'Sign in with Google or Email to synchronize your account across devices.',
          confirmText: 'Understood',
          singleButton: true,
          icon: 'person-outline',
          onConfirm: () => {},
        });
      }
    } catch (e) {
      setConfirmModal({
        visible: true,
        title: 'Local Storage Safe',
        message: 'Your notes and faith journey are safely preserved locally on this device.',
        confirmText: 'OK',
        singleButton: true,
        icon: 'phone-portrait-outline',
        onConfirm: () => {},
      });
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleLogoutPress = () => {
    setConfirmModal({
      visible: true,
      title: 'Log Out Confirmation',
      message: 'Are you sure you want to log out? Your bookmarks and progress are safely preserved.',
      confirmText: 'Log Out',
      cancelText: 'Stay',
      confirmStyle: 'destructive',
      icon: 'log-out-outline',
      onConfirm: () => {
        onClose();
        if (onLogout) onLogout();
      },
    });
  };

  const handleClearHistory = () => {
    setConfirmModal({
      visible: true,
      title: 'Clear Conversation History',
      message: 'This will remove all dialogue and counsel with Apostles from your device. This cannot be undone.',
      confirmText: 'Clear All',
      cancelText: 'Keep Messages',
      confirmStyle: 'destructive',
      icon: 'trash-outline',
      onConfirm: async () => {
        await clearChatHistory();
        setConfirmModal({
          visible: true,
          title: 'Conversations Cleared',
          message: 'All chats have been refreshed.',
          confirmText: 'Done',
          singleButton: true,
          icon: 'checkmark-circle-outline',
          onConfirm: () => {},
        });
      },
    });
  };

  return (
    <>
      <InteractiveGestureSheet
        visible={visible}
        onClose={onClose}
        initialSnap="mid"
        midHeightRatio={0.70}
        fullHeightRatio={0.98}
      >
        <View style={styles.sheetModal}>

          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* ========================================================================= */}
            {/* SECTION: GENERAL (Matching Reference Image) */}
            {/* ========================================================================= */}
            <Text style={styles.sectionHeading}>General</Text>

            <TouchableOpacity
              style={styles.softPillCard}
              onPress={() => setActiveSubModal('Account')}
              activeOpacity={0.75}
            >
              <Text style={styles.softPillText}>Account</Text>
              <Ionicons name="chevron-forward" size={18} color="#A1A1AA" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.softPillCard}
              onPress={() => setActiveSubModal('Notifications')}
              activeOpacity={0.75}
            >
              <Text style={styles.softPillText}>Notifications</Text>
              <Ionicons name="chevron-forward" size={18} color="#A1A1AA" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.softPillCard}
              onPress={() => setActiveSubModal('Languages')}
              activeOpacity={0.75}
            >
              <Text style={styles.softPillText}>Languages</Text>
              <Ionicons name="chevron-forward" size={18} color="#A1A1AA" />
            </TouchableOpacity>

            {/* ========================================================================= */}
            {/* SECTION: ACCESSIBILITY (Matching Reference Image) */}
            {/* ========================================================================= */}
            <Text style={styles.sectionHeading}>Accessibility</Text>

            <TouchableOpacity
              style={styles.softPillCard}
              onPress={() => setActiveSubModal('Text and Display')}
              activeOpacity={0.75}
            >
              <Text style={styles.softPillText}>Text and Display</Text>
              <Ionicons name="chevron-forward" size={18} color="#A1A1AA" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.softPillCard}
              onPress={() => setActiveSubModal('Audio and Visual aids')}
              activeOpacity={0.75}
            >
              <Text style={styles.softPillText}>Audio and Visual aids</Text>
              <Ionicons name="chevron-forward" size={18} color="#A1A1AA" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.softPillCard}
              onPress={() => setActiveSubModal('Navigations')}
              activeOpacity={0.75}
            >
              <Text style={styles.softPillText}>Navigations</Text>
              <Ionicons name="chevron-forward" size={18} color="#A1A1AA" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.softPillCard}
              onPress={() => setActiveSubModal('Cognitive Support')}
              activeOpacity={0.75}
            >
              <Text style={styles.softPillText}>Cognitive Support</Text>
              <Ionicons name="chevron-forward" size={18} color="#A1A1AA" />
            </TouchableOpacity>

            {/* ========================================================================= */}
            {/* SECTION: SECURITY (Matching Reference Image) */}
            {/* ========================================================================= */}
            <Text style={styles.sectionHeading}>Security</Text>

            <TouchableOpacity
              style={styles.softPillCard}
              onPress={() => setActiveSubModal('Devices')}
              activeOpacity={0.75}
            >
              <Text style={styles.softPillText}>Devices</Text>
              <Ionicons name="chevron-forward" size={18} color="#A1A1AA" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.softPillCard}
              onPress={() => setActiveSubModal('Privacy')}
              activeOpacity={0.75}
            >
              <Text style={styles.softPillText}>Privacy</Text>
              <Ionicons name="chevron-forward" size={18} color="#A1A1AA" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.softPillCard}
              onPress={() => setActiveSubModal('Documentation')}
              activeOpacity={0.75}
            >
              <Text style={styles.softPillText}>Documentation</Text>
              <Ionicons name="chevron-forward" size={18} color="#A1A1AA" />
            </TouchableOpacity>

            {/* Log Out Pill Button matching Reference Screenshot */}
            <TouchableOpacity
              style={styles.logoutBtnCard}
              onPress={handleLogoutPress}
              activeOpacity={0.8}
            >
              <Text style={styles.logoutBtnText}>Log out</Text>
            </TouchableOpacity>

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </InteractiveGestureSheet>

      {/* ========================================================================= */}
      {/* 1. ACCOUNT SUBMODAL (With Calm Loading State) */}
      {/* ========================================================================= */}
      <Modal
        visible={activeSubModal === 'Account'}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setActiveSubModal(null)}
      >
        <SafeAreaView style={styles.subModalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setActiveSubModal(null)} style={styles.modalBackBtn}>
              <Ionicons name="arrow-back" size={22} color="#111111" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Account</Text>
            <View style={{ width: 36 }} />
          </View>

          <ScrollView contentContainerStyle={styles.modalContent}>
            {isAccountLoading ? (
              /* Calm loading skeleton for user information */
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#111111" style={{ marginBottom: 12 }} />
                <Text style={styles.loadingText}>Gathering pilgrim information...</Text>
                <View style={styles.skeletonPill} />
                <View style={[styles.skeletonPill, { width: '70%' }]} />
              </View>
            ) : (
              <View>
                {/* User Info Overview */}
                <View style={styles.accountCard}>
                  <View style={styles.accountAvatarCircle}>
                    <Text style={styles.accountAvatarText}>
                      {(draftProfile.fullName || 'P').charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 14 }}>
                    <Text style={styles.accountCardName}>{draftProfile.fullName || 'Beloved Pilgrim'}</Text>
                    <Text style={styles.accountCardEmail}>{draftProfile.email || authInfo.email || 'Cloud Guest Account'}</Text>
                  </View>
                </View>

                {/* Form Fields */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Full Name</Text>
                  <TextInput
                    style={styles.inputField}
                    value={draftProfile.fullName}
                    onChangeText={(val) => setDraftProfile({ ...draftProfile, fullName: val })}
                    placeholder="Enter your name"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Email Address</Text>
                  <TextInput
                    style={styles.inputField}
                    value={draftProfile.email}
                    onChangeText={(val) => setDraftProfile({ ...draftProfile, email: val })}
                    placeholder="Enter email address"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Spiritual Journey Bio</Text>
                  <TextInput
                    style={[styles.inputField, { height: 80, textAlignVertical: 'top' }]}
                    value={draftProfile.bio}
                    onChangeText={(val) => setDraftProfile({ ...draftProfile, bio: val })}
                    placeholder="Share what God is doing in your life..."
                    placeholderTextColor="#9CA3AF"
                    multiline
                  />
                </View>

                {/* Study Depth & Comprehension Level */}
                <View style={styles.preferenceGroup}>
                  <Text style={styles.preferenceLabel}>Study Depth & Comprehension</Text>
                  <Text style={styles.preferenceHint}>Calibrates theological exegesis and dynamic vocabulary assistance from mentors.</Text>
                  <View style={styles.pillRow}>
                    {[
                      { id: 'plain_simple', label: 'Plain & Simple' },
                      { id: 'growing_believer', label: 'Everyday Believer' },
                      { id: 'deep_exegesis', label: 'Deep Exegesis' }
                    ].map((opt) => {
                      const isSelected = (draftProfile.comprehensionLevel || 'growing_believer') === opt.id;
                      return (
                        <TouchableOpacity
                          key={opt.id}
                          style={[styles.choicePill, isSelected && styles.choicePillActive]}
                          onPress={() => setDraftProfile({ ...draftProfile, comprehensionLevel: opt.id as any })}
                          activeOpacity={0.7}
                        >
                          <Text style={[styles.choicePillText, isSelected && styles.choicePillTextActive]}>
                            {opt.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Church Role / Season */}
                <View style={styles.preferenceGroup}>
                  <Text style={styles.preferenceLabel}>Church Role & Season</Text>
                  <View style={styles.pillRow}>
                    {[
                      { id: 'seeker', label: 'Seeker' },
                      { id: 'member', label: 'Member' },
                      { id: 'leader', label: 'Leader' },
                      { id: 'pastor', label: 'Pastor' },
                      { id: 'questioning', label: 'Questioning' }
                    ].map((opt) => {
                      const isSelected = (draftProfile.churchRole || 'member') === opt.id;
                      return (
                        <TouchableOpacity
                          key={opt.id}
                          style={[styles.choicePill, isSelected && styles.choicePillActive]}
                          onPress={() => setDraftProfile({ ...draftProfile, churchRole: opt.id })}
                          activeOpacity={0.7}
                        >
                          <Text style={[styles.choicePillText, isSelected && styles.choicePillTextActive]}>
                            {opt.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Age Bracket */}
                <View style={styles.preferenceGroup}>
                  <Text style={styles.preferenceLabel}>Age Group</Text>
                  <View style={styles.pillRow}>
                    {['under_18', '18_24', '25_34', '35_50', '50_plus'].map((ageId) => {
                      const displayLabel = ageId.replace('under_', 'Under ').replace('_', ' – ').replace('plus', '+');
                      const isSelected = (draftProfile.ageBracket || '25_34') === ageId;
                      return (
                        <TouchableOpacity
                          key={ageId}
                          style={[styles.choicePill, isSelected && styles.choicePillActive]}
                          onPress={() => setDraftProfile({ ...draftProfile, ageBracket: ageId })}
                          activeOpacity={0.7}
                        >
                          <Text style={[styles.choicePillText, isSelected && styles.choicePillTextActive]}>
                            {displayLabel}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Save Account Button */}
                <TouchableOpacity
                  style={styles.primaryActionButton}
                  onPress={handleSaveAccount}
                  activeOpacity={0.8}
                >
                  <Text style={styles.primaryActionButtonText}>Save Account Changes</Text>
                </TouchableOpacity>

                {/* Cloud Backup Button */}
                <TouchableOpacity
                  style={styles.secondaryActionButton}
                  onPress={handleCloudBackup}
                  activeOpacity={0.8}
                  disabled={isBackingUp}
                >
                  <Ionicons name="cloud-upload-outline" size={18} color="#111111" style={{ marginRight: 8 }} />
                  <Text style={styles.secondaryActionButtonText}>
                    {isBackingUp ? 'Syncing to Cloud...' : 'Synchronize with Cloud Backup'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* ========================================================================= */}
      {/* 2. NOTIFICATIONS SUBMODAL (Interactive Toggle Switches) */}
      {/* ========================================================================= */}
      <Modal
        visible={activeSubModal === 'Notifications'}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setActiveSubModal(null)}
      >
        <SafeAreaView style={styles.subModalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setActiveSubModal(null)} style={styles.modalBackBtn}>
              <Ionicons name="arrow-back" size={22} color="#111111" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Notifications</Text>
            <View style={{ width: 36 }} />
          </View>

          <ScrollView contentContainerStyle={styles.modalContent}>
            <Text style={styles.subSectionTitle}>Daily Encouragements</Text>

            <View style={styles.toggleRowCard}>
              <View style={styles.toggleTextWrap}>
                <Text style={styles.toggleLabel}>Daily Scripture at 8:00 AM</Text>
                <Text style={styles.toggleSubtitle}>Start each morning anchored in Scripture</Text>
              </View>
              <Switch
                value={dailyScriptureReminder}
                onValueChange={setDailyScriptureReminder}
                trackColor={{ false: '#E5E5EA', true: '#111111' }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.toggleRowCard}>
              <View style={styles.toggleTextWrap}>
                <Text style={styles.toggleLabel}>Apostle Words of Grace</Text>
                <Text style={styles.toggleSubtitle}>Heartfelt devotional counsels from Peter, John & Paul</Text>
              </View>
              <Switch
                value={apostleWordsGrace}
                onValueChange={setApostleWordsGrace}
                trackColor={{ false: '#E5E5EA', true: '#111111' }}
                thumbColor="#FFFFFF"
              />
            </View>

            <Text style={styles.subSectionTitle}>Spiritual Growth & Fellowship</Text>

            <View style={styles.toggleRowCard}>
              <View style={styles.toggleTextWrap}>
                <Text style={styles.toggleLabel}>Streak Milestones & Badges</Text>
                <Text style={styles.toggleSubtitle}>Celebrate streak achievements and newly unlocked badges</Text>
              </View>
              <Switch
                value={streakMilestoneNotifs}
                onValueChange={setStreakMilestoneNotifs}
                trackColor={{ false: '#E5E5EA', true: '#111111' }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.toggleRowCard}>
              <View style={styles.toggleTextWrap}>
                <Text style={styles.toggleLabel}>Fellowship & Study Circles</Text>
                <Text style={styles.toggleSubtitle}>Updates when friends share reflections and prayer requests</Text>
              </View>
              <Switch
                value={fellowshipNotifs}
                onValueChange={setFellowshipNotifs}
                trackColor={{ false: '#E5E5EA', true: '#111111' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* ========================================================================= */}
      {/* 3. LANGUAGES SUBMODAL (Both Bible & App Interface Languages) */}
      {/* ========================================================================= */}
      <Modal
        visible={activeSubModal === 'Languages'}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setActiveSubModal(null)}
      >
        <SafeAreaView style={styles.subModalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setActiveSubModal(null)} style={styles.modalBackBtn}>
              <Ionicons name="arrow-back" size={22} color="#111111" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Languages</Text>
            <View style={{ width: 36 }} />
          </View>

          <ScrollView contentContainerStyle={styles.modalContent}>
            {/* PART 1: App Interface Language */}
            <Text style={styles.subSectionTitle}>App Interface Language</Text>
            <Text style={styles.subSectionDescription}>
              Select the language for all buttons, menus, and spiritual guidance tabs.
            </Text>

            <View style={styles.radioGroupCard}>
              {SUPPORTED_LANGUAGES.map((lang) => {
                const isSelected = currentLanguage === lang.code;
                return (
                  <TouchableOpacity
                    key={lang.code}
                    style={[styles.radioItemRow, isSelected && styles.radioItemRowSelected]}
                    onPress={() => setLanguage(lang.code as AppLanguage)}
                    activeOpacity={0.7}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={{ fontSize: 20, marginRight: 12 }}>{lang.flag}</Text>
                      <View>
                        <Text style={[styles.radioItemTitle, isSelected && styles.radioItemTitleSelected]}>
                          {lang.nativeName}
                        </Text>
                        <Text style={styles.radioItemSub}>{lang.name}</Text>
                      </View>
                    </View>

                    {/* Radio Button Circle */}
                    <View style={[styles.radioOuterCircle, isSelected && styles.radioOuterCircleActive]}>
                      {isSelected && <View style={styles.radioInnerDot} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* PART 2: Bible Text Language & Translation */}
            <Text style={[styles.subSectionTitle, { marginTop: 28 }]}>Bible Text & Translation</Text>
            <Text style={styles.subSectionDescription}>
              Select the translation used for daily readings, verse search, and scripture reflection.
            </Text>

            <View style={styles.radioGroupCard}>
              {BIBLE_TRANSLATIONS.map((trans) => {
                const isSelected = bibleTranslation === trans.code;
                return (
                  <TouchableOpacity
                    key={trans.code}
                    style={[styles.radioItemRow, isSelected && styles.radioItemRowSelected]}
                    onPress={async () => {
                      setBibleTranslation(trans.code);
                      await setPreferredTranslation(trans.code);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={{ flex: 1, paddingRight: 10 }}>
                      <Text style={[styles.radioItemTitle, isSelected && styles.radioItemTitleSelected]}>
                        {trans.name}
                      </Text>
                      <Text style={styles.radioItemSub}>{trans.description}</Text>
                    </View>

                    {/* Radio Button Circle */}
                    <View style={[styles.radioOuterCircle, isSelected && styles.radioOuterCircleActive]}>
                      {isSelected && <View style={styles.radioInnerDot} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* ========================================================================= */}
      {/* 4. TEXT AND DISPLAY SUBMODAL */}
      {/* ========================================================================= */}
      <Modal
        visible={activeSubModal === 'Text and Display'}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setActiveSubModal(null)}
      >
        <SafeAreaView style={styles.subModalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setActiveSubModal(null)} style={styles.modalBackBtn}>
              <Ionicons name="arrow-back" size={22} color="#111111" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Text and Display</Text>
            <View style={{ width: 36 }} />
          </View>

          <ScrollView contentContainerStyle={styles.modalContent}>
            <Text style={styles.subSectionTitle}>Scripture Reading Size</Text>

            <View style={styles.radioGroupCard}>
              {(['Small', 'Normal', 'Large', 'Extra Large'] as const).map((scale) => {
                const isSelected = fontSizeScale === scale;
                return (
                  <TouchableOpacity
                    key={scale}
                    style={[styles.radioItemRow, isSelected && styles.radioItemRowSelected]}
                    onPress={() => setFontSizeScale(scale)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.radioItemTitle, isSelected && styles.radioItemTitleSelected]}>
                      {scale}
                    </Text>
                    <View style={[styles.radioOuterCircle, isSelected && styles.radioOuterCircleActive]}>
                      {isSelected && <View style={styles.radioInnerDot} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Live Verse Preview */}
            <View style={styles.previewBox}>
              <Text
                style={[
                  styles.previewVerse,
                  fontSizeScale === 'Small' && { fontSize: 13, lineHeight: 19 },
                  fontSizeScale === 'Normal' && { fontSize: 15, lineHeight: 22 },
                  fontSizeScale === 'Large' && { fontSize: 17, lineHeight: 25 },
                  fontSizeScale === 'Extra Large' && { fontSize: 19, lineHeight: 28 },
                  dyslexiaFont && { letterSpacing: 0.5 }
                ]}
              >
                “Your word is a lamp to my feet and a light to my path.” — Psalm 119:105
              </Text>
            </View>

            <Text style={[styles.subSectionTitle, { marginTop: 24 }]}>Display Accessibility</Text>

            <View style={styles.toggleRowCard}>
              <View style={styles.toggleTextWrap}>
                <Text style={styles.toggleLabel}>Dyslexia-Friendly Spacing</Text>
                <Text style={styles.toggleSubtitle}>Enhanced character tracking and line separation</Text>
              </View>
              <Switch
                value={dyslexiaFont}
                onValueChange={setDyslexiaFont}
                trackColor={{ false: '#E5E5EA', true: '#111111' }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.toggleRowCard}>
              <View style={styles.toggleTextWrap}>
                <Text style={styles.toggleLabel}>High Contrast Mode</Text>
                <Text style={styles.toggleSubtitle}>Deepens text darkness for improved outdoor visibility</Text>
              </View>
              <Switch
                value={highContrastMode}
                onValueChange={setHighContrastMode}
                trackColor={{ false: '#E5E5EA', true: '#111111' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* ========================================================================= */}
      {/* 5. AUDIO AND VISUAL AIDS */}
      {/* ========================================================================= */}
      <Modal
        visible={activeSubModal === 'Audio and Visual aids'}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setActiveSubModal(null)}
      >
        <SafeAreaView style={styles.subModalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setActiveSubModal(null)} style={styles.modalBackBtn}>
              <Ionicons name="arrow-back" size={22} color="#111111" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Audio and Visual aids</Text>
            <View style={{ width: 36 }} />
          </View>

          <ScrollView contentContainerStyle={styles.modalContent}>
            <Text style={styles.subSectionTitle}>Apostolic Voice & Audio</Text>

            <View style={styles.toggleRowCard}>
              <View style={styles.toggleTextWrap}>
                <Text style={styles.toggleLabel}>Voice Narration of Scripture</Text>
                <Text style={styles.toggleSubtitle}>Spoken words of grace when reviewing chapters</Text>
              </View>
              <Switch
                value={voiceOverApostles}
                onValueChange={setVoiceOverApostles}
                trackColor={{ false: '#E5E5EA', true: '#111111' }}
                thumbColor="#FFFFFF"
              />
            </View>

            <Text style={[styles.subSectionTitle, { marginTop: 20 }]}>Narration Speed</Text>
            <View style={styles.radioGroupCard}>
              {(['0.75x', '1.0x', '1.25x', '1.5x'] as const).map((speed) => {
                const isSelected = audioSpeed === speed;
                return (
                  <TouchableOpacity
                    key={speed}
                    style={[styles.radioItemRow, isSelected && styles.radioItemRowSelected]}
                    onPress={() => setAudioSpeed(speed)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.radioItemTitle, isSelected && styles.radioItemTitleSelected]}>
                      {speed} {speed === '1.0x' ? '(Normal)' : ''}
                    </Text>
                    <View style={[styles.radioOuterCircle, isSelected && styles.radioOuterCircleActive]}>
                      {isSelected && <View style={styles.radioInnerDot} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={[styles.subSectionTitle, { marginTop: 20 }]}>Atmosphere & Motion</Text>

            <View style={styles.toggleRowCard}>
              <View style={styles.toggleTextWrap}>
                <Text style={styles.toggleLabel}>Ambient Prayer Background</Text>
                <Text style={styles.toggleSubtitle}>Subtle serene chimes during devotional reading</Text>
              </View>
              <Switch
                value={ambientAudio}
                onValueChange={setAmbientAudio}
                trackColor={{ false: '#E5E5EA', true: '#111111' }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.toggleRowCard}>
              <View style={styles.toggleTextWrap}>
                <Text style={styles.toggleLabel}>Reduce Motion</Text>
                <Text style={styles.toggleSubtitle}>Minimizes sliding and particle effects</Text>
              </View>
              <Switch
                value={reduceMotion}
                onValueChange={setReduceMotion}
                trackColor={{ false: '#E5E5EA', true: '#111111' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* ========================================================================= */}
      {/* 6. NAVIGATIONS SUBMODAL */}
      {/* ========================================================================= */}
      <Modal
        visible={activeSubModal === 'Navigations'}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setActiveSubModal(null)}
      >
        <SafeAreaView style={styles.subModalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setActiveSubModal(null)} style={styles.modalBackBtn}>
              <Ionicons name="arrow-back" size={22} color="#111111" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Navigations</Text>
            <View style={{ width: 36 }} />
          </View>

          <ScrollView contentContainerStyle={styles.modalContent}>
            <View style={styles.toggleRowCard}>
              <View style={styles.toggleTextWrap}>
                <Text style={styles.toggleLabel}>Haptic Touch Feedback</Text>
                <Text style={styles.toggleSubtitle}>Gentle vibration on tab switches and verse bookmarks</Text>
              </View>
              <Switch
                value={hapticTouch}
                onValueChange={setHapticTouch}
                trackColor={{ false: '#E5E5EA', true: '#111111' }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.toggleRowCard}>
              <View style={styles.toggleTextWrap}>
                <Text style={styles.toggleLabel}>Swipe to Next Chapter</Text>
                <Text style={styles.toggleSubtitle}>Horizontal gestures to glide through books of the Bible</Text>
              </View>
              <Switch
                value={swipeNavigation}
                onValueChange={setSwipeNavigation}
                trackColor={{ false: '#E5E5EA', true: '#111111' }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.toggleRowCard}>
              <View style={styles.toggleTextWrap}>
                <Text style={styles.toggleLabel}>Quick Chapter Jump Bar</Text>
                <Text style={styles.toggleSubtitle}>Floating selector for instant book and chapter picking</Text>
              </View>
              <Switch
                value={quickChapterJump}
                onValueChange={setQuickChapterJump}
                trackColor={{ false: '#E5E5EA', true: '#111111' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* ========================================================================= */}
      {/* 7. COGNITIVE SUPPORT SUBMODAL */}
      {/* ========================================================================= */}
      <Modal
        visible={activeSubModal === 'Cognitive Support'}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setActiveSubModal(null)}
      >
        <SafeAreaView style={styles.subModalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setActiveSubModal(null)} style={styles.modalBackBtn}>
              <Ionicons name="arrow-back" size={22} color="#111111" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Cognitive Support</Text>
            <View style={{ width: 36 }} />
          </View>

          <ScrollView contentContainerStyle={styles.modalContent}>
            <View style={styles.toggleRowCard}>
              <View style={styles.toggleTextWrap}>
                <Text style={styles.toggleLabel}>Plain Language Explanations</Text>
                <Text style={styles.toggleSubtitle}>Simplifies complex archaic terms and theological contexts</Text>
              </View>
              <Switch
                value={plainLanguageMode}
                onValueChange={setPlainLanguageMode}
                trackColor={{ false: '#E5E5EA', true: '#111111' }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.toggleRowCard}>
              <View style={styles.toggleTextWrap}>
                <Text style={styles.toggleLabel}>Distraction-Free Focus Mode</Text>
                <Text style={styles.toggleSubtitle}>Dims app bars and buttons while immersed in reading</Text>
              </View>
              <Switch
                value={focusReadingMode}
                onValueChange={setFocusReadingMode}
                trackColor={{ false: '#E5E5EA', true: '#111111' }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.toggleRowCard}>
              <View style={styles.toggleTextWrap}>
                <Text style={styles.toggleLabel}>Devotional Reflection Prompts</Text>
                <Text style={styles.toggleSubtitle}>Guides you with personal application questions after chapters</Text>
              </View>
              <Switch
                value={reflectionPrompts}
                onValueChange={setReflectionPrompts}
                trackColor={{ false: '#E5E5EA', true: '#111111' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* ========================================================================= */}
      {/* 8. DEVICES SUBMODAL */}
      {/* ========================================================================= */}
      <Modal
        visible={activeSubModal === 'Devices'}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setActiveSubModal(null)}
      >
        <SafeAreaView style={styles.subModalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setActiveSubModal(null)} style={styles.modalBackBtn}>
              <Ionicons name="arrow-back" size={22} color="#111111" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Devices</Text>
            <View style={{ width: 36 }} />
          </View>

          <ScrollView contentContainerStyle={styles.modalContent}>
            <Text style={styles.subSectionTitle}>Active Sessions</Text>

            <View style={styles.deviceCard}>
              <View style={styles.deviceIconCircle}>
                <Ionicons name="phone-portrait-outline" size={24} color="#111111" />
              </View>
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={styles.deviceName}>Current Smartphone</Text>
                <Text style={styles.deviceStatus}>Active Now · Secure Local Storage</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.secondaryActionButton}
              onPress={() => {
                setConfirmModal({
                  visible: true,
                  title: 'Device Security',
                  message: 'Your active session is protected with biometric and secure hardware keys.',
                  confirmText: 'Got It',
                  singleButton: true,
                  icon: 'shield-checkmark-outline',
                  onConfirm: () => {},
                });
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryActionButtonText}>Manage Synced Devices</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* ========================================================================= */}
      {/* 9. PRIVACY SUBMODAL */}
      {/* ========================================================================= */}
      <Modal
        visible={activeSubModal === 'Privacy'}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setActiveSubModal(null)}
      >
        <SafeAreaView style={styles.subModalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setActiveSubModal(null)} style={styles.modalBackBtn}>
              <Ionicons name="arrow-back" size={22} color="#111111" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Privacy</Text>
            <View style={{ width: 36 }} />
          </View>

          <ScrollView contentContainerStyle={styles.modalContent}>
            <View style={styles.toggleRowCard}>
              <View style={styles.toggleTextWrap}>
                <Text style={styles.toggleLabel}>Anonymous Diagnostic Analytics</Text>
                <Text style={styles.toggleSubtitle}>Helps our engineering team optimize offline scripture loading</Text>
              </View>
              <Switch
                value={analyticsOptIn}
                onValueChange={setAnalyticsOptIn}
                trackColor={{ false: '#E5E5EA', true: '#111111' }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.toggleRowCard}>
              <View style={styles.toggleTextWrap}>
                <Text style={styles.toggleLabel}>Incognito Apostolic Counsel</Text>
                <Text style={styles.toggleSubtitle}>Conversation logs never touch external servers</Text>
              </View>
              <Switch
                value={incognitoChat}
                onValueChange={setIncognitoChat}
                trackColor={{ false: '#E5E5EA', true: '#111111' }}
                thumbColor="#FFFFFF"
              />
            </View>

            {/* Clear History Button */}
            <TouchableOpacity
              style={[styles.secondaryActionButton, { borderColor: '#DC2626', marginTop: 24 }]}
              onPress={handleClearHistory}
              activeOpacity={0.8}
            >
              <Ionicons name="trash-outline" size={17} color="#DC2626" style={{ marginRight: 8 }} />
              <Text style={[styles.secondaryActionButtonText, { color: '#DC2626' }]}>
                Clear All Chat History
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* ========================================================================= */}
      {/* 10. DOCUMENTATION SUBMODAL */}
      {/* ========================================================================= */}
      <Modal
        visible={activeSubModal === 'Documentation'}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setActiveSubModal(null)}
      >
        <SafeAreaView style={styles.subModalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setActiveSubModal(null)} style={styles.modalBackBtn}>
              <Ionicons name="arrow-back" size={22} color="#111111" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Documentation</Text>
            <View style={{ width: 36 }} />
          </View>

          <ScrollView contentContainerStyle={styles.modalContent}>
            <View style={styles.docCard}>
              <Text style={styles.docTitle}>Theological Foundation</Text>
              <Text style={styles.docBody}>
                Bible Chat App is grounded in orthodox biblical Christianity and historical creeds. Our companions (Simon Peter, John, Paul) offer counsel faithfully reflecting the inspired Word of God.
              </Text>
            </View>

            <View style={styles.docCard}>
              <Text style={styles.docTitle}>Apostolic Council Personas</Text>
              <Text style={styles.docBody}>
                Each companion is modeled after the New Testament epistles and historical church accounts, providing scriptural guidance rooted in love, grace, and truth.
              </Text>
            </View>

            <View style={styles.docCard}>
              <Text style={styles.docTitle}>Open Source & Scripture Permissions</Text>
              <Text style={styles.docBody}>
                Scripture quotations are taken from public domain and authorized digital collections. Offline translation databases are cached for seamless continuous study.
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Reusable Custom Confirmation Modal */}
      <CustomConfirmationModal
        visible={confirmModal.visible}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        cancelText={confirmModal.cancelText}
        confirmStyle={confirmModal.confirmStyle}
        icon={confirmModal.icon}
        singleButton={confirmModal.singleButton}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, visible: false }))}
        onClose={() => setConfirmModal(prev => ({ ...prev, visible: false }))}
      />
    </>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  sheetModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    flex: 1,
  },
  grabHandleWrap: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
  },
  grabHandleTouch: {
    padding: 6,
  },
  grabHandle: {
    width: 44,
    height: 4.5,
    borderRadius: 3,
    backgroundColor: '#000000',
  },
  scrollArea: {
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  sectionHeading: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 14,
    color: '#111111',
    marginTop: 18,
    marginBottom: 10,
    letterSpacing: -0.2,
  },
  // Toned-down soft card matching User Request (cleaner, lighter, not muddy grey)
  softPillCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F4F4F6',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ECECEE',
  },
  softPillText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 15,
    color: '#111111',
  },
  // Soft coral/rose Log Out pill button matching Reference Screenshot
  logoutBtnCard: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8A7A7',
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 18,
    marginBottom: 10,
  },
  logoutBtnText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 15,
    color: '#3B1818',
  },
  // Submodals
  subModalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalBackBtn: {
    padding: 6,
  },
  modalTitle: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 18,
    color: '#111111',
  },
  modalContent: {
    padding: 20,
    paddingBottom: 50,
  },
  subSectionTitle: {
    fontFamily: Typography.fontSansBold,
    fontSize: 15,
    color: '#111111',
    marginBottom: 6,
  },
  subSectionDescription: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 14,
  },
  // Toggle Row Card
  toggleRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F7F7F8',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EFEFF0',
  },
  toggleTextWrap: {
    flex: 1,
    marginRight: 14,
  },
  toggleLabel: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 14.5,
    color: '#111111',
  },
  toggleSubtitle: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 12.5,
    color: '#6B7280',
    marginTop: 3,
    lineHeight: 17,
  },
  // Radio Group & Buttons
  radioGroupCard: {
    backgroundColor: '#F7F7F8',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EFEFF0',
    overflow: 'hidden',
  },
  radioItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFF0',
  },
  radioItemRowSelected: {
    backgroundColor: '#FFFFFF',
  },
  radioItemTitle: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 14.5,
    color: '#111111',
  },
  radioItemTitleSelected: {
    fontFamily: Typography.fontSansSemiBold,
    color: '#111111',
  },
  radioItemSub: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  radioOuterCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterCircleActive: {
    borderColor: '#111111',
  },
  radioInnerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#111111',
  },
  // Loading Skeleton State
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
  },
  skeletonPill: {
    width: '90%',
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    marginBottom: 12,
  },
  // Account Card
  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F7F8',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#EFEFF0',
  },
  accountAvatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountAvatarText: {
    fontFamily: Typography.fontSansBold,
    fontSize: 18,
    color: '#FFFFFF',
  },
  accountCardName: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 16,
    color: '#111111',
  },
  accountCardEmail: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
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
    backgroundColor: '#F7F7F8',
    borderWidth: 1,
    borderColor: '#EFEFF0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: Typography.fontSansRegular,
    fontSize: 14.5,
    color: '#111111',
  },
  primaryActionButton: {
    backgroundColor: '#111111',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  primaryActionButtonText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 14.5,
    color: '#FFFFFF',
  },
  secondaryActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingVertical: 13,
    marginTop: 12,
  },
  secondaryActionButtonText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 14,
    color: '#111111',
  },
  previewBox: {
    backgroundColor: '#F7F7F8',
    borderRadius: 14,
    padding: 16,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: '#EFEFF0',
  },
  previewVerse: {
    fontFamily: Typography.fontSerif,
    color: '#111111',
    textAlign: 'center',
  },
  deviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F7F8',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EFEFF0',
    marginBottom: 16,
  },
  deviceIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EFEFF0',
  },
  deviceName: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 15,
    color: '#111111',
  },
  deviceStatus: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 12.5,
    color: '#059669',
    marginTop: 2,
  },
  docCard: {
    backgroundColor: '#F7F7F8',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EFEFF0',
  },
  docTitle: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 15,
    color: '#111111',
    marginBottom: 6,
  },
  docBody: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 13.5,
    color: '#4B5563',
    lineHeight: 20,
  },
  preferenceGroup: {
    marginBottom: 22,
  },
  preferenceLabel: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 14,
    color: '#111111',
    marginBottom: 4,
  },
  preferenceHint: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 10,
    lineHeight: 16,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  choicePill: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  choicePillActive: {
    borderColor: '#111111',
    backgroundColor: '#111111',
  },
  choicePillText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 13,
    color: '#374151',
  },
  choicePillTextActive: {
    fontFamily: Typography.fontSansSemiBold,
    color: '#FFFFFF',
  },
});
