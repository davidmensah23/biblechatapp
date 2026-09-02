import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ScrollView,
  Image,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../theme/typography';
import { APOSTLE_PERSONAS } from '../services/personas';
import { COUNCIL_PRESETS } from '../services/groupConversationConductor';
import { GroupCouncilThread } from '../types/groupChat';
import { createGroupThread } from '../services/database';

interface CreateGroupCouncilModalProps {
  visible: boolean;
  onClose: () => void;
  onCouncilCreated: (thread: GroupCouncilThread) => void;
}

export const CreateGroupCouncilModal: React.FC<CreateGroupCouncilModalProps> = ({
  visible,
  onClose,
  onCouncilCreated
}) => {
  const [tab, setTab] = useState<'presets' | 'custom'>('presets');
  const [customName, setCustomName] = useState('');
  const [customTopic, setCustomTopic] = useState('');
  const [selectedApostleIds, setSelectedApostleIds] = useState<string[]>(['peter', 'paul', 'john']);
  const [loading, setLoading] = useState(false);

  const toggleApostle = (id: string) => {
    if (selectedApostleIds.includes(id)) {
      if (selectedApostleIds.length <= 2) {
        Alert.alert('Minimum Members', 'A council needs at least 2 Apostles to converse.');
        return;
      }
      setSelectedApostleIds(selectedApostleIds.filter(a => a !== id));
    } else {
      setSelectedApostleIds([...selectedApostleIds, id]);
    }
  };

  const handleCreateFromPreset = async (preset: typeof COUNCIL_PRESETS[0]) => {
    setLoading(true);
    try {
      const thread = await createGroupThread(preset.name, preset.topic, preset.apostleIds);
      onCouncilCreated(thread);
      onClose();
    } catch (e) {
      Alert.alert('Error', 'Could not start council room.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCustom = async () => {
    if (!customName.trim()) {
      Alert.alert('Name Required', 'Please give this council a name.');
      return;
    }
    if (selectedApostleIds.length < 2) {
      Alert.alert('Select Apostles', 'Please select at least 2 Apostles to gather.');
      return;
    }

    setLoading(true);
    try {
      const topic = customTopic.trim() || 'Studying Scripture and walking in grace together.';
      const thread = await createGroupThread(customName.trim(), topic, selectedApostleIds);
      onCouncilCreated(thread);
      onClose();
    } catch (e) {
      Alert.alert('Error', 'Could not start custom council.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.backdrop}>
        <SafeAreaView style={styles.sheetContainer}>
          {/* Top Grab Handle */}
          <View style={styles.grabBar} />

          {/* Header */}
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.title}>Council of Faith</Text>
              <Text style={styles.subtitle}>Gather multiple Apostles into one fellowship room</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Ionicons name="close" size={20} color="#111111" />
            </TouchableOpacity>
          </View>

          {/* Segmented Switcher */}
          <View style={styles.segmentedRow}>
            <TouchableOpacity
              style={[styles.segmentBtn, tab === 'presets' && styles.segmentBtnActive]}
              onPress={() => setTab('presets')}
              activeOpacity={0.8}
            >
              <Text style={[styles.segmentText, tab === 'presets' && styles.segmentTextActive]}>
                🏛️ Recommended Councils
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.segmentBtn, tab === 'custom' && styles.segmentBtnActive]}
              onPress={() => setTab('custom')}
              activeOpacity={0.8}
            >
              <Text style={[styles.segmentText, tab === 'custom' && styles.segmentTextActive]}>
                ✨ Custom Room
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {tab === 'presets' ? (
              <View style={styles.presetsList}>
                {COUNCIL_PRESETS.map((preset) => {
                  const memberApostles = APOSTLE_PERSONAS.filter(a => preset.apostleIds.includes(a.id));
                  return (
                    <TouchableOpacity
                      key={preset.id}
                      style={styles.presetCard}
                      onPress={() => handleCreateFromPreset(preset)}
                      activeOpacity={0.85}
                      disabled={loading}
                    >
                      <View style={styles.presetCardHeader}>
                        <View style={[styles.presetIconWrap, { backgroundColor: `${preset.color}15` }]}>
                          <Ionicons name={preset.icon as any} size={22} color={preset.color} />
                        </View>
                        <View style={{ flex: 1, marginLeft: 12 }}>
                          <Text style={styles.presetName}>{preset.name}</Text>
                          <Text style={styles.presetSubtitle}>{preset.subtitle}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                      </View>

                      <Text style={styles.presetTopic}>"{preset.topic}"</Text>

                      {/* Member Avatars Row */}
                      <View style={styles.avatarsRow}>
                        {memberApostles.map((a, i) => (
                          <Image
                            key={a.id}
                            source={a.avatar}
                            style={[
                              styles.memberAvatar,
                              { marginLeft: i === 0 ? 0 : -10, zIndex: 10 - i, borderColor: '#FFFFFF' }
                            ]}
                          />
                        ))}
                        <Text style={styles.membersCountText}>
                          {preset.apostleIds.length} Apostles
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              <View style={styles.customForm}>
                <View style={styles.inputWrap}>
                  <Text style={styles.inputLabel}>Room Name</Text>
                  <TextInput
                    style={styles.inputField}
                    placeholder="e.g. Antioch Fellowship / Grace & Faith"
                    placeholderTextColor="#9CA3AF"
                    value={customName}
                    onChangeText={setCustomName}
                  />
                </View>

                <View style={styles.inputWrap}>
                  <Text style={styles.inputLabel}>Focus Topic or Question (Optional)</Text>
                  <TextInput
                    style={[styles.inputField, { height: 72, textAlignVertical: 'top' }]}
                    placeholder="e.g. How do we keep our eyes on Jesus when storms of life arise?"
                    placeholderTextColor="#9CA3AF"
                    value={customTopic}
                    onChangeText={setCustomTopic}
                    multiline
                    numberOfLines={3}
                  />
                </View>

                <Text style={[styles.inputLabel, { marginTop: 8, marginBottom: 8 }]}>
                  Select Apostles to Invite ({selectedApostleIds.length} selected)
                </Text>

                <View style={styles.apostlesGrid}>
                  {APOSTLE_PERSONAS.map((a) => {
                    const isSelected = selectedApostleIds.includes(a.id);
                    return (
                      <TouchableOpacity
                        key={a.id}
                        style={[styles.apostleSelectPill, isSelected && styles.apostleSelectPillActive]}
                        onPress={() => toggleApostle(a.id)}
                        activeOpacity={0.8}
                      >
                        <Image source={a.avatar} style={styles.apostlePillAvatar} />
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.apostlePillName, isSelected && styles.apostlePillNameActive]}>
                            {a.name}
                          </Text>
                          <Text style={styles.apostlePillTitle} numberOfLines={1}>
                            {a.subtitle}
                          </Text>
                        </View>
                        <Ionicons
                          name={isSelected ? "checkmark-circle" : "ellipse-outline"}
                          size={20}
                          color={isSelected ? "#16A34A" : "#D1D5DB"}
                        />
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <TouchableOpacity
                  style={styles.createBtn}
                  onPress={handleCreateCustom}
                  activeOpacity={0.85}
                  disabled={loading}
                >
                  <Text style={styles.createBtnText}>Open Council Room</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '90%',
    paddingBottom: 24,
  },
  grabBar: {
    width: 38,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  title: {
    fontFamily: Typography.fontSerifBold,
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
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentedRow: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    marginHorizontal: 20,
    padding: 4,
    marginBottom: 16,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 11,
  },
  segmentBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  segmentText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 12.5,
    color: '#6B7280',
  },
  segmentTextActive: {
    fontFamily: Typography.fontSansSemiBold,
    color: '#111827',
  },
  scrollArea: {
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  presetsList: {
    gap: 12,
  },
  presetCard: {
    backgroundColor: '#FAFAFA',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
  },
  presetCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  presetIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetName: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 15.5,
    color: '#111827',
  },
  presetSubtitle: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 12,
    color: '#6B7280',
    marginTop: 1,
  },
  presetTopic: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
    marginBottom: 12,
  },
  avatarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  membersCountText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 10,
  },
  customForm: {
    gap: 12,
  },
  inputWrap: {
    marginBottom: 2,
  },
  inputLabel: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 13,
    color: '#374151',
    marginBottom: 6,
  },
  inputField: {
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: Typography.fontSansRegular,
    fontSize: 14,
    color: '#111827',
  },
  apostlesGrid: {
    gap: 8,
    marginBottom: 16,
  },
  apostleSelectPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    padding: 10,
    gap: 10,
  },
  apostleSelectPillActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#16A34A',
  },
  apostlePillAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  apostlePillName: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 14,
    color: '#111827',
  },
  apostlePillNameActive: {
    color: '#16A34A',
  },
  apostlePillTitle: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 11.5,
    color: '#6B7280',
  },
  createBtn: {
    backgroundColor: '#111827',
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  createBtnText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 15,
    color: '#FFFFFF',
  },
});
