import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../theme/typography';
import { ArmorPiece } from '../services/armorQuestService';

interface CustomActionModalProps {
  visible: boolean;
  type: 'signout' | 'armor_lesson' | 'confirm';
  title?: string;
  message?: string;
  armorPiece?: ArmorPiece | null;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const CustomActionModal: React.FC<CustomActionModalProps> = ({
  visible,
  type,
  title,
  message,
  armorPiece,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = false,
  onConfirm,
  onClose
}) => {
  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="fade" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {type === 'armor_lesson' && armorPiece ? (
            /* Armor of God Sacred Lesson Modal */
            <>
              <View style={[styles.iconLargeWrap, { backgroundColor: `${armorPiece.color}15` }]}>
                <Ionicons name={armorPiece.iconName as any} size={40} color={armorPiece.color} />
              </View>

              <Text style={styles.eyebrowText}>{armorPiece.scriptureRef}</Text>
              <Text style={styles.cardTitle}>{armorPiece.name}</Text>

              <View style={styles.lessonQuoteBox}>
                <Ionicons name="book-outline" size={16} color="#9CA3AF" style={{ marginBottom: 4 }} />
                <Text style={styles.lessonQuoteText}>{armorPiece.lessonDecree}</Text>
              </View>

              <View style={styles.armorActionRow}>
                <TouchableOpacity
                  style={[styles.primaryBtn, { backgroundColor: armorPiece.color }]}
                  onPress={onConfirm}
                  activeOpacity={0.85}
                >
                  <Ionicons name="shield-checkmark" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.primaryBtnText}>
                    {armorPiece.isEquipped ? 'Equipped & Active' : 'Equip Armor Piece'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
                  <Text style={styles.cancelBtnText}>Close</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : type === 'signout' ? (
            /* Sign Out Confirmation Modal */
            <>
              <View style={[styles.iconLargeWrap, { backgroundColor: '#FEE2E2' }]}>
                <Ionicons name="log-out-outline" size={36} color="#DC2626" />
              </View>

              <Text style={styles.cardTitle}>Sign Out</Text>
              <Text style={styles.cardBody}>
                Are you sure you want to sign out? Your saved offline data will be kept on this device.
              </Text>

              <View style={styles.actionColumn}>
                <TouchableOpacity
                  style={[styles.primaryBtn, styles.destructiveBtn]}
                  onPress={onConfirm}
                  activeOpacity={0.85}
                >
                  <Text style={styles.primaryBtnText}>Yes, Sign Out</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
                  <Text style={styles.cancelBtnText}>Stay Signed In</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            /* Generic Confirmation Modal */
            <>
              <View style={[styles.iconLargeWrap, { backgroundColor: isDestructive ? '#FEE2E2' : '#EFF6FF' }]}>
                <Ionicons
                  name={isDestructive ? 'alert-circle-outline' : 'information-circle-outline'}
                  size={36}
                  color={isDestructive ? '#DC2626' : '#2563EB'}
                />
              </View>

              <Text style={styles.cardTitle}>{title || 'Confirmation'}</Text>
              <Text style={styles.cardBody}>{message}</Text>

              <View style={styles.actionColumn}>
                <TouchableOpacity
                  style={[styles.primaryBtn, isDestructive && styles.destructiveBtn]}
                  onPress={onConfirm}
                  activeOpacity={0.85}
                >
                  <Text style={styles.primaryBtnText}>{confirmText}</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
                  <Text style={styles.cancelBtnText}>{cancelText}</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  iconLargeWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  eyebrowText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 11,
    color: '#6B7280',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  cardTitle: {
    fontFamily: Typography.fontSerif,
    fontSize: 24,
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  cardBody: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 13.5,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  lessonQuoteBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
    marginBottom: 20,
    width: '100%',
  },
  lessonQuoteText: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 13,
    color: '#374151',
    lineHeight: 19,
    fontStyle: 'italic',
  },
  actionColumn: {
    width: '100%',
    gap: 8,
  },
  armorActionRow: {
    width: '100%',
    gap: 8,
  },
  primaryBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 16,
    paddingVertical: 13,
  },
  destructiveBtn: {
    backgroundColor: '#DC2626',
  },
  primaryBtnText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 14.5,
    color: '#FFFFFF',
  },
  cancelBtn: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 13.5,
    color: '#6B7280',
  }
});
