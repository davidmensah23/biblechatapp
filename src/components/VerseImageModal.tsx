import React, { useState, useEffect } from 'react';
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
  TextInput,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../theme/typography';
import {
  getRemainingImageGenerations,
  recordImageGeneration,
  QuotaStatus
} from '../services/imageQuotaService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface VerseImageModalProps {
  visible: boolean;
  onClose: () => void;
  verseCitation: string;
  verseText: string;
  translation?: string;
  isGuest?: boolean;
}

type AspectRatioType = '9:16' | '1:1' | '16:9';

interface PresetTheme {
  id: string;
  name: string;
  type: 'image' | 'gradient';
  source?: any;
  colors?: [string, string, ...string[]];
  textColor: string;
}

const PRESET_THEMES: PresetTheme[] = [
  {
    id: 'morning',
    name: 'Galilee Dawn',
    type: 'image',
    source: require('../../assets/images/morning_prayer_bg.jpg'),
    textColor: '#FFFFFF'
  },
  {
    id: 'afternoon',
    name: 'Golden Fields',
    type: 'image',
    source: require('../../assets/images/afternoon_prayer_bg.jpg'),
    textColor: '#FFFFFF'
  },
  {
    id: 'evening',
    name: 'Starry Night',
    type: 'image',
    source: require('../../assets/images/evening_prayer_bg.jpg'),
    textColor: '#FFFFFF'
  },
  {
    id: 'sacred_light',
    name: 'Sacred Light',
    type: 'gradient',
    colors: ['#F59E0B', '#D97706', '#78350F'],
    textColor: '#FFFFFF'
  },
  {
    id: 'parchment',
    name: 'Warm Parchment',
    type: 'gradient',
    colors: ['#FEF3C7', '#FDE68A', '#F59E0B'],
    textColor: '#1E293B'
  }
];

const PROMPT_SUGGESTIONS = [
  'Gentle dawn light breaking over rolling hills',
  'Peaceful living waters with wildflowers on shore',
  'Sunbeams filtering through ancient olive trees',
  'Quiet starlit night sky over calm sea'
];

export const VerseImageModal: React.FC<VerseImageModalProps> = ({
  visible,
  onClose,
  verseCitation,
  verseText,
  translation = 'NIV',
  isGuest = false
}) => {
  const [aspectRatio, setAspectRatio] = useState<AspectRatioType>('9:16');
  const [selectedPreset, setSelectedPreset] = useState<PresetTheme>(PRESET_THEMES[0]);
  const [customPrompt, setCustomPrompt] = useState('');
  const [aiImageUrl, setAiImageUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [quota, setQuota] = useState<QuotaStatus>({ remaining: 3, total: 3, canGenerate: true });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      loadQuota();
      setAiImageUrl(null);
      setErrorMessage(null);
    }
  }, [visible]);

  const loadQuota = async () => {
    const status = await getRemainingImageGenerations(isGuest);
    setQuota(status);
  };

  const handleGenerateAiImage = async () => {
    if (!customPrompt.trim()) {
      setErrorMessage('Please type an inspirational prompt or choose a sample chip below.');
      return;
    }

    if (!quota.canGenerate) {
      setErrorMessage(`Daily limit reached (${quota.total}/${quota.total}). Upgrade to generate unlimited images.`);
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);

    try {
      // Dimensions based on aspect ratio
      let width = 768;
      let height = 1365;
      if (aspectRatio === '1:1') {
        width = 1024;
        height = 1024;
      } else if (aspectRatio === '16:9') {
        width = 1365;
        height = 768;
      }

      // Fast, beautiful Pollinations AI Flux Generator (Zero API key dependencies, instant SSL render)
      const encodedPrompt = encodeURIComponent(`peaceful serene biblical landscape, ${customPrompt.trim()}, spiritual, editorial digital art, cinematic lighting, highly detailed, no text, no characters`);
      const generatedUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&model=flux&nologo=true&seed=${Date.now() % 100000}`;

      // Pre-fetch image
      await Image.prefetch(generatedUrl);

      setAiImageUrl(generatedUrl);
      await recordImageGeneration(isGuest);
      await loadQuota();
    } catch (e) {
      console.warn('AI image gen error:', e);
      setErrorMessage('Could not generate image. Please check your internet connection or use a preset.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `“${verseText}”\n— ${verseCitation} (${translation})\n\nCreated with Bible Chat App: https://biblechatapp.com`,
        title: `Scripture: ${verseCitation}`
      });
    } catch (e) {}
  };

  // Card dimensions based on aspect ratio
  const getCardDimensions = () => {
    const maxWidth = SCREEN_WIDTH - 44;
    if (aspectRatio === '9:16') {
      return { width: maxWidth * 0.72, height: (maxWidth * 0.72) * (16 / 9) };
    }
    if (aspectRatio === '1:1') {
      return { width: maxWidth * 0.85, height: maxWidth * 0.85 };
    }
    // 16:9
    return { width: maxWidth, height: maxWidth * (9 / 16) };
  };

  const cardDim = getCardDimensions();

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.headerCloseBtn} activeOpacity={0.7}>
            <Ionicons name="close" size={22} color="#111111" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Create Verse Image</Text>
            <View style={styles.quotaPill}>
              <Ionicons name="color-wand" size={11} color="#D97706" style={{ marginRight: 4 }} />
              <Text style={styles.quotaText}>
                {quota.remaining} of {quota.total} left today
              </Text>
            </View>
          </View>

          <TouchableOpacity onPress={handleShare} style={styles.shareBtn} activeOpacity={0.8}>
            <Ionicons name="share-outline" size={18} color="#FFFFFF" style={{ marginRight: 4 }} />
            <Text style={styles.shareBtnText}>Share</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Aspect Ratio Switcher */}
          <View style={styles.aspectRatioRow}>
            {[
              { id: '9:16', label: 'Story (9:16)', icon: 'phone-portrait-outline' as const },
              { id: '1:1', label: 'Square (1:1)', icon: 'square-outline' as const },
              { id: '16:9', label: 'Landscape (16:9)', icon: 'phone-landscape-outline' as const },
            ].map((ratio) => (
              <TouchableOpacity
                key={ratio.id}
                style={[styles.ratioPill, aspectRatio === ratio.id && styles.ratioPillActive]}
                onPress={() => setAspectRatio(ratio.id as AspectRatioType)}
                activeOpacity={0.75}
              >
                <Ionicons
                  name={ratio.icon}
                  size={14}
                  color={aspectRatio === ratio.id ? '#111111' : '#6B7280'}
                  style={{ marginRight: 5 }}
                />
                <Text style={[styles.ratioText, aspectRatio === ratio.id && styles.ratioTextActive]}>
                  {ratio.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Scripture Canvas Preview */}
          <View style={styles.previewCanvasWrapper}>
            <View style={[styles.cardCanvas, { width: cardDim.width, height: cardDim.height }]}>
              {/* Background Layer: Either AI Image or Selected Preset */}
              {aiImageUrl ? (
                <Image source={{ uri: aiImageUrl }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
              ) : selectedPreset.type === 'image' && selectedPreset.source ? (
                <Image source={selectedPreset.source} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
              ) : (
                <LinearGradient
                  colors={selectedPreset.colors || ['#1E293B', '#0F172A']}
                  style={StyleSheet.absoluteFillObject}
                />
              )}

              {/* Gentle Readability Gradient Scrim */}
              <LinearGradient
                colors={['rgba(0, 0, 0, 0.45)', 'rgba(0, 0, 0, 0.15)', 'rgba(0, 0, 0, 0.65)']}
                locations={[0, 0.4, 1]}
                style={StyleSheet.absoluteFillObject}
              />

              {/* Quoted Scripture Overlay */}
              <View style={styles.cardContent}>
                <Ionicons name="bookmark" size={18} color="rgba(255, 255, 255, 0.75)" style={{ marginBottom: 10 }} />
                <Text
                  style={[
                    styles.cardVerseText,
                    aspectRatio === '16:9' ? { fontSize: 13, lineHeight: 18 } : { fontSize: 16, lineHeight: 23 }
                  ]}
                  numberOfLines={aspectRatio === '16:9' ? 3 : 6}
                >
                  “{verseText}”
                </Text>
                <Text style={styles.cardCitation}>
                  — {verseCitation} ({translation})
                </Text>
              </View>

              {/* Bottom App Watermark */}
              <View style={styles.cardFooter}>
                <Text style={styles.cardWatermark}>BibleChat App</Text>
              </View>
            </View>
          </View>

          {/* Preset Styles Section */}
          <Text style={styles.sectionHeaderTitle}>Curated Presets</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetScroll}>
            {PRESET_THEMES.map((theme) => {
              const isSelected = !aiImageUrl && selectedPreset.id === theme.id;
              return (
                <TouchableOpacity
                  key={theme.id}
                  style={[styles.presetCard, isSelected && styles.presetCardActive]}
                  onPress={() => {
                    setAiImageUrl(null);
                    setSelectedPreset(theme);
                  }}
                  activeOpacity={0.8}
                >
                  {theme.type === 'image' && theme.source ? (
                    <Image source={theme.source} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
                  ) : (
                    <LinearGradient colors={theme.colors || ['#111', '#333']} style={StyleSheet.absoluteFillObject} />
                  )}
                  <View style={styles.presetOverlay}>
                    <Text style={styles.presetName} numberOfLines={1}>{theme.name}</Text>
                  </View>
                  {isSelected && (
                    <View style={styles.presetCheckBadge}>
                      <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* AI Image Generator Section */}
          <View style={styles.aiGenSection}>
            <View style={styles.aiHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="brush" size={16} color="#D97706" />
                <Text style={styles.sectionHeaderTitle}>Generate Custom Background</Text>
              </View>
              <Text style={styles.dailyQuotaHint}>{quota.remaining} left</Text>
            </View>

            {/* Prompt Input */}
            <View style={styles.promptInputWrap}>
              <TextInput
                style={styles.promptInput}
                placeholder="Describe your vision (e.g. Dawn mist in Galilee...)"
                placeholderTextColor="#9CA3AF"
                value={customPrompt}
                onChangeText={(text) => {
                  setCustomPrompt(text);
                  setErrorMessage(null);
                }}
                multiline
              />

              <TouchableOpacity
                style={[
                  styles.generateBtn,
                  (!customPrompt.trim() || isGenerating || !quota.canGenerate) && styles.generateBtnDisabled
                ]}
                onPress={handleGenerateAiImage}
                disabled={!customPrompt.trim() || isGenerating || !quota.canGenerate}
                activeOpacity={0.85}
              >
                {isGenerating ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="brush" size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.generateBtnText}>Generate</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {errorMessage && (
              <Text style={styles.errorText}>{errorMessage}</Text>
            )}

            {/* Sample Prompt Chips */}
            <Text style={styles.chipsHint}>Or pick an inspiration prompt:</Text>
            <View style={styles.promptChipsRow}>
              {PROMPT_SUGGESTIONS.map((chip, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.chipPill}
                  onPress={() => {
                    setCustomPrompt(chip);
                    setErrorMessage(null);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.chipText}>{chip}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerCloseBtn: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: Typography.fontSansBold,
    fontSize: 16,
    color: '#111827',
  },
  quotaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 2,
  },
  quotaText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 10.5,
    color: '#B45309',
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
  },
  shareBtnText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 12.5,
    color: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 16,
  },
  aspectRatioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  ratioPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
  },
  ratioPillActive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#111827',
  },
  ratioText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 11.5,
    color: '#6B7280',
  },
  ratioTextActive: {
    fontFamily: Typography.fontSansSemiBold,
    color: '#111827',
  },
  previewCanvasWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },
  cardCanvas: {
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    justifyContent: 'space-between',
    padding: 20,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
    zIndex: 2,
  },
  cardVerseText: {
    fontFamily: Typography.fontSerif,
    color: '#FFFFFF',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.55)',
    textShadowOffset: { width: 0, height: 1.5 },
    textShadowRadius: 6,
  },
  cardCitation: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 12.5,
    color: 'rgba(255, 255, 255, 0.92)',
    textShadowColor: 'rgba(0, 0, 0, 0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  cardFooter: {
    alignItems: 'flex-end',
    zIndex: 2,
  },
  cardWatermark: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 10.5,
    color: 'rgba(255, 255, 255, 0.75)',
    letterSpacing: 0.5,
  },
  sectionHeaderTitle: {
    fontFamily: Typography.fontSansBold,
    fontSize: 14.5,
    color: '#111827',
    marginBottom: 10,
  },
  presetScroll: {
    gap: 10,
    paddingBottom: 18,
  },
  presetCard: {
    width: 96,
    height: 96,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  presetCardActive: {
    borderColor: '#111827',
  },
  presetOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: 6,
  },
  presetName: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 10.5,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  presetCheckBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiGenSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  aiHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  dailyQuotaHint: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 11.5,
    color: '#6B7280',
  },
  promptInputWrap: {
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 10,
    marginBottom: 10,
  },
  promptInput: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 13,
    color: '#111827',
    minHeight: 44,
    textAlignVertical: 'top',
  },
  generateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111827',
    paddingVertical: 9,
    borderRadius: 12,
    marginTop: 6,
  },
  generateBtnDisabled: {
    opacity: 0.5,
  },
  generateBtnText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 12.5,
    color: '#FFFFFF',
  },
  errorText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 12,
    color: '#DC2626',
    marginBottom: 8,
  },
  chipsHint: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 11.5,
    color: '#6B7280',
    marginBottom: 8,
  },
  promptChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chipPill: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  chipText: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 11,
    color: '#374151',
  },
});
