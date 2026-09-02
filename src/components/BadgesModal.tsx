import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../theme/typography';
import { FaithBadge } from '../services/gamificationService';
import { MascotBadgeCard } from './MascotBadgeCard';

interface BadgesModalProps {
  visible: boolean;
  onClose: () => void;
  badges: FaithBadge[];
}

export const BadgesModal: React.FC<BadgesModalProps> = ({
  visible,
  onClose,
  badges
}) => {
  const [selectedBadge, setSelectedBadge] = useState<FaithBadge | null>(null);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={onClose}
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={24} color="#111111" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Badges</Text>
 <View style={{ width: 24 }} />
 </View>

 <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
 {/* 3-Column Badges Grid */}
 <View style={styles.grid}>
 {badges.map((badge) => (
 <MascotBadgeCard
 key={badge.id}
 badge={badge}
 onPress={() => setSelectedBadge(badge)}
 />
 ))}
 </View>

 {/* Badge Detail Card */}
 {selectedBadge && (
 <View style={[styles.detailCard, { borderColor: selectedBadge.badgeColor }]}>
 <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
 <Text style={styles.detailTitle}>{selectedBadge.title}</Text>
 <View style={[styles.detailXpPill, { backgroundColor: selectedBadge.badgeColor + '20' }]}>
 <Text style={[styles.detailXpText, { color: selectedBadge.badgeColor }]}>+ {selectedBadge.xpReward} XP</Text>
 </View>
 </View>
 <Text style={styles.detailSubtitle}>{selectedBadge.subtitle}</Text>
 <Text style={styles.detailProgressText}>
 Progress: {selectedBadge.progress} / {selectedBadge.maxProgress}
 </Text>
 </View>
 )}
 </ScrollView>
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
 paddingVertical: 14,
 borderBottomWidth: 1,
 borderBottomColor: '#F0F0F1',
 },
 backButton: {
 padding: 4,
 },
 headerTitle: {
 fontFamily: Typography.fontSansSemiBold,
 fontSize: 18,
 color: '#111111',
 },
 scrollContent: {
 padding: 16,
 paddingTop: 24,
 },
 grid: {
 flexDirection: 'row',
 flexWrap: 'wrap',
 justifyContent: 'space-between',
 },
 detailCard: {
 backgroundColor: '#F9F9FB',
 borderRadius: 20,
 padding: 16,
 borderWidth: 1.5,
 marginTop: 16,
 marginBottom: 24,
 },
 detailTitle: {
 fontFamily: Typography.fontSansSemiBold,
 fontSize: 15,
 color: '#111111',
 },
 detailXpPill: {
 paddingHorizontal: 8,
 paddingVertical: 3,
 borderRadius: 10,
 },
 detailXpText: {
 fontFamily: Typography.fontSansSemiBold,
 fontSize: 11,
 },
 detailSubtitle: {
 fontFamily: Typography.fontSansRegular,
 fontSize: 13,
 color: '#4B5563',
 marginBottom: 8,
 },
 detailProgressText: {
 fontFamily: Typography.fontSansMedium,
 fontSize: 12.5,
 color: '#111111',
 }
});