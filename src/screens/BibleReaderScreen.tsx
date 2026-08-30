import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { BIBLE_BOOKS, INITIAL_FEATURED_VERSES } from '../services/bibleData';
import { saveBookmark } from '../services/database';
import { BibleVerse, BibleBook } from '../types';

export const BibleReaderScreen: React.FC = () => {
  const [selectedBook, setSelectedBook] = useState<BibleBook>(BIBLE_BOOKS[0]); // Matthew
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [fontSize, setFontSize] = useState(16);
  const [searchQuery, setSearchQuery] = useState('');
  const [showBookPicker, setShowBookPicker] = useState(false);
  const [translation, setTranslation] = useState('NIV');

  // Chapter sample text generation
  const getChapterVerses = (): BibleVerse[] => {
    const featured = INITIAL_FEATURED_VERSES.filter(v => v.book.toLowerCase() === selectedBook.name.toLowerCase());
    if (featured.length > 0) {
      return featured;
    }

    return [
      {
        book: selectedBook.name,
        chapter: selectedChapter,
        verse: 1,
        text: `In the beginning was the divine revelation and grace given through faith in ${selectedBook.name} chapter ${selectedChapter}.`,
        translation: translation
      },
      {
        book: selectedBook.name,
        chapter: selectedChapter,
        verse: 2,
        text: 'The Lord is my light and my salvation; whom shall I fear? The Lord is the stronghold of my life.',
        translation: translation
      },
      {
        book: selectedBook.name,
        chapter: selectedChapter,
        verse: 3,
        text: 'Blessed are those who hunger and thirst for righteousness, for they will be filled.',
        translation: translation
      },
      {
        book: selectedBook.name,
        chapter: selectedChapter,
        verse: 4,
        text: 'Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him.',
        translation: translation
      },
      {
        book: selectedBook.name,
        chapter: selectedChapter,
        verse: 5,
        text: 'Cast your cares on the Lord and he will sustain you; he will never let the righteous be shaken.',
        translation: translation
      }
    ];
  };

  const handleBookmark = async (verse: BibleVerse) => {
    await saveBookmark({
      id: `bm_verse_${Date.now()}`,
      type: 'verse',
      title: `${verse.book} ${verse.chapter}:${verse.verse}`,
      content: verse.text,
      reference: `${verse.book} ${verse.chapter}:${verse.verse} (${verse.translation})`,
      timestamp: Date.now()
    });
    alert(`Saved ${verse.book} ${verse.chapter}:${verse.verse} to your profile bookmarks!`);
  };

  const verses = getChapterVerses();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {/* Book & Chapter Selector Button */}
        <TouchableOpacity
          style={styles.bookSelectorBtn}
          onPress={() => setShowBookPicker(true)}
          activeOpacity={0.75}
        >
          <Text style={styles.bookSelectorText}>
            {selectedBook.name} {selectedChapter}
          </Text>
          <Ionicons name="chevron-down" size={16} color={Colors.textPrimary} />
        </TouchableOpacity>

        {/* Controls */}
        <View style={styles.controlsRow}>
          <TouchableOpacity
            style={styles.controlBtn}
            onPress={() => setFontSize(Math.max(13, fontSize - 1))}
          >
            <Text style={styles.controlBtnText}>A-</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.controlBtn}
            onPress={() => setFontSize(Math.min(24, fontSize + 1))}
          >
            <Text style={styles.controlBtnText}>A+</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.controlBtn, styles.translationBtn]}
            onPress={() => setTranslation(translation === 'NIV' ? 'KJV' : translation === 'KJV' ? 'WEB' : 'NIV')}
          >
            <Text style={styles.translationText}>{translation}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Scripture Text Body */}
      <ScrollView contentContainerStyle={styles.scriptureBody} showsVerticalScrollIndicator={false}>
        <Text style={styles.chapterHeading}>
          {selectedBook.name} {selectedChapter}
        </Text>

        {verses.map((v) => (
          <TouchableOpacity
            key={v.verse}
            style={styles.verseRow}
            onLongPress={() => handleBookmark(v)}
            activeOpacity={0.8}
          >
            <Text style={[styles.verseNumber, { fontSize: fontSize * 0.75 }]}>{v.verse}</Text>
            <Text style={[styles.verseText, { fontSize: fontSize, lineHeight: fontSize * 1.6 }]}>
              {v.text}
            </Text>
          </TouchableOpacity>
        ))}

        {/* Chapter Switcher Bottom */}
        <View style={styles.chapterNavigation}>
          <TouchableOpacity
            style={[styles.navChapterBtn, selectedChapter <= 1 && styles.navChapterBtnDisabled]}
            disabled={selectedChapter <= 1}
            onPress={() => setSelectedChapter(selectedChapter - 1)}
          >
            <Ionicons name="arrow-back" size={16} color={Colors.textPrimary} />
            <Text style={styles.navChapterText}>Previous</Text>
          </TouchableOpacity>

          <Text style={styles.navChapterIndicator}>
            Chapter {selectedChapter} of {selectedBook.chaptersCount}
          </Text>

          <TouchableOpacity
            style={[styles.navChapterBtn, selectedChapter >= selectedBook.chaptersCount && styles.navChapterBtnDisabled]}
            disabled={selectedChapter >= selectedBook.chaptersCount}
            onPress={() => setSelectedChapter(selectedChapter + 1)}
          >
            <Text style={styles.navChapterText}>Next</Text>
            <Ionicons name="arrow-forward" size={16} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Book & Chapter Picker Modal */}
      <Modal visible={showBookPicker} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.pickerModal}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Select Book & Chapter</Text>
              <TouchableOpacity onPress={() => setShowBookPicker(false)}>
                <Ionicons name="close" size={22} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={BIBLE_BOOKS}
              keyExtractor={(item) => item.name}
              contentContainerStyle={styles.bookList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.bookRow, item.name === selectedBook.name && styles.bookRowActive]}
                  onPress={() => {
                    setSelectedBook(item);
                    setSelectedChapter(1);
                    setShowBookPicker(false);
                  }}
                >
                  <Text style={[styles.bookName, item.name === selectedBook.name && styles.bookNameActive]}>
                    {item.name}
                  </Text>
                  <Text style={styles.bookTestament}>{item.testament} • {item.chaptersCount} ch</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  bookSelectorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardSecondary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  bookSelectorText: {
    fontFamily: Typography.fontSerif,
    fontSize: 18,
    color: Colors.textPrimary,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  controlBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.cardSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlBtnText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 12,
    color: Colors.textPrimary,
  },
  translationBtn: {
    width: 'auto',
    paddingHorizontal: 10,
  },
  translationText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 11,
    color: Colors.textPrimary,
  },
  scriptureBody: {
    paddingHorizontal: 22,
    paddingVertical: 20,
    paddingBottom: 110,
  },
  chapterHeading: {
    fontFamily: Typography.fontSerif,
    fontSize: 30,
    color: Colors.textPrimary,
    marginBottom: 20,
    textAlign: 'center',
  },
  verseRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  verseNumber: {
    fontFamily: Typography.fontSansBold,
    color: Colors.accentRed,
    width: 24,
    marginTop: 2,
  },
  verseText: {
    flex: 1,
    fontFamily: Typography.fontSansRegular,
    color: Colors.textPrimary,
  },
  chapterNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 32,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  navChapterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: Colors.cardSecondary,
  },
  navChapterBtnDisabled: {
    opacity: 0.3,
  },
  navChapterText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 12,
    color: Colors.textPrimary,
  },
  navChapterIndicator: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 11,
    color: Colors.textMuted,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  pickerModal: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    maxHeight: '75%',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  pickerTitle: {
    fontFamily: Typography.fontSerif,
    fontSize: 22,
    color: Colors.textPrimary,
  },
  bookList: {
    paddingBottom: 20,
  },
  bookRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  bookRowActive: {
    backgroundColor: Colors.cardSecondary,
  },
  bookName: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  bookNameActive: {
    fontFamily: Typography.fontSansBold,
    color: Colors.accentRed,
  },
  bookTestament: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 12,
    color: Colors.textMuted,
  }
});
