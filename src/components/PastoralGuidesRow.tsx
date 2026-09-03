import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image
} from 'react-native';
import { PASTORAL_GUIDES, PastoralGuide } from '../services/pastoralGuidesService';
import { APOSTLE_PERSONAS } from '../services/personas';
import { Typography } from '../theme/typography';
import { Colors } from '../theme/colors';

interface PastoralGuidesRowProps {
  onSelectGuide: (guide: PastoralGuide) => void;
}

export const PastoralGuidesRow: React.FC<PastoralGuidesRowProps> = ({ onSelectGuide }) => {
  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Walk Me Through...</Text>
        <Text style={styles.sectionSubtitle}>Biblical pastoral guidance for right now</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        decelerationRate="fast"
      >
        {PASTORAL_GUIDES.map((guide) => {
          const apostle = APOSTLE_PERSONAS.find((a) => a.id === guide.apostleId);
          return (
            <TouchableOpacity
              key={guide.id}
              style={[styles.card, { borderColor: '#E5E7EB' }]}
              onPress={() => onSelectGuide(guide)}
              activeOpacity={0.82}
            >
              {/* Top Tag */}
              <View style={[styles.tagRow, { backgroundColor: guide.accentBg }]}>
                <Text style={styles.emojiText}>{guide.emoji}</Text>
                <Text style={[styles.tagLabel, { color: guide.color }]}>
                  {guide.situationLabel}
                </Text>
              </View>

              {/* Title */}
              <Text style={styles.cardTitle} numberOfLines={2}>
                {guide.title}
              </Text>

              {/* Subtitle */}
              <Text style={styles.cardSubtitle} numberOfLines={1}>
                {guide.subtitle}
              </Text>

              {/* Apostle Footer */}
              <View style={styles.apostleFooter}>
                {apostle?.avatar && (
                  <Image source={apostle.avatar} style={styles.apostleAvatar} />
                )}
                <Text style={styles.apostleNameText} numberOfLines={1}>
                  {guide.apostleName.split(',')[0]}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  sectionTitle: {
    fontFamily: Typography.fontSansBold,
    fontSize: 15,
    color: '#111827',
    letterSpacing: -0.2,
  },
  sectionSubtitle: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 12,
    color: '#6B7280',
    marginTop: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
    paddingBottom: 6,
  },
  card: {
    width: 204,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    justifyContent: 'space-between',
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 8,
    gap: 5,
    marginBottom: 8,
  },
  emojiText: {
    fontSize: 12,
  },
  tagLabel: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 11,
    letterSpacing: 0.2,
  },
  cardTitle: {
    fontFamily: Typography.fontSansBold,
    fontSize: 14,
    lineHeight: 19,
    color: '#111827',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 11.5,
    lineHeight: 16,
    color: '#6B7280',
    marginBottom: 12,
  },
  apostleFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 8,
  },
  apostleAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  apostleNameText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 11,
    color: '#4B5563',
  },
});
