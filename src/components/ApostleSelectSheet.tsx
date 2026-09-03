import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { APOSTLE_PERSONAS } from '../services/personas';
import { ApostlePersona } from '../types';
import { Typography } from '../theme/typography';
import { InteractiveGestureSheet } from './InteractiveGestureSheet';

interface ApostleSelectSheetProps {
  visible: boolean;
  onClose: () => void;
  verseCitation: string;
  verseText: string;
  onSelectApostle: (apostle: ApostlePersona) => void;
}

export const ApostleSelectSheet: React.FC<ApostleSelectSheetProps> = ({
  visible,
  onClose,
  verseCitation,
  verseText,
  onSelectApostle
}) => {
  return (
    <InteractiveGestureSheet
      visible={visible}
      onClose={onClose}
      initialSnap="mid"
      midHeightRatio={0.65}
      fullHeightRatio={0.88}
      showGrabBar={true}
    >
      <View style={styles.contentWrap}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Study with an Apostle</Text>
            <Text style={styles.subtitle} numberOfLines={1}>
              Explore {verseCitation} with a spiritual mentor
            </Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
            <Ionicons name="close" size={20} color="#111111" />
          </TouchableOpacity>
        </View>

        {/* Quoted Verse Snippet Preview */}
        <View style={styles.quoteCard}>
          <Text style={styles.quoteText} numberOfLines={2}>
            “{verseText}”
          </Text>
          <Text style={styles.quoteRef}>— {verseCitation}</Text>
        </View>

        {/* Apostles List */}
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollList}>
          {APOSTLE_PERSONAS.map((apostle) => (
            <TouchableOpacity
              key={apostle.id}
              style={styles.apostleRow}
              onPress={() => {
                onClose();
                onSelectApostle(apostle);
              }}
              activeOpacity={0.75}
            >
              <Image source={apostle.avatar} style={styles.avatar} />
              <View style={styles.metaWrap}>
                <View style={styles.nameBadgeRow}>
                  <Text style={styles.apostleName}>{apostle.name}</Text>
                  <Text style={styles.roleBadge} numberOfLines={1}>{apostle.title}</Text>
                </View>
                <Text style={styles.description} numberOfLines={1}>
                  {apostle.subtitle || apostle.bio}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </InteractiveGestureSheet>
  );
};

const styles = StyleSheet.create({
  contentWrap: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    fontFamily: Typography.fontSansBold,
    fontSize: 17,
    color: '#111827',
  },
  subtitle: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 12.5,
    color: '#6B7280',
    marginTop: 1,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
  },
  quoteCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 14,
  },
  quoteText: {
    fontFamily: Typography.fontSerifItalic,
    fontSize: 13,
    lineHeight: 18,
    color: '#374151',
  },
  quoteRef: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 11.5,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'right',
  },
  scrollList: {
    paddingBottom: 28,
  },
  apostleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    marginBottom: 8,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    backgroundColor: '#E5E7EB',
  },
  metaWrap: {
    flex: 1,
    paddingRight: 8,
  },
  nameBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  apostleName: {
    fontFamily: Typography.fontSansBold,
    fontSize: 14,
    color: '#111827',
  },
  roleBadge: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 10.5,
    color: '#4B5563',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
  },
  description: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 12,
    color: '#6B7280',
  },
});
