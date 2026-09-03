import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TouchableWithoutFeedback
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Typography } from '../theme/typography';
import { SACRED_AVATAR_EMBLEMS, SacredAvatarEmblem, setUserAvatarEmblem } from '../services/avatarService';

interface AvatarPickerModalProps {
  visible: boolean;
  selectedEmblemId: string;
  onClose: () => void;
  onSelectEmblem: (emblem: SacredAvatarEmblem) => void;
}

export const AvatarPickerModal: React.FC<AvatarPickerModalProps> = ({
  visible,
  selectedEmblemId,
  onClose,
  onSelectEmblem
}) => {
  const handleSelect = async (emblem: SacredAvatarEmblem) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}
    await setUserAvatarEmblem(emblem.id);
    onSelectEmblem(emblem);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={styles.sheetContainer}>
              {/* Grab Bar */}
              <View style={styles.grabBar} />

              <View style={styles.headerRow}>
                <View>
                  <Text style={styles.title}>Choose Sacred Emblem</Text>
                  <Text style={styles.subtitle}>Select your fellowship identity across the Community</Text>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
                  <Ionicons name="close" size={20} color="#111111" />
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
              >
                <View style={styles.grid}>
                  {SACRED_AVATAR_EMBLEMS.map((emblem) => {
                    const isSelected = selectedEmblemId === emblem.id;
                    return (
                      <TouchableOpacity
                        key={emblem.id}
                        style={[
                          styles.emblemCard,
                          isSelected && styles.emblemCardSelected
                        ]}
                        onPress={() => handleSelect(emblem)}
                        activeOpacity={0.75}
                      >
                        <View style={[styles.emblemIconCircle, { backgroundColor: emblem.bgColor }]}>
                          <Text style={styles.emblemEmoji}>{emblem.emoji}</Text>
                        </View>
                        <Text style={styles.emblemName} numberOfLines={1}>{emblem.name}</Text>
                        <Text style={styles.emblemMeaning} numberOfLines={1}>{emblem.meaning}</Text>
                        {isSelected && (
                          <View style={styles.checkBadge}>
                            <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>
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
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 36,
    maxHeight: '75%',
  },
  grabBar: {
    width: 38,
    height: 4.5,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 18,
    color: '#111827',
  },
  subtitle: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 12.5,
    color: '#6B7280',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  emblemCard: {
    width: '31%',
    backgroundColor: '#F9FAFB',
    borderRadius: 18,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#F3F4F6',
    position: 'relative',
  },
  emblemCardSelected: {
    borderColor: '#8B1E1E',
    backgroundColor: '#FFFBFB',
  },
  emblemIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emblemEmoji: {
    fontSize: 26,
  },
  emblemName: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 12,
    color: '#111827',
    textAlign: 'center',
  },
  emblemMeaning: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 9.5,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 2,
  },
  checkBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#8B1E1E',
    alignItems: 'center',
    justifyContent: 'center',
  }
});
