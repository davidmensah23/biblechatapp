import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  PanResponder,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { fetchChapter, BibleChapterData, ALL_BIBLE_BOOKS } from '../services/bibleEngine';
import { BibleBookPickerModal } from '../components/BibleBookPickerModal';
import { BibleVersionsModal } from '../components/BibleVersionsModal';
import { saveBookmark } from '../services/database';

interface BibleReaderScreenProps {
  onAskApostleWithVerse?: (verseText: string, reference: string) => void;
}

export const BibleReaderScreen: React.FC<BibleReaderScreenProps> = ({ onAskApostleWithVerse }) => {
  const [currentBook, setCurrentBook] = useState('2 Samuel');
  const [currentChapter, setCurrentChapter] = useState(23);
  const [translation, setTranslation] = useState<'NIV' | 'KJV' | 'ESV'>('NIV');
  const [chapterData, setChapterData] = useState<BibleChapterData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVerseNumber, setSelectedVerseNumber] = useState<number | null>(null);
  const [showBookPicker, setShowBookPicker] = useState(false);
  const [showVersionsModal, setShowVersionsModal] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [fontSize, setFontSize] = useState(16.5);

  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    loadChapterData(currentBook, currentChapter, translation);
  }, [currentBook, currentChapter, translation]);

  const loadChapterData = async (b: string, c: number, t: string) => {
    setIsLoading(true);
    setSelectedVerseNumber(null);
    try {
      const data = await fetchChapter(b, c, t);
      setChapterData(data);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    } catch (err) {
      console.error('Failed to load chapter:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getBookMetadata = (name: string) => {
    return ALL_BIBLE_BOOKS.find((b) => b.name === name) || { name, chaptersCount: 28, testament: 'NT' };
  };

  const handleNextChapter = () => {
    const bookMeta = getBookMetadata(currentBook);
    if (currentChapter < bookMeta.chaptersCount) {
      setCurrentChapter(currentChapter + 1);
    } else {
      // Jump to next book in sequence
      const bookIdx = ALL_BIBLE_BOOKS.findIndex((b) => b.name === currentBook);
      if (bookIdx >= 0 && bookIdx < ALL_BIBLE_BOOKS.length - 1) {
        const nextBook = ALL_BIBLE_BOOKS[bookIdx + 1];
        setCurrentBook(nextBook.name);
        setCurrentChapter(1);
      }
    }
  };

  const handlePrevChapter = () => {
    if (currentChapter > 1) {
      setCurrentChapter(currentChapter - 1);
    } else {
      // Jump to previous book in sequence
      const bookIdx = ALL_BIBLE_BOOKS.findIndex((b) => b.name === currentBook);
      if (bookIdx > 0) {
        const prevBook = ALL_BIBLE_BOOKS[bookIdx - 1];
        setCurrentBook(prevBook.name);
        setCurrentChapter(prevBook.chaptersCount);
      }
    }
  };

  // Horizontal Swipe Gesture Responder
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 35 && Math.abs(gestureState.dy) < 25;
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -60) {
          // Swiped Left -> Next Chapter
          handleNextChapter();
        } else if (gestureState.dx > 60) {
          // Swiped Right -> Previous Chapter
          handlePrevChapter();
        }
      }
    })
  ).current;

  const handleVerseTap = (verseNum: number) => {
    if (selectedVerseNumber === verseNum) {
      setSelectedVerseNumber(null);
    } else {
      setSelectedVerseNumber(verseNum);
    }
  };

  const handleBookmarkSelectedVerse = async () => {
    if (!chapterData || selectedVerseNumber === null) return;
    const verseObj = chapterData.verses.find((v) => v.verseNumber === selectedVerseNumber);
    if (!verseObj) return;

    await saveBookmark({
      id: `bm_verse_${Date.now()}`,
      type: 'verse',
      title: `${chapterData.book} ${chapterData.chapter}:${selectedVerseNumber}`,
      content: verseObj.text,
      timestamp: Date.now()
    });

    Alert.alert('Bookmarked', `Saved ${chapterData.book} ${chapterData.chapter}:${selectedVerseNumber} to your profile!`);
    setSelectedVerseNumber(null);
  };

  const handleCopyVerse = () => {
    if (!chapterData || selectedVerseNumber === null) return;
    Alert.alert('Copied', `Copied ${chapterData.book} ${chapterData.chapter}:${selectedVerseNumber} to clipboard`);
    setSelectedVerseNumber(null);
  };

  const toggleTranslation = () => {
    if (translation === 'NIV') setTranslation('KJV');
    else if (translation === 'KJV') setTranslation('ESV');
    else setTranslation('NIV');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top YouVersion-style Header Bar */}
      <View style={styles.topHeader}>
        <View style={styles.topHeaderLeft}>
          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={() => setIsPlayingAudio(!isPlayingAudio)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isPlayingAudio ? 'volume-high' : 'volume-medium-outline'}
              size={23}
              color={isPlayingAudio ? Colors.accentBlue : Colors.textPrimary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={() => setShowBookPicker(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="search" size={21} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <View style={styles.topHeaderRight}>
          <TouchableOpacity
            style={styles.translationPill}
            onPress={() => setShowVersionsModal(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="globe-outline" size={15} color={Colors.textPrimary} style={{ marginRight: 5 }} />
            <Text style={styles.translationPillText}>{translation}</Text>
          </TouchableOpacity>

          {/* Quick Font Size Adjuster */}
          <View style={styles.fontSizeControls}>
            <TouchableOpacity
              onPress={() => setFontSize(Math.max(13, fontSize - 1.5))}
              style={styles.fontSizeBtn}
            >
              <Text style={styles.fontSizeBtnText}>A-</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setFontSize(Math.min(24, fontSize + 1.5))}
              style={styles.fontSizeBtn}
            >
              <Text style={styles.fontSizeBtnText}>A+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Main Scripture Scrollable Area with Swipe Gestures */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        {...panResponder.panHandlers}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.textPrimary} />
            <Text style={styles.loadingText}>Loading Scripture...</Text>
          </View>
        ) : chapterData ? (
          <View>
            {/* Hero Chapter Header */}
            <View style={styles.heroHeader}>
              <Text style={styles.heroBookName}>{chapterData.book}</Text>
              <Text style={styles.heroChapterNumber}>{chapterData.chapter}</Text>
              {chapterData.sectionTitle ? (
                <Text style={styles.heroSectionTitle}>{chapterData.sectionTitle}</Text>
              ) : null}
            </View>

            {/* Continuous Verses Text */}
            <View style={styles.versesContainer}>
              {chapterData.verses.map((v) => {
                const isSelected = selectedVerseNumber === v.verseNumber;
                return (
                  <TouchableOpacity
                    key={v.verseNumber}
                    style={[styles.verseParagraph, isSelected && styles.verseParagraphSelected]}
                    onPress={() => handleVerseTap(v.verseNumber)}
                    activeOpacity={0.85}
                  >
                    <Text
                      style={[
                        styles.verseContentText,
                        { fontSize, lineHeight: fontSize * 1.6 },
                        isSelected && styles.verseContentTextSelected
                      ]}
                    >
                      <Text style={styles.superscriptVerseNumber}>{v.verseNumber} </Text>
                      {v.text}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ) : null}
      </ScrollView>

      {/* Selected Verse Action Bar */}
      {selectedVerseNumber !== null && (
        <View style={styles.verseActionBar}>
          <Text style={styles.verseActionLabel} numberOfLines={1}>
            {currentBook} {currentChapter}:{selectedVerseNumber}
          </Text>

          <View style={styles.verseActionButtonsRow}>
            <TouchableOpacity style={styles.actionBtn} onPress={handleCopyVerse} activeOpacity={0.8}>
              <Ionicons name="copy-outline" size={18} color="#FFFFFF" />
              <Text style={styles.actionBtnText}>Copy</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn} onPress={handleBookmarkSelectedVerse} activeOpacity={0.8}>
              <Ionicons name="bookmark-outline" size={18} color="#FFFFFF" />
              <Text style={styles.actionBtnText}>Bookmark</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.actionBtnSpecial]}
              onPress={() => {
                const verseObj = chapterData?.verses.find((v) => v.verseNumber === selectedVerseNumber);
                if (onAskApostleWithVerse && verseObj) {
                  onAskApostleWithVerse(verseObj.text, `${currentBook} ${currentChapter}:${selectedVerseNumber}`);
                } else {
                  Alert.alert('Ask Apostle', `Ask Simon Peter or John about this verse in the chat tab!`);
                }
                setSelectedVerseNumber(null);
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="sparkles" size={17} color="#FFFFFF" />
              <Text style={styles.actionBtnText}>Ask Apostle</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Bottom Floating Control Bar */}
      <View style={styles.floatingControlsWrapper}>
        {/* Audio Narration Play Button */}
        <TouchableOpacity
          style={styles.floatingAudioBtn}
          onPress={() => setIsPlayingAudio(!isPlayingAudio)}
          activeOpacity={0.85}
        >
          <Ionicons name={isPlayingAudio ? 'pause' : 'play'} size={20} color={Colors.textPrimary} />
        </TouchableOpacity>

        {/* Chapter Switcher Pill */}
        <View style={styles.floatingChapterPill}>
          <TouchableOpacity onPress={handlePrevChapter} style={styles.chapterArrowBtn} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.chapterTitleButton}
            onPress={() => setShowBookPicker(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.floatingChapterText}>
              {currentBook} {currentChapter}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleNextChapter} style={styles.chapterArrowBtn} activeOpacity={0.7}>
            <Ionicons name="chevron-forward" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Book & Chapter Picker Modal */}
      <BibleBookPickerModal
        visible={showBookPicker}
        currentBook={currentBook}
        currentChapter={currentChapter}
        onSelect={(b, c) => {
          setCurrentBook(b);
          setCurrentChapter(c);
        }}
        onClose={() => setShowBookPicker(false)}
      />

      {/* YouVersion-Style Bible Versions & Offline Downloads Modal */}
      <BibleVersionsModal
        visible={showVersionsModal}
        currentVersion={translation}
        onSelectVersion={(v) => setTranslation(v as any)}
        onClose={() => setShowVersionsModal(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  topHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.cardSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  translationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardSecondary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  translationPillText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 13,
    color: Colors.textPrimary,
  },
  fontSizeControls: {
    flexDirection: 'row',
    backgroundColor: Colors.cardSecondary,
    borderRadius: 20,
    padding: 3,
  },
  fontSizeBtn: {
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  fontSizeBtnText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 13,
    color: Colors.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 160,
  },
  loadingContainer: {
    paddingVertical: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: 12,
  },
  heroHeader: {
    alignItems: 'center',
    marginBottom: 28,
  },
  heroBookName: {
    fontFamily: Typography.fontSerif,
    fontSize: 26,
    color: '#666666',
    letterSpacing: 0.5,
  },
  heroChapterNumber: {
    fontFamily: Typography.fontSerif,
    fontSize: 72,
    color: Colors.textPrimary,
    lineHeight: 80,
    marginVertical: 4,
  },
  heroSectionTitle: {
    fontFamily: Typography.fontSerifItalic,
    fontSize: 22,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 16,
  },
  versesContainer: {
    gap: 14,
  },
  verseParagraph: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  verseParagraphSelected: {
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    borderLeftWidth: 3,
    borderLeftColor: Colors.accentBlue,
  },
  superscriptVerseNumber: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 11,
    color: '#999999',
  },
  verseContentText: {
    fontFamily: Typography.fontSansRegular,
    color: '#222222',
  },
  verseContentTextSelected: {
    color: '#111111',
  },
  verseActionBar: {
    position: 'absolute',
    bottom: 154,
    left: 16,
    right: 16,
    backgroundColor: '#1E1E22',
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 150,
  },
  verseActionLabel: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 13,
    color: '#FFFFFF',
    maxWidth: 90,
  },
  verseActionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    gap: 5,
  },
  actionBtnSpecial: {
    backgroundColor: Colors.accentBlue,
  },
  actionBtnText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 12,
    color: '#FFFFFF',
  },
  floatingControlsWrapper: {
    position: 'absolute',
    bottom: 86,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    zIndex: 100,
  },
  floatingAudioBtn: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  floatingChapterPill: {
    flex: 1,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  chapterArrowBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chapterTitleButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  floatingChapterText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 16,
    color: Colors.textPrimary,
  }
});
