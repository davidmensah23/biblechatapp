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
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import {
  BibleVersionInfo,
  getBibleVersionsList,
  downloadBibleVersion
} from '../services/bibleEngine';
import { useTranslation, SUPPORTED_LANGUAGES, AppLanguage } from '../services/localizationService';
import { LanguagePickerModal } from './LanguagePickerModal';

interface BibleVersionsModalProps {
  visible: boolean;
  currentVersion: string;
  onSelectVersion: (versionCode: string) => void;
  onClose: () => void;
}

export const BibleVersionsModal: React.FC<BibleVersionsModalProps> = ({
  visible,
  currentVersion,
  onSelectVersion,
  onClose
}) => {
  const { t, currentLanguage, setLanguage } = useTranslation();
  const [versions, setVersions] = useState<BibleVersionInfo[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [downloadingCode, setDownloadingCode] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);

  useEffect(() => {
    if (visible) {
      loadVersions();
    }
  }, [visible, currentLanguage]);

  const loadVersions = async () => {
    const list = await getBibleVersionsList();
    setVersions(list);
  };

  const handleDownload = async (item: BibleVersionInfo) => {
    setDownloadingCode(item.code);
    setDownloadProgress(10);

    const success = await downloadBibleVersion(item.code, (p) => {
      setDownloadProgress(p);
    });

    setDownloadingCode(null);
    setDownloadProgress(0);

    if (success) {
      setVersions(prev =>
        prev.map(v => (v.code === item.code ? { ...v, isDownloaded: true } : v))
      );
      Alert.alert(
        'Downloaded for Offline Reading',
        `${item.code} (${item.name}) is now saved on your device and will work 100% offline with zero internet!`
      );
    } else {
      Alert.alert('Download Error', 'Could not complete translation download. Please check your connection.');
    }
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
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        {/* Header Bar */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Translations</Text>

          <TouchableOpacity style={styles.searchBtn}>
            <Ionicons name="search" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Language Selector Card */}
          <TouchableOpacity
            style={styles.languagePill}
            onPress={() => setShowLanguagePicker(true)}
            activeOpacity={0.8}
          >
            <View style={styles.languageLeft}>
              <Ionicons name="globe-outline" size={20} color={Colors.textPrimary} style={{ marginRight: 10 }} />
              <Text style={styles.languageLabel}>{t('language_label', 'Language')}</Text>
            </View>
            <View style={styles.languageRight}>
              <Text style={styles.languageValue}>
                {SUPPORTED_LANGUAGES.find(l => l.code === currentLanguage)?.flag}{' '}
                {SUPPORTED_LANGUAGES.find(l => l.code === currentLanguage)?.name || 'English (US)'}
              </Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.textPrimary} style={{ marginLeft: 6 }} />
            </View>
          </TouchableOpacity>

          {/* Search Input */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={18} color={Colors.textMuted} style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search translation name or code (KJV, NIV)..."
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

          {/* Downloaded Offline Section */}
          {downloadedList.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionHeading}>Offline Ready on Device ({downloadedList.length})</Text>
                <View style={styles.offlineBadge}>
                  <Ionicons name="checkmark-circle" size={13} color="#059669" />
                  <Text style={styles.offlineBadgeText}>Offline</Text>
                </View>
              </View>

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
                            <Ionicons name="volume-medium" size={13} color="#666666" />
                          </View>
                        )}
                        {isSelected && (
                          <View style={styles.activePill}>
                            <Text style={styles.activePillText}>Active</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.versionName} numberOfLines={2}>
                        {item.name}
                      </Text>
                    </View>

                    <Ionicons
                      name={isSelected ? "radio-button-on" : "radio-button-off"}
                      size={20}
                      color={isSelected ? "#2563EB" : "#9CA3AF"}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Available for Download Section */}
          {availableList.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionHeading}>Available for Offline Download ({availableList.length})</Text>
              {availableList.map((item) => {
                const isDownloading = downloadingCode === item.code;
                return (
                  <View key={item.id} style={styles.versionRow}>
                    <View style={styles.versionInfo}>
                      <View style={styles.codeRow}>
                        <Text style={styles.versionCode}>{item.code}</Text>
                        {item.hasAudio && (
                          <View style={styles.audioBadge}>
                            <Ionicons name="volume-medium" size={13} color="#666666" />
                          </View>
                        )}
                      </View>
                      <Text style={styles.versionName} numberOfLines={2}>
                        {item.name}
                      </Text>
                    </View>

                    {isDownloading ? (
                      <View style={styles.downloadProgressWrap}>
                        <ActivityIndicator size="small" color="#2563EB" />
                        <Text style={styles.progressPercentText}>{downloadProgress}%</Text>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={styles.downloadBtn}
                        onPress={() => handleDownload(item)}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="cloud-download-outline" size={16} color="#2563EB" style={{ marginRight: 4 }} />
                        <Text style={styles.downloadBtnText}>Download</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>

      <LanguagePickerModal
        visible={showLanguagePicker}
        onClose={() => setShowLanguagePicker(false)}
        onLanguageSelected={(lang) => {
          setLanguage(lang);
          setShowLanguagePicker(false);
        }}
      />
    </Modal>
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
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    backgroundColor: '#F3F3F5',
  },
  backBtn: {
    padding: 6,
  },
  headerTitle: {
    fontFamily: Typography.fontSerif,
    fontSize: 24,
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
    backgroundColor: '#DCDCE1',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 12,
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
    color: '#555555',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCDCE1',
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
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionHeading: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 16,
    color: '#111827',
  },
  offlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DEF7EC',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    gap: 3,
  },
  offlineBadgeText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 11,
    color: '#059669',
  },
  versionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#DCDCE1',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  versionRowSelected: {
    borderWidth: 1.5,
    borderColor: '#2563EB',
    backgroundColor: '#E8E8EE',
  },
  versionInfo: {
    flex: 1,
    paddingRight: 12,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  versionCode: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 16,
    color: '#111827',
  },
  versionCodeSelected: {
    color: '#2563EB',
  },
  activePill: {
    backgroundColor: '#2563EB',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    marginLeft: 8,
  },
  activePillText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 10,
    color: '#FFFFFF',
  },
  audioBadge: {
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 2,
    marginLeft: 6,
  },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECECF0',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  downloadBtnText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 12,
    color: '#2563EB',
  },
  downloadProgressWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  progressPercentText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 12,
    color: '#2563EB',
  },
  versionName: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 13,
    color: '#555555',
    lineHeight: 17,
  }
});
