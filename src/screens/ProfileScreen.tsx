import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Share,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../theme/typography';
import { fetchBookmarks, removeBookmark, fetchUserProfile, saveUserProfile, fetchAllVerseNotes, fetchAllHighlights, VerseNote, VerseHighlight } from '../services/database';
import { supabase, fetchRemoteProfile, updateRemoteProfile, getUserAuthProvider, DEFAULT_PROFILE } from '../services/supabase';
import { SavedBookmark, UserProfile } from '../types';
import { SettingsScreen } from './SettingsScreen';
import { getSpiritualGrowthProfile, SpiritualGrowthProfile, FaithBadge } from '../services/gamificationService';
import { BadgesModal } from '../components/BadgesModal';
import { MascotBadgeCard } from '../components/MascotBadgeCard';
import { MascotAssets } from '../services/mascotAssets';
import { CustomConfirmationModal } from '../components/CustomConfirmationModal';
import { BadgeDetailModal } from '../components/BadgeDetailModal';

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
  const [bookmarks, setBookmarks] = useState<SavedBookmark[]>([]);
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [authProvider, setAuthProvider] = useState<'google' | 'email' | 'guest'>('guest');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showBadgesModal, setShowBadgesModal] = useState(false);
  const [selectedBadgeForDetail, setSelectedBadgeForDetail] = useState<FaithBadge | null>(null);
  const [growthProfile, setGrowthProfile] = useState<SpiritualGrowthProfile | null>(null);
  const [activeActivityFilter, setActiveActivityFilter] = useState<'all' | 'highlights' | 'notes' | 'plans' | 'badges'>('all');
  const [likedActivities, setLikedActivities] = useState<Record<string, boolean>>({ act_1: false });
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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const bms = await fetchBookmarks();
    setBookmarks(bms);

    const growth = await getSpiritualGrowthProfile();
    setGrowthProfile(growth);

    const [notes, hls] = await Promise.all([
      fetchAllVerseNotes(),
      fetchAllHighlights()
    ]);
    setUserNotes(notes);
    setUserHighlights(hls);

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

  const handleShareProfile = async () => {
    try {
      await Share.share({
        message: `Connect with ${profile.fullName || 'me'} on Bible Chat App! Let us walk together in faith and daily Scripture.`,
      });
    } catch (e) {}
  };

  const toggleLike = (id: string) => {
    setLikedActivities(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const userInitial = (profile.fullName || 'D').trim().charAt(0).toUpperCase();

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header Actions (QR Share Profile, Settings Gear, Menu) */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.shareProfileBtn}
          onPress={handleShareProfile}
          activeOpacity={0.8}
        >
          <Ionicons name="qr-code-outline" size={16} color="#111111" style={{ marginRight: 6 }} />
          <Text style={styles.shareProfileText}>Share Profile</Text>
        </TouchableOpacity>

        <View style={styles.headerRightButtons}>
          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={() => setShowSettingsModal(true)}
            activeOpacity={0.75}
          >
            <Ionicons name="settings-outline" size={22} color="#111111" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={() => setShowSettingsModal(true)}
            activeOpacity={0.75}
          >
            <Ionicons name="menu-outline" size={24} color="#111111" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* User Identity Header Block */}
        <View style={styles.profileHeaderBlock}>
          <View style={styles.profileMetaLeft}>
            <Text style={styles.profileFullName}>{profile.fullName || 'David Mensah'}</Text>
            <View style={styles.chipsRow}>
              <View style={styles.chipPill}>
                <Text style={styles.chipText}>Friends 2</Text>
              </View>
              <View style={styles.chipPill}>
                <Text style={styles.chipText}>Following 1</Text>
              </View>
            </View>
          </View>

          {/* Large Avatar with Initial & Camera Badge */}
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitial}>{userInitial}</Text>
            </View>
            <TouchableOpacity
              style={styles.cameraBadge}
              onPress={() => setConfirmModal({
                visible: true,
                title: 'Personalize Avatar',
                message: 'Personalize your profile appearance and disciple companion avatar. Syncs across all your devices.',
                confirmText: 'Got It',
                singleButton: true,
                icon: 'camera-outline',
                onConfirm: () => {},
              })}
              activeOpacity={0.8}
            >
              <Ionicons name="camera-outline" size={14} color="#111111" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Button: Find Your Church */}
        <TouchableOpacity
          style={styles.findChurchBtn}
          onPress={() => setConfirmModal({
            visible: true,
            title: 'Find Your Church',
            message: 'Discover biblical community, local churches, and prayer circles walking together near your area.',
            confirmText: 'Explore Fellowships',
            cancelText: 'Maybe Later',
            icon: 'home-outline',
            onConfirm: () => {},
          })}
          activeOpacity={0.8}
        >
          <Ionicons name="home-outline" size={17} color="#111111" style={{ marginRight: 8 }} />
          <Text style={styles.findChurchText}>Find Your Church</Text>
        </TouchableOpacity>

        {/* 3 Soft Action Cards: Saved, Prayer, Giving */}
        <View style={styles.actionCardsRow}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={onOpenBible}
            activeOpacity={0.75}
          >
            <Ionicons name="bookmark-outline" size={22} color="#111111" style={{ marginBottom: 6 }} />
            <Text style={styles.actionCardLabel}>Saved</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={onSelectApostle}
            activeOpacity={0.75}
          >
            <Ionicons name="hand-left-outline" size={22} color="#111111" style={{ marginBottom: 6 }} />
            <Text style={styles.actionCardLabel}>Prayer</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => setConfirmModal({
              visible: true,
              title: 'Kingdom Giving',
              message: 'Support Scripture translation, local outreach, and church planting around the globe.',
              confirmText: 'Give Generously',
              cancelText: 'Close',
              icon: 'heart-outline',
              onConfirm: () => {},
            })}
            activeOpacity={0.75}
          >
            <Ionicons name="heart-outline" size={22} color="#111111" style={{ marginBottom: 6 }} />
            <Text style={styles.actionCardLabel}>Giving</Text>
          </TouchableOpacity>
        </View>

        {/* Metric Card 1: App Streak */}
        <View style={styles.metricCard}>
          <View>
            <Text style={styles.metricValue}>{growthProfile?.streakDays || 1}</Text>
            <Text style={styles.metricLabel}>App Streak</Text>
          </View>
          <Ionicons name="flash-outline" size={24} color="#111111" />
        </View>

        {/* Metric Card 2: Encouragements Sent */}
        <View style={styles.metricCard}>
          <View>
            <Text style={styles.metricValue}>{growthProfile?.conversationsCount || 0}</Text>
            <Text style={styles.metricLabel}>Encouragements Sent</Text>
          </View>
          <Ionicons name="paper-plane-outline" size={22} color="#111111" />
        </View>

        {/* Metric Card 3: Badges Showcase Card */}
        <TouchableOpacity
          style={styles.badgesSectionCard}
          onPress={() => setShowBadgesModal(true)}
          activeOpacity={0.85}
        >
          <View style={styles.badgesCardHeader}>
            <Text style={styles.badgesCardTitle}>{growthProfile?.badges?.length || 8} Badges</Text>
            <Ionicons name="ribbon-outline" size={24} color="#111111" />
          </View>

          {/* Horizontal Preview Row of 4 Prominent Badges */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.badgesPreviewRow}
          >
            {(growthProfile?.badges || []).slice(0, 4).map((badge) => (
              <MascotBadgeCard
                key={badge.id}
                badge={badge}
                size="compact"
                onPress={() => setSelectedBadgeForDetail(badge)}
              />
            ))}
          </ScrollView>
        </TouchableOpacity>

 {/* ========================================================================= */}
 {/* ACTIVITY FEED SECTION (YouVersion Alignment) */}
        {/* ========================================================================= */}
        {/* ACTIVITY FEED SECTION (YouVersion Alignment) */}
        {/* ========================================================================= */}
        <View style={styles.activitySection}>
          <Text style={styles.activityHeading}>Activity</Text>

          {/* Filter Chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterChipsRow}>
            {[
              { id: 'all', label: 'All', icon: undefined },
              { id: 'highlights', label: 'Highlights', icon: 'create-outline' },
              { id: 'notes', label: 'Notes', icon: 'document-text-outline' },
              { id: 'plans', label: 'Plans', icon: 'checkbox-outline' },
              { id: 'badges', label: 'Badges', icon: 'ribbon-outline' },
            ].map((f) => {
              const isActive = activeActivityFilter === f.id;
              return (
                <TouchableOpacity
                  key={f.id}
                  style={[styles.filterChip, isActive && styles.filterChipActive]}
                  onPress={() => {
                    setActiveActivityFilter(f.id as any);
                    if (f.id === 'badges') setShowBadgesModal(true);
                  }}
                  activeOpacity={0.75}
                >
                  {f.icon && (
                    <Ionicons
                      name={f.icon as any}
                      size={14}
                      color={isActive ? '#FFFFFF' : '#111111'}
                      style={{ marginRight: 5 }}
                    />
                  )}
                  <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                    {f.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* DYNAMIC ACTIVITY FEED (Notes, Highlights, Badges) */}

          {/* 1. NOTES FILTER */}
          {activeActivityFilter === 'notes' && (
            userNotes.length === 0 ? (
              <View style={styles.emptyActivityBox}>
                <Ionicons name="document-text-outline" size={32} color="#9CA3AF" style={{ marginBottom: 8 }} />
                <Text style={styles.emptyActivityTitle}>No Journal Notes Yet</Text>
                <Text style={styles.emptyActivitySub}>Tap any verse in the Bible reader and select "Add Note" to write your reflections.</Text>
              </View>
            ) : (
              userNotes.map((note) => (
                <View key={note.id} style={styles.activityCard}>
                  <View style={styles.activityHeader}>
                    <View style={styles.activityAvatarSmall}>
                      <Text style={styles.activityAvatarText}>{userInitial}</Text>
                    </View>
                    <View style={styles.activityMeta}>
                      <Text style={styles.activityTitleText}>
                        Note on <Text style={{ fontFamily: Typography.fontSansBold }}>{note.reference}</Text>
                      </Text>
                      <Text style={styles.activityTimeText}>Just now</Text>
                    </View>
                  </View>

                  <View style={styles.quoteBlock}>
                    <View style={styles.quoteAccentLine} />
                    <View style={styles.quoteContent}>
                      <Text style={styles.quoteText}>“{note.verseText}”</Text>
                      <Text style={styles.quoteRef}>{note.reference}</Text>
                    </View>
                  </View>

                  {/* User's Reflection */}
                  <View style={styles.userNoteBox}>
                    <Text style={styles.userNoteText}>{note.noteText}</Text>
                  </View>
                </View>
              ))
            )
          )}

          {/* 2. HIGHLIGHTS FILTER */}
          {activeActivityFilter === 'highlights' && (
            userHighlights.length === 0 ? (
              <View style={styles.emptyActivityBox}>
                <Ionicons name="create-outline" size={32} color="#9CA3AF" style={{ marginBottom: 8 }} />
                <Text style={styles.emptyActivityTitle}>No Highlights Yet</Text>
                <Text style={styles.emptyActivitySub}>Tap any verse in the Bible reader to choose a color highlight.</Text>
              </View>
            ) : (
              userHighlights.map((hl) => (
                <View key={hl.id} style={styles.activityCard}>
                  <View style={styles.activityHeader}>
                    <View style={[styles.activityAvatarSmall, { backgroundColor: hl.color }]}>
                      <Ionicons name="bookmark" size={14} color="#111111" />
                    </View>
                    <View style={styles.activityMeta}>
                      <Text style={styles.activityTitleText}>
                        Highlighted <Text style={{ fontFamily: Typography.fontSansBold }}>{hl.book} {hl.chapter}:{hl.verse}</Text>
                      </Text>
                      <Text style={styles.activityTimeText}>Just now</Text>
                    </View>
                  </View>

                  <View style={[styles.quoteBlock, { backgroundColor: hl.color + '40', borderRadius: 12, padding: 12 }]}>
                    <Text style={styles.quoteText}>“{hl.verseText}”</Text>
                    <Text style={styles.quoteRef}>{hl.book} {hl.chapter}:{hl.verse}</Text>
                  </View>
                </View>
              ))
            )
          )}

          {/* 3. ALL / DEFAULT FILTER */}
          {(activeActivityFilter === 'all' || activeActivityFilter === 'plans') && (
            <View>
              {/* User Notes Preview */}
              {userNotes.slice(0, 2).map((note) => (
                <View key={note.id} style={styles.activityCard}>
                  <View style={styles.activityHeader}>
                    <View style={styles.activityAvatarSmall}>
                      <Text style={styles.activityAvatarText}>{userInitial}</Text>
                    </View>
                    <View style={styles.activityMeta}>
                      <Text style={styles.activityTitleText}>
                        Note on <Text style={{ fontFamily: Typography.fontSansBold }}>{note.reference}</Text>
                      </Text>
                    </View>
                  </View>
                  <View style={styles.userNoteBox}>
                    <Text style={styles.userNoteText}>{note.noteText}</Text>
                  </View>
                </View>
              ))}

              {/* Saved Scripture Card */}
              <View style={styles.activityCard}>
                <View style={styles.activityHeader}>
                  <View style={styles.activityAvatarSmall}>
                    <Text style={styles.activityAvatarText}>{userInitial}</Text>
                  </View>
                  <View style={styles.activityMeta}>
                    <Text style={styles.activityTitleText}>
                      You saved <Text style={{ fontFamily: Typography.fontSansBold }}>James 1:27 NIV</Text>
                    </Text>
                    <View style={styles.tagRow}>
                      <Ionicons name="pricetag-outline" size={11} color="#6B7280" style={{ marginRight: 4 }} />
                      <Text style={styles.activityTagText}>encouragement</Text>
                    </View>
                  </View>
                  <Text style={styles.activityTimeText}>41w</Text>
                </View>

                <View style={styles.quoteBlock}>
                  <View style={styles.quoteAccentLine} />
                  <View style={styles.quoteContent}>
                    <Text style={styles.quoteVerseNum}>27</Text>
                    <Text style={styles.quoteText}>
                      Religion that God our Father accepts as pure and faultless is this: to look after orphans and widows in their distress...
                    </Text>
                    <Text style={styles.quoteRef}>James 1:27 NIV</Text>
                  </View>
                </View>

                <View style={styles.activityActionsRow}>
                  <View style={styles.activityActionIcons}>
                    <TouchableOpacity
                      onPress={() => toggleLike('act_1')}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      style={{ marginRight: 16 }}
                    >
                      <Ionicons
                        name={likedActivities['act_1'] ? 'heart' : 'heart-outline'}
                        size={22}
                        color={likedActivities['act_1'] ? '#EF4444' : '#111111'}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <Ionicons name="chatbubble-outline" size={20} color="#111111" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Badge Level Up Card */}
              <TouchableOpacity
                style={styles.activityCard}
                onPress={() => {
                  const b = growthProfile?.badges.find(x => x.id === 'saved_verse') || growthProfile?.badges[0];
                  if (b) setSelectedBadgeForDetail(b);
                }}
                activeOpacity={0.8}
              >
                <View style={styles.activityHeader}>
                  <View style={styles.activityAvatarSmall}>
                    <Text style={styles.activityAvatarText}>{userInitial}</Text>
                  </View>
                  <View style={styles.activityMeta}>
                    <Text style={styles.activityTitleText}>
                      You leveled up your <Text style={{ fontFamily: Typography.fontSansBold }}>Saved Verse</Text> Badge
                    </Text>
                  </View>
                  <Text style={styles.activityTimeText}>41w</Text>
                </View>

                <View style={styles.badgeLevelUpPreview}>
                  <View style={styles.badgeLevelUpCard}>
                    <View style={styles.badgeLevelUpCircle}>
                      <Image source={MascotAssets.rock} style={styles.badgeLevelUpImg} />
                    </View>
                    <View style={styles.badgeLevelUpPill}>
                      <Text style={styles.badgeLevelUpPillText}>5</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Badges Screen Modal */}
      <BadgesModal
        visible={showBadgesModal}
        onClose={() => setShowBadgesModal(false)}
        badges={growthProfile?.badges || []}
        onSelectBadge={(badge) => {
          setShowBadgesModal(false);
          setSelectedBadgeForDetail(badge);
        }}
      />

      {/* Dedicated Badge Detail Screen Modal */}
      <BadgeDetailModal
        visible={Boolean(selectedBadgeForDetail)}
        badge={selectedBadgeForDetail}
        onClose={() => setSelectedBadgeForDetail(null)}
      />

      {/* Custom Soft Confirmation Modal */}
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
 backgroundColor: '#FAFAFA',
 },
 header: {
 flexDirection: 'row',
 alignItems: 'center',
 justifyContent: 'space-between',
 paddingHorizontal: 20,
 paddingTop: 12,
 paddingBottom: 8,
 },
 shareProfileBtn: {
 flexDirection: 'row',
 alignItems: 'center',
 backgroundColor: '#FFFFFF',
 borderWidth: 1,
 borderColor: '#E5E5EA',
 borderRadius: 20,
 paddingHorizontal: 14,
 paddingVertical: 7,
 },
 shareProfileText: {
 fontFamily: Typography.fontSansSemiBold,
 fontSize: 13,
 color: '#111111',
 },
 headerRightButtons: {
 flexDirection: 'row',
 alignItems: 'center',
 gap: 12,
 },
 headerIconBtn: {
 padding: 6,
 },
 scrollContent: {
 paddingHorizontal: 20,
 paddingTop: 8,
 paddingBottom: 110,
 },
 profileHeaderBlock: {
 flexDirection: 'row',
 alignItems: 'center',
 justifyContent: 'space-between',
 marginVertical: 14,
 },
 profileMetaLeft: {
 flex: 1,
 },
 profileFullName: {
 fontFamily: Typography.fontSansBold,
 fontSize: 26,
 color: '#111111',
 letterSpacing: -0.5,
 marginBottom: 8,
 },
 chipsRow: {
 flexDirection: 'row',
 alignItems: 'center',
 gap: 8,
 },
 chipPill: {
 backgroundColor: '#FFFFFF',
 borderWidth: 1,
 borderColor: '#E5E5EA',
 borderRadius: 16,
 paddingHorizontal: 12,
 paddingVertical: 4,
 },
 chipText: {
 fontFamily: Typography.fontSansMedium,
 fontSize: 12,
 color: '#111111',
 },
 avatarWrapper: {
 position: 'relative',
 marginLeft: 14,
 },
 avatarCircle: {
 width: 78,
 height: 78,
 borderRadius: 39,
 borderWidth: 2.5,
 borderColor: '#111111',
 backgroundColor: '#FFFFFF',
 alignItems: 'center',
 justifyContent: 'center',
 },
 avatarInitial: {
 fontFamily: Typography.fontSansBold,
 fontSize: 34,
 color: '#111111',
 },
 cameraBadge: {
 position: 'absolute',
 bottom: -2,
 right: -2,
 width: 26,
 height: 26,
 borderRadius: 13,
 backgroundColor: '#F3F4F6',
 borderWidth: 1.5,
 borderColor: '#FFFFFF',
 alignItems: 'center',
 justifyContent: 'center',
 },
 findChurchBtn: {
 flexDirection: 'row',
 alignItems: 'center',
 justifyContent: 'center',
 backgroundColor: '#FFFFFF',
 borderWidth: 1,
 borderColor: '#E5E5EA',
 borderRadius: 22,
 paddingVertical: 12,
 marginBottom: 16,
 },
 findChurchText: {
 fontFamily: Typography.fontSansSemiBold,
 fontSize: 14,
 color: '#111111',
 },
 actionCardsRow: {
 flexDirection: 'row',
 justifyContent: 'space-between',
 marginBottom: 16,
 },
 actionCard: {
 width: '31%',
 backgroundColor: '#F3F3F5',
 borderRadius: 18,
 paddingVertical: 16,
 alignItems: 'center',
 justifyContent: 'center',
 },
 actionCardLabel: {
 fontFamily: Typography.fontSansSemiBold,
 fontSize: 13.5,
 color: '#111111',
 },
 metricCard: {
 backgroundColor: '#FFFFFF',
 borderRadius: 20,
 padding: 18,
 flexDirection: 'row',
 alignItems: 'center',
 justifyContent: 'space-between',
 borderWidth: 1,
 borderColor: '#E5E5EA',
 marginBottom: 12,
 },
 metricValue: {
 fontFamily: Typography.fontSansBold,
 fontSize: 18,
 color: '#111111',
 },
 metricLabel: {
 fontFamily: Typography.fontSansRegular,
 fontSize: 12,
 color: '#6B7280',
 marginTop: 2,
 },
 badgesSectionCard: {
 backgroundColor: '#FFFFFF',
 borderRadius: 20,
 padding: 18,
 borderWidth: 1,
 borderColor: '#E5E5EA',
 marginBottom: 20,
 },
 badgesCardHeader: {
 flexDirection: 'row',
 alignItems: 'center',
 justifyContent: 'space-between',
 marginBottom: 12,
 },
 badgesCardTitle: {
 fontFamily: Typography.fontSansBold,
 fontSize: 16,
 color: '#111111',
 },
 badgesPreviewRow: {
 paddingTop: 4,
 },
 activitySection: {
 marginTop: 6,
 },
 activityHeading: {
 fontFamily: Typography.fontSansBold,
 fontSize: 18,
 color: '#111111',
 marginBottom: 12,
 },
 filterChipsRow: {
 flexDirection: 'row',
 alignItems: 'center',
 gap: 8,
 marginBottom: 16,
 },
 filterChip: {
 flexDirection: 'row',
 alignItems: 'center',
 backgroundColor: '#FFFFFF',
 borderWidth: 1,
 borderColor: '#E5E5EA',
 borderRadius: 18,
 paddingHorizontal: 14,
 paddingVertical: 7,
 },
 filterChipActive: {
 backgroundColor: '#111111',
 borderColor: '#111111',
 },
 filterChipText: {
 fontFamily: Typography.fontSansSemiBold,
 fontSize: 12.5,
 color: '#111111',
 },
 filterChipTextActive: {
 color: '#FFFFFF',
 },
 activityCard: {
 backgroundColor: '#FFFFFF',
 borderRadius: 22,
 padding: 16,
 borderWidth: 1,
 borderColor: '#E5E5EA',
 marginBottom: 16,
 },
 activityHeader: {
 flexDirection: 'row',
 alignItems: 'center',
 marginBottom: 12,
 },
 activityAvatarSmall: {
 width: 38,
 height: 38,
 borderRadius: 19,
 borderWidth: 2,
 borderColor: '#111111',
 alignItems: 'center',
 justifyContent: 'center',
 marginRight: 10,
 },
 activityAvatarText: {
 fontFamily: Typography.fontSansBold,
 fontSize: 16,
 color: '#111111',
 },
 activityMeta: {
 flex: 1,
 },
 activityTitleText: {
 fontFamily: Typography.fontSansRegular,
 fontSize: 14,
 color: '#111111',
 },
 tagRow: {
 flexDirection: 'row',
 alignItems: 'center',
 marginTop: 2,
 },
 activityTagText: {
 fontFamily: Typography.fontSansRegular,
 fontSize: 11.5,
 color: '#6B7280',
 },
 activityTimeText: {
 fontFamily: Typography.fontSansRegular,
 fontSize: 12,
 color: '#9CA3AF',
 },
 quoteBlock: {
 flexDirection: 'row',
 marginVertical: 10,
 paddingLeft: 4,
 },
 quoteAccentLine: {
 width: 3,
 backgroundColor: '#111111',
 borderRadius: 1.5,
 marginRight: 12,
 },
 quoteContent: {
 flex: 1,
 position: 'relative',
 },
 quoteVerseNum: {
 fontFamily: Typography.fontSansRegular,
 fontSize: 10,
 color: '#6B7280',
 marginBottom: 2,
 },
 quoteText: {
 fontFamily: Typography.fontSerif,
 fontSize: 15.5,
 lineHeight: 22,
 color: '#111111',
 marginBottom: 6,
 },
 quoteRef: {
 fontFamily: Typography.fontSansBold,
 fontSize: 12,
 color: '#111111',
 },
 activityActionsRow: {
 flexDirection: 'row',
 alignItems: 'center',
 justifyContent: 'space-between',
 paddingTop: 8,
 borderTopWidth: 1,
 borderTopColor: '#F3F4F6',
 marginTop: 6,
 },
 activityActionIcons: {
 flexDirection: 'row',
 alignItems: 'center',
 },
 likesRow: {
 flexDirection: 'row',
 alignItems: 'center',
 marginTop: 10,
 },
 likeAvatarSmall: {
 width: 22,
 height: 22,
 borderRadius: 11,
 borderWidth: 1.5,
 borderColor: '#FFFFFF',
 backgroundColor: '#D1D5DB',
 alignItems: 'center',
 justifyContent: 'center',
 },
 likeAvatarText: {
 fontFamily: Typography.fontSansBold,
 fontSize: 10,
 color: '#111111',
 },
 likesCountText: {
 fontFamily: Typography.fontSansRegular,
 fontSize: 12,
 color: '#6B7280',
 marginLeft: 8,
 },
 badgeLevelUpPreview: {
 alignItems: 'center',
 paddingVertical: 12,
 },
 badgeLevelUpCard: {
 width: 100,
 height: 110,
 backgroundColor: '#F3F3F5',
 borderRadius: 22,
 alignItems: 'center',
 justifyContent: 'center',
 position: 'relative',
 },
 badgeLevelUpCircle: {
 width: 58,
 height: 58,
 borderRadius: 29,
 borderWidth: 2,
 borderColor: '#C27A4E',
 overflow: 'hidden',
 backgroundColor: '#FFFFFF',
 marginBottom: 4,
 },
 badgeLevelUpImg: {
 width: '100%',
 height: '100%',
 },
 badgeLevelUpPill: {
 backgroundColor: '#6B7280',
 paddingHorizontal: 8,
 paddingVertical: 2,
 borderRadius: 10,
 },
 badgeLevelUpPillText: {
 fontFamily: Typography.fontSansSemiBold,
 fontSize: 10,
 color: '#FFFFFF',
 }
,
  emptyActivityBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginVertical: 10,
  },
  emptyActivityTitle: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 15,
    color: '#111111',
    marginBottom: 4,
  },
  emptyActivitySub: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
  },
  userNoteBox: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#EFEFF0',
  },
  userNoteText: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 14,
    color: '#111111',
    lineHeight: 20,
  }
});