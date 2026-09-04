import React, { useState, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  TextInput,
  ScrollView,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { ALL_BIBLE_BOOKS } from '../services/bibleEngine';
import { BibleBook } from '../types';
import { useTranslation } from '../services/localizationService';
import { getLocalizedBookName, getLanguageForTranslation } from '../services/bibleBookTranslations';

interface BibleBookPickerModalProps {
  visible: boolean;
  currentBook: string;
  currentChapter: number;
  currentTranslation?: string;
  onSelect: (book: string, chapter: number) => void;
  onClose: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_PADDING = 20;
const GRID_GAP = 10;
const COLUMNS = 5;
// Calculate exact width for 5 equal columns
const TILE_WIDTH = Math.floor((SCREEN_WIDTH - (GRID_PADDING * 2) - (GRID_GAP * (COLUMNS - 1))) / COLUMNS);

export const BibleBookPickerModal: React.FC<BibleBookPickerModalProps> = ({
  visible,
  currentBook,
  currentChapter,
  currentTranslation,
  onSelect,
  onClose
}) => {
  const { currentLanguage } = useTranslation();
  const activePickerLanguage = getLanguageForTranslation(currentTranslation, currentLanguage);
  // Tab 1: Old Testament (39), Tab 2: New Testament (27) - Biblical Order
  const [testamentTab, setTestamentTab] = useState<'OT' | 'NT'>('OT');
  const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Books filtered by active testament tab and localized / english search query
  const filteredBooks = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return ALL_BIBLE_BOOKS.filter((b) => {
      if (b.testament !== testamentTab) return false;
      if (!q) return true;
      const localized = getLocalizedBookName(b.name, activePickerLanguage).toLowerCase();
      return b.name.toLowerCase().includes(q) || localized.includes(q);
    });
  }, [testamentTab, searchQuery, activePickerLanguage]);


  const handleBookClick = (book: BibleBook) => {
    setSelectedBook(book);
  };

  const handleChapterClick = (chapNumber: number) => {
    if (selectedBook) {
      onSelect(selectedBook.name, chapNumber);
      setSelectedBook(null);
      onClose();
    }
  };

  const handleBackToBooks = () => {
    setSelectedBook(null);
  };

  const selectedBookLocalized = selectedBook
    ? getLocalizedBookName(selectedBook.name, activePickerLanguage)
    : '';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header Bar */}
        <View style={styles.header}>
          {selectedBook ? (
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBackToBooks}
              activeOpacity={0.7}
            >
              <View style={styles.backIconCircle}>
                <Ionicons name="arrow-back" size={18} color="#111111" />
              </View>
              <Text style={styles.headerTitle}>
                {selectedBookLocalized || selectedBook.name}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.headerLeft}>
              <Text style={styles.headerTitle}>Select Scripture</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={20} color="#111111" />
          </TouchableOpacity>
        </View>

        {selectedBook ? (
          /* ================= CHAPTER SELECTION VIEW ================= */
          <View style={styles.chapterContainer}>
            {/* Book Info Summary Card */}
            <View style={styles.bookSummaryCard}>
              <View style={styles.bookSummaryLeft}>
                <Text style={styles.bookSummaryTitle}>
                  {selectedBookLocalized}
                </Text>
                {selectedBookLocalized !== selectedBook.name && (
                  <Text style={styles.bookSummarySubtitle}>
                    {selectedBook.name}
                  </Text>
                )}
                <View style={styles.badgeRow}>
                  <View style={styles.testamentPill}>
                    <Text style={styles.testamentPillText}>
                      {selectedBook.testament === 'OT' ? 'Old Testament' : 'New Testament'}
                    </Text>
                  </View>
                  <Text style={styles.chapterCountMeta}>
                    {selectedBook.chaptersCount} Chapters
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.changeBookPill}
                onPress={handleBackToBooks}
                activeOpacity={0.7}
              >
                <Text style={styles.changeBookPillText}>Change Book</Text>
              </TouchableOpacity>
            </View>

            {/* Instruction Label */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeaderLabel}>Select Chapter</Text>
              <Text style={styles.sectionHeaderSub}>Tap to start reading</Text>
            </View>

            {/* 5-Column Responsive Chapter Grid */}
            <ScrollView
              contentContainerStyle={styles.chapterGrid}
              showsVerticalScrollIndicator={false}
            >
              {Array.from({ length: selectedBook.chaptersCount }, (_, i) => i + 1).map((chap) => {
                const isCurrent = selectedBook.name === currentBook && chap === currentChapter;
                return (
                  <TouchableOpacity
                    key={chap}
                    style={[
                      styles.chapterTile,
                      { width: TILE_WIDTH, height: TILE_WIDTH },
                      isCurrent && styles.chapterTileActive
                    ]}
                    onPress={() => handleChapterClick(chap)}
                    activeOpacity={0.72}
                  >
                    <Text
                      style={[
                        styles.chapterTileNumber,
                        isCurrent && styles.chapterTileNumberActive
                      ]}
                    >
                      {chap}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        ) : (
          /* ================= BOOK SELECTION VIEW ================= */
          <View style={styles.content}>
            {/* Search Bar */}
            <View style={styles.searchBar}>
              <Ionicons name="search" size={17} color={Colors.textMuted} style={{ marginRight: 8 }} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search book (e.g. Psalms, Romafo, John)..."
                placeholderTextColor={Colors.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCorrect={false}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
                </TouchableOpacity>
              )}
            </View>

            {/* Testament Segmented Tabs (OT First, NT Second) */}
            <View style={styles.testamentTabsWrapper}>
              <TouchableOpacity
                style={[styles.testamentTab, testamentTab === 'OT' && styles.testamentTabActive]}
                onPress={() => setTestamentTab('OT')}
                activeOpacity={0.8}
              >
                <Text style={[styles.testamentTabText, testamentTab === 'OT' && styles.testamentTabTextActive]}>
                  Old Testament
                </Text>
                <View style={[styles.tabBadge, testamentTab === 'OT' && styles.tabBadgeActive]}>
                  <Text style={[styles.tabBadgeText, testamentTab === 'OT' && styles.tabBadgeTextActive]}>39</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.testamentTab, testamentTab === 'NT' && styles.testamentTabActive]}
                onPress={() => setTestamentTab('NT')}
                activeOpacity={0.8}
              >
                <Text style={[styles.testamentTabText, testamentTab === 'NT' && styles.testamentTabTextActive]}>
                  New Testament
                </Text>
                <View style={[styles.tabBadge, testamentTab === 'NT' && styles.tabBadgeActive]}>
                  <Text style={[styles.tabBadgeText, testamentTab === 'NT' && styles.tabBadgeTextActive]}>27</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Books List */}
            <FlatList
              data={filteredBooks}
              keyExtractor={(item) => item.name}
              contentContainerStyle={styles.bookList}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const isCurrent = item.name === currentBook;
                const localized = getLocalizedBookName(item.name, activePickerLanguage);
                const hasLocalTranslation = localized !== item.name;

                return (
                  <TouchableOpacity
                    style={[styles.bookCard, isCurrent && styles.bookCardCurrent]}
                    onPress={() => handleBookClick(item)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.bookCardLeft}>
                      <View style={styles.bookNameRow}>
                        <Text style={[styles.bookNameText, isCurrent && styles.bookNameTextCurrent]}>
                          {localized}
                        </Text>
                        {isCurrent && (
                          <View style={styles.activeDot} />
                        )}
                      </View>
                      {hasLocalTranslation && (
                        <Text style={styles.bookEnglishSubtitle}>{item.name}</Text>
                      )}
                    </View>

                    <View style={styles.bookCardRight}>
                      <View style={styles.chapterBadge}>
                        <Text style={styles.chapterBadgeText}>{item.chaptersCount} ch</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={16} color="#9CA3AF" style={{ marginLeft: 4 }} />
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAF7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EBEBE6',
    backgroundColor: '#FAFAF7',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EFEFEA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: Typography.fontSerifBold,
    fontSize: 22,
    color: '#111827',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFEFEA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 14,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#EBEBE6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    fontFamily: Typography.fontSansRegular,
    fontSize: 14,
    color: '#111827',
  },
  testamentTabsWrapper: {
    flexDirection: 'row',
    backgroundColor: '#EFEFEA',
    borderRadius: 12,
    padding: 3,
    marginBottom: 14,
  },
  testamentTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 10,
    gap: 6,
  },
  testamentTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  testamentTabText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 13,
    color: '#6B7280',
  },
  testamentTabTextActive: {
    fontFamily: Typography.fontSansSemiBold,
    color: '#111827',
  },
  tabBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 8,
    backgroundColor: '#E5E5DF',
  },
  tabBadgeActive: {
    backgroundColor: '#F3F4F6',
  },
  tabBadgeText: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 11,
    color: '#6B7280',
  },
  tabBadgeTextActive: {
    fontFamily: Typography.fontSansBold,
    color: '#111827',
  },
  bookList: {
    paddingBottom: 40,
  },
  bookCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#EFEFEA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  bookCardCurrent: {
    borderColor: '#E11D48',
    borderWidth: 1.5,
    backgroundColor: '#FFF9F9',
  },
  bookCardLeft: {
    flex: 1,
  },
  bookNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bookNameText: {
    fontFamily: Typography.fontSerifBold,
    fontSize: 18,
    color: '#111827',
  },
  bookNameTextCurrent: {
    color: '#E11D48',
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E11D48',
  },
  bookEnglishSubtitle: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 12,
    color: '#888888',
    marginTop: 2,
  },
  bookCardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chapterBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  chapterBadgeText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 12,
    color: '#4B5563',
  },

  /* Chapter Selection View Styles */
  chapterContainer: {
    flex: 1,
    paddingHorizontal: GRID_PADDING,
    paddingTop: 16,
  },
  bookSummaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#EBEBE6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  bookSummaryLeft: {
    flex: 1,
  },
  bookSummaryTitle: {
    fontFamily: Typography.fontSerifBold,
    fontSize: 22,
    color: '#111827',
    lineHeight: 26,
  },
  bookSummarySubtitle: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 13,
    color: '#6B7280',
    marginTop: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  testamentPill: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  testamentPillText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 11,
    color: '#4B5563',
  },
  chapterCountMeta: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 12,
    color: '#9CA3AF',
  },
  changeBookPill: {
    backgroundColor: '#EFEFEA',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  changeBookPillText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 12,
    color: '#374151',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionHeaderLabel: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 15,
    color: '#111827',
  },
  sectionHeaderSub: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 12,
    color: '#9CA3AF',
  },
  chapterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
    paddingBottom: 48,
  },
  chapterTile: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  chapterTileActive: {
    backgroundColor: '#111827',
    borderColor: '#111827',
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  chapterTileNumber: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 16,
    color: '#111827',
  },
  chapterTileNumberActive: {
    color: '#FFFFFF',
    fontFamily: Typography.fontSansBold,
  }
});
