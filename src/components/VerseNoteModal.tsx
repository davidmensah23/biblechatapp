import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../theme/typography';

interface VerseNoteModalProps {
  visible: boolean;
  onClose: () => void;
  verseCitation: string;
  verseText: string;
  existingNote?: string;
  onSaveNote: (noteText: string) => void;
  onDeleteNote?: () => void;
}

export const VerseNoteModal: React.FC<VerseNoteModalProps> = ({
  visible,
  onClose,
  verseCitation,
  verseText,
  existingNote = '',
  onSaveNote,
  onDeleteNote
}) => {
  const [noteText, setNoteText] = useState(existingNote);

  useEffect(() => {
    setNoteText(existingNote);
  }, [existingNote, visible]);

  const handleSave = () => {
    if (!noteText.trim()) return;
    onSaveNote(noteText.trim());
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.headerBtn} activeOpacity={0.7}>
              <Ionicons name="close" size={24} color="#111111" />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Reflection Note</Text>

            <TouchableOpacity
              onPress={handleSave}
              style={[styles.saveHeaderBtn, !noteText.trim() && styles.saveHeaderBtnDisabled]}
              disabled={!noteText.trim()}
              activeOpacity={0.7}
            >
              <Text style={styles.saveHeaderText}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            {/* Verse Citation Banner */}
            <View style={styles.citationBanner}>
              <Text style={styles.citationTitle}>{verseCitation}</Text>
              <Text style={styles.verseSnippet}>“{verseText}”</Text>
            </View>

            {/* Note Text Input */}
            <Text style={styles.inputHeading}>Personal Journal Note</Text>
            <View style={styles.inputCard}>
              <TextInput
                style={styles.textInput}
                placeholder="What is the Holy Spirit revealing to you through this scripture? Write your prayer, reflection, or takeaway..."
                placeholderTextColor="#9CA3AF"
                multiline
                value={noteText}
                onChangeText={setNoteText}
                autoFocus
              />
            </View>

            {/* Save Note Button */}
            <TouchableOpacity
              style={[styles.primarySaveBtn, !noteText.trim() && styles.primarySaveBtnDisabled]}
              onPress={handleSave}
              disabled={!noteText.trim()}
              activeOpacity={0.8}
            >
              <Text style={styles.primarySaveBtnText}>Save to Profile Journal</Text>
            </TouchableOpacity>

            {/* Delete Note Option if note already exists */}
            {existingNote && onDeleteNote ? (
              <TouchableOpacity
                style={styles.deleteNoteBtn}
                onPress={() => {
                  onDeleteNote();
                  onClose();
                }}
                activeOpacity={0.75}
              >
                <Ionicons name="trash-outline" size={16} color="#DC2626" style={{ marginRight: 6 }} />
                <Text style={styles.deleteNoteBtnText}>Delete Note</Text>
              </TouchableOpacity>
            ) : null}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerBtn: {
    padding: 6,
  },
  headerTitle: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 17,
    color: '#111111',
  },
  saveHeaderBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: '#111111',
    borderRadius: 12,
  },
  saveHeaderBtnDisabled: {
    backgroundColor: '#E5E7EB',
  },
  saveHeaderText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 13,
    color: '#FFFFFF',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  citationBanner: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#EFEFF0',
  },
  citationTitle: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 15,
    color: '#111111',
    marginBottom: 6,
  },
  verseSnippet: {
    fontFamily: Typography.fontYouVersionSerif,
    fontSize: 17,
    lineHeight: 26,
    color: '#111111',
  },
  inputHeading: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 14,
    color: '#111111',
    marginBottom: 10,
  },
  inputCard: {
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minHeight: 180,
    marginBottom: 20,
  },
  textInput: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 15,
    lineHeight: 23,
    color: '#111111',
    textAlignVertical: 'top',
  },
  primarySaveBtn: {
    backgroundColor: '#111111',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  primarySaveBtnDisabled: {
    backgroundColor: '#D1D5DB',
  },
  primarySaveBtnText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 14.5,
    color: '#FFFFFF',
  },
  deleteNoteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  deleteNoteBtnText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 13.5,
    color: '#DC2626',
  }
});
