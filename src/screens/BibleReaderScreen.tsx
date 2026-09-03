import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  PanResponder,
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
import { getChapterHeading, getChapterSections } from '../services/chapterHeadings';
import { getLastReadPosition, saveLastReadPosition, subscribeVersionChange, setPreferredTranslation } from '../services/readingProgressService';
import { useTranslation, LANGUAGE_TO_DEFAULT_BIBLE } from '../services/localizationService';
import { ApostleSelectSheet } from '../components/ApostleSelectSheet';
import { ToastBanner } from '../components/ToastBanner';
import { ApostlePersona } from '../types';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming
} from 'react-native-reanimated';
import { NativeSyntheticEvent, NativeScrollEvent } from 'react-native';

interface BibleReaderScreenProps {
  onAskApostleWithVerse?: (verseText: string, reference: string, apostle?: ApostlePersona) => void;
  initialBook?: string;
  initialChapter?: number;
  onSetNavBarVisible?: (visible: boolean) => void;
}

export const BibleReaderScreen: React.FC<BibleReaderScreenProps> = ({ 
  onAskApostleWithVerse,
  initialBook,
  initialChapter,
  onSetNavBarVisible
}) => {
  const [currentBook, setCurrentBook] = useState(initialBook || 'Romans');
  const [currentChapter, setCurrentChapter] = useState(initialChapter || 8);
  const [translation, setTranslation] = useState('NIV');
  const [chapterData, setChapterData] = useState<BibleChapterData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verse Interaction Sheet State
  const [selectedVerseNumber, setSelectedVerseNumber] = useState<number | null>(null);
  const [showActionSheet, setShowActionSheet] = useState(false);

  // Highlights & Notes state
  const [chapterHighlights, setChapterHighlights] = useState<Record<number, string>>({});
  const [chapterNotes, setChapterNotes] = useState<Record<number, string>>({});

  // Audio Narration & Sequential Queue State
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [activeReadingVerse, setActiveReadingVerse] = useState<number | null>(null);
  const isAudioCancelledRef = useRef(false);
  const verseLayouts = useRef<Record<number, number>>({});

  // Sub-Modals
  const [showBookPicker, setShowBookPicker] = useState(false);
  const [showVersionsModal, setShowVersionsModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showMemoryModal, setShowMemoryModal] = useState(false);
  const [showApostleSelectSheet, setShowApostleSelectSheet] = useState(false);

  // Custom Toast Banner State
  const [toastMessage, setToastMessage] = useState('');
  const [toastIcon, setToastIcon] = useState<keyof typeof Ionicons.glyphMap>('checkmark-circle');
  const [toastVisible, setToastVisible] = useState(false);

  // Font Size
  const [fontSize, setFontSize] = useState(18);

  const scrollViewRef = useRef<ScrollView>(null);

  // Immersive Full-Screen Reading Shared Values
  const topHeaderTranslateY = useSharedValue(0);
  const topHeaderOpacity = useSharedValue(1);
  const bottomControlsTranslateY = useSharedValue(0);
  const bottomControlsOpacity = useSharedValue(1);

  const lastScrollY = useRef(0);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isControlsVisibleRef = useRef(true);

  const setControlsVisibility = (visible: boolean) => {
    isControlsVisibleRef.current = visible;
    topHeaderTranslateY.value = withSpring(visible ? 0 : -85, { damping: 20, stiffness: 220 });
    topHeaderOpacity.value = withTiming(visible ? 1 : 0, { duration: 180 });
    bottomControlsTranslateY.value = withSpring(visible ? 0 : 130, { damping: 20, stiffness: 220 });
    bottomControlsOpacity.value = withTiming(visible ? 1 : 0, { duration: 180 });
    onSetNavBarVisible?.(visible);
  };

  // Scroll listener for immersive reading: scrolling down hides bars, pause/up shows them
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentY = event.nativeEvent.contentOffset.y;
    const diff = currentY - lastScrollY.current;

    if (currentY <= 25) {
      if (!isControlsVisibleRef.current) {
        setControlsVisibility(true);
      }
      lastScrollY.current = currentY;
      return;
    }

    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }

    if (diff > 8) {
      // User is scrolling down to read: Hide top header, floating controls & nav bar
      if (isControlsVisibleRef.current) {
        setControlsVisibility(false);
      }
      // Restore automatically when user pauses scrolling for 1.2s
      hideTimeoutRef.current = setTimeout(() => {
        setControlsVisibility(true);
      }, 1200);
    } else if (diff < -12) {
      // Scrolling up: Bring controls back into view
      if (!isControlsVisibleRef.current) {
        setControlsVisibility(true);
      }
    }

    lastScrollY.current = currentY;
  };

  // Ensure nav bar is restored when unmounting
  useEffect(() => {
    return () => {
      onSetNavBarVisible?.(true);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  const animatedTopHeaderStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: topHeaderTranslateY.value }],
    opacity: topHeaderOpacity.value,
  }));

  const animatedBottomControlsStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bottomControlsTranslateY.value }],
    opacity: bottomControlsOpacity.value,
  }));

  const showToast = (message: string, icon: keyof typeof Ionicons.glyphMap = 'checkmark-circle') => {
    setToastMessage(message);
    setToastIcon(icon);
    setToastVisible(true);
  };

  const { currentLanguage, t } = useTranslation();

  // Listen to version changes across the entire app
  useEffect(() => {
    const unsub = subscribeVersionChange((newVersion) => {
      setTranslation(newVersion);
    });
    return unsub;
  }, []);

  // When language changes (e.g. user selects Twi, Spanish, etc.), auto-switch Bible translation!
  useEffect(() => {
    if (currentLanguage) {
      const defaultBible = LANGUAGE_TO_DEFAULT_BIBLE[currentLanguage];
      if (defaultBible && defaultBible !== translation) {
        setTranslation(defaultBible);
        saveLastReadPosition(currentBook, currentChapter, defaultBible);
      }
    }
  }, [currentLanguage]);

  // Restore Last Read Position on mount if no initial target was given
  useEffect(() => {
    if (!initialBook || !initialChapter) {
      getLastReadPosition().then((pos) => {
        if (pos) {
          setCurrentBook(pos.book);
          setCurrentChapter(pos.chapter);
          if (pos.translation) setTranslation(pos.translation);
        }
      });
    }
  }, []);

  // When initialBook/Chapter prop changes, navigate to it
  useEffect(() => {
    if (initialBook && initialChapter) {
      setCurrentBook(initialBook);
      setCurrentChapter(initialChapter);
    }
  }, [initialBook, initialChapter]);

  // Load Chapter Data whenever Book, Chapter, or Translation changes
  useEffect(() => {
    // Stop any ongoing audio narration when navigating chapters
    handleStopAudio();
    loadChapter(currentBook, currentChapter, translation);
  }, [currentBook, currentChapter, translation]);

  const loadChapter = async (b: string, c: number, t: string) => {
    setIsLoading(true);
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

  // Handle Verse Tap
  const handleVerseTap = (verseNum: number) => {
    setSelectedVerseNumber(verseNum);

    // If audio is currently playing, seek narration to this tapped verse!
    if (isPlayingAudio) {
      handleSeekAudioToVerse(verseNum);
    } else {
      setShowActionSheet(true);
    }
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

  // 2. Bookmark Verse with Custom Toast
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

    showToast('Saved to Bookmarks ✓ Find it in your Profile', 'bookmark');
  };

  // 3. Copy Verse with App Download Link
  const handleCopyVerse = () => {
    if (!chapterData || selectedVerseNumber === null) return;
    const verseObj = chapterData.verses.find(v => v.verseNumber === selectedVerseNumber);
    if (!verseObj) return;

    const copyText = `“${verseObj.text}”\n— ${chapterData.book} ${chapterData.chapter}:${selectedVerseNumber} (${translation})\n\nRead on BibleChat App: https://biblechatapp.com`;
    try {
      Clipboard.setString(copyText);
      showToast('Verse copied with app download link ✓', 'copy-outline');
    } catch (e) {}
  };

  // 4. Save Note with Custom Toast
  const handleSaveNote = async (noteText: string) => {
    if (!chapterData || selectedVerseNumber === null) return;
    const verseObj = chapterData.verses.find(v => v.verseNumber === selectedVerseNumber);
    if (!verseObj) return;

    const ref = `${chapterData.book} ${chapterData.chapter}:${selectedVerseNumber}`;
    setChapterNotes(prev => ({ ...prev, [selectedVerseNumber]: noteText }));
    await saveVerseNote(currentBook, currentChapter, selectedVerseNumber, ref, verseObj.text, noteText);
    showToast('Reflection saved to Profile ✓', 'document-text-outline');
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
    showToast('Note deleted', 'trash-outline');
  };

  // 6. Sequential Audio Narration Queue Engine
  const playVerseQueue = async (startVerseNum: number) => {
    if (!chapterData?.verses || chapterData.verses.length === 0) return;
    const verseIndex = chapterData.verses.findIndex(v => v.verseNumber === startVerseNum);
    if (verseIndex === -1) return;

    const currentVerse = chapterData.verses[verseIndex];
    setActiveReadingVerse(currentVerse.verseNumber);
    setIsPlayingAudio(true);

    // Auto-scroll reader to center active verse smoothly
    const yOffset = verseLayouts.current[currentVerse.verseNumber];
    if (typeof yOffset === 'number') {
      scrollViewRef.current?.scrollTo({ y: Math.max(0, yOffset - 90), animated: true });
    }

    const verseAudioKey = `bible_${currentBook}_${currentChapter}_${translation}_v${currentVerse.verseNumber}`;
    const textToRead = `Verse ${currentVerse.verseNumber}. ${currentVerse.text}`;

    await playDeepgramSpeech(
      verseAudioKey,
      textToRead,
      'narrator',
      () => {
        setActiveReadingVerse(currentVerse.verseNumber);
        setIsPlayingAudio(true);
      },
      async () => {
        if (!isAudioCancelledRef.current && verseIndex + 1 < chapterData.verses.length) {
          const nextVerse = chapterData.verses[verseIndex + 1];
          playVerseQueue(nextVerse.verseNumber);
        } else {
          setIsPlayingAudio(false);
          setActiveReadingVerse(null);
        }
      }
    );
  };

  const handleSeekAudioToVerse = async (verseNum: number) => {
    isAudioCancelledRef.current = true;
    await stopDeepgramSpeech();
    isAudioCancelledRef.current = false;
    playVerseQueue(verseNum);
  };

  const handleStopAudio = async () => {
    isAudioCancelledRef.current = true;
    await stopDeepgramSpeech();
    setIsPlayingAudio(false);
    setActiveReadingVerse(null);
  };

  const handleToggleAudioNarration = async () => {
    if (isPlayingAudio) {
      await handleStopAudio();
    } else {
      isAudioCancelledRef.current = false;
      const startFrom = selectedVerseNumber || activeReadingVerse || 1;
      playVerseQueue(startFrom);
    }
  };

  const selectedVerseObj = chapterData?.verses.find(v => v.verseNumber === selectedVerseNumber);
  const selectedCitation = selectedVerseNumber ? `${currentBook} ${currentChapter}:${selectedVerseNumber}` : '';

  return (
    <SafeAreaView style={styles.container}>
      {/* Custom Non-blocking Toast Banner */}
      <ToastBanner
        visible={toastVisible}
        message={toastMessage}
        iconName={toastIcon}
        onDismiss={() => setToastVisible(false)}
      />

      {/* Top Header Bar (Animated for Immersive Full-Screen Reading) */}
      <Animated.View style={[styles.topHeader, animatedTopHeaderStyle]}>
        <View style={styles.topHeaderLeft}>
          <TouchableOpacity
            style={[styles.headerIconBtn, isPlayingAudio && styles.headerIconBtnAudioActive]}
            onPress={handleToggleAudioNarration}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isPlayingAudio ? 'volume-high' : 'volume-medium-outline'}
              size={22}
              color={isPlayingAudio ? '#D97706' : Colors.textPrimary}
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
      </Animated.View>

      {/* Scripture Reading Content */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {isLoading ? (
          <BibleChapterSkeleton />
        ) : chapterData ? (
          <View style={styles.chapterWrapper}>
            {/* Left-Aligned Clean Hero Heading (No Redundant Text) */}
            <View style={styles.heroHeader}>
              <Text style={styles.heroChapterNumber}>{chapterData.chapter}</Text>
              {(() => {
                const heading = getChapterHeading(chapterData.book, chapterData.chapter, chapterData.sectionTitle);
                return heading ? (
                  <Text style={styles.heroSectionTitle}>{heading}</Text>
                ) : null;
              })()}
            </View>

            {/* Verses List with Canonical Pericope Sub-Headings */}
            <View style={styles.versesContainer}>
              {(() => {
                const chapterSections = getChapterSections(chapterData.book, chapterData.chapter);
                return chapterData.verses.map((v) => {
                  const isSelected = selectedVerseNumber === v.verseNumber;
                  const highlightColor = chapterHighlights[v.verseNumber];
                  const hasNote = Boolean(chapterNotes[v.verseNumber]);
                  const isReadingThisVerse = activeReadingVerse === v.verseNumber;
                  const inlineSectionTitle = chapterSections[v.verseNumber];

                  return (
                    <View
                      key={v.verseNumber}
                      onLayout={(e) => {
                        verseLayouts.current[v.verseNumber] = e.nativeEvent.layout.y;
                      }}
                    >
                      {/* Canonical Pericope Section Heading (NIV/ESV official section breaks) */}
                      {inlineSectionTitle && v.verseNumber !== 1 && (
                        <View style={styles.inlineSectionHeaderWrap}>
                          <Text style={styles.inlineSectionHeaderText}>{inlineSectionTitle}</Text>
                        </View>
                      )}

                      <TouchableOpacity
                        style={[
                          styles.verseParagraph,
                          highlightColor && { backgroundColor: highlightColor },
                          isSelected && !highlightColor && styles.verseParagraphSelected,
                          isReadingThisVerse && styles.verseReadingActive
                        ]}
                        onPress={() => handleVerseTap(v.verseNumber)}
                        activeOpacity={0.8}
                      >
                      <Text
                        style={[
                          styles.verseContentText,
                          { fontSize, lineHeight: fontSize * 1.68 },
                        ]}
                      >
                        <Text style={styles.superscriptVerseNumber}>{v.verseNumber} </Text>
                        {isReadingThisVerse && (
                          <Ionicons name="volume-medium" size={13} color="#D97706" style={{ marginRight: 4 }} />
                        )}
                        {v.text}
                      </Text>
                    </TouchableOpacity>

                    {/* Inline Note Reflection Callout */}
                    {hasNote && (
                      <TouchableOpacity
                        style={styles.inlineNoteCallout}
                        onPress={() => {
                          setSelectedVerseNumber(v.verseNumber);
                          setShowNoteModal(true);
                        }}
                        activeOpacity={0.8}
                      >
                        <View style={styles.inlineNoteHeader}>
                          <Ionicons name="document-text" size={12} color="#8B1E1E" style={{ marginRight: 5 }} />
                          <Text style={styles.inlineNoteLabel}>{t('my_reflection', 'My Reflection')}</Text>
                        </View>
                        <Text style={styles.inlineNoteText} numberOfLines={2}>
                          {chapterNotes[v.verseNumber]}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              });
            })()}
            </View>
          </View>
        ) : null}
      </ScrollView>

      {/* Floating Bottom Audio & Chapter Controls (Animated for Immersive Reading) */}
      <Animated.View style={[styles.floatingControlsWrapper, animatedBottomControlsStyle]}>
        <TouchableOpacity
          style={[styles.floatingAudioBtn, isPlayingAudio && styles.floatingAudioBtnActive]}
          onPress={handleToggleAudioNarration}
          activeOpacity={0.85}
        >
          <Ionicons
            name={isPlayingAudio ? 'pause' : 'play'}
            size={20}
            color={isPlayingAudio ? '#D97706' : Colors.textPrimary}
          />
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
      </Animated.View>

      {/* Soft UI Verse Action Sheet with Multi-Version Comparison */}
      <VerseActionSheet
        visible={showActionSheet}
        onClose={() => {
          setShowActionSheet(false);
          setSelectedVerseNumber(null);
        }}
        verseCitation={selectedCitation}
        verseText={selectedVerseObj?.text || ''}
        book={currentBook}
        chapter={currentChapter}
        verseNumber={selectedVerseNumber || undefined}
        currentTranslation={translation}
        currentColor={selectedVerseNumber ? chapterHighlights[selectedVerseNumber] : undefined}
        hasNote={Boolean(selectedVerseNumber && chapterNotes[selectedVerseNumber])}
        onSelectHighlight={handleSelectHighlight}
        onOpenCreateImage={() => setShowImageModal(true)}
        onOpenAddNote={() => setShowNoteModal(true)}
        onAskApostle={() => setShowApostleSelectSheet(true)}
        onBookmark={handleBookmarkSelectedVerse}
        onCopy={handleCopyVerse}
        onMemorize={() => setShowMemoryModal(true)}
      />

      {/* Apostle Select Sheet */}
      <ApostleSelectSheet
        visible={showApostleSelectSheet}
        onClose={() => setShowApostleSelectSheet(false)}
        verseCitation={selectedCitation}
        verseText={selectedVerseObj?.text || ''}
        onSelectApostle={(apostle) => {
          setShowApostleSelectSheet(false);
          if (selectedVerseObj && onAskApostleWithVerse) {
            onAskApostleWithVerse(selectedVerseObj.text, selectedCitation, apostle);
          }
        }}
      />

      {/* Scripture Memorization Modal */}
      <ScriptureMemoryModal
        visible={showMemoryModal}
        reference={selectedCitation}
        verseText={selectedVerseObj?.text || ''}
        version={translation}
        onClose={() => setShowMemoryModal(false)}
      />

      {/* Create Verse Image Modal with AI & Presets */}
      <VerseImageModal
        visible={showImageModal}
        onClose={() => setShowImageModal(false)}
        verseCitation={selectedCitation}
        verseText={selectedVerseObj?.text || ''}
        translation={translation}
      />

      {/* Verse Note Modal */}
      <VerseNoteModal
        visible={showNoteModal}
        onClose={() => setShowNoteModal(false)}
        verseCitation={selectedCitation}
        verseText={selectedVerseObj?.text || ''}
        existingNote={selectedVerseNumber ? chapterNotes[selectedVerseNumber] : undefined}
        onSaveNote={handleSaveNote}
        onDeleteNote={handleDeleteNote}
      />

      {/* Book & Chapter Picker */}
      <BibleBookPickerModal
        visible={showBookPicker}
        onClose={() => setShowBookPicker(false)}
        currentBook={currentBook}
        currentChapter={currentChapter}
        onSelect={(book, chapter) => {
          setCurrentBook(book);
          setCurrentChapter(chapter);
          setShowBookPicker(false);
        }}
      />

      {/* Bible Versions Modal */}
      <BibleVersionsModal
        visible={showVersionsModal}
        onClose={() => setShowVersionsModal(false)}
        currentVersion={translation}
        onSelectVersion={(versionCode) => {
          setTranslation(versionCode);
          setShowVersionsModal(false);
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAF7',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FAFAF7',
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEA',
  },
  topHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  topHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2F2EE',
  },
  headerIconBtnAudioActive: {
    backgroundColor: '#FEF3C7',
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
  chapterWrapper: {
    maxWidth: 680,
    alignSelf: 'center',
    width: '100%',
  },
  heroHeader: {
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingHorizontal: 6,
  },
  heroChapterNumber: {
    fontFamily: Typography.fontYouVersionSerifBold,
    fontSize: 58,
    color: '#111827',
    lineHeight: 66,
    marginBottom: 2,
    textAlign: 'left',
  },
  heroSectionTitle: {
    fontFamily: Typography.fontYouVersionSerifItalic,
    fontSize: 21,
    lineHeight: 28,
    color: '#1F2937',
    textAlign: 'left',
    marginTop: 2,
    marginBottom: 8,
  },
  versesContainer: {
    gap: 8,
  },
  verseParagraph: {
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderRadius: 8,
  },
  verseParagraphSelected: {
    backgroundColor: '#FEF3C755',
  },
  verseReadingActive: {
    backgroundColor: '#FEF3C7',
    borderLeftWidth: 3.5,
    borderLeftColor: '#D97706',
    paddingLeft: 8,
  },
  superscriptVerseNumber: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 11.5,
    color: '#6B7280',
    marginRight: 4,
  },
  verseContentText: {
    fontFamily: Typography.fontSerifMedium,
    color: '#111827',
    letterSpacing: 0.1,
  },
  inlineSectionHeaderWrap: {
    marginTop: 22,
    marginBottom: 8,
    paddingHorizontal: 6,
  },
  inlineSectionHeaderText: {
    fontFamily: Typography.fontSerifBold,
    fontSize: 18,
    lineHeight: 24,
    color: '#111827',
    textAlign: 'left',
    letterSpacing: 0.1,
  },
  inlineNoteCallout: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 10,
    marginHorizontal: 6,
    marginTop: 4,
    marginBottom: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#8B1E1E',
  },
  inlineNoteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  inlineNoteLabel: {
    fontFamily: Typography.fontSansBold,
    fontSize: 11,
    color: '#8B1E1E',
  },
  inlineNoteText: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 12.5,
    color: '#1F2937',
    lineHeight: 17,
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
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#EFEFEA',
  },
  floatingAudioBtnActive: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FCD34D',
  },
  floatingChapterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 8,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#EFEFEA',
  },
  chapterNavArrow: {
    padding: 6,
  },
  chapterNavCenter: {
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  floatingChapterText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 14,
    color: Colors.textPrimary,
  },
});
