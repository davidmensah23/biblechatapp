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
  ActivityIndicator,
  Share,
  Clipboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { fetchChapter, BibleChapterData, ALL_BIBLE_BOOKS } from '../services/bibleEngine';
import { BibleBookPickerModal } from '../components/BibleBookPickerModal';
import { BibleVersionsModal } from '../components/BibleVersionsModal';
import {
  saveBookmark,
  saveVerseHighlight,
  removeVerseHighlight,
  fetchHighlightsForChapter,
  saveVerseNote,
  deleteVerseNote,
  fetchNotesForChapter
} from '../services/database';
import { playDeepgramSpeech, stopDeepgramSpeech } from '../services/deepgramVoices';
import { VerseActionSheet } from '../components/VerseActionSheet';
import { VerseImageModal } from '../components/VerseImageModal';
import { VerseNoteModal } from '../components/VerseNoteModal';
import { BibleChapterSkeleton } from '../components/SoftSkeleton';
import { ScriptureMemoryModal } from '../components/ScriptureMemoryModal';
import { getLastReadPosition, saveLastReadPosition } from '../services/readingProgressService';

interface BibleReaderScreenProps {
  onAskApostleWithVerse?: (verseText: string, reference: string) => void;
  initialBook?: string;
  initialChapter?: number;
}

export const BibleReaderScreen: React.FC<BibleReaderScreenProps> = ({ 
  onAskApostleWithVerse,
  initialBook,
  initialChapter 
}) => {
  const [currentBook, setCurrentBook] = useState(initialBook || 'Romans');
  const [currentChapter, setCurrentChapter] = useState(initialChapter || 8);
  const [translation, setTranslation] = useState<string>('NIV');
  const [chapterData, setChapterData] = useState<BibleChapterData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVerseNumber, setSelectedVerseNumber] = useState<number | null>(null);
  const [showBookPicker, setShowBookPicker] = useState(false);
  const [showVersionsModal, setShowVersionsModal] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [fontSize, setFontSize] = useState(17.5);

  // Real SQLite persistent highlights & notes for the current chapter
  const [chapterHighlights, setChapterHighlights] = useState<Record<number, string>>({});
  const [chapterNotes, setChapterNotes] = useState<Record<number, string>>({});

  // Modals
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showMemoryModal, setShowMemoryModal] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (initialBook && initialBook !== currentBook) setCurrentBook(initialBook);
    if (initialChapter && initialChapter !== currentChapter) setCurrentChapter(initialChapter);
  }, [initialBook, initialChapter]);

  useEffect(() => {
    if (!initialBook && !initialChapter) {
      getLastReadPosition().then((pos) => {
        if (pos && pos.book && pos.chapter) {
          setCurrentBook(pos.book);
          setCurrentChapter(pos.chapter);
          if (pos.translation) setTranslation(pos.translation);
        }
      });
    }
  }, []);

  useEffect(() => {
    loadChapterData(currentBook, currentChapter, translation);
    return () => {
      stopDeepgramSpeech();
    };
  }, [currentBook, currentChapter, translation]);

  const loadChapterData = async (b: string, c: number, t: string) => {
    setIsLoading(true);
    setSelectedVerseNumber(null);
    setShowActionSheet(false);
    try {
      const data = await fetchChapter(b, c, t);
      setChapterData(data);

      if (data && data.verses && data.verses.length > 0) {
        const firstVerse = data.verses[0].text;
        const estMins = Math.max(2, Math.round(data.verses.length / 7));
        saveLastReadPosition(b, c, t, 1, firstVerse, estMins);
      }

      // Load saved highlights and notes for this chapter from SQLite
      const [hlMap, noteMap] = await Promise.all([
        fetchHighlightsForChapter(b, c),
        fetchNotesForChapter(b, c)
      ]);
      setChapterHighlights(hlMap);
      setChapterNotes(noteMap);

      // Background pre-fetch adjacent chapters for seamless reading & automatic offline caching
      setTimeout(() => {
        if (c > 1) fetchChapter(b, c - 1, t);
        fetchChapter(b, c + 1, t);
      }, 1200);
    } catch (e) {
      console.warn('Error loading chapter:', e);
    } finally {
      setIsLoading(false);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }
  };

  const handleNextChapter = () => {
    const currentBookObj = ALL_BIBLE_BOOKS.find(b => b.name === currentBook);
    const totalChapters = currentBookObj ? currentBookObj.chaptersCount : 1;
    if (currentChapter < totalChapters) {
      setCurrentChapter(prev => prev + 1);
    } else {
      const currentBookIndex = ALL_BIBLE_BOOKS.findIndex(b => b.name === currentBook);
      if (currentBookIndex < ALL_BIBLE_BOOKS.length - 1) {
        setCurrentBook(ALL_BIBLE_BOOKS[currentBookIndex + 1].name);
        setCurrentChapter(1);
      }
    }
  };

  const handlePrevChapter = () => {
    if (currentChapter > 1) {
      setCurrentChapter(prev => prev - 1);
    } else {
      const currentBookIndex = ALL_BIBLE_BOOKS.findIndex(b => b.name === currentBook);
      if (currentBookIndex > 0) {
        const prevBook = ALL_BIBLE_BOOKS[currentBookIndex - 1];
        setCurrentBook(prevBook.name);
        setCurrentChapter(prevBook.chaptersCount);
      }
    }
  };

  // Handle Verse Tap: Open soft action sheet
  const handleVerseTap = (verseNum: number) => {
    setSelectedVerseNumber(verseNum);
    setShowActionSheet(true);
  };

  // 1. Color Highlight selection
  const handleSelectHighlight = async (hexColor: string | null) => {
    if (!chapterData || selectedVerseNumber === null) return;
    const verseObj = chapterData.verses.find(v => v.verseNumber === selectedVerseNumber);
    if (!verseObj) return;

    if (hexColor) {
      setChapterHighlights(prev => ({ ...prev, [selectedVerseNumber]: hexColor }));
      await saveVerseHighlight(currentBook, currentChapter, selectedVerseNumber, hexColor, verseObj.text);
    } else {
      setChapterHighlights(prev => {
        const copy = { ...prev };
        delete copy[selectedVerseNumber];
        return copy;
      });
      await removeVerseHighlight(currentBook, currentChapter, selectedVerseNumber);
    }
  };

  // 2. Bookmark Verse
  const handleBookmarkSelectedVerse = async () => {
    if (!chapterData || selectedVerseNumber === null) return;
    const verseObj = chapterData.verses.find(v => v.verseNumber === selectedVerseNumber);
    if (!verseObj) return;

    await saveBookmark({
      id: `bm_verse_${Date.now()}`,
      type: 'verse',
      title: `${chapterData.book} ${chapterData.chapter}:${selectedVerseNumber}`,
      content: verseObj.text,
      reference: `${chapterData.book} ${chapterData.chapter}:${selectedVerseNumber} (${translation})`,
      timestamp: Date.now()
    });

    Alert.alert('Saved to Profile', `Bookmarked ${chapterData.book} ${chapterData.chapter}:${selectedVerseNumber}!`);
  };

  // 3. Copy Verse
  const handleCopyVerse = () => {
    if (!chapterData || selectedVerseNumber === null) return;
    const verseObj = chapterData.verses.find(v => v.verseNumber === selectedVerseNumber);
    if (!verseObj) return;

    const copyText = `“${verseObj.text}” — ${chapterData.book} ${chapterData.chapter}:${selectedVerseNumber} (${translation})`;
    try {
      Clipboard.setString(copyText);
    } catch (e) {}
    Alert.alert('Copied', 'Verse copied to clipboard.');
  };

  // 4. Save Note
  const handleSaveNote = async (noteText: string) => {
    if (!chapterData || selectedVerseNumber === null) return;
    const verseObj = chapterData.verses.find(v => v.verseNumber === selectedVerseNumber);
    if (!verseObj) return;

    const ref = `${chapterData.book} ${chapterData.chapter}:${selectedVerseNumber}`;
    setChapterNotes(prev => ({ ...prev, [selectedVerseNumber]: noteText }));
    await saveVerseNote(currentBook, currentChapter, selectedVerseNumber, ref, verseObj.text, noteText);
    Alert.alert('Note Saved', 'Your reflection is saved under Profile > Notes.');
  };

  // 5. Delete Note
  const handleDeleteNote = async () => {
    if (!chapterData || selectedVerseNumber === null) return;
    setChapterNotes(prev => {
      const copy = { ...prev };
      delete copy[selectedVerseNumber];
      return copy;
    });
    await deleteVerseNote(`note_${currentBook}_${currentChapter}_${selectedVerseNumber}`);
  };

  // 6. Audio Narration
  const handleToggleAudioNarration = async () => {
    if (isPlayingAudio) {
      await stopDeepgramSpeech();
      setIsPlayingAudio(false);
    } else {
      if (!chapterData || !chapterData.verses || chapterData.verses.length === 0) return;
      const fullChapterText = `${chapterData.book} Chapter ${chapterData.chapter}. ` +
        chapterData.verses.map(v => `${v.verseNumber}. ${v.text}`).join(' ');
      setIsPlayingAudio(true);
      await playDeepgramSpeech(
        `bible_${chapterData.book}_${chapterData.chapter}_${translation}`,
        fullChapterText,
        'narrator',
        () => setIsPlayingAudio(true),
        () => setIsPlayingAudio(false)
      );
    }
  };

  const selectedVerseObj = chapterData?.verses.find(v => v.verseNumber === selectedVerseNumber);
  const selectedCitation = selectedVerseNumber ? `${currentBook} ${currentChapter}:${selectedVerseNumber}` : '';

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header Bar */}
      <View style={styles.topHeader}>
        <View style={styles.topHeaderLeft}>
          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={handleToggleAudioNarration}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isPlayingAudio ? 'volume-high' : 'volume-medium-outline'}
              size={23}
              color={isPlayingAudio ? '#8B1E1E' : Colors.textPrimary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.versionSelectorPill}
            onPress={() => setShowVersionsModal(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.versionSelectorText}>{translation}</Text>
            <Ionicons name="chevron-down" size={14} color="#666666" style={{ marginLeft: 3 }} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.bookSelectorPill}
          onPress={() => setShowBookPicker(true)}
          activeOpacity={0.75}
        >
          <Text style={styles.bookSelectorText}>{currentBook} {currentChapter}</Text>
          <Ionicons name="chevron-down" size={14} color="#111111" style={{ marginLeft: 5 }} />
        </TouchableOpacity>

        <View style={styles.topHeaderRight}>
          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={() => setFontSize(prev => (prev >= 23 ? 15 : prev + 2))}
            activeOpacity={0.7}
          >
            <Text style={styles.fontScaleBtnText}>aA</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Scripture Reading Content */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <BibleChapterSkeleton />
        ) : chapterData ? (
          <View style={styles.chapterWrapper}>
            {/* Minimalist Hero Heading */}
            <View style={styles.heroHeader}>
              <Text style={styles.heroBookName}>{chapterData.book}</Text>
              <Text style={styles.heroChapterNumber}>{chapterData.chapter}</Text>
              {chapterData.sectionTitle ? (
                <Text style={styles.heroSectionTitle}>{chapterData.sectionTitle}</Text>
              ) : null}
            </View>

            {/* Verses List */}
            <View style={styles.versesContainer}>
              {chapterData.verses.map((v) => {
                const isSelected = selectedVerseNumber === v.verseNumber;
                const highlightColor = chapterHighlights[v.verseNumber];
                const hasNote = Boolean(chapterNotes[v.verseNumber]);

                return (
                  <TouchableOpacity
                    key={v.verseNumber}
                    style={[
                      styles.verseParagraph,
                      highlightColor && { backgroundColor: highlightColor },
                      isSelected && !highlightColor && styles.verseParagraphSelected
                    ]}
                    onPress={() => handleVerseTap(v.verseNumber)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.verseContentText,
                        { fontSize, lineHeight: fontSize * 1.65 },
                      ]}
                    >
                      <Text style={styles.superscriptVerseNumber}>{v.verseNumber} </Text>
                      {hasNote && (
                        <Ionicons name="document-text" size={11} color="#8B1E1E" style={{ marginRight: 3 }} />
                      )}
                      {v.text}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ) : null}
      </ScrollView>

      {/* Floating Bottom Audio & Chapter Controls */}
      <View style={styles.floatingControlsWrapper}>
        <TouchableOpacity
          style={styles.floatingAudioBtn}
          onPress={handleToggleAudioNarration}
          activeOpacity={0.85}
        >
          <Ionicons name={isPlayingAudio ? 'pause' : 'play'} size={20} color={Colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.floatingChapterPill}>
          <TouchableOpacity onPress={handlePrevChapter} style={styles.chapterNavArrow} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setShowBookPicker(true)} style={styles.chapterNavCenter} activeOpacity={0.7}>
            <Text style={styles.floatingChapterText} numberOfLines={1}>
              {currentBook} {currentChapter}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleNextChapter} style={styles.chapterNavArrow} activeOpacity={0.7}>
            <Ionicons name="chevron-forward" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Soft UI Verse Action Sheet (Replacing Buggy Floating Bar) */}
      <VerseActionSheet
        visible={showActionSheet}
        onClose={() => {
          setShowActionSheet(false);
          setSelectedVerseNumber(null);
        }}
        verseCitation={selectedCitation}
        verseText={selectedVerseObj?.text || ''}
        currentColor={selectedVerseNumber ? chapterHighlights[selectedVerseNumber] : undefined}
        hasNote={Boolean(selectedVerseNumber && chapterNotes[selectedVerseNumber])}
        onSelectHighlight={handleSelectHighlight}
        onOpenCreateImage={() => setShowImageModal(true)}
        onOpenAddNote={() => setShowNoteModal(true)}
        onAskApostle={() => {
          if (selectedVerseObj && onAskApostleWithVerse) {
            onAskApostleWithVerse(selectedVerseObj.text, selectedCitation);
          }
        }}
        onBookmark={handleBookmarkSelectedVerse}
        onCopy={handleCopyVerse}
        onMemorize={() => setShowMemoryModal(true)}
      />

      {/* Scripture Memorization Modal */}
      <ScriptureMemoryModal
        visible={showMemoryModal}
        reference={selectedCitation}
        verseText={selectedVerseObj?.text || ''}
        version={translation}
        onClose={() => setShowMemoryModal(false)}
      />

      {/* Create Verse Image Modal */}
      <VerseImageModal
        visible={showImageModal}
        onClose={() => setShowImageModal(false)}
        verseCitation={selectedCitation}
        verseText={selectedVerseObj?.text || ''}
        translation={translation}
      />

      {/* Add / Edit Verse Note Modal */}
      <VerseNoteModal
        visible={showNoteModal}
        onClose={() => setShowNoteModal(false)}
        verseCitation={selectedCitation}
        verseText={selectedVerseObj?.text || ''}
        existingNote={selectedVerseNumber ? chapterNotes[selectedVerseNumber] : ''}
        onSaveNote={handleSaveNote}
        onDeleteNote={handleDeleteNote}
      />

      {/* Book & Chapter Picker */}
      <BibleBookPickerModal
        visible={showBookPicker}
        currentBook={currentBook}
        currentChapter={currentChapter}
        onClose={() => setShowBookPicker(false)}
        onSelect={(book: string, chapter: number) => {
          setCurrentBook(book);
          setCurrentChapter(chapter);
          setShowBookPicker(false);
        }}
      />

      {/* Translation Picker */}
      <BibleVersionsModal
        visible={showVersionsModal}
        onClose={() => setShowVersionsModal(false)}
        currentVersion={translation}
        onSelectVersion={(v) => {
          setTranslation(v as any);
          setShowVersionsModal(false);
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F6',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEA',
    backgroundColor: '#FAF9F6',
  },
  topHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  topHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2F2EE',
  },
  versionSelectorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2EE',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  versionSelectorText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 13,
    color: '#333333',
  },
  bookSelectorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E8E8E2',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  bookSelectorText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 14,
    color: '#111111',
  },
  fontScaleBtnText: {
    fontFamily: Typography.fontSansBold,
    fontSize: 14,
    color: '#111111',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 160,
  },
  loadingContainer: {
    paddingTop: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: 12,
  },
  chapterWrapper: {
    maxWidth: 680,
    alignSelf: 'center',
    width: '100%',
  },
  heroHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  heroBookName: {
    fontFamily: Typography.fontSerif,
    fontSize: 26,
    color: '#666666',
    letterSpacing: 0.5,
  },
  heroChapterNumber: {
    fontFamily: Typography.fontYouVersionSerifBold,
    fontSize: 76,
    color: Colors.textPrimary,
    lineHeight: 84,
    marginVertical: 2,
  },
  heroSectionTitle: {
    fontFamily: Typography.fontYouVersionSerifItalic,
    fontSize: 22,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 16,
  },
  versesContainer: {
    gap: 8,
  },
  verseParagraph: {
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 6,
  },
  // Soft, warm, non-AI selection wash
  verseParagraphSelected: {
    backgroundColor: '#FEF3C755',
  },
  superscriptVerseNumber: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 11,
    color: '#9CA3AF',
  },
  verseContentText: {
    fontFamily: Typography.fontYouVersionSerif,
    color: '#1F2937',
    letterSpacing: 0.15,
  },
  floatingControlsWrapper: {
    position: 'absolute',
    bottom: 86,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  floatingAudioBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#EBEBE6',
  },
  floatingChapterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 6,
    paddingVertical: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#EBEBE6',
  },
  chapterNavArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chapterNavCenter: {
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  floatingChapterText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 13.5,
    color: Colors.textPrimary,
  }
});
