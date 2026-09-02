import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../theme/typography';
import { CardStyles } from '../theme/cardStyles';
import { KingdomDeed, logCompletedDeed, CompletedDeedLog } from '../services/deedsService';
import { InteractiveGestureSheet } from './InteractiveGestureSheet';

interface DeedCompletionModalProps {
  visible: boolean;
  deed: KingdomDeed;
  mode: 'complete' | 'scripture';
  onClose: () => void;
  onSuccess: (log: CompletedDeedLog) => void;
}

export const DeedCompletionModal: React.FC<DeedCompletionModalProps> = ({
  visible,
  deed,
  mode,
  onClose,
  onSuccess
}) => {
  const [reflection, setReflection] = useState('');
  const [locationName, setLocationName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showBlessing, setShowBlessing] = useState(false);

  const handleSealDeed = async () => {
    setIsSubmitting(true);
    try {
      const log = await logCompletedDeed(
        deed,
        reflection,
        locationName || 'Local Community'
      );
      setShowBlessing(true);
      setTimeout(() => {
        setIsSubmitting(false);
        onSuccess(log);
        setShowBlessing(false);
        setReflection('');
        setLocationName('');
        onClose();
      }, 2500);
    } catch (e) {
      setIsSubmitting(false);
    }
  };

  return (
    <InteractiveGestureSheet
      visible={visible}
      onClose={onClose}
      initialSnap="mid"
      midHeightRatio={0.70}
      fullHeightRatio={0.92}
    >
      <View style={styles.sheetContainer}>
        {/* Close Button */}
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Ionicons name="close" size={22} color="#6B7280" />
        </TouchableOpacity>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {showBlessing ? (
              /* Success Celebration Blessing */
              <View style={styles.blessingWrap}>
                <View style={styles.blessingIconCircle}>
                  <Ionicons name="sparkles" size={32} color="#F59E0B" />
                </View>
                <Text style={styles.blessingEyebrow}>DEED SEALED IN GRACE</Text>
                <Text style={styles.blessingTitle}>+{deed.xpReward} Grace XP Awarded!</Text>
                
                <View style={styles.scriptureCard}>
                  <Text style={styles.scriptureRef}>{deed.scriptureRef}</Text>
                  <Text style={styles.scriptureText}>{deed.scriptureVerse}</Text>
                  <Text style={styles.blessingDecree}>{deed.blessingText}</Text>
                </View>
              </View>
            ) : mode === 'scripture' ? (
              /* Scripture Guide View */
              <View style={styles.guideWrap}>
                <View style={styles.guideIconWrap}>
                  <Ionicons name="book" size={28} color="#2563EB" />
                </View>
                <Text style={styles.guideEyebrow}>SCRIPTURAL FOUNDATION</Text>
                <Text style={styles.guideTitle}>{deed.title}</Text>

                <View style={styles.scriptureCard}>
                  <Text style={styles.scriptureRef}>{deed.scriptureRef}</Text>
                  <Text style={styles.scriptureText}>{deed.scriptureVerse}</Text>
                </View>

                <Text style={styles.guideBody}>{deed.description}</Text>

                <TouchableOpacity style={styles.doneBtn} onPress={onClose} activeOpacity={0.85}>
                  <Text style={styles.doneBtnText}>Return to Daily Deed</Text>
                </TouchableOpacity>
              </View>
            ) : (
              /* Reflection & Completion Input Form */
              <View style={styles.formWrap}>
                <Text style={styles.formEyebrow}>DAILY KINGDOM DEED</Text>
                <Text style={styles.formTitle}>Record Your Act of Grace</Text>
                <Text style={styles.formSubtitle}>
                  Share a brief reflection of how you brought God's love into someone's life today.
                </Text>

                {/* Reflection Input */}
                <View style={styles.inputBlock}>
                  <Text style={styles.inputLabel}>What good deed did you share?</Text>
                  <TextInput
                    style={styles.textArea}
                    placeholder="e.g., I bought lunch for a vendor and prayed for his family..."
                    placeholderTextColor="#9CA3AF"
                    value={reflection}
                    onChangeText={setReflection}
                    multiline
                    numberOfLines={3}
                  />
                </View>

                {/* Location / City Tag */}
                <View style={styles.inputBlock}>
                  <Text style={styles.inputLabel}>City or Neighborhood (for Faith Route)</Text>
                  <View style={styles.locationInputRow}>
                    <Ionicons name="location-outline" size={18} color="#2563EB" style={{ marginRight: 8 }} />
                    <TextInput
                      style={styles.locationInput}
                      placeholder="e.g., East Legon, Accra"
                      placeholderTextColor="#9CA3AF"
                      value={locationName}
                      onChangeText={setLocationName}
                    />
                  </View>
                </View>

                {/* Submit Obsidian Pill Button */}
                <TouchableOpacity
                  style={[styles.sealBtn, isSubmitting && styles.sealBtnDisabled]}
                  onPress={handleSealDeed}
                  disabled={isSubmitting}
                  activeOpacity={0.85}
                >
                  <Ionicons name="sparkles" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.sealBtnText}>
                    {isSubmitting ? 'Sealing in Grace...' : `Seal Deed (+${deed.xpReward} XP)`}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
      </View>
    </InteractiveGestureSheet>
  );
};

const styles = StyleSheet.create({
  sheetContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  closeBtn: {
    alignSelf: 'flex-end',
    padding: 6,
    marginTop: -8,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  formWrap: {
    alignItems: 'center',
  },
  formEyebrow: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 11,
    color: '#2563EB',
    letterSpacing: 1,
    marginBottom: 4,
  },
  formTitle: {
    fontFamily: Typography.fontSerif,
    fontSize: 24,
    color: '#111827',
    textAlign: 'center',
    marginBottom: 6,
  },
  formSubtitle: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 13.5,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  inputBlock: {
    width: '100%',
    marginBottom: 16,
  },
  inputLabel: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 13,
    color: '#374151',
    marginBottom: 8,
  },
  textArea: {
    backgroundColor: '#F9FAFB',
    borderRadius: 18,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
    fontFamily: Typography.fontSansRegular,
    fontSize: 14,
    color: '#111827',
    height: 85,
    textAlignVertical: 'top',
  },
  locationInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 18,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  locationInput: {
    flex: 1,
    fontFamily: Typography.fontSansRegular,
    fontSize: 14,
    color: '#111827',
  },
  sealBtn: {
    width: '100%',
    ...CardStyles.obsidianPillBtn,
    paddingVertical: 15,
    marginTop: 8,
  },
  sealBtnDisabled: {
    backgroundColor: '#9CA3AF',
  },
  sealBtnText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 15,
    color: '#FFFFFF',
  },
  blessingWrap: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  blessingIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFBEB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#FEF3C7',
  },
  blessingEyebrow: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 11,
    color: '#B45309',
    letterSpacing: 1,
    marginBottom: 4,
  },
  blessingTitle: {
    fontFamily: Typography.fontSerif,
    fontSize: 22,
    color: '#111827',
    marginBottom: 16,
  },
  scriptureCard: {
    width: '100%',
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    borderCurve: 'continuous',
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  scriptureRef: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 13,
    color: '#2563EB',
    marginBottom: 6,
  },
  scriptureText: {
    fontFamily: Typography.fontSerif,
    fontSize: 15,
    color: '#1F2937',
    lineHeight: 22,
    marginBottom: 8,
  },
  blessingDecree: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 12.5,
    color: '#059669',
    fontStyle: 'italic',
  },
  guideWrap: {
    alignItems: 'center',
  },
  guideIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  guideEyebrow: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 11,
    color: '#2563EB',
    letterSpacing: 1,
    marginBottom: 4,
  },
  guideTitle: {
    fontFamily: Typography.fontSerif,
    fontSize: 22,
    color: '#111827',
    textAlign: 'center',
    marginBottom: 14,
  },
  guideBody: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 13.5,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  doneBtn: {
    width: '100%',
    ...CardStyles.obsidianPillBtn,
    paddingVertical: 14,
  },
  doneBtnText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 14.5,
    color: '#FFFFFF',
  }
});
