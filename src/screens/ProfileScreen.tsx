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

interface ProfileScreenProps {
  onLogout?: () => void;
  onOpenAuthModal?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onLogout, onOpenAuthModal }) => {
  const [activeSubTab, setActiveSubTab] = useState<'bookmarks' | 'edit'>('bookmarks');
  const [bookmarks, setBookmarks] = useState<SavedBookmark[]>([]);
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [authProvider, setAuthProvider] = useState<'google' | 'email' | 'guest'>('guest');
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const bms = await fetchBookmarks();
    setBookmarks(bms);
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

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header: "Profile" in Instrument Serif with Red Indicator Above */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <View style={styles.topRedIndicator} />
          <Text style={styles.title}>Profile</Text>
        </View>

        {/* Top-Right Settings / Sliders Icon Button to Open Extended Settings Modal */}
        <TouchableOpacity
          style={styles.settingsBtn}
          onPress={() => setShowSettingsModal(true)}
          activeOpacity={0.75}
        >
          <Ionicons name="options-outline" size={24} color="#111111" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Guest Mode Upgrade Card */}
        {authProvider === 'guest' && (
          <View style={styles.guestBannerCard}>
            <View style={styles.guestBannerLeft}>
              <View style={styles.guestBannerIcon}>
                <Ionicons name="cloud-upload-outline" size={20} color="#2563EB" />
              </View>
              <View style={styles.guestBannerTextWrap}>
                <Text style={styles.guestBannerTitle}>Guest Account</Text>
                <Text style={styles.guestBannerSub}>
                  Sign in to back up and sync your conversations to the cloud.
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

        {/* User Card */}
        <View style={styles.userCard}>
          <Image
            source={require('../../assets/avatars/user_profile.png')}
            style={styles.userAvatar}
          />
          <View style={styles.userInfo}>
            <View style={styles.userNameRow}>
              <Text style={styles.userName}>{profile.fullName}</Text>
              {authProvider !== 'guest' && (
                <Ionicons name="checkmark-circle" size={18} color="#2563EB" style={{ marginLeft: 6 }} />
              )}
            </View>
            <Text style={styles.userBio} numberOfLines={2}>{profile.bio}</Text>
            <TouchableOpacity onPress={() => setActiveSubTab('edit')} activeOpacity={0.7}>
              <Text style={styles.editBioLink}>
                <Ionicons name="create-outline" size={14} color="#3B82F6" /> Edit your bio
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Sub Tab Switcher (Folder vs Person) */}
        <View style={styles.subTabsRow}>
          <TouchableOpacity
            style={[styles.subTabButton, activeSubTab === 'bookmarks' && styles.subTabButtonActive]}
            onPress={() => setActiveSubTab('bookmarks')}
          >
            <Ionicons
              name={activeSubTab === 'bookmarks' ? 'folder' : 'folder-outline'}
              size={22}
              color={activeSubTab === 'bookmarks' ? '#111111' : '#888888'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.subTabButton, activeSubTab === 'edit' && styles.subTabButtonActive]}
            onPress={() => setActiveSubTab('edit')}
          >
            <Ionicons
              name={activeSubTab === 'edit' ? 'person' : 'person-outline'}
              size={22}
              color={activeSubTab === 'edit' ? '#111111' : '#888888'}
            />
          </TouchableOpacity>
        </View>

        {/* Tab 1: Bookmarks & Saved Items */}
        {activeSubTab === 'bookmarks' ? (
          <View style={styles.bookmarksContainer}>
            {bookmarks.length === 0 ? (
              <View style={styles.emptyBookmarks}>
                <Ionicons name="bookmark-outline" size={36} color="#A0A0A5" />
                <Text style={styles.emptyText}>No bookmarks yet. Tap the heart icon in chats or reader to save reflections!</Text>
              </View>
            ) : (
              bookmarks.map((bm) => (
                <View key={bm.id} style={styles.bookmarkCard}>
                  <View style={styles.bmHeader}>
                    {bm.type === 'verse' ? (
                      <Image
                        source={require('../../assets/images/daily_scripture_banner.png')}
                        style={styles.bmThumbnail}
                      />
                    ) : (
                      <Image
                        source={require('../../assets/avatars/peter.png')}
                        style={styles.bmAvatar}
                      />
                    )}
                    <View style={styles.bmContent}>
                      <Text style={styles.bmText} numberOfLines={3}>{bm.content}</Text>
                      <Text style={styles.bmReference}>{bm.type === 'verse' ? 'Read in Bible' : 'Saved Reflection'}</Text>
                    </View>
                    <TouchableOpacity onPress={() => handleRemoveBookmark(bm.id)}>
                      <Ionicons name="heart" size={20} color="#E11D48" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        ) : (
          /* Tab 2: Edit Profile Form */
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.inputField}
                value={profile.fullName}
                onChangeText={(t) => setProfile({ ...profile, fullName: t })}
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
              <Text style={styles.inputLabel}>Location</Text>
              <TextInput
                style={styles.inputField}
                value={profile.location}
                onChangeText={(t) => setProfile({ ...profile, location: t })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Date of Birth</Text>
              <TextInput
                style={styles.inputField}
                value={profile.dateOfBirth}
                onChangeText={(t) => setProfile({ ...profile, dateOfBirth: t })}
              />
            </View>

            {/* Green Save Changes Button */}
            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleSaveProfile}
              activeOpacity={0.85}
            >
              <Text style={styles.saveBtnText}>Save changes</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Extended Settings Sliding Modal Sheet (triggers from top-right icon) */}
      <SettingsScreen
        visible={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        userProfile={profile}
        onUpdateProfile={(updated) => setProfile(updated)}
        onLogout={onLogout}
      />
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
  },
  titleContainer: {
    position: 'relative',
    paddingTop: 8,
  },
  topRedIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 46,
    height: 3,
    backgroundColor: '#D92D20',
    borderRadius: 2,
  },
  title: {
    fontFamily: Typography.fontSerif,
    fontSize: 32,
    color: '#111111',
  },
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E6E6EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 110,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  userAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontFamily: Typography.fontSerif,
    fontSize: 29,
    color: '#111111',
  },
  userBio: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 13.5,
    color: '#666666',
    marginTop: 3,
    lineHeight: 19,
  },
  editBioLink: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 13,
    color: '#3B82F6',
    marginTop: 5,
  },
  subTabsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E2E8',
    marginBottom: 20,
  },
  subTabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  subTabButtonActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#111111',
  },
  bookmarksContainer: {
    gap: 12,
  },
  emptyBookmarks: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 14,
    color: '#777777',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 20,
  },
  bookmarkCard: {
    backgroundColor: '#DCDCE1',
    borderRadius: 18,
    padding: 16,
  },
  bmHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bmThumbnail: {
    width: 48,
    height: 48,
    borderRadius: 10,
    marginRight: 12,
  },
  bmAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  bmContent: {
    flex: 1,
    marginRight: 8,
  },
  bmText: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 14,
    lineHeight: 20,
    color: '#111111',
  },
  bmReference: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 12.5,
    color: '#284682',
    marginTop: 4,
    textDecorationLine: 'underline',
  },
  formContainer: {
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 13.5,
    color: '#444444',
  },
  inputField: {
    backgroundColor: '#DCDCE1',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: Typography.fontSansRegular,
    fontSize: 15,
    color: '#111111',
  },
  saveBtn: {
    backgroundColor: '#52C480',
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 12,
  },
  saveBtnText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 16,
    color: '#FFFFFF',
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  guestBannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    marginBottom: 20,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  guestBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  guestBannerIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  guestBannerTextWrap: {
    flex: 1,
  },
  guestBannerTitle: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 13.5,
    color: '#1E40AF',
  },
  guestBannerSub: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 11.5,
    color: '#6B7280',
    lineHeight: 16,
    marginTop: 2,
  },
  guestSignInBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 14,
  },
  guestSignInBtnText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 13,
    color: '#FFFFFF',
  }
});
