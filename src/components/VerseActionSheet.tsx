import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  Share
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../theme/typography';

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
  hasNote
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={styles.sheetCard}>
              {/* Grab Handle */}
              <View style={styles.grabHandleWrap}>
                <View style={styles.grabHandle} />
              </View>

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

                {/* 2. Add Note */}
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
                  <Text style={styles.actionLabel}>{hasNote ? 'Edit Note' : 'Add Note'}</Text>
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
                  <View style={[styles.actionIconCircle, { backgroundColor: '#EFF6FF' }]}>
                    <Ionicons name="sparkles" size={20} color="#2563EB" />
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
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  sheetCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 36,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 20,
  },
  grabHandleWrap: {
    alignItems: 'center',
    paddingBottom: 10,
  },
  grabHandle: {
    width: 42,
    height: 4.5,
    borderRadius: 3,
    backgroundColor: '#E5E7EB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  citationBadge: {
    backgroundColor: '#F4F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  citationText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 16,
    color: '#111111',
    letterSpacing: -0.2,
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
    fontFamily: Typography.fontSerifItalic,
    fontSize: 14.5,
    lineHeight: 21,
    color: '#4B5563',
    marginBottom: 16,
    paddingHorizontal: 2,
  },
  sectionLabel: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 12,
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  colorDotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    marginBottom: 18,
  },
  colorDot: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  colorDotSelected: {
    borderColor: '#111111',
    transform: [{ scale: 1.08 }],
  },
  clearColorBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  clearColorBtnActive: {
    backgroundColor: '#E5E7EB',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 12,
  },
  actionsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 6,
  },
  actionPillBtn: {
    alignItems: 'center',
    flex: 1,
  },
  actionIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F4F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  actionIconCircleActive: {
    backgroundColor: '#DBEAFE',
  },
  actionLabel: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 11.5,
    color: '#111111',
    textAlign: 'center',
  }
});
