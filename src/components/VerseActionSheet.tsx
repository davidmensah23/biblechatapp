import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../theme/typography';
import { InteractiveGestureSheet } from './InteractiveGestureSheet';
import { fetchChapter } from '../services/bibleEngine';

export const HIGHLIGHT_COLORS = [
  { id: 'yellow', hex: '#FEF08A', name: 'Amber' },
  { id: 'green', hex: '#BBF7D0', name: 'Mint' },
  { id: 'blue', hex: '#BAE6FD', name: 'Sky' },
  { id: 'pink', hex: '#FECDD3', name: 'Coral' },
  { id: 'purple', hex: '#E9D5FF', name: 'Lilac' }
];

const COMPARISON_VERSIONS = [
  { code: 'NIV', name: 'NIV' },
  { code: 'KJV', name: 'KJV' },
  { code: 'ESV', name: 'ESV' },
  { code: 'NLT', name: 'NLT' },
  { code: 'WEB', name: 'WEB' },
  { code: 'AMP', name: 'AMP' },
  { code: 'TWI', name: 'Asante Twi' },
  { code: 'YOR', name: 'Yorùbá' }
];

interface VerseActionSheetProps {
  visible: boolean;
  onClose: () => void;
  verseCitation: string;
  verseText: string;
  book?: string;
  chapter?: number;
  verseNumber?: number;
  currentTranslation?: string;
  currentColor?: string;
  onSelectHighlight: (hexColor: string | null) => void;
  onOpenCreateImage: () => void;
  onOpenAddNote: () => void;
  onAskApostle: () => void;
  onBookmark: () => void;
  onCopy: () => void;
  onMemorize?: () => void;
  hasNote?: boolean;
}

export const VerseActionSheet: React.FC<VerseActionSheetProps> = ({
  visible,
  onClose,
  verseCitation,
  verseText,
  book,
  chapter,
  verseNumber,
  currentTranslation = 'NIV',
  currentColor,
  onSelectHighlight,
  onOpenCreateImage,
  onOpenAddNote,
  onAskApostle,
  onBookmark,
  onCopy,
  onMemorize,
  hasNote
}) => {
  const [selectedCompareVersion, setSelectedCompareVersion] = useState<string | null>(null);
  const [compareVerseText, setCompareVerseText] = useState<string | null>(null);
  const [loadingCompare, setLoadingCompare] = useState(false);

  useEffect(() => {
    if (visible) {
      setSelectedCompareVersion(null);
      setCompareVerseText(null);
    }
  }, [visible]);

  const handleSelectCompareVersion = async (versionCode: string) => {
    if (selectedCompareVersion === versionCode) {
      setSelectedCompareVersion(null);
      setCompareVerseText(null);
      return;
    }

    if (!book || !chapter || !verseNumber) return;

    setSelectedCompareVersion(versionCode);
    setLoadingCompare(true);

    try {
      const data = await fetchChapter(book, chapter, versionCode);
      const matched = data.verses.find(v => v.verseNumber === verseNumber);
      if (matched) {
        setCompareVerseText(matched.text);
      } else {
        setCompareVerseText(null);
      }
    } catch (e) {
      console.warn('Compare translation error:', e);
      setCompareVerseText(null);
    } finally {
      setLoadingCompare(false);
    }
  };

  return (
    <InteractiveGestureSheet
      visible={visible}
      onClose={onClose}
      initialSnap="mid"
      midHeightRatio={0.62}
      fullHeightRatio={0.88}
      showGrabBar={true}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header: Verse Citation & Close Button */}
        <View style={styles.header}>
          <View style={styles.citationBadge}>
            <Text style={styles.citationText}>{verseCitation}</Text>
          </View>

          <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
            <Ionicons name="close" size={20} color="#111111" />
          </TouchableOpacity>
        </View>

        {/* Primary Verse Snippet */}
        <View style={styles.verseSnippetWrap}>
          <Text style={styles.verseSnippet}>
            “{verseText}”
          </Text>
          <Text style={styles.versionTag}>{currentTranslation}</Text>
        </View>

        {/* Color Highlighter Row */}
        <View style={styles.highlightHeaderRow}>
          <Text style={styles.sectionLabel}>Highlight</Text>
          {currentColor && (
            <TouchableOpacity onPress={() => onSelectHighlight(null)} activeOpacity={0.7}>
              <Text style={styles.clearHighlightText}>Remove</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.colorDotsRow}>
          {HIGHLIGHT_COLORS.map((col) => {
            const isSelected = currentColor === col.hex;
            return (
              <TouchableOpacity
                key={col.id}
                style={[
                  styles.colorDot,
                  { backgroundColor: col.hex },
                  isSelected && styles.colorDotSelected
                ]}
                onPress={() => onSelectHighlight(col.hex)}
                activeOpacity={0.75}
              >
                {isSelected && (
                  <Ionicons name="checkmark" size={16} color="#111111" />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* 6 Action Icons Grid */}
        <View style={styles.actionsGrid}>
          {/* 1. Create Image */}
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => {
              onClose();
              onOpenCreateImage();
            }}
            activeOpacity={0.75}
          >
            <View style={styles.actionIconCircle}>
              <Ionicons name="image-outline" size={19} color="#111111" />
            </View>
            <Text style={styles.actionLabel}>Create Image</Text>
          </TouchableOpacity>

          {/* 2. Add / Edit Note */}
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => {
              onClose();
              onOpenAddNote();
            }}
            activeOpacity={0.75}
          >
            <View style={[styles.actionIconCircle, hasNote && styles.actionIconCircleActive]}>
              <Ionicons
                name={hasNote ? 'document-text' : 'document-text-outline'}
                size={19}
                color={hasNote ? '#8B1E1E' : '#111111'}
              />
            </View>
            <Text style={[styles.actionLabel, hasNote && styles.actionLabelActive]}>
              {hasNote ? 'Edit Note' : 'Add Note'}
            </Text>
          </TouchableOpacity>

          {/* 3. Ask Apostle */}
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => {
              onClose();
              onAskApostle();
            }}
            activeOpacity={0.75}
          >
            <View style={styles.actionIconCircle}>
              <Ionicons name="chatbubbles-outline" size={19} color="#111111" />
            </View>
            <Text style={styles.actionLabel}>Ask Apostle</Text>
          </TouchableOpacity>

          {/* 4. Bookmark */}
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => {
              onClose();
              onBookmark();
            }}
            activeOpacity={0.75}
          >
            <View style={styles.actionIconCircle}>
              <Ionicons name="bookmark-outline" size={19} color="#111111" />
            </View>
            <Text style={styles.actionLabel}>Bookmark</Text>
          </TouchableOpacity>

          {/* 5. Copy */}
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => {
              onClose();
              onCopy();
            }}
            activeOpacity={0.75}
          >
            <View style={styles.actionIconCircle}>
              <Ionicons name="copy-outline" size={19} color="#111111" />
            </View>
            <Text style={styles.actionLabel}>Copy</Text>
          </TouchableOpacity>

          {/* 6. Memorize */}
          {onMemorize && (
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => {
                onClose();
                onMemorize();
              }}
              activeOpacity={0.75}
            >
              <View style={styles.actionIconCircle}>
                <Ionicons name="hardware-chip-outline" size={19} color="#111111" />
              </View>
              <Text style={styles.actionLabel}>Memorize</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Compare Translations Section */}
        <View style={styles.compareSection}>
          <Text style={styles.sectionLabel}>Compare Translations</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.versionPillsScroll}>
            {COMPARISON_VERSIONS.map((v) => {
              const isSelected = selectedCompareVersion === v.code;
              return (
                <TouchableOpacity
                  key={v.code}
                  style={[styles.versionPill, isSelected && styles.versionPillActive]}
                  onPress={() => handleSelectCompareVersion(v.code)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.versionPillText, isSelected && styles.versionPillTextActive]}>
                    {v.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Comparison Result Card */}
          {selectedCompareVersion && (
            <View style={styles.compareResultCard}>
              <View style={styles.compareResultHeader}>
                <Text style={styles.compareResultTitle}>{selectedCompareVersion} Translation</Text>
                {loadingCompare && <ActivityIndicator size="small" color="#111111" />}
              </View>
              {loadingCompare ? (
                <Text style={styles.compareLoadingText}>Loading {selectedCompareVersion} version...</Text>
              ) : compareVerseText ? (
                <Text style={styles.compareVerseText}>“{compareVerseText}”</Text>
              ) : (
                <Text style={styles.compareNotFoundText}>Could not load {selectedCompareVersion} version.</Text>
              )}
            </View>
          )}
        </View>

        <View style={{ height: 28 }} />
      </ScrollView>
    </InteractiveGestureSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  citationBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  citationText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 13,
    color: '#111827',
  },
  closeBtn: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
  },
  verseSnippetWrap: {
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 14,
  },
  verseSnippet: {
    fontFamily: Typography.fontSerifItalic,
    fontSize: 14.5,
    lineHeight: 21,
    color: '#1F2937',
    marginBottom: 6,
  },
  versionTag: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'right',
  },
  highlightHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionLabel: {
    fontFamily: Typography.fontSansBold,
    fontSize: 12.5,
    color: '#374151',
    letterSpacing: 0.2,
  },
  clearHighlightText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 12,
    color: '#DC2626',
  },
  colorDotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  colorDot: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  colorDotSelected: {
    borderColor: '#111827',
    borderWidth: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 14,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 14,
  },
  actionBtn: {
    width: '31%',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  actionIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  actionIconCircleActive: {
    backgroundColor: '#FEE2E2',
  },
  actionLabel: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 11.5,
    color: '#374151',
    textAlign: 'center',
  },
  actionLabelActive: {
    color: '#8B1E1E',
    fontFamily: Typography.fontSansSemiBold,
  },
  compareSection: {
    marginTop: 2,
  },
  versionPillsScroll: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 10,
  },
  versionPill: {
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  versionPillActive: {
    backgroundColor: '#111827',
    borderColor: '#111827',
  },
  versionPillText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 12,
    color: '#4B5563',
  },
  versionPillTextActive: {
    color: '#FFFFFF',
    fontFamily: Typography.fontSansSemiBold,
  },
  compareResultCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 6,
  },
  compareResultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  compareResultTitle: {
    fontFamily: Typography.fontSansBold,
    fontSize: 12.5,
    color: '#111827',
  },
  compareLoadingText: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 12.5,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  compareVerseText: {
    fontFamily: Typography.fontSerifItalic,
    fontSize: 14,
    lineHeight: 20,
    color: '#1F2937',
  },
  compareNotFoundText: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 12,
    color: '#9CA3AF',
  },
});
