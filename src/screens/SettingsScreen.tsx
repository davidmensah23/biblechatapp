import React from 'react';
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
  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Profile</Text>
            <View style={styles.titleRedLine} />
          </View>

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

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
              <TouchableOpacity key={idx} style={styles.pillRow} activeOpacity={0.7}>
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
    fontSize: 13,
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
  pillText: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 14,
    color: Colors.textPrimary,
  }
});
