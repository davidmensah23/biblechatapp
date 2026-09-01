import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../theme/typography';
import { fetchBookmarks, removeBookmark, fetchUserProfile, saveUserProfile } from '../services/database';
import { supabase, fetchRemoteProfile, updateRemoteProfile, getUserAuthProvider, DEFAULT_PROFILE } from '../services/supabase';
import { SavedBookmark, UserProfile } from '../types';
import { SettingsScreen } from './SettingsScreen';
import { getUserAvatarUrl, AvatarStyle, AVATAR_STYLE_OPTIONS } from '../services/avatarService';
import { getSpiritualGrowthProfile, SpiritualGrowthProfile, FaithBadge } from '../services/gamificationService';
import { HoldToExplodeBadge } from '../components/HoldToExplodeBadge';
import { ShareMilestoneModal } from '../components/ShareMilestoneModal';
import { StreaksJourneyView } from '../components/StreaksJourneyView';
import { triggerInstantMilestonePush } from '../services/pushNotificationService';

interface ProfileScreenProps {
  onLogout?: () => void;
  onOpenAuthModal?: () => void;
  onSelectApostle?: () => void;
  onOpenBible?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  onLogout,
  onOpenAuthModal,
  onSelectApostle,
  onOpenBible
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'streaks' | 'badges' | 'bookmarks' | 'edit'>('streaks');
  const [bookmarks, setBookmarks] = useState<SavedBookmark[]>([]);
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [authProvider, setAuthProvider] = useState<'google' | 'email' | 'guest'>('guest');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [avatarStyle, setAvatarStyle] = useState<AvatarStyle>('notionists');
  const [avatarSeedOffset, setAvatarSeedOffset] = useState<number>(0);
  const [growthProfile, setGrowthProfile] = useState<SpiritualGrowthProfile | null>(null);
  const [celebratingBadge, setCelebratingBadge] = useState<FaithBadge | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const bms = await fetchBookmarks();
    setBookmarks(bms);

    const growth = await getSpiritualGrowthProfile();
    setGrowthProfile(growth);

    try {
      const auth = await getUserAuthProvider();
      setAuthProvider(auth.provider);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const remote = await fetchRemoteProfile(user.id);
        if (remote) {
          setProfile(remote);
          await saveUserProfile(remote);
          return;
        }
      }
    } catch (e) {}

    const p = await fetchUserProfile();
    if (p) setProfile(p);
  };

  const handleSaveProfile = async () => {
    await saveUserProfile(profile);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await updateRemoteProfile(user.id, profile);
      }
    } catch (e) {}
    Alert.alert('Saved', 'Profile changes saved successfully!');
  };

  const handleRemoveBookmark = async (id: string) => {
    await removeBookmark(id);
    setBookmarks(bookmarks.filter(b => b.id !== id));
  };

  const handleCycleAvatarStyle = () => {
    const currentIndex = AVATAR_STYLE_OPTIONS.findIndex(s => s.id === avatarStyle);
    const nextIndex = (currentIndex + 1) % AVATAR_STYLE_OPTIONS.length;
    setAvatarStyle(AVATAR_STYLE_OPTIONS[nextIndex].id);
  };

  const handleShuffleAvatarSeed = () => {
    setAvatarSeedOffset(prev => prev + 1);
  };

  const handleBadgeExploded = (badge: FaithBadge) => {
    setCelebratingBadge(badge);
    triggerInstantMilestonePush(
      `🎉 Milestone Unlocked: ${badge.title}`,
      `"${badge.subtitle}" — +${badge.xpReward} Grace XP added to your faith journey!`
    );
  };

  const currentSeed = `${profile.fullName || profile.email || 'Disciple'}${avatarSeedOffset > 0 ? `_${avatarSeedOffset}` : ''}`;
  const avatarUrl = getUserAvatarUrl(currentSeed, avatarStyle);

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <View style={styles.topRedIndicator} />
          <Text style={styles.title}>Profile</Text>
        </View>

        <TouchableOpacity
          style={styles.settingsBtn}
          onPress={() => setShowSettingsModal(true)}
          activeOpacity={0.75}
        >
          <Ionicons name="options-outline" size={24} color="#111111" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Guest Mode Upgrade Banner */}
        {authProvider === 'guest' && (
          <View style={styles.guestBannerCard}>
            <View style={styles.guestBannerLeft}>
              <View style={styles.guestBannerIcon}>
                <Ionicons name="cloud-upload-outline" size={20} color="#2563EB" />
              </View>
              <View style={styles.guestBannerTextWrap}>
                <Text style={styles.guestBannerTitle}>Guest Account</Text>
                <Text style={styles.guestBannerSub}>
                  Sign in to back up and sync your faith journey.
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.guestSignInBtn}
              onPress={onOpenAuthModal}
              activeOpacity={0.85}
            >
              <Text style={styles.guestSignInBtnText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* User Card with Illustrated Avatar */}
        <View style={styles.userCard}>
          <View style={styles.avatarWrapper}>
            <Image
              source={{ uri: avatarUrl }}
              style={styles.userAvatar}
            />
            <TouchableOpacity
              style={styles.shuffleAvatarBtn}
              onPress={handleShuffleAvatarSeed}
              activeOpacity={0.8}
            >
              <Ionicons name="dice-outline" size={14} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.userInfo}>
            <View style={styles.userNameRow}>
              <Text style={styles.userName}>{profile.fullName || 'Beloved Disciple'}</Text>
              {authProvider !== 'guest' && (
                <Ionicons name="checkmark-circle" size={17} color="#2563EB" style={{ marginLeft: 6 }} />
              )}
            </View>
            <Text style={styles.userBio} numberOfLines={2}>{profile.bio}</Text>

            <View style={styles.avatarStyleRow}>
              <TouchableOpacity
                style={styles.avatarStylePill}
                onPress={handleCycleAvatarStyle}
                activeOpacity={0.75}
              >
                <Ionicons name="color-palette-outline" size={12} color="#2563EB" style={{ marginRight: 4 }} />
                <Text style={styles.avatarStylePillText}>
                  Style: {AVATAR_STYLE_OPTIONS.find(s => s.id === avatarStyle)?.label}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Spiritual Maturity Level & Grace XP Card */}
        {growthProfile && (
          <View style={styles.levelCard}>
            <View style={styles.levelHeaderRow}>
              <View>
                <Text style={styles.levelBadgeText}>LEVEL {growthProfile.currentLevel}</Text>
                <Text style={styles.levelTitleText}>{growthProfile.levelTitle}</Text>
              </View>
              <View style={styles.xpPill}>
                <Ionicons name="sparkles" size={12} color="#7C3AED" style={{ marginRight: 4 }} />
                <Text style={styles.xpPillText}>{growthProfile.totalXp} Grace XP</Text>
              </View>
            </View>

            {/* XP Progress Bar */}
            <View style={styles.progressBarTrack}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${Math.min(100, Math.round((growthProfile.currentLevelXp / growthProfile.nextLevelXp) * 100))}%`
                  }
                ]}
              />
            </View>

            <Text style={styles.progressDetailText}>
              {growthProfile.currentLevelXp} / {growthProfile.nextLevelXp} XP to next level
            </Text>

            {/* Key Growth Stats Row */}
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{growthProfile.streakDays}</Text>
                <Text style={styles.statLabel}>Day Streak</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{growthProfile.conversationsCount}</Text>
                <Text style={styles.statLabel}>Conversations</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{growthProfile.badges.filter(b => b.isUnlocked).length}</Text>
                <Text style={styles.statLabel}>Faith Badges</Text>
              </View>
            </View>
          </View>
        )}

        {/* 4 Clean Sub-Tabs */}
        <View style={styles.subTabsRow}>
          <TouchableOpacity
            style={[styles.subTabButton, activeSubTab === 'streaks' && styles.subTabButtonActive]}
            onPress={() => setActiveSubTab('streaks')}
          >
            <Ionicons
              name={activeSubTab === 'streaks' ? 'flame' : 'flame-outline'}
              size={17}
              color={activeSubTab === 'streaks' ? '#D97706' : '#888888'}
            />
            <Text style={[styles.subTabLabel, activeSubTab === 'streaks' && styles.subTabLabelActive]}>
              Streaks
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.subTabButton, activeSubTab === 'badges' && styles.subTabButtonActive]}
            onPress={() => setActiveSubTab('badges')}
          >
            <Ionicons
              name={activeSubTab === 'badges' ? 'ribbon' : 'ribbon-outline'}
              size={17}
              color={activeSubTab === 'badges' ? '#7C3AED' : '#888888'}
            />
            <Text style={[styles.subTabLabel, activeSubTab === 'badges' && styles.subTabLabelActive]}>
              Badges
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.subTabButton, activeSubTab === 'bookmarks' && styles.subTabButtonActive]}
            onPress={() => setActiveSubTab('bookmarks')}
          >
            <Ionicons
              name={activeSubTab === 'bookmarks' ? 'bookmark' : 'bookmark-outline'}
              size={17}
              color={activeSubTab === 'bookmarks' ? '#2563EB' : '#888888'}
            />
            <Text style={[styles.subTabLabel, activeSubTab === 'bookmarks' && styles.subTabLabelActive]}>
              Saved
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.subTabButton, activeSubTab === 'edit' && styles.subTabButtonActive]}
            onPress={() => setActiveSubTab('edit')}
          >
            <Ionicons
              name={activeSubTab === 'edit' ? 'person' : 'person-outline'}
              size={17}
              color={activeSubTab === 'edit' ? '#111111' : '#888888'}
            />
            <Text style={[styles.subTabLabel, activeSubTab === 'edit' && styles.subTabLabelActive]}>
              Profile
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab 1: Streaks & Journey */}
        {activeSubTab === 'streaks' && growthProfile ? (
          <StreaksJourneyView
            growthProfile={growthProfile}
            onSelectApostle={onSelectApostle}
            onOpenBible={onOpenBible}
          />
        ) : activeSubTab === 'badges' && growthProfile ? (
          /* Tab 2: Badges with Hold-to-Explode Physics */
          <View style={styles.badgesList}>
            <Text style={styles.holdInstruction}>
              💡 Press and hold any unlocked badge to explode in celebration!
            </Text>
            {growthProfile.badges.map((badge) => (
              <HoldToExplodeBadge
                key={badge.id}
                badge={badge}
                onExplode={handleBadgeExploded}
              />
            ))}
          </View>
        ) : activeSubTab === 'bookmarks' ? (
          /* Tab 3: Saved Bookmarks */
          <View style={styles.bookmarksContainer}>
            {bookmarks.length === 0 ? (
              <View style={styles.emptyBookmarks}>
                <Ionicons name="bookmark-outline" size={36} color="#A0A0A5" />
                <Text style={styles.emptyText}>No bookmarks yet. Tap the bookmark icon in Scripture reader to save verses!</Text>
              </View>
            ) : (
              bookmarks.map((bm) => (
                <View key={bm.id} style={styles.bookmarkCard}>
                  <View style={styles.bmHeader}>
                    <View style={styles.bmContent}>
                      <Text style={styles.bmText} numberOfLines={3}>{bm.content}</Text>
                      <Text style={styles.bmReference}>{bm.type === 'verse' ? 'Read in Bible' : 'Saved Reflection'}</Text>
                    </View>
                    <TouchableOpacity onPress={() => handleRemoveBookmark(bm.id)}>
                      <Ionicons name="trash-outline" size={18} color="#9CA3AF" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        ) : (
          /* Tab 4: Edit Profile */
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.inputField}
                value={profile.fullName}
                onChangeText={(t) => setProfile({ ...profile, fullName: t })}
                placeholder="Your Name"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <TextInput
                style={styles.inputField}
                value={profile.email}
                onChangeText={(t) => setProfile({ ...profile, email: t })}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Faith Bio & Reflection</Text>
              <TextInput
                style={[styles.inputField, styles.textArea]}
                value={profile.bio}
                onChangeText={(t) => setProfile({ ...profile, bio: t })}
                multiline
                numberOfLines={3}
              />
            </View>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveProfile}
              activeOpacity={0.85}
            >
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Share Milestone Modal */}
      {celebratingBadge && (
        <ShareMilestoneModal
          visible={Boolean(celebratingBadge)}
          badge={celebratingBadge}
          userName={profile.fullName || 'Beloved Disciple'}
          onClose={() => setCelebratingBadge(null)}
        />
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <SettingsScreen
          visible={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
          onLogout={onLogout}
          userProfile={profile}
          onUpdateProfile={(updated) => {
            setProfile(updated);
            saveUserProfile(updated);
          }}
        />
      )}
    </SafeAreaView>
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
    paddingHorizontal: 22,
    paddingTop: 14,
    paddingBottom: 10,
  },
  titleContainer: {
    alignItems: 'flex-start',
  },
  topRedIndicator: {
    width: 24,
    height: 3,
    backgroundColor: '#DC2626',
    borderRadius: 2,
    marginBottom: 4,
  },
  title: {
    fontFamily: Typography.fontSerif,
    fontSize: 28,
    color: '#111111',
  },
  settingsBtn: {
    padding: 6,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  guestBannerCard: {
    backgroundColor: '#EEF2FF',
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  guestBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  guestBannerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  guestBannerTextWrap: {
    flex: 1,
  },
  guestBannerTitle: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 14,
    color: '#1E40AF',
  },
  guestBannerSub: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 12,
    color: '#3B82F6',
    lineHeight: 16,
  },
  guestSignInBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  guestSignInBtnText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 13,
    color: '#FFFFFF',
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 14,
  },
  userAvatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#E0E7FF',
  },
  shuffleAvatarBtn: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  userInfo: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  userName: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 18,
    color: '#111827',
  },
  userBio: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 6,
  },
  avatarStyleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarStylePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  avatarStylePillText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 11,
    color: '#2563EB',
  },
  levelCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  levelHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  levelBadgeText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 11,
    color: '#7C3AED',
    letterSpacing: 0.5,
  },
  levelTitleText: {
    fontFamily: Typography.fontSerif,
    fontSize: 20,
    color: '#111827',
  },
  xpPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F3FF',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  xpPillText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 12,
    color: '#7C3AED',
  },
  progressBarTrack: {
    height: 7,
    borderRadius: 4,
    backgroundColor: '#F3F4F6',
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#7C3AED',
    borderRadius: 4,
  },
  progressDetailText: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 11.5,
    color: '#9CA3AF',
    marginBottom: 14,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 17,
    color: '#111827',
  },
  statLabel: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E5E7EB',
  },
  subTabsRow: {
    flexDirection: 'row',
    backgroundColor: '#E5E5EA',
    borderRadius: 16,
    padding: 3,
    marginBottom: 16,
  },
  subTabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 13,
    gap: 4,
  },
  subTabButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  subTabLabel: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 12,
    color: '#6B7280',
  },
  subTabLabelActive: {
    color: '#111827',
  },
  badgesList: {
    gap: 4,
  },
  holdInstruction: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  bookmarksContainer: {
    gap: 10,
  },
  emptyBookmarks: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 13,
    color: '#888888',
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 20,
    lineHeight: 18,
  },
  bookmarkCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
  },
  bmHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bmContent: {
    flex: 1,
    paddingRight: 10,
  },
  bmText: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 13.5,
    color: '#1F2937',
    lineHeight: 19,
    marginBottom: 4,
  },
  bmReference: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 11.5,
    color: '#2563EB',
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
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
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontFamily: Typography.fontSansRegular,
    fontSize: 14,
    color: '#111827',
  },
  textArea: {
    height: 70,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#2563EB',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 6,
  },
  saveButtonText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 14,
    color: '#FFFFFF',
  }
});
