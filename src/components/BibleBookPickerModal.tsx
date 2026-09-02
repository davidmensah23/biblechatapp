import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  TextInput,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { ALL_BIBLE_BOOKS } from '../services/bibleEngine';
import { BibleBook } from '../types';

interface BibleBookPickerModalProps {
  visible: boolean;
  currentBook: string;
  currentChapter: number;
  onSelect: (book: string, chapter: number) => void;
  onClose: () => void;
}

export const BibleBookPickerModal: React.FC<BibleBookPickerModalProps> = ({
  visible,
  currentBook,
  currentChapter,
  onSelect,
  onClose
}) => {
  const [testamentTab, setTestamentTab] = useState<'NT' | 'OT'>('NT');
  const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBooks = ALL_BIBLE_BOOKS.filter(
    (b) =>
      b.testament === testamentTab &&
      b.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            {selectedBook ? (
              <TouchableOpacity style={styles.backButton} onPress={handleBackToBooks}>
                <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} style={{ marginRight: 8 }} />
                <Text style={styles.headerTitle}>{selectedBook.name}</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.headerTitle}>Select Scripture</Text>
            )}
          </View>

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {selectedBook ? (
          /* Chapter Grid View */
          <View style={styles.chapterGridContainer}>
            <Text style={styles.chooseChapterLabel}>Select Chapter</Text>
            <ScrollView contentContainerStyle={styles.chapterGrid} showsVerticalScrollIndicator={false}>
              {Array.from({ length: selectedBook.chaptersCount }, (_, i) => i + 1).map((chap) => {
                const isCurrent = selectedBook.name === currentBook && chap === currentChapter;
                return (
                  <TouchableOpacity
                    key={chap}
                    style={[styles.chapterPill, isCurrent && styles.chapterPillActive]}
                    onPress={() => handleChapterClick(chap)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.chapterPillText, isCurrent && styles.chapterPillTextActive]}>
                      {chap}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        ) : (
          /* Book Selection View */
          <View style={styles.content}>
            {/* Search Bar */}
            <View style={styles.searchBar}>
              <Ionicons name="search" size={18} color={Colors.textMuted} style={{ marginRight: 8 }} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search book of the Bible..."
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

            {/* Testament Tabs */}
            <View style={styles.testamentTabs}>
              <TouchableOpacity
                style={[styles.testamentBtn, testamentTab === 'NT' && styles.testamentBtnActive]}
                onPress={() => setTestamentTab('NT')}
              >
                <Text style={[styles.testamentText, testamentTab === 'NT' && styles.testamentTextActive]}>
                  New Testament (27)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.testamentBtn, testamentTab === 'OT' && styles.testamentBtnActive]}
                onPress={() => setTestamentTab('OT')}
              >
                <Text style={[styles.testamentText, testamentTab === 'OT' && styles.testamentTextActive]}>
                  Old Testament (39)
                </Text>
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
                return (
                  <TouchableOpacity
                    style={[styles.bookRow, isCurrent && styles.bookRowCurrent]}
                    onPress={() => handleBookClick(item)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.bookName, isCurrent && styles.bookNameCurrent]}>
                      {item.name}
                    </Text>
                    <View style={styles.chapterBadge}>
                      <Text style={styles.chapterBadgeText}>{item.chaptersCount} ch</Text>
                      <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} style={{ marginLeft: 4 }} />
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
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: Typography.fontSerif,
    fontSize: 26,
    color: Colors.textPrimary,
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.cardSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardSecondary,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontFamily: Typography.fontSansRegular,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  testamentTabs: {
    flexDirection: 'row',
    backgroundColor: Colors.cardSecondary,
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
  },
  testamentBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  testamentBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  testamentText: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 13,
    color: Colors.textMuted,
  },
  testamentTextActive: {
    fontFamily: Typography.fontSansSemiBold,
    color: Colors.textPrimary,
  },
  bookList: {
    paddingBottom: 40,
  },
  bookRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.cardSecondary,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 15,
    marginBottom: 8,
  },
  bookRowCurrent: {
    borderWidth: 1.5,
    borderColor: Colors.accentRed,
  },
  bookName: {
    fontFamily: Typography.fontSerif,
    fontSize: 20,
    color: Colors.textPrimary,
  },
  bookNameCurrent: {
    color: Colors.accentRed,
  },
  chapterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chapterBadgeText: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 12,
    color: Colors.textMuted,
  },
  chapterGridContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  chooseChapterLabel: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  chapterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingBottom: 40,
  },
  chapterPill: {
    width: '17.5%',
    aspectRatio: 1,
    borderRadius: 14,
    backgroundColor: Colors.cardSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chapterPillActive: {
    backgroundColor: Colors.textPrimary,
  },
  chapterPillText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 17,
    color: Colors.textPrimary,
  },
  chapterPillTextActive: {
    color: '#FFFFFF',
  }
});
