import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { BibleVerse } from '../types';
import { InteractiveGestureSheet } from './InteractiveGestureSheet';

interface ScriptureDetailModalProps {
  visible: boolean;
  verse: BibleVerse | null;
  onClose: () => void;
  onBookmark?: (verse: BibleVerse) => void;
}

export const ScriptureDetailModal: React.FC<ScriptureDetailModalProps> = ({
  visible,
  verse,
  onClose,
  onBookmark
}) => {
  if (!verse) return null;

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
          <View>
            <Text style={styles.reference}>
              {verse.book} {verse.chapter}:{verse.verse}
            </Text>
            <Text style={styles.translation}>{verse.translation} Translation</Text>
          </View>

          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Scripture Body */}
        <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
          <Text style={styles.scriptureText}>"{verse.text}"</Text>
        </ScrollView>

        {/* Actions */}
        <View style={styles.actionsRow}>
          {onBookmark && (
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => onBookmark(verse)}
              activeOpacity={0.8}
            >
              <Ionicons name="bookmark-outline" size={18} color={Colors.textPrimary} />
              <Text style={styles.actionBtnText}>Save Verse</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.actionBtn, styles.primaryActionBtn]}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryActionBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </InteractiveGestureSheet>
  );
};

const styles = StyleSheet.create({
  modalCard: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 28,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  reference: {
    fontFamily: Typography.fontSerif,
    fontSize: 24,
    color: Colors.textPrimary,
  },
  translation: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 12.5,
    color: Colors.textMuted,
    marginTop: 2,
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
    marginVertical: 12,
  },
  scriptureText: {
    fontFamily: Typography.fontSerif,
    fontSize: 18,
    lineHeight: 28,
    color: Colors.textPrimary,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 16,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    gap: 6,
  },
  actionBtnText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 13,
    color: Colors.textPrimary,
  },
  primaryActionBtn: {
    backgroundColor: '#111111',
  },
  primaryActionBtnText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 13,
    color: '#FFFFFF',
  }
});
