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
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollStyle}
        decelerationRate="fast"
      >
        {PASTORAL_GUIDES.map((guide) => {
          const apostle = APOSTLE_PERSONAS.find((a) => a.id === guide.apostleId);
          return (
            <TouchableOpacity
              key={guide.id}
              style={[styles.card, { borderColor: '#EBEBEB' }]}
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
    marginVertical: 8,
    overflow: 'visible',
  },
  sectionHeader: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontFamily: Typography.fontSansBold,
    fontSize: 14.5,
    color: '#111827',
    letterSpacing: -0.2,
  },
  scrollStyle: {
    overflow: 'visible',
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 10,
    paddingBottom: 4,
  },
  card: {
    width: 154,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 11,
    borderWidth: 1,
    borderColor: '#ECECEC',
    justifyContent: 'space-between',
    shadowColor: 'transparent',
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 6,
    gap: 4,
    marginBottom: 6,
  },
  emojiText: {
    fontSize: 11,
  },
  tagLabel: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 10,
    letterSpacing: 0.2,
  },
  cardTitle: {
    fontFamily: Typography.fontSansBold,
    fontSize: 12.5,
    lineHeight: 16.5,
    color: '#111827',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 10.5,
    lineHeight: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  apostleFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 6,
  },
  apostleAvatar: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  apostleNameText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 10.5,
    color: '#4B5563',
  },
});
