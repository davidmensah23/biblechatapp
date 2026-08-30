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
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';

export interface BibleVersionItem {
  id: string;
  code: string;
  name: string;
  hasAudio: boolean;
  isDownloaded: boolean;
  hasUpdate?: boolean;
}

interface BibleVersionsModalProps {
  visible: boolean;
  currentVersion: string;
  onSelectVersion: (versionCode: string) => void;
  onClose: () => void;
}

const INITIAL_VERSIONS: BibleVersionItem[] = [
  // Downloaded
  { id: '1', code: 'NIV', name: 'New International Version', hasAudio: true, isDownloaded: true, hasUpdate: true },
  { id: '2', code: 'KJV', name: 'King James Version', hasAudio: true, isDownloaded: true },
  { id: '3', code: 'ESV', name: 'English Standard Version', hasAudio: true, isDownloaded: true },
  { id: '4', code: 'WEB', name: 'World English Bible', hasAudio: false, isDownloaded: true },

  // Available for Download
  { id: '5', code: 'NLT', name: 'New Living Translation', hasAudio: true, isDownloaded: false },
  { id: '6', code: 'AMP', name: 'Amplified Bible', hasAudio: false, isDownloaded: false },
  { id: '7', code: 'ASV', name: 'American Standard Version (1901)', hasAudio: false, isDownloaded: false },
  { id: '8', code: 'BBE', name: 'Bible in Basic English', hasAudio: false, isDownloaded: false },
  { id: '9', code: 'GNV', name: 'Geneva Bible (1599)', hasAudio: false, isDownloaded: false },
  { id: '10', code: 'AFINTEXP', name: 'African International New Testament: Explanatory Paraphrase', hasAudio: false, isDownloaded: false },
  { id: '11', code: 'AFINTLIT', name: 'African International New Testament: Literal Translation', hasAudio: false, isDownloaded: false }
];

export const BibleVersionsModal: React.FC<BibleVersionsModalProps> = ({
  visible,
  currentVersion,
  onSelectVersion,
  onClose
}) => {
  const [versions, setVersions] = useState<BibleVersionItem[]>(INITIAL_VERSIONS);
  const [searchQuery, setSearchQuery] = useState('');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownload = (item: BibleVersionItem) => {
    setDownloadingId(item.id);
    setTimeout(() => {
      setVersions((prev) =>
        prev.map((v) => (v.id === item.id ? { ...v, isDownloaded: true } : v))
      );
      setDownloadingId(null);
      Alert.alert('Downloaded', `${item.code} (${item.name}) is now downloaded for 100% offline reading!`);
    }, 1200);
  };

  const handleSelect = (code: string) => {
    onSelectVersion(code);
    onClose();
  };

  const downloadedList = versions.filter(
    (v) =>
      v.isDownloaded &&
      (v.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const availableList = versions.filter(
    (v) =>
      !v.isDownloaded &&
      (v.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView style={styles.container}>
        {/* Header Bar */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Versions</Text>

          <TouchableOpacity style={styles.searchBtn}>
            <Ionicons name="search" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Language Selector Card */}
          <TouchableOpacity style={styles.languagePill} activeOpacity={0.75}>
            <View style={styles.languageLeft}>
              <Ionicons name="globe-outline" size={20} color={Colors.textPrimary} style={{ marginRight: 10 }} />
              <Text style={styles.languageLabel}>Language</Text>
            </View>
            <View style={styles.languageRight}>
              <Text style={styles.languageValue}>English</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} style={{ marginLeft: 4 }} />
            </View>
          </TouchableOpacity>

          {/* Search Input */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={18} color={Colors.textMuted} style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search translation name or code..."
              placeholderTextColor={Colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          {/* Downloaded Section */}
          {downloadedList.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionHeading}>Downloaded</Text>
              {downloadedList.map((item) => {
                const isSelected = currentVersion.toUpperCase() === item.code.toUpperCase();
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.versionRow, isSelected && styles.versionRowSelected]}
                    onPress={() => handleSelect(item.code)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.versionInfo}>
                      <View style={styles.codeRow}>
                        <Text style={[styles.versionCode, isSelected && styles.versionCodeSelected]}>
                          {item.code}
                        </Text>
                        {item.hasAudio && (
                          <View style={styles.audioBadge}>
                            <Ionicons name="volume-medium" size={14} color="#666666" />
                          </View>
                        )}
                      </View>
                      <Text style={styles.versionName} numberOfLines={2}>
                        {item.name}
                      </Text>
                      {item.hasUpdate && (
                        <View style={styles.updateBadge}>
                          <Text style={styles.updateBadgeText}>Update Available</Text>
                        </View>
                      )}
                    </View>

                    <TouchableOpacity style={styles.moreBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                      <Ionicons name="ellipsis-vertical" size={18} color={Colors.textMuted} />
                    </TouchableOpacity>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Available English Versions Section */}
          {availableList.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionHeading}>English Versions ({availableList.length})</Text>
              {availableList.map((item) => (
                <View key={item.id} style={styles.versionRow}>
                  <View style={styles.versionInfo}>
                    <View style={styles.codeRow}>
                      <Text style={styles.versionCode}>{item.code}</Text>
                      {downloadingId === item.id ? (
                        <ActivityIndicator size="small" color={Colors.accentBlue} style={{ marginLeft: 8 }} />
                      ) : (
                        <TouchableOpacity
                          style={styles.downloadBtn}
                          onPress={() => handleDownload(item)}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="download-outline" size={16} color={Colors.textPrimary} />
                        </TouchableOpacity>
                      )}
                    </View>
                    <Text style={styles.versionName} numberOfLines={2}>
                      {item.name}
                    </Text>
                  </View>

                  <TouchableOpacity style={styles.moreBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Ionicons name="ellipsis-vertical" size={18} color={Colors.textMuted} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backBtn: {
    padding: 6,
  },
  headerTitle: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 20,
    color: Colors.textPrimary,
  },
  searchBtn: {
    padding: 6,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 60,
  },
  languagePill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F3F4F6',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 14,
    marginBottom: 16,
  },
  languageLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageLabel: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  languageRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageValue: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 14,
    color: '#4B5563',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    fontFamily: Typography.fontSansRegular,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  section: {
    marginBottom: 26,
  },
  sectionHeading: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 18,
    color: '#111827',
    marginBottom: 14,
  },
  versionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  versionRowSelected: {
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
    borderRadius: 12,
    paddingHorizontal: 8,
  },
  versionInfo: {
    flex: 1,
    paddingRight: 12,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  versionCode: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 17,
    color: '#111827',
  },
  versionCodeSelected: {
    color: Colors.accentBlue,
  },
  audioBadge: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  downloadBtn: {
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 8,
  },
  versionName: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 13.5,
    color: '#6B7280',
    lineHeight: 18,
  },
  updateBadge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#EF4444',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 6,
  },
  updateBadgeText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 10.5,
    color: '#EF4444',
  },
  moreBtn: {
    padding: 6,
  }
});
