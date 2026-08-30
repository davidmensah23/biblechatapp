import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';

interface SettingsScreenProps {
  visible: boolean;
  onClose: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ visible, onClose }) => {
  const [activeSubScreen, setActiveSubScreen] = useState<string | null>(null);
  const [textScale, setTextScale] = useState<'Small' | 'Normal' | 'Large' | 'Extra Large'>('Normal');

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            {activeSubScreen ? (
              <TouchableOpacity
                style={styles.backRow}
                onPress={() => setActiveSubScreen(null)}
              >
                <Ionicons name="arrow-back" size={20} color={Colors.textPrimary} style={{ marginRight: 8 }} />
                <Text style={styles.title}>{activeSubScreen}</Text>
              </TouchableOpacity>
            ) : (
              <>
                <Text style={styles.title}>Settings</Text>
                <View style={styles.titleRedLine} />
              </>
            )}
          </View>

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {activeSubScreen === 'Text and Display' ? (
          /* Text and Display Sub-Screen */
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionTitle}>App-wide Font Size</Text>

            <View style={styles.group}>
              {(['Small', 'Normal', 'Large', 'Extra Large'] as const).map((size) => (
                <TouchableOpacity
                  key={size}
                  style={[styles.pillRow, textScale === size && styles.pillRowActive]}
                  onPress={() => setTextScale(size)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.pillText, textScale === size && styles.pillTextActive]}>
                    {size} {size === 'Normal' ? '(Recommended)' : ''}
                  </Text>
                  {textScale === size && (
                    <Ionicons name="checkmark-circle" size={20} color={Colors.accentBlue} />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Live Preview Card */}
            <Text style={styles.sectionTitle}>Live Reading Preview</Text>
            <View style={styles.previewCard}>
              <Text
                style={[
                  styles.previewText,
                  textScale === 'Small' && { fontSize: 13, lineHeight: 19 },
                  textScale === 'Normal' && { fontSize: 15.5, lineHeight: 23 },
                  textScale === 'Large' && { fontSize: 18, lineHeight: 26 },
                  textScale === 'Extra Large' && { fontSize: 21, lineHeight: 30 },
                ]}
              >
                "Peace be with you! As I walked with our Lord by the sea of Galilee, He taught us to love one another with sincere hearts."
              </Text>
              <Text style={styles.previewAuthor}>— Apostle Simon Peter</Text>
            </View>
          </ScrollView>
        ) : (
          /* Main Settings Menu */
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* General Section */}
            <Text style={styles.sectionTitle}>General</Text>
            <View style={styles.group}>
              {['Account', 'Notifications', 'Languages'].map((item, idx) => (
                <TouchableOpacity key={idx} style={styles.pillRow} activeOpacity={0.7}>
                  <Text style={styles.pillText}>{item}</Text>
                  <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
                </TouchableOpacity>
              ))}
            </View>

            {/* Accessibility Section */}
            <Text style={styles.sectionTitle}>Accessibility</Text>
            <View style={styles.group}>
              {['Text and Display', 'Audio and Visual aids', 'Navigations', 'Cognitive Support'].map((item, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.pillRow}
                  onPress={() => item === 'Text and Display' && setActiveSubScreen(item)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.pillText}>{item}</Text>
                  <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
                </TouchableOpacity>
              ))}
            </View>

            {/* Security Section */}
            <Text style={styles.sectionTitle}>Security</Text>
            <View style={styles.group}>
              {['Devices', 'Privacy & Data'].map((item, idx) => (
                <TouchableOpacity key={idx} style={styles.pillRow} activeOpacity={0.7}>
                  <Text style={styles.pillText}>{item}</Text>
                  <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  titleContainer: {
    position: 'relative',
    paddingBottom: 4,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontFamily: Typography.fontSerif,
    fontSize: 26,
    color: Colors.textPrimary,
  },
  titleRedLine: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 28,
    height: 2.5,
    backgroundColor: Colors.accentRed,
    borderRadius: 2,
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.cardSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 50,
  },
  sectionTitle: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 10,
    marginTop: 10,
  },
  group: {
    gap: 8,
    marginBottom: 16,
  },
  pillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.cardSecondary,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  pillRowActive: {
    borderWidth: 1.5,
    borderColor: Colors.accentBlue,
  },
  pillText: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  pillTextActive: {
    fontFamily: Typography.fontSansSemiBold,
    color: Colors.accentBlue,
  },
  previewCard: {
    backgroundColor: Colors.cardSecondary,
    borderRadius: 18,
    padding: 18,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: Colors.accentBlue,
  },
  previewText: {
    fontFamily: Typography.fontSansRegular,
    color: Colors.textPrimary,
  },
  previewAuthor: {
    fontFamily: Typography.fontSerifItalic,
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: 10,
  }
});
