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
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { fetchBookmarks, removeBookmark, fetchUserProfile, saveUserProfile } from '../services/database';
import { SavedBookmark, UserProfile } from '../types';
import { SettingsScreen } from './SettingsScreen';

export const ProfileScreen: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'bookmarks' | 'edit'>('bookmarks');
  const [bookmarks, setBookmarks] = useState<SavedBookmark[]>([]);
  const [profile, setProfile] = useState<UserProfile>({
    fullName: 'Kofi Amartey James',
    email: 'ko.james@gmail.com',
    bio: 'I am an INFP with multiple interest. Introverted and artistic seeker of Christ.',
    location: 'Ghana, Accra',
    dateOfBirth: '28th, June, 2025'
  });
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const bms = await fetchBookmarks();
    setBookmarks(bms);
    const p = await fetchUserProfile();
    setProfile(p);
  };

  const handleSaveProfile = async () => {
    await saveUserProfile(profile);
    Alert.alert('Success', 'Profile changes saved successfully!');
  };

  const handleRemoveBookmark = async (id: string) => {
    await removeBookmark(id);
    setBookmarks(bookmarks.filter(b => b.id !== id));
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Navigation */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Profile</Text>
          <View style={styles.titleRedLine} />
        </View>

        <TouchableOpacity
          style={styles.settingsBtn}
          onPress={() => setShowSettings(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="options-outline" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <View style={styles.userCard}>
          <Image
            source={require('../../assets/avatars/user_profile.png')}
            style={styles.userAvatar}
          />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{profile.fullName}</Text>
            <Text style={styles.userBio} numberOfLines={2}>{profile.bio}</Text>
            <TouchableOpacity onPress={() => setActiveSubTab('edit')}>
              <Text style={styles.editBioLink}>
                <Ionicons name="create-outline" size={13} color="#3B82F6" /> Edit your bio
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
              size={20}
              color={activeSubTab === 'bookmarks' ? Colors.textPrimary : Colors.textMuted}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.subTabButton, activeSubTab === 'edit' && styles.subTabButtonActive]}
            onPress={() => setActiveSubTab('edit')}
          >
            <Ionicons
              name={activeSubTab === 'edit' ? 'person' : 'person-outline'}
              size={20}
              color={activeSubTab === 'edit' ? Colors.textPrimary : Colors.textMuted}
            />
          </TouchableOpacity>
        </View>

        {/* Tab 1: Bookmarks & Saved Items */}
        {activeSubTab === 'bookmarks' ? (
          <View style={styles.bookmarksContainer}>
            {bookmarks.map((bm) => (
              <View key={bm.id} style={styles.bookmarkCard}>
                <View style={styles.bmHeader}>
                  {bm.type === 'verse' ? (
                    <Image
                      source={require('../../assets/images/daily_scripture_banner.png')}
                      style={styles.bmThumbnail}
                    />
                  ) : (
                    <Image
                      source={require('../../assets/avatars/thomas.png')}
                      style={styles.bmAvatar}
                    />
                  )}
                  <View style={styles.bmContent}>
                    <Text style={styles.bmText} numberOfLines={3}>{bm.content}</Text>
                    <Text style={styles.bmReference}>{bm.type === 'verse' ? 'Read' : 'View message in chat'}</Text>
                  </View>
                  <TouchableOpacity onPress={() => handleRemoveBookmark(bm.id)}>
                    <Ionicons name="heart" size={18} color={Colors.heartActive} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
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
              <Text style={styles.inputLabel}>Email</Text>
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

      {/* Settings Modal */}
      <SettingsScreen
        visible={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </SafeAreaView>
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
    paddingBottom: 10,
  },
  titleContainer: {
    position: 'relative',
    paddingBottom: 4,
  },
  title: {
    fontFamily: Typography.fontSerif,
    fontSize: 26,
    color: Colors.textPrimary,
  },
  titleRedLine: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 28,
    height: 2.5,
    backgroundColor: Colors.accentRed,
    borderRadius: 2,
  },
  settingsBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.cardSecondary,
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
    width: 68,
    height: 68,
    borderRadius: 34,
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontFamily: Typography.fontSerif,
    fontSize: 22,
    color: Colors.textPrimary,
  },
  userBio: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 11.5,
    color: Colors.textMuted,
    marginTop: 2,
    lineHeight: 16,
  },
  editBioLink: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 12,
    color: '#3B82F6',
    marginTop: 4,
  },
  subTabsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
    marginBottom: 20,
  },
  subTabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  subTabButtonActive: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.textPrimary,
  },
  bookmarksContainer: {
    gap: 12,
  },
  bookmarkCard: {
    backgroundColor: Colors.cardSecondary,
    borderRadius: 18,
    padding: 14,
  },
  bmHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bmThumbnail: {
    width: 44,
    height: 44,
    borderRadius: 8,
    marginRight: 12,
  },
  bmAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  bmContent: {
    flex: 1,
    marginRight: 8,
  },
  bmText: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 12,
    lineHeight: 17,
    color: Colors.textPrimary,
  },
  bmReference: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 11,
    color: '#3B82F6',
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
    fontSize: 12,
    color: Colors.textSecondary,
  },
  inputField: {
    backgroundColor: Colors.cardSecondary,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: Typography.fontSansRegular,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  saveBtn: {
    backgroundColor: Colors.accentGreen,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  saveBtnText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 15,
    color: '#FFFFFF',
  }
});
