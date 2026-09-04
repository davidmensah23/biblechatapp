import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { Typography } from '../theme/typography';
import {
  SACRED_AVATAR_EMBLEMS,
  SacredAvatarEmblem,
  DICEBEAR_STYLES,
  getDicebearUrl,
  rollRandomDicebearAvatar,
  setUserAvatarEmblem,
  saveUserAvatarUrl,
  uploadProfileAvatar
} from '../services/avatarService';
import { InteractiveGestureSheet } from './InteractiveGestureSheet';

interface AvatarPickerModalProps {
  visible: boolean;
  selectedEmblemId: string;
  currentAvatarUrl?: string;
  userId?: string;
  onClose: () => void;
  onSelectEmblem: (emblem: SacredAvatarEmblem) => void;
  onSelectAvatarUrl?: (url: string) => void;
}

export const AvatarPickerModal: React.FC<AvatarPickerModalProps> = ({
  visible,
  selectedEmblemId,
  currentAvatarUrl,
  userId = 'guest',
  onClose,
  onSelectEmblem,
  onSelectAvatarUrl
}) => {
  const [activeTab, setActiveTab] = useState<'dicebear' | 'emblems'>('dicebear');
  const [dicebearStyle, setDicebearStyle] = useState<string>('notionists');
  const [previewAvatar, setPreviewAvatar] = useState<string>(
    currentAvatarUrl && currentAvatarUrl.startsWith('http')
      ? currentAvatarUrl
      : getDicebearUrl(`seed_${userId}`, 'notionists')
  );
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // Roll a fresh random Dicebear avatar
  const handleRollRandom = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (e) {}
    const newUrl = rollRandomDicebearAvatar(dicebearStyle);
    setPreviewAvatar(newUrl);
  };

  // Switch style & refresh preview
  const handleSelectStyle = (styleId: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}
    setDicebearStyle(styleId);
    setPreviewAvatar(getDicebearUrl(`seed_${Date.now()}`, styleId));
  };

  // Apply chosen Dicebear avatar
  const handleApplyDicebear = async () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {}
    await saveUserAvatarUrl(previewAvatar);
    if (onSelectAvatarUrl) onSelectAvatarUrl(previewAvatar);
    onClose();
  };

  // Upload custom photo from phone gallery
  const handlePickAndUploadPhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert("Permission Needed", "Please grant photo library access to upload your profile picture.");
        return;
      }

      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (pickerResult.canceled || !pickerResult.assets?.[0]?.uri) {
        return;
      }

      setIsUploading(true);
      const selectedUri = pickerResult.assets[0].uri;
      const res = await uploadProfileAvatar(userId, selectedUri);
      setIsUploading(false);

      if (res.success && res.url) {
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (e) {}
        setPreviewAvatar(res.url);
        if (onSelectAvatarUrl) onSelectAvatarUrl(res.url);
        onClose();
      } else {
        Alert.alert("Upload Failed", res.error || "Could not save profile picture. Please try again.");
      }
    } catch (err: any) {
      setIsUploading(false);
      Alert.alert("Error", err.message || "An unexpected error occurred.");
    }
  };

  // Select Sacred Emblem
  const handleSelectEmblem = async (emblem: SacredAvatarEmblem) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}
    await setUserAvatarEmblem(emblem.id);
    onSelectEmblem(emblem);
    onClose();
  };

  return (
    <InteractiveGestureSheet
      visible={visible}
      onClose={onClose}
      initialSnap="mid"
      midHeightRatio={0.82}
      fullHeightRatio={0.98}
    >
      <View style={styles.sheetContainer}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Profile Avatar</Text>
            <Text style={styles.subtitle}>Choose your sacred identity in fellowship</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
            <Ionicons name="close" size={20} color="#111111" />
          </TouchableOpacity>
        </View>

        {/* Top Switcher: Dicebear vs Emblems */}
        <View style={styles.tabsSwitcher}>
          <TouchableOpacity
            style={[styles.switcherTab, activeTab === 'dicebear' && styles.switcherTabActive]}
            onPress={() => setActiveTab('dicebear')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="dice-outline"
              size={16}
              color={activeTab === 'dicebear' ? '#111827' : '#6B7280'}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.switcherText, activeTab === 'dicebear' && styles.switcherTextActive]}>
              Dicebear & Photos
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.switcherTab, activeTab === 'emblems' && styles.switcherTabActive]}
            onPress={() => setActiveTab('emblems')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="shield-checkmark-outline"
              size={16}
              color={activeTab === 'emblems' ? '#111827' : '#6B7280'}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.switcherText, activeTab === 'emblems' && styles.switcherTextActive]}>
              Sacred Emblems
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {activeTab === 'dicebear' ? (
            <View>
              {/* Live Preview Circle */}
              <View style={styles.previewCenter}>
                <View style={styles.previewRing}>
                  <Image source={{ uri: previewAvatar }} style={styles.previewImage} resizeMode="cover" />
                </View>

                {/* Roll Dice Button */}
                <TouchableOpacity
                  style={styles.rollDiceBtn}
                  onPress={handleRollRandom}
                  activeOpacity={0.8}
                >
                  <Ionicons name="shuffle" size={17} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.rollDiceBtnText}>Roll New Avatar 🎲</Text>
                </TouchableOpacity>
              </View>

              {/* Style Selector Chips */}
              <Text style={styles.sectionLabel}>AVATAR STYLES</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.stylesRow}>
                {DICEBEAR_STYLES.map((s) => (
                  <TouchableOpacity
                    key={s.id}
                    style={[styles.styleChip, dicebearStyle === s.id && styles.styleChipActive]}
                    onPress={() => handleSelectStyle(s.id)}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.styleChipText, dicebearStyle === s.id && styles.styleChipTextActive]}>
                      {s.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Upload Photo Button */}
              <TouchableOpacity
                style={[styles.uploadPhotoBtn, isUploading && { opacity: 0.6 }]}
                onPress={handlePickAndUploadPhoto}
                disabled={isUploading}
                activeOpacity={0.8}
              >
                {isUploading ? (
                  <ActivityIndicator size="small" color="#111827" />
                ) : (
                  <>
                    <Ionicons name="camera-outline" size={19} color="#111827" style={{ marginRight: 8 }} />
                    <Text style={styles.uploadPhotoBtnText}>Upload from Camera / Gallery</Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Apply Button */}
              <TouchableOpacity
                style={styles.applyBtn}
                onPress={handleApplyDicebear}
                activeOpacity={0.85}
              >
                <Text style={styles.applyBtnText}>Use This Avatar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* Sacred Emblems Grid */
            <View style={styles.grid}>
              {SACRED_AVATAR_EMBLEMS.map((emblem) => {
                const isSelected = selectedEmblemId === emblem.id;
                return (
                  <TouchableOpacity
                    key={emblem.id}
                    style={[
                      styles.emblemCard,
                      isSelected && styles.emblemCardSelected
                    ]}
                    onPress={() => handleSelectEmblem(emblem)}
                    activeOpacity={0.75}
                  >
                    <View style={[styles.emblemIconCircle, { backgroundColor: emblem.bgColor }]}>
                      <Text style={styles.emblemEmoji}>{emblem.emoji}</Text>
                    </View>
                    <Text style={styles.emblemName} numberOfLines={1}>{emblem.name}</Text>
                    <Text style={styles.emblemMeaning} numberOfLines={1}>{emblem.meaning}</Text>
                    {isSelected && (
                      <View style={styles.checkBadge}>
                        <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </ScrollView>
      </View>
    </InteractiveGestureSheet>
  );
};

const styles = StyleSheet.create({
  sheetContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    backgroundColor: '#FFFFFF',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  title: {
    fontFamily: Typography.fontSansBold,
    fontSize: 18,
    color: '#111827',
  },
  subtitle: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 12.5,
    color: '#6B7280',
    marginTop: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabsSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 3,
    marginBottom: 16,
  },
  switcherTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 10,
  },
  switcherTabActive: {
    backgroundColor: '#FFFFFF',
  },
  switcherText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 13,
    color: '#6B7280',
  },
  switcherTextActive: {
    fontFamily: Typography.fontSansBold,
    color: '#111827',
  },
  scrollContent: {
    paddingBottom: 30,
  },
  previewCenter: {
    alignItems: 'center',
    marginBottom: 18,
  },
  previewRing: {
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 3,
    borderColor: '#111827',
    padding: 3,
    marginBottom: 12,
    backgroundColor: '#F9FAFB',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 48,
  },
  rollDiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 14,
  },
  rollDiceBtnText: {
    fontFamily: Typography.fontSansBold,
    fontSize: 13,
    color: '#FFFFFF',
  },
  sectionLabel: {
    fontFamily: Typography.fontSansBold,
    fontSize: 11,
    color: '#6B7280',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  stylesRow: {
    flexDirection: 'row',
    marginBottom: 18,
  },
  styleChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  styleChipActive: {
    backgroundColor: '#111827',
    borderColor: '#111827',
  },
  styleChipText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 12.5,
    color: '#4B5563',
  },
  styleChipTextActive: {
    color: '#FFFFFF',
    fontFamily: Typography.fontSansBold,
  },
  uploadPhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
  },
  uploadPhotoBtnText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 13.5,
    color: '#111827',
  },
  applyBtn: {
    backgroundColor: '#111827',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyBtnText: {
    fontFamily: Typography.fontSansBold,
    fontSize: 14,
    color: '#FFFFFF',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  emblemCard: {
    width: '31%',
    backgroundColor: '#F9FAFB',
    borderRadius: 18,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#F3F4F6',
    position: 'relative',
  },
  emblemCardSelected: {
    borderColor: '#8B1E1E',
    backgroundColor: '#FFFBFB',
  },
  emblemIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emblemEmoji: {
    fontSize: 26,
  },
  emblemName: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 12,
    color: '#111827',
    textAlign: 'center',
  },
  emblemMeaning: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 9.5,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 2,
  },
  checkBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#8B1E1E',
    alignItems: 'center',
    justifyContent: 'center',
  }
});
