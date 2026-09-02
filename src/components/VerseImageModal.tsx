import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
  Share,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../theme/typography';
import { MascotAssets } from '../services/mascotAssets';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface VerseImageModalProps {
  visible: boolean;
  onClose: () => void;
  verseCitation: string;
  verseText: string;
  translation?: string;
}

const THEMES = [
  { id: 'cream', name: 'Cream', bg: '#FAF9F6', text: '#1E293B', cite: '#64748B', brand: '#94A3B8', border: '#E2E8F0' },
  { id: 'midnight', name: 'Midnight', bg: '#0F172A', text: '#F8FAFC', cite: '#CBD5E1', brand: '#94A3B8', border: '#1E293B' },
  { id: 'sage', name: 'Sage', bg: '#F0FDF4', text: '#14532D', cite: '#166534', brand: '#4ADE80', border: '#DCFCE7' },
  { id: 'rose', name: 'Rose', bg: '#FFF1F2', text: '#881337', cite: '#9F1239', brand: '#FB7185', border: '#FFE4E6' }
];

const MASCOTS = [
  { id: 'rock', name: 'Anchor Rock', img: MascotAssets.rock },
  { id: 'flame', name: 'Holy Flame', img: MascotAssets.flame },
  { id: 'bread', name: 'Daily Bread', img: MascotAssets.bread },
  { id: 'blossom', name: 'Grace Blossom', img: MascotAssets.blossom }
];

export const VerseImageModal: React.FC<VerseImageModalProps> = ({
  visible,
  onClose,
  verseCitation,
  verseText,
  translation = 'NIV'
}) => {
  const [selectedTheme, setSelectedTheme] = useState(THEMES[0]);
  const [selectedMascot, setSelectedMascot] = useState(MASCOTS[0]);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `“${verseText}”
— ${verseCitation} (${translation})

Created with Bible Chat App: https://biblechatapp.com`,
        title: `Scripture: ${verseCitation}`
      });
    } catch (e) {}
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.headerBtn} activeOpacity={0.7}>
            <Ionicons name="close" size={24} color="#111111" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Create Verse Image</Text>

          <TouchableOpacity onPress={handleShare} style={styles.shareIconBtn} activeOpacity={0.7}>
            <Ionicons name="share-social" size={22} color="#111111" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Visual Editorial Art Card */}
          <View style={styles.cardContainer}>
            <View
              style={[
                styles.artCard,
                {
                  backgroundColor: selectedTheme.bg,
                  borderColor: selectedTheme.border
                }
              ]}
            >
              {/* Top Mascot Seal */}
              <View style={styles.mascotSealWrap}>
                <View style={styles.mascotSealCircle}>
                  <Image source={selectedMascot.img} style={styles.mascotSealImg} resizeMode="cover" />
                </View>
              </View>

              {/* Majestic Verse Typography in Literata */}
              <Text style={[styles.verseText, { color: selectedTheme.text }]}>
                “{verseText}”
              </Text>

              {/* Reference Citation */}
              <Text style={[styles.citationText, { color: selectedTheme.cite }]}>
                — {verseCitation} ({translation})
              </Text>

              {/* Soft Brand Watermark */}
              <View style={styles.brandRow}>
                <Ionicons name="book-outline" size={13} color={selectedTheme.brand} style={{ marginRight: 5 }} />
                <Text style={[styles.brandText, { color: selectedTheme.brand }]}>
                  Bible Chat App
                </Text>
              </View>
            </View>
          </View>

          {/* Theme Palette Chooser */}
          <Text style={styles.sectionHeading}>Card Theme</Text>
          <View style={styles.themeRow}>
            {THEMES.map((t) => {
              const isSelected = selectedTheme.id === t.id;
              return (
                <TouchableOpacity
                  key={t.id}
                  style={[
                    styles.themePill,
                    { backgroundColor: t.bg, borderColor: t.border },
                    isSelected && styles.themePillSelected
                  ]}
                  onPress={() => setSelectedTheme(t)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.themePillText, { color: t.text }]}>{t.name}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Mascot Seal Chooser */}
          <Text style={styles.sectionHeading}>Faith Companion Seal</Text>
          <View style={styles.mascotRow}>
            {MASCOTS.map((m) => {
              const isSelected = selectedMascot.id === m.id;
              return (
                <TouchableOpacity
                  key={m.id}
                  style={[
                    styles.mascotOptionBtn,
                    isSelected && styles.mascotOptionBtnSelected
                  ]}
                  onPress={() => setSelectedMascot(m)}
                  activeOpacity={0.75}
                >
                  <Image source={m.img} style={styles.mascotThumbImg} />
                  <Text style={[styles.mascotThumbText, isSelected && styles.mascotThumbTextSelected]}>
                    {m.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Share Action Button */}
          <TouchableOpacity style={styles.primaryShareBtn} onPress={handleShare} activeOpacity={0.8}>
            <Ionicons name="share-social-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.primaryShareBtnText}>Share to Instagram / WhatsApp</Text>
          </TouchableOpacity>
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerBtn: {
    padding: 6,
  },
  headerTitle: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 17,
    color: '#111111',
  },
  shareIconBtn: {
    padding: 6,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  cardContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  artCard: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 24,
    paddingHorizontal: 26,
    paddingTop: 30,
    paddingBottom: 24,
    alignItems: 'center',
    borderWidth: 1.5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 6,
  },
  mascotSealWrap: {
    marginBottom: 18,
  },
  mascotSealCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2.5,
    borderColor: '#D97706',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mascotSealImg: {
    width: '100%',
    height: '100%',
  },
  verseText: {
    fontFamily: Typography.fontSerif,
    fontSize: 19,
    lineHeight: 29,
    textAlign: 'center',
    letterSpacing: -0.2,
    marginBottom: 16,
  },
  citationText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 22,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 11.5,
    letterSpacing: 0.3,
  },
  sectionHeading: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 14,
    color: '#111111',
    marginBottom: 12,
  },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  themePill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1.5,
    flex: 1,
    marginHorizontal: 3,
    alignItems: 'center',
  },
  themePillSelected: {
    borderColor: '#111111',
    borderWidth: 2,
  },
  themePillText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 13,
  },
  mascotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  mascotOptionBtn: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'transparent',
    flex: 1,
    marginHorizontal: 2,
    backgroundColor: '#F9FAFB',
  },
  mascotOptionBtnSelected: {
    borderColor: '#111111',
    backgroundColor: '#F3F4F6',
  },
  mascotThumbImg: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginBottom: 6,
  },
  mascotThumbText: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
  },
  mascotThumbTextSelected: {
    fontFamily: Typography.fontSansSemiBold,
    color: '#111111',
  },
  primaryShareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111111',
    borderRadius: 16,
    paddingVertical: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  primaryShareBtnText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 15,
    color: '#FFFFFF',
  }
});
