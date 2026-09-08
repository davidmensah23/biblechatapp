import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Clipboard, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { BibleVerse } from '../types';
import { ResolvedScripturePassage } from '../services/bibleEngine';
import { InteractiveGestureSheet } from './InteractiveGestureSheet';

export type ScriptureModalData = BibleVerse | ResolvedScripturePassage;

interface ScriptureDetailModalProps {
  visible: boolean;
  verse: ScriptureModalData | null;
  onClose: () => void;
  onBookmark?: (verse: ScriptureModalData) => void;
  onReadInBible?: (book: string, chapter: number) => void;
}

export const ScriptureDetailModal: React.FC<ScriptureDetailModalProps> = ({
  visible,
  verse,
  onClose,
  onBookmark,
  onReadInBible
}) => {
  if (!verse) return null;

  const isResolvedPassage = 'citation' in verse && Array.isArray((verse as ResolvedScripturePassage).verses);
  const resolvedPassage = isResolvedPassage ? (verse as ResolvedScripturePassage) : null;
  const standardVerse = !isResolvedPassage ? (verse as BibleVerse) : null;

  const referenceTitle = resolvedPassage
    ? resolvedPassage.citation
    : `${standardVerse?.book} ${standardVerse?.chapter}:${standardVerse?.verse}`;

  const translationName = verse.translation || 'NIV';

  const handleCopy = () => {
    const textToCopy = `“${verse.text}”\n— ${referenceTitle} (${translationName})`;
    Clipboard.setString(textToCopy);
    Alert.alert('Copied', 'Scripture passage copied to clipboard.');
  };

  return (
    <InteractiveGestureSheet
      visible={visible}
      onClose={onClose}
      initialSnap="mid"
      midHeightRatio={0.65}
      fullHeightRatio={0.92}
    >
      <View style={styles.modalCard}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTitleWrap}>
            <Text style={styles.reference}>{referenceTitle}</Text>
            <View style={styles.translationBadge}>
              <Ionicons name="checkmark-circle-outline" size={13} color="#2E7D32" />
              <Text style={styles.translation}>{translationName} Verified</Text>
            </View>
          </View>

          <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.75}>
            <Ionicons name="close" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Scripture Body */}
        <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
          {resolvedPassage && resolvedPassage.verses.length > 1 ? (
            <View style={styles.multiVerseContainer}>
              {resolvedPassage.verses.map(v => (
                <Text key={v.verseNumber} style={styles.scriptureText}>
                  <Text style={styles.verseNumberSuperscript}>{v.verseNumber} </Text>
                  {v.text}{' '}
                </Text>
              ))}
            </View>
          ) : (
            <Text style={styles.scriptureText}>“{verse.text}”</Text>
          )}
        </ScrollView>

        {/* Actions Row */}
        <View style={styles.actionsContainer}>
          {/* Secondary Escape Hatch: Outline Read from Bible */}
          {onReadInBible && (
            <TouchableOpacity
              style={styles.outlineActionBtn}
              onPress={() => {
                const book = verse.book;
                const chapter = typeof verse.chapter === 'string' ? parseInt(verse.chapter, 10) : verse.chapter;
                onClose();
                onReadInBible(book, chapter);
              }}
              activeOpacity={0.75}
            >
              <Ionicons name="book-outline" size={16} color={Colors.textPrimary} />
              <Text style={styles.outlineActionBtnText}>Read from Bible</Text>
            </TouchableOpacity>
          )}

          <View style={styles.utilityActionsRow}>
            <TouchableOpacity style={styles.actionBtn} onPress={handleCopy} activeOpacity={0.8}>
              <Ionicons name="copy-outline" size={16} color={Colors.textPrimary} />
              <Text style={styles.actionBtnText}>Copy</Text>
            </TouchableOpacity>

            {onBookmark && (
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => onBookmark(verse)}
                activeOpacity={0.8}
              >
                <Ionicons name="bookmark-outline" size={16} color={Colors.textPrimary} />
                <Text style={styles.actionBtnText}>Save</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.actionBtn, styles.doneActionBtn]}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.doneActionBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </InteractiveGestureSheet>
  );
};

const styles = StyleSheet.create({
  modalCard: {
    flex: 1,
    paddingHorizontal: 22,
    paddingBottom: 28,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EDEDED',
  },
  headerTitleWrap: {
    flex: 1,
    marginRight: 12,
  },
  reference: {
    fontFamily: Typography.fontSerif,
    fontSize: 22,
    color: Colors.textPrimary,
    lineHeight: 28,
  },
  translationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  translation: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 12,
    color: '#2E7D32',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    marginVertical: 10,
  },
  multiVerseContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  verseNumberSuperscript: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 12,
    color: '#8B1E1E',
  },
  scriptureText: {
    fontFamily: Typography.fontSerif,
    fontSize: 18,
    lineHeight: 29,
    color: Colors.textPrimary,
  },
  actionsContainer: {
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    gap: 12,
  },
  outlineActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D0D0D0',
    backgroundColor: 'transparent',
    gap: 8,
  },
  outlineActionBtnText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  utilityActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 10,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    gap: 5,
  },
  actionBtnText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 13,
    color: Colors.textPrimary,
  },
  doneActionBtn: {
    backgroundColor: '#111111',
  },
  doneActionBtnText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 13,
    color: '#FFFFFF',
  }
});
