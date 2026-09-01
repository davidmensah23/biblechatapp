import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../theme/typography';
import { ARMOR_PIECES, STORY_CHAPTERS, FAITH_TITLES, ArmorPiece } from '../services/armorQuestService';
import { CustomActionModal } from './CustomActionModal';

export const ArmorOfGodView: React.FC = () => {
  const [armorList, setArmorList] = useState<ArmorPiece[]>(ARMOR_PIECES);
  const [selectedArmor, setSelectedArmor] = useState<ArmorPiece | null>(null);
  const [showLessonModal, setShowLessonModal] = useState(false);

  const handleOpenArmor = (piece: ArmorPiece) => {
    setSelectedArmor(piece);
    setShowLessonModal(true);
  };

  const handleToggleEquip = () => {
    if (!selectedArmor) return;
    setArmorList(prev =>
      prev.map(item =>
        item.id === selectedArmor.id ? { ...item, isEquipped: !item.isEquipped } : item
      )
    );
    setShowLessonModal(false);
  };

  const equippedCount = armorList.filter(a => a.isEquipped).length;

  return (
    <View style={styles.container}>
      {/* 1. Armor of God Equipment Showcase */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={styles.sectionLabel}>EPHESIANS 6:10-18</Text>
            <Text style={styles.sectionTitle}>The Armor of God</Text>
          </View>
          <View style={styles.equippedPill}>
            <Ionicons name="shield-checkmark" size={14} color="#2563EB" style={{ marginRight: 4 }} />
            <Text style={styles.equippedPillText}>{equippedCount} / 6 Equipped</Text>
          </View>
        </View>

        <Text style={styles.sectionSub}>
          Tap any piece to reflect on its sacred lesson and equip it for your spiritual walk.
        </Text>

        <View style={styles.armorGrid}>
          {armorList.map((piece) => (
            <TouchableOpacity
              key={piece.id}
              style={[
                styles.armorCard,
                !piece.isUnlocked && styles.armorCardLocked,
                piece.isEquipped && styles.armorCardEquipped
              ]}
              onPress={() => handleOpenArmor(piece)}
              activeOpacity={0.8}
            >
              <View style={[styles.armorIconWrap, { backgroundColor: piece.isUnlocked ? `${piece.color}15` : '#E5E7EB' }]}>
                <Ionicons
                  name={piece.iconName as any}
                  size={26}
                  color={piece.isUnlocked ? piece.color : '#9CA3AF'}
                />
              </View>

              <Text style={[styles.armorName, !piece.isUnlocked && styles.armorNameLocked]} numberOfLines={1}>
                {piece.name}
              </Text>
              <Text style={styles.armorRef}>{piece.scriptureRef}</Text>

              <View style={styles.armorStatusRow}>
                {piece.isEquipped ? (
                  <View style={styles.equippedBadge}>
                    <Text style={styles.equippedBadgeText}>Equipped</Text>
                  </View>
                ) : piece.isUnlocked ? (
                  <Text style={styles.tapToEquipText}>Tap to inspect</Text>
                ) : (
                  <View style={styles.lockRow}>
                    <Ionicons name="lock-closed" size={11} color="#9CA3AF" />
                    <Text style={styles.lockText}>Locked</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 2. Story Chapters: Genesis to Revelation Arc */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionLabel}>EPIC BIBLICAL ODYSSEY</Text>
        <Text style={styles.sectionTitle}>The Living Story</Text>
        <Text style={styles.sectionSub}>Your journey through the unfolding narrative of Scripture.</Text>

        <View style={styles.storyTimeline}>
          {STORY_CHAPTERS.map((ch, idx) => (
            <View key={ch.id} style={styles.storyItem}>
              <View style={styles.storyNodeCol}>
                <View
                  style={[
                    styles.storyNode,
                    ch.isCompleted && styles.storyNodeCompleted,
                    ch.isActive && styles.storyNodeActive
                  ]}
                >
                  {ch.isCompleted ? (
                    <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                  ) : ch.isActive ? (
                    <Ionicons name="flame" size={14} color="#FFFFFF" />
                  ) : (
                    <Text style={styles.storyNodeNum}>{ch.order}</Text>
                  )}
                </View>
                {idx < STORY_CHAPTERS.length - 1 && (
                  <View style={[styles.storyLine, ch.isCompleted && styles.storyLineCompleted]} />
                )}
              </View>

              <View style={styles.storyContent}>
                <Text style={styles.storyEra}>{ch.era}</Text>
                <Text style={styles.storyTitle}>{ch.title}</Text>
                <Text style={styles.storySubtitle}>{ch.subtitle}</Text>
                <Text style={styles.storyAnchor}>{ch.scriptureAnchor}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* 3. Discipleship Titles */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionLabel}>ACCOMPLISHMENTS & REPUTE</Text>
        <Text style={styles.sectionTitle}>Discipleship Titles</Text>

        <View style={styles.titlesList}>
          {FAITH_TITLES.map((t) => (
            <View key={t.id} style={[styles.titleItem, !t.isUnlocked && styles.titleItemLocked]}>
              <View style={[styles.titleIcon, { backgroundColor: t.isUnlocked ? '#DEF7EC' : '#F3F4F6' }]}>
                <Ionicons
                  name={t.isUnlocked ? 'ribbon' : 'lock-closed-outline'}
                  size={18}
                  color={t.isUnlocked ? '#059669' : '#9CA3AF'}
                />
              </View>
              <View style={styles.titleInfo}>
                <Text style={[styles.titleName, !t.isUnlocked && styles.titleNameLocked]}>
                  {t.title}
                </Text>
                <Text style={styles.titleCondition}>{t.condition}</Text>
              </View>
              {t.isUnlocked && (
                <View style={styles.activeTitlePill}>
                  <Text style={styles.activeTitleText}>Earned</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </View>

      {/* Armor Lesson Decree Modal */}
      {selectedArmor && (
        <CustomActionModal
          visible={showLessonModal}
          type="armor_lesson"
          armorPiece={selectedArmor}
          onConfirm={handleToggleEquip}
          onClose={() => setShowLessonModal(false)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  sectionLabel: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 10.5,
    color: '#7C3AED',
    letterSpacing: 0.8,
  },
  sectionTitle: {
    fontFamily: Typography.fontSerif,
    fontSize: 20,
    color: '#111827',
  },
  sectionSub: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 12.5,
    color: '#6B7280',
    lineHeight: 17,
    marginTop: 2,
    marginBottom: 14,
  },
  equippedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  equippedPillText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 11.5,
    color: '#2563EB',
  },
  armorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  armorCard: {
    width: '48%',
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  armorCardLocked: {
    opacity: 0.55,
  },
  armorCardEquipped: {
    borderColor: '#2563EB',
    backgroundColor: '#F0F7FF',
  },
  armorIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  armorName: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 13,
    color: '#111827',
    textAlign: 'center',
    marginBottom: 2,
  },
  armorNameLocked: {
    color: '#6B7280',
  },
  armorRef: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 6,
  },
  armorStatusRow: {
    marginTop: 2,
  },
  equippedBadge: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  equippedBadgeText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 10,
    color: '#FFFFFF',
  },
  tapToEquipText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 10.5,
    color: '#2563EB',
  },
  lockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  lockText: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 10.5,
    color: '#9CA3AF',
  },
  storyTimeline: {
    marginTop: 6,
  },
  storyItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  storyNodeCol: {
    alignItems: 'center',
    width: 30,
    marginRight: 10,
  },
  storyNode: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  storyNodeCompleted: {
    backgroundColor: '#059669',
  },
  storyNodeActive: {
    backgroundColor: '#D97706',
  },
  storyNodeNum: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 11,
    color: '#6B7280',
  },
  storyLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E5E7EB',
    marginTop: 4,
    marginBottom: -4,
  },
  storyLineCompleted: {
    backgroundColor: '#059669',
  },
  storyContent: {
    flex: 1,
  },
  storyEra: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 10,
    color: '#7C3AED',
    letterSpacing: 0.5,
  },
  storyTitle: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 14,
    color: '#111827',
    marginTop: 1,
  },
  storySubtitle: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
    marginTop: 2,
  },
  storyAnchor: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 11,
    color: '#2563EB',
    marginTop: 3,
  },
  titlesList: {
    gap: 8,
    marginTop: 6,
  },
  titleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  titleItemLocked: {
    opacity: 0.55,
  },
  titleIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  titleInfo: {
    flex: 1,
  },
  titleName: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 13,
    color: '#111827',
  },
  titleNameLocked: {
    color: '#6B7280',
  },
  titleCondition: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 11.5,
    color: '#6B7280',
  },
  activeTitlePill: {
    backgroundColor: '#DEF7EC',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  activeTitleText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 10.5,
    color: '#059669',
  }
});
