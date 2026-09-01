import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../theme/typography';
import {
  SUPPORTED_LANGUAGES,
  AppLanguage,
  getAppLanguage,
  setAppLanguage
} from '../services/localizationService';

interface LanguagePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onLanguageSelected?: (lang: AppLanguage) => void;
}

export const LanguagePickerModal: React.FC<LanguagePickerModalProps> = ({
  visible,
  onClose,
  onLanguageSelected
}) => {
  const currentLang = getAppLanguage();

  const handleSelect = async (code: AppLanguage) => {
    await setAppLanguage(code);
    if (onLanguageSelected) onLanguageSelected(code);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.overlay}>
        <SafeAreaView style={styles.sheetContainer}>
          <View style={styles.grabBar} />

          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Select Language</Text>
              <Text style={styles.subtitle}>Choose your preferred tongue for devotions & AI</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.list}>
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = currentLang === lang.code;

              return (
                <TouchableOpacity
                  key={lang.code}
                  style={[styles.langRow, isSelected && styles.langRowSelected]}
                  onPress={() => handleSelect(lang.code)}
                  activeOpacity={0.7}
                >
                  <View style={styles.langLeft}>
                    <Text style={styles.flagEmoji}>{lang.flag}</Text>
                    <View>
                      <Text style={[styles.nativeName, isSelected && styles.nativeNameSelected]}>
                        {lang.nativeName}
                      </Text>
                      <Text style={styles.englishName}>{lang.name}</Text>
                    </View>
                  </View>

                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={22} color="#2563EB" />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    maxHeight: '75%',
  },
  grabBar: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
    alignSelf: 'center',
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  title: {
    fontFamily: Typography.fontSerif,
    fontSize: 22,
    color: '#111827',
  },
  subtitle: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 12.5,
    color: '#6B7280',
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  list: {
    gap: 8,
  },
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  langRowSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#93C5FD',
  },
  langLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  flagEmoji: {
    fontSize: 24,
  },
  nativeName: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 15,
    color: '#111827',
  },
  nativeNameSelected: {
    color: '#1E40AF',
  },
  englishName: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 12,
    color: '#6B7280',
    marginTop: 1,
  }
});
