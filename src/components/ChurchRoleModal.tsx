import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ChurchRole, UserProfile } from '../types';
import { Typography } from '../theme/typography';
import { fetchUserProfile, saveUserProfile } from '../services/database';

interface ChurchRoleModalProps {
  visible: boolean;
  onClose: (selectedRole?: ChurchRole) => void;
}

interface RoleOption {
  role: ChurchRole;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const ROLES: RoleOption[] = [
  {
    role: 'pastor',
    title: 'Pastor / Preacher / Minister',
    subtitle: 'I regularly preach or teach from the pulpit',
    icon: 'mic-outline',
    color: '#8B1E1E'
  },
  {
    role: 'leader',
    title: 'Small Group / Youth Leader',
    subtitle: 'I lead Bible studies, classes, or youth ministry',
    icon: 'people-outline',
    color: '#D97706'
  },
  {
    role: 'member',
    title: 'Church Member / Believer',
    subtitle: 'I want to grow deeper in my faith and Bible walk',
    icon: 'heart-outline',
    color: '#2563EB'
  },
  {
    role: 'seeker',
    title: 'Curious Seeker',
    subtitle: 'I am exploring Jesus, faith, and what the Bible says',
    icon: 'compass-outline',
    color: '#059669'
  }
];

export const ChurchRoleModal: React.FC<ChurchRoleModalProps> = ({ visible, onClose }) => {
  const [selectedRole, setSelectedRole] = useState<ChurchRole>('member');
  const [churchName, setChurchName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const current = await fetchUserProfile();
      const updated: UserProfile = {
        ...current,
        churchRole: selectedRole,
        churchName: churchName.trim() || current.churchName
      };
      await saveUserProfile(updated);
      onClose(selectedRole);
    } catch (e) {
      console.warn('Error saving church role:', e);
      onClose(selectedRole);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={() => onClose()}>
      <TouchableWithoutFeedback onPress={() => onClose()}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={styles.sheetContainer}
            >
              <View style={styles.sheet}>
                {/* Header */}
                <View style={styles.headerRow}>
                  <View style={styles.headerTextCol}>
                    <Text style={styles.title}>How do you serve or participate in church?</Text>
                    <Text style={styles.subtitle}>
                      This helps us tailor your daily Scripture reflections and Bible study tools.
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.closeBtn}
                    onPress={() => onClose()}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="close" size={20} color="#6B7280" />
                  </TouchableOpacity>
                </View>

                {/* Role Choices */}
                <ScrollView showsVerticalScrollIndicator={false} style={styles.rolesScroll}>
                  {ROLES.map(r => {
                    const isSelected = selectedRole === r.role;
                    return (
                      <TouchableOpacity
                        key={r.role}
                        style={[styles.roleCard, isSelected && styles.roleCardSelected]}
                        onPress={() => setSelectedRole(r.role)}
                        activeOpacity={0.8}
                      >
                        <View style={[styles.iconWrap, { backgroundColor: isSelected ? '#FEF2F2' : '#F3F4F6' }]}>
                          <Ionicons name={r.icon} size={22} color={isSelected ? '#8B1E1E' : '#4B5563'} />
                        </View>
                        <View style={styles.roleInfo}>
                          <Text style={[styles.roleTitle, isSelected && styles.roleTitleSelected]}>
                            {r.title}
                          </Text>
                          <Text style={styles.roleSubtitle}>{r.subtitle}</Text>
                        </View>
                        <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                          {isSelected && <View style={styles.radioDot} />}
                        </View>
                      </TouchableOpacity>
                    );
                  })}

                  {/* Church Name (Optional) */}
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>What church do you attend? (Optional)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. Grace Fellowship, City Church..."
                      placeholderTextColor="#9CA3AF"
                      value={churchName}
                      onChangeText={setChurchName}
                    />
                  </View>
                </ScrollView>

                {/* Bottom Actions */}
                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleSave}
                    disabled={isSaving}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.saveButtonText}>
                      {isSaving ? 'Saving...' : 'Save & Continue'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.skipButton}
                    onPress={() => onClose()}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.skipButtonText}>Skip for now</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    width: '100%',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: Platform.OS === 'ios' ? 38 : 24,
    maxHeight: '90%',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTextCol: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    fontFamily: Typography.fontSerifBold,
    fontSize: 20,
    color: '#111111',
    lineHeight: 26,
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  rolesScroll: {
    marginVertical: 6,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    marginBottom: 10,
  },
  roleCardSelected: {
    borderColor: '#8B1E1E',
    backgroundColor: '#FFFDFD',
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  roleInfo: {
    flex: 1,
    paddingRight: 8,
  },
  roleTitle: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 14.5,
    color: '#111111',
    marginBottom: 2,
  },
  roleTitleSelected: {
    color: '#8B1E1E',
  },
  roleSubtitle: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: '#8B1E1E',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#8B1E1E',
  },
  inputContainer: {
    marginTop: 8,
    marginBottom: 14,
  },
  inputLabel: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 12.5,
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    height: 46,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    fontFamily: Typography.fontSansRegular,
    fontSize: 14,
    color: '#111111',
    backgroundColor: '#F9FAFB',
  },
  actionsRow: {
    marginTop: 6,
  },
  saveButton: {
    backgroundColor: '#111111',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  saveButtonText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 15,
    color: '#FFFFFF',
  },
  skipButton: {
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipButtonText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 13,
    color: '#6B7280',
  },
});
