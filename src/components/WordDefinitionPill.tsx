import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../theme/typography';
import { GlossaryEntry } from '../services/biblicalGlossary';

interface WordDefinitionPillProps {
  entry: GlossaryEntry | null;
  onClose: () => void;
}

export const WordDefinitionPill: React.FC<WordDefinitionPillProps> = ({
  entry,
  onClose
}) => {
  if (!entry) return null;

  return (
    <Modal
      transparent
      animationType="fade"
      visible={Boolean(entry)}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={styles.floatingTooltip}>
              {/* Top Header Row */}
              <View style={styles.headerRow}>
                <View style={styles.termInfo}>
                  <View style={styles.originPill}>
                    <Ionicons name="sparkles" size={10} color="#8B1E1E" style={{ marginRight: 3 }} />
                    <Text style={styles.originText}>{entry.originLabel || 'Biblical Study'}</Text>
                  </View>
                  <Text style={styles.termTitle}>{entry.term}</Text>
                </View>

                <TouchableOpacity
                  onPress={onClose}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  style={styles.closeBtn}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={16} color="#6B7280" />
                </TouchableOpacity>
              </View>

              {/* Definition in clean, small, highly legible Poppins text */}
              <Text style={styles.definitionText}>{entry.definition}</Text>

              {/* Contextual Nuance (if available) */}
              {Boolean(entry.exampleContext) && (
                <View style={styles.contextRow}>
                  <View style={styles.contextBar} />
                  <Text style={styles.contextText} numberOfLines={2}>
                    {entry.exampleContext}
                  </Text>
                </View>
              )}
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
    backgroundColor: 'rgba(0, 0, 0, 0.18)',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 100 : 85,
    paddingHorizontal: 16,
  },
  floatingTooltip: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 14,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  termInfo: {
    flex: 1,
    paddingRight: 8,
  },
  originPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FDF2F2',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: 'rgba(139, 30, 30, 0.10)',
  },
  originText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 10,
    color: '#8B1E1E',
    letterSpacing: 0.2,
  },
  termTitle: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 15.5,
    color: '#111827',
  },
  closeBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  definitionText: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 13,
    lineHeight: 19,
    color: '#374151',
  },
  contextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  contextBar: {
    width: 2.5,
    height: '100%',
    minHeight: 18,
    backgroundColor: '#D97706',
    borderRadius: 2,
    marginRight: 8,
  },
  contextText: {
    flex: 1,
    fontFamily: Typography.fontSansRegular,
    fontSize: 11.5,
    color: '#6B7280',
    lineHeight: 16,
    fontStyle: 'italic',
  },
});
