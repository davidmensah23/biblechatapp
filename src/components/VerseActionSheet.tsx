import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Share
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../theme/typography';
import { InteractiveGestureSheet } from './InteractiveGestureSheet';

export const HIGHLIGHT_COLORS = [
  { id: 'yellow', hex: '#FEF08A', name: 'Amber' },
  { id: 'green', hex: '#BBF7D0', name: 'Mint' },
  { id: 'blue', hex: '#BAE6FD', name: 'Sky' },
  { id: 'pink', hex: '#FECDD3', name: 'Coral' },
  { id: 'purple', hex: '#E9D5FF', name: 'Lilac' }
];

interface VerseActionSheetProps {
  visible: boolean;
  onClose: () => void;
  verseCitation: string;
  verseText: string;
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
  return (
    <InteractiveGestureSheet
      visible={visible}
      onClose={onClose}
      initialSnap="mid"
      midHeightRatio={0.52}
      fullHeightRatio={0.78}
      showGrabBar={true}
    >
      <View style={styles.sheetContentWrap}>
        {/* Header: Verse Citation & Close Button */}
        <View style={styles.header}>
          <View style={styles.citationBadge}>
            <Text style={styles.citationText}>{verseCitation}</Text>
          </View>

          <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
            <Ionicons name="close" size={20} color="#111111" />
          </TouchableOpacity>
        </View>

        {/* Verse Snippet */}
        <Text style={styles.verseSnippet} numberOfLines={2}>
          “{verseText}”
        </Text>

        {/* Color Highlighter Dots (Soft Pastel Wash) */}
        <Text style={styles.sectionLabel}>Highlight</Text>
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

          {/* Clear / Remove Highlight Button */}
          <TouchableOpacity
            style={[styles.clearColorBtn, !currentColor && styles.clearColorBtnActive]}
            onPress={() => onSelectHighlight(null)}
            activeOpacity={0.75}
          >
            <Ionicons name="close" size={16} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* 5 Soft UI Actions Grid */}
        <View style={styles.actionsGrid}>
          {/* 1. Create Image */}
          <TouchableOpacity
            style={styles.actionPillBtn}
            onPress={() => {
              onClose();
              onOpenCreateImage();
            }}
            activeOpacity={0.75}
          >
            <View style={styles.actionIconCircle}>
              <Ionicons name="image-outline" size={20} color="#111111" />
            </View>
            <Text style={styles.actionLabel}>Create Image</Text>
          </TouchableOpacity>

          {/* 2. Add / Edit Note */}
          <TouchableOpacity
            style={styles.actionPillBtn}
            onPress={() => {
              onClose();
              onOpenAddNote();
            }}
            activeOpacity={0.75}
          >
            <View style={[styles.actionIconCircle, hasNote && styles.actionIconCircleActive]}>
              <Ionicons
                name={hasNote ? 'document-text' : 'document-text-outline'}
                size={20}
                color={hasNote ? '#2563EB' : '#111111'}
              />
            </View>
            <Text style={[styles.actionLabel, hasNote && styles.actionLabelActive]}>
              {hasNote ? 'Edit Note' : 'Add Note'}
            </Text>
          </TouchableOpacity>

          {/* 3. Ask Apostle */}
          <TouchableOpacity
            style={styles.actionPillBtn}
            onPress={() => {
              onClose();
              onAskApostle();
            }}
            activeOpacity={0.75}
          >
            <View style={styles.actionIconCircle}>
              <Ionicons name="chatbubbles-outline" size={20} color="#111111" />
            </View>
            <Text style={styles.actionLabel}>Ask Apostle</Text>
          </TouchableOpacity>

          {/* 4. Bookmark */}
          <TouchableOpacity
            style={styles.actionPillBtn}
            onPress={() => {
              onClose();
              onBookmark();
            }}
            activeOpacity={0.75}
          >
            <View style={styles.actionIconCircle}>
              <Ionicons name="bookmark-outline" size={20} color="#111111" />
            </View>
            <Text style={styles.actionLabel}>Bookmark</Text>
          </TouchableOpacity>

          {/* 5. Copy */}
          <TouchableOpacity
            style={styles.actionPillBtn}
            onPress={() => {
              onClose();
              onCopy();
            }}
            activeOpacity={0.75}
          >
            <View style={styles.actionIconCircle}>
              <Ionicons name="copy-outline" size={20} color="#111111" />
            </View>
            <Text style={styles.actionLabel}>Copy</Text>
          </TouchableOpacity>

          {/* 6. Memorize */}
          <TouchableOpacity
            style={styles.actionPillBtn}
            onPress={() => {
              onClose();
              if (onMemorize) onMemorize();
            }}
            activeOpacity={0.75}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="sparkles" size={19} color="#D97706" />
            </View>
            <Text style={[styles.actionLabel, { color: '#B45309', fontWeight: '600' }]}>Memorize</Text>
          </TouchableOpacity>
        </View>
      </View>
    </InteractiveGestureSheet>
  );
};

const styles = StyleSheet.create({
  sheetContentWrap: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 28,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  citationBadge: {
    backgroundColor: '#F4F4F6',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  citationText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 13,
    color: '#111111',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F4F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verseSnippet: {
    fontFamily: Typography.fontSerif,
    fontSize: 14,
    lineHeight: 20,
    color: '#4B5563',
    fontStyle: 'italic',
    marginBottom: 14,
  },
  sectionLabel: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 11,
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  colorDotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  colorDot: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  colorDotSelected: {
    borderColor: '#111111',
    transform: [{ scale: 1.1 }],
  },
  clearColorBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  clearColorBtnActive: {
    borderColor: '#9CA3AF',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F2',
    marginVertical: 12,
  },
  actionsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  actionPillBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  actionIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F4F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  actionIconCircleActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  actionLabel: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 11,
    color: '#374151',
    textAlign: 'center',
  },
  actionLabelActive: {
    color: '#2563EB',
    fontFamily: Typography.fontSansSemiBold,
  },
});
