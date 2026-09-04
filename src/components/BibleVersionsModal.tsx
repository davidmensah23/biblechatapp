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
  fetchBibleVersionsForLanguage,
  downloadBibleVersion
} from '../services/bibleEngine';
import { useTranslation, SUPPORTED_LANGUAGES, AppLanguage } from '../services/localizationService';
import { setPreferredTranslation } from '../services/readingProgressService';
import { LanguagePickerModal } from './LanguagePickerModal';
import { CustomConfirmationModal } from './CustomConfirmationModal';

interface BibleVersionsModalProps {
  visible: boolean;
  currentVersion: string;
  onSelectVersion: (versionCode: string) => void;
  onClose: () => void;
}

interface LanguageFilterTab {
  code: string;
  label: string;
  flag: string;
}

const LANGUAGE_FILTER_TABS: LanguageFilterTab[] = [
  { code: 'all', label: 'All', flag: '🌐' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'tw', label: 'Ghana', flag: '🇬🇭' },
  { code: 'pcm', label: 'Pidgin', flag: '🇳🇬' },
  { code: 'yo', label: 'Yorùbá', flag: '🇳🇬' },
  { code: 'ig', label: 'Igbo', flag: '🇳🇬' },
  { code: 'sw', label: 'Kiswahili', flag: '🇰🇪' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'pt', label: 'Português', flag: '🇵🇹' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'tl', label: 'Tagalog', flag: '🇵🇭' },
];

export const BibleVersionsModal: React.FC<BibleVersionsModalProps> = ({
  visible,
  currentVersion,
  onSelectVersion,
  onClose
}) => {
  const { currentLanguage } = useTranslation();
  const [selectedLangFilter, setSelectedLangFilter] = useState<string>(currentLanguage || 'all');
  const [versions, setVersions] = useState<BibleVersionInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [downloadingCode, setDownloadingCode] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);
  const [feedbackModal, setFeedbackModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
    isError?: boolean;
  }>({
    visible: false,
    title: '',
    message: ''
  });

  // When modal opens, auto-detect active app language and select that filter tab!
  useEffect(() => {
    if (visible) {
      const initialLang = currentLanguage || 'all';
      setSelectedLangFilter(initialLang);
      loadVersionsForLanguage(initialLang);
    }
  }, [visible, currentLanguage]);

  const loadVersionsForLanguage = async (langCode: string) => {
    setIsLoading(true);
    try {
      const list = await fetchBibleVersionsForLanguage(langCode);
      setVersions(list);
    } catch (e) {
      console.warn('Error loading versions:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectFilter = (langCode: string) => {
    setSelectedLangFilter(langCode);
    loadVersionsForLanguage(langCode);
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
      setFeedbackModal({
        visible: true,
        title: 'Offline Ready',
        message: `${item.code} (${item.name}) is saved onto your device for 100% offline reading.`
      });
    } else {
      setFeedbackModal({
        visible: true,
        title: 'Download Error',
        message: 'Could not complete download. Please check your internet connection.',
        isError: true
      });
    }
  };

  const handleSelectVersion = async (code: string) => {
    await setPreferredTranslation(code);
    onSelectVersion(code);
    onClose();
  };

  const filteredVersions = versions.filter((v) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      v.code.toLowerCase().includes(query) ||
      v.name.toLowerCase().includes(query) ||
      (v.language && v.language.toLowerCase().includes(query))
    );
  });

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        {/* Header Bar */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.headerCloseBtn} activeOpacity={0.7}>
            <Ionicons name="close" size={22} color="#111111" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Bible Translations</Text>

          <TouchableOpacity
            style={styles.headerLangBtn}
            onPress={() => setShowLanguagePicker(true)}
            activeOpacity={0.75}
          >
            <Ionicons name="globe-outline" size={17} color="#111111" style={{ marginRight: 4 }} />
            <Text style={styles.headerLangText}>
              {SUPPORTED_LANGUAGES.find(l => l.code === currentLanguage)?.flag || '🌐'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchWrapper}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={18} color="#9CA3AF" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search translation (e.g. Twi, KJV, NIV, RVR)..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Horizontal Language Filter Tabs */}
        <View style={styles.langTabsWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.langTabsScroll}>
            {LANGUAGE_FILTER_TABS.map((tab) => {
              const isSelected = selectedLangFilter === tab.code;
              return (
                <TouchableOpacity
                  key={tab.code}
                  style={[styles.langTabPill, isSelected && styles.langTabPillActive]}
                  onPress={() => handleSelectFilter(tab.code)}
                  activeOpacity={0.75}
                >
                  <Text style={styles.langTabFlag}>{tab.flag}</Text>
                  <Text style={[styles.langTabText, isSelected && styles.langTabTextActive]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Versions List */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#111111" />
            <Text style={styles.loadingText}>Fetching translations from YouVersion & Offline Library...</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {filteredVersions.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="book-outline" size={44} color="#D1D5DB" />
                <Text style={styles.emptyTitle}>No Translations Found</Text>
                <Text style={styles.emptySubtitle}>
                  Try selecting "All" or searching for a different language.
                </Text>
              </View>
            ) : (
              <View style={styles.listCardWrap}>
                {filteredVersions.map((item) => {
                  const isSelected = currentVersion.toUpperCase() === item.code.toUpperCase();
                  const isDownloading = downloadingCode === item.code;

                  return (
                    <TouchableOpacity
                      key={item.id || item.code}
                      style={[styles.versionRow, isSelected && styles.versionRowSelected]}
                      onPress={() => handleSelectVersion(item.code)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.versionInfo}>
                        <View style={styles.codeRow}>
                          <Text style={[styles.versionCode, isSelected && styles.versionCodeSelected]}>
                            {item.code}
                          </Text>

                          {item.hasAudio && (
                            <View style={styles.audioBadge}>
                              <Ionicons name="volume-medium" size={13} color="#4B5563" />
                            </View>
                          )}

                          {item.isDownloaded && (
                            <View style={styles.offlineBadge}>
                              <Ionicons name="checkmark-circle" size={11} color="#059669" style={{ marginRight: 3 }} />
                              <Text style={styles.offlineBadgeText}>Offline</Text>
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

                      {/* Right Action: Download or Selection Check */}
                      <View style={styles.rightAction}>
                        {!item.isDownloaded && (
                          <TouchableOpacity
                            style={styles.downloadBtn}
                            onPress={() => handleDownload(item)}
                            disabled={isDownloading}
                            activeOpacity={0.7}
                          >
                            {isDownloading ? (
                              <ActivityIndicator size="small" color="#111111" />
                            ) : (
                              <Ionicons name="cloud-download-outline" size={20} color="#6B7280" />
                            )}
                          </TouchableOpacity>
                        )}

                        <Ionicons
                          name={isSelected ? "checkmark-circle" : "radio-button-off"}
                          size={22}
                          color={isSelected ? "#111111" : "#D1D5DB"}
                          style={{ marginLeft: 8 }}
                        />
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
            <View style={{ height: 32 }} />
          </ScrollView>
        )}

        {/* Language Picker Sub-Modal */}
        <LanguagePickerModal
          visible={showLanguagePicker}
          onClose={() => setShowLanguagePicker(false)}
          onLanguageSelected={(newLang) => {
            setSelectedLangFilter(newLang);
            loadVersionsForLanguage(newLang);
          }}
        />

        {/* Custom Confirmation / Alert Modal */}
        <CustomConfirmationModal
          visible={feedbackModal.visible}
          title={feedbackModal.title}
          message={feedbackModal.message}
          icon={feedbackModal.isError ? 'alert-circle-outline' : 'checkmark-circle-outline'}
          confirmText="OK"
          singleButton={true}
          onConfirm={() => setFeedbackModal(prev => ({ ...prev, visible: false }))}
          onClose={() => setFeedbackModal(prev => ({ ...prev, visible: false }))}
        />
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerCloseBtn: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
  },
  headerTitle: {
    fontFamily: Typography.fontSansBold,
    fontSize: 16,
    color: '#111827',
  },
  headerLangBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  headerLangText: {
    fontSize: 14,
  },
  searchWrapper: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 6,
    backgroundColor: '#FFFFFF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    fontFamily: Typography.fontSansRegular,
    fontSize: 13,
    color: '#111827',
  },
  langTabsWrapper: {
    backgroundColor: '#FFFFFF',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  langTabsScroll: {
    paddingHorizontal: 18,
    gap: 8,
  },
  langTabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  langTabPillActive: {
    backgroundColor: '#111827',
    borderColor: '#111827',
  },
  langTabFlag: {
    fontSize: 13,
    marginRight: 5,
  },
  langTabText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 12,
    color: '#4B5563',
  },
  langTabTextActive: {
    color: '#FFFFFF',
    fontFamily: Typography.fontSansSemiBold,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 30,
  },
  loadingText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 13,
    color: '#6B7280',
    marginTop: 12,
    textAlign: 'center',
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 30,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 30,
  },
  emptyTitle: {
    fontFamily: Typography.fontSansBold,
    fontSize: 15,
    color: '#374151',
    marginTop: 12,
  },
  emptySubtitle: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  listCardWrap: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  versionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  versionRowSelected: {
    backgroundColor: '#F9FAFB',
  },
  versionInfo: {
    flex: 1,
    paddingRight: 12,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  versionCode: {
    fontFamily: Typography.fontSansBold,
    fontSize: 14,
    color: '#111827',
  },
  versionCodeSelected: {
    color: '#111827',
  },
  audioBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  offlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  offlineBadgeText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 10,
    color: '#059669',
  },
  activePill: {
    backgroundColor: '#111827',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  activePillText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 10,
    color: '#FFFFFF',
  },
  versionName: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 12.5,
    color: '#4B5563',
    lineHeight: 17,
  },
  rightAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  downloadBtn: {
    padding: 6,
  },
});
