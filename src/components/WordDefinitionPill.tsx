import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../theme/typography';
import { Colors } from '../theme/colors';
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
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.card}>
              {/* Header Badge */}
              <View style={styles.headerRow}>
                <View style={styles.badge}>
                  <Ionicons name="sparkles" size={12} color="#8B1E1E" style={{ marginRight: 4 }} />
                  <Text style={styles.badgeText}>{entry.originLabel}</Text>
                </View>
                <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Ionicons name="close" size={18} color="#8E8E93" />
                </TouchableOpacity>
              </View>

              {/* Term Title */}
              <Text style={styles.termTitle}>{entry.term}</Text>

              {/* 1-Sentence Plain English Definition */}
              <Text style={styles.definitionText}>{entry.definition}</Text>

              {/* Context / Example if available */}
              {entry.exampleContext && (
                <View style={styles.contextBox}>
                  <Text style={styles.contextText}>“{entry.exampleContext}”</Text>
                </View>
              )}

              {/* Bottom "Got it" action */}
              <TouchableOpacity style={styles.gotItBtn} onPress={onClose} activeOpacity={0.8}>
                <Text style={styles.gotItText}>Got it</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDF2F2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 30, 30, 0.12)',
  },
  badgeText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 11,
    color: '#8B1E1E',
    letterSpacing: 0.2,
  },
  termTitle: {
    fontFamily: Typography.fontYouVersionSerif,
    fontSize: 22,
    color: '#111111',
    fontWeight: '600',
    marginBottom: 8,
  },
  definitionText: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 15,
    color: '#333333',
    lineHeight: 22,
    marginBottom: 12,
  },
  contextBox: {
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#8B1E1E',
  },
  contextText: {
    fontFamily: Typography.fontYouVersionSerif,
    fontSize: 13.5,
    color: '#4B5563',
    lineHeight: 19,
    fontStyle: 'italic',
  },
  gotItBtn: {
    backgroundColor: '#111111',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gotItText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 14,
    color: '#FFFFFF',
  },
});
