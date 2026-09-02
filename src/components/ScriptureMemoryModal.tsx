import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Share,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { InteractiveGestureSheet } from './InteractiveGestureSheet';
import { Typography } from '../theme/typography';
import { Colors } from '../theme/colors';
import { MascotAssets } from '../services/mascotAssets';
import { saveMemorizedVerse } from '../services/database';
import { recordDailyActivity } from '../services/gamificationService';
import { playDeepgramSpeech, stopDeepgramSpeech } from '../services/deepgramVoices';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface ScriptureMemoryModalProps {
  visible: boolean;
  reference: string;
  verseText: string;
  version?: string;
  onClose: () => void;
  onMastered?: () => void;
}

type Stage = 1 | 2 | 3 | 4 | 5;

interface WordToken {
  original: string;
  clean: string;
  isBlank: boolean;
  isFilled: boolean;
}

export const ScriptureMemoryModal: React.FC<ScriptureMemoryModalProps> = ({
  visible,
  reference,
  verseText,
  version = 'NIV',
  onClose,
  onMastered,
}) => {
  const [stage, setStage] = useState<Stage>(1);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [activeBlankIndex, setActiveBlankIndex] = useState<number>(0);
  const [tokens, setTokens] = useState<WordToken[]>([]);
  const [wordBank, setWordBank] = useState<{ id: string; word: string; used: boolean }[]>([]);
  const [errorWordId, setErrorWordId] = useState<string | null>(null);

  // Parse and reset whenever modal opens or verse changes
  useEffect(() => {
    if (visible) {
      setStage(1);
      setIsPlayingAudio(false);
    } else {
      stopDeepgramSpeech();
      setIsPlayingAudio(false);
    }
  }, [visible, verseText]);

  // Generate tokens for Stage 2 (25% blanks) and Stage 3 (50% blanks)
  const setupGameStage = (currentStage: 2 | 3) => {
    const rawWords = verseText.trim().split(/\s+/);
    const blankRatio = currentStage === 2 ? 4 : 2; // every 4th or 2nd word

    let blankIdxCounter = 0;
    const missingWords: { id: string; word: string; used: boolean }[] = [];

    const newTokens: WordToken[] = rawWords.map((word, idx) => {
      const clean = word.replace(/[^a-zA-Z0-9]/g, '');
      const shouldBeBlank = clean.length > 2 && idx % blankRatio === 0;

      if (shouldBeBlank) {
        missingWords.push({
          id: `word_${idx}_${clean}`,
          word: clean,
          used: false
        });
      }

      return {
        original: word,
        clean,
        isBlank: shouldBeBlank,
        isFilled: false
      };
    });

    // Scramble missing words for the word bank
    const scrambled = [...missingWords].sort(() => Math.random() - 0.5);

    setTokens(newTokens);
    setWordBank(scrambled);
    setActiveBlankIndex(0);
    setStage(currentStage);
  };

  // Words that are blanks in current tokens
  const blankTokensIndices = useMemo(() => {
    const indices: number[] = [];
    tokens.forEach((t, idx) => {
      if (t.isBlank) indices.push(idx);
    });
    return indices;
  }, [tokens]);

  const handleTilePress = (tile: { id: string; word: string; used: boolean }) => {
    if (tile.used) return;

    if (activeBlankIndex >= blankTokensIndices.length) return;
    const currentTokenIndex = blankTokensIndices[activeBlankIndex];
    const targetToken = tokens[currentTokenIndex];

    if (tile.word.toLowerCase() === targetToken.clean.toLowerCase()) {
      // Correct Match!
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setErrorWordId(null);

      // Mark token filled
      const updatedTokens = [...tokens];
      updatedTokens[currentTokenIndex] = {
        ...targetToken,
        isFilled: true
      };
      setTokens(updatedTokens);

      // Mark tile used
      setWordBank(prev => prev.map(w => w.id === tile.id ? { ...w, used: true } : w));

      const nextBlank = activeBlankIndex + 1;
      setActiveBlankIndex(nextBlank);

      // Check if all blanks filled
      if (nextBlank >= blankTokensIndices.length) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setTimeout(() => {
          if (stage === 2) {
            setupGameStage(3); // Advance to 50%
          } else if (stage === 3) {
            setStage(4); // Advance to Master mode
          }
        }, 650);
      }
    } else {
      // Incorrect Match
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      setErrorWordId(tile.id);
      setTimeout(() => setErrorWordId(null), 500);
    }
  };

  // Audio Playback
  const handleToggleAudio = async () => {
    if (isPlayingAudio) {
      await stopDeepgramSpeech();
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      await playDeepgramSpeech(
        `mem_${reference}`,
        verseText,
        'paul',
        () => setIsPlayingAudio(true),
        () => setIsPlayingAudio(false)
      );
    }
  };

  // Master Mode Completion
  const handleMasterModeComplete = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setStage(5);

    // Save to Database and award XP
    await saveMemorizedVerse(reference, verseText, version);
    await recordDailyActivity('verse_memorized', 15);
    if (onMastered) onMastered();
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `I hid this scripture in my heart today: "${verseText}" — ${reference} (${version}) #BibleChat`
      });
    } catch (e) {}
  };

  return (
    <InteractiveGestureSheet
      visible={visible}
      onClose={() => {
        stopDeepgramSpeech();
        onClose();
      }}
      initialSnap="full"
      fullHeightRatio={0.92}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {/* Top Header Row with Progress Tracker */}
        <View style={styles.topHeader}>
          <View style={styles.badgePill}>
            <Ionicons name="sparkles" size={14} color="#D97706" />
            <Text style={styles.badgePillText}>HIDE GOD'S WORD</Text>
          </View>
          <View style={styles.stageIndicatorRow}>
            {[1, 2, 3, 4, 5].map((s) => (
              <View
                key={s}
                style={[
                  styles.stageDot,
                  stage === s && styles.stageDotActive,
                  stage > s && styles.stageDotCompleted
                ]}
              />
            ))}
          </View>
        </View>

        {/* Reference Bar */}
        <View style={styles.referenceRow}>
          <Text style={styles.referenceTitle}>{reference}</Text>
          <View style={styles.versionBadge}>
            <Text style={styles.versionText}>{version}</Text>
          </View>
        </View>

        {/* ========================================================= */}
        {/* STAGE 1: READ & ABSORB */}
        {/* ========================================================= */}
        {stage === 1 && (
          <View style={styles.stageContainer}>
            <Text style={styles.instructionText}>
              Stage 1 of 4: Read the scripture slowly and let the words sink into your spirit.
            </Text>

            <View style={styles.verseCard}>
              <Text style={styles.verseBodyText}>"{verseText}"</Text>
            </View>

            {/* Audio Recitation Button */}
            <TouchableOpacity
              style={[styles.audioBtn, isPlayingAudio && styles.audioBtnPlaying]}
              onPress={handleToggleAudio}
              activeOpacity={0.8}
            >
              <Ionicons
                name={isPlayingAudio ? "volume-high" : "volume-medium-outline"}
                size={20}
                color={isPlayingAudio ? "#FFFFFF" : "#111827"}
              />
              <Text style={[styles.audioBtnText, isPlayingAudio && styles.audioBtnTextPlaying]}>
                {isPlayingAudio ? "Reciting Scripture..." : "Listen Aloud"}
              </Text>
            </TouchableOpacity>

            {/* Ready Button */}
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => setupGameStage(2)}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryBtnText}>I've Read It · Start Memory Challenge</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
            </TouchableOpacity>
          </View>
        )}

        {/* ========================================================= */}
        {/* STAGE 2 & 3: INTERACTIVE WORD BANK BLANKS */}
        {/* ========================================================= */}
        {(stage === 2 || stage === 3) && (
          <View style={styles.stageContainer}>
            <Text style={styles.instructionText}>
              {stage === 2
                ? "Stage 2: 25% Hidden. Tap the matching word tiles below in sequence to complete the blanks!"
                : "Stage 3: 50% Hidden. Deeper recall! Reconstruct the passage from memory."}
            </Text>

            {/* Verse with Interactive Blanks */}
            <View style={styles.verseCard}>
              <View style={styles.tokensFlowWrap}>
                {tokens.map((token, idx) => {
                  if (!token.isBlank) {
                    return (
                      <Text key={idx} style={styles.tokenPlainText}>
                        {token.original}{' '}
                      </Text>
                    );
                  }

                  if (token.isFilled) {
                    return (
                      <View key={idx} style={styles.filledBlankPill}>
                        <Text style={styles.filledBlankText}>{token.clean}</Text>
                      </View>
                    );
                  }

                  const isCurrentBlank = blankTokensIndices[activeBlankIndex] === idx;
                  return (
                    <View
                      key={idx}
                      style={[
                        styles.emptyBlankPill,
                        isCurrentBlank && styles.currentBlankPill
                      ]}
                    >
                      <Text style={[styles.emptyBlankText, isCurrentBlank && styles.currentBlankText]}>
                        _____
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Word Bank Scrambled Tiles */}
            <View style={styles.wordBankContainer}>
              <Text style={styles.wordBankLabel}>WORD BANK</Text>
              <View style={styles.tilesGrid}>
                {wordBank.map((tile) => (
                  <TouchableOpacity
                    key={tile.id}
                    style={[
                      styles.wordTile,
                      tile.used && styles.wordTileUsed,
                      errorWordId === tile.id && styles.wordTileError
                    ]}
                    onPress={() => handleTilePress(tile)}
                    disabled={tile.used}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.wordTileText,
                        tile.used && styles.wordTileTextUsed,
                        errorWordId === tile.id && styles.wordTileTextError
                      ]}
                    >
                      {tile.word}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* ========================================================= */}
        {/* STAGE 4: MASTER MODE (FIRST LETTERS ONLY) */}
        {/* ========================================================= */}
        {stage === 4 && (
          <View style={styles.stageContainer}>
            <Text style={styles.instructionText}>
              Stage 4: Master Mode. Every word is hidden down to its first letter. Recite the full verse aloud!
            </Text>

            <View style={styles.verseCard}>
              <View style={styles.tokensFlowWrap}>
                {verseText.trim().split(/\s+/).map((word, idx) => {
                  const firstChar = word.charAt(0);
                  const dots = '_'.repeat(Math.min(3, Math.max(1, word.length - 1)));
                  return (
                    <Text key={idx} style={styles.masterLetterText}>
                      {firstChar}{dots}{' '}
                    </Text>
                  );
                })}
              </View>
            </View>

            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: '#8B1E1E' }]}
              onPress={handleMasterModeComplete}
              activeOpacity={0.85}
            >
              <Ionicons name="trophy" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.primaryBtnText}>I Recited It from Memory! 🏆</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ========================================================= */}
        {/* STAGE 5: VICTORY & REWARD */}
        {/* ========================================================= */}
        {stage === 5 && (
          <View style={[styles.stageContainer, styles.victoryContainer]}>
            {/* Mascot Trophy Celebration */}
            <View style={styles.mascotSealWrap}>
              <Image source={MascotAssets.bread} style={styles.mascotSealImg} resizeMode="contain" />
              <View style={styles.rewardXpPill}>
                <Text style={styles.rewardXpText}>+15 XP</Text>
              </View>
            </View>

            <Text style={styles.victoryTitle}>Hidden in Your Heart!</Text>
            <Text style={styles.victorySubtitle}>
              "I have hidden your word in my heart that I might not sin against you." — Psalm 119:11
            </Text>

            <View style={styles.memorizedSummaryCard}>
              <Text style={styles.summaryRef}>{reference} · {version}</Text>
              <Text style={styles.summaryBody}>"{verseText}"</Text>
            </View>

            {/* Actions */}
            <TouchableOpacity
              style={styles.shareBtn}
              onPress={handleShare}
              activeOpacity={0.8}
            >
              <Ionicons name="share-social-outline" size={18} color="#111827" style={{ marginRight: 6 }} />
              <Text style={styles.shareBtnText}>Share Memorized Verse</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.primaryBtn, { marginTop: 12 }]}
              onPress={() => {
                onClose();
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </InteractiveGestureSheet>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderRadius: 8,
    gap: 5,
  },
  badgePillText: {
    fontFamily: Typography.fontSansBold,
    fontSize: 10,
    letterSpacing: 0.8,
    color: '#92400E',
  },
  stageIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stageDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
  },
  stageDotActive: {
    width: 22,
    backgroundColor: '#8B1E1E',
  },
  stageDotCompleted: {
    backgroundColor: '#10B981',
  },
  referenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  referenceTitle: {
    fontFamily: Typography.fontSansBold,
    fontSize: 22,
    color: '#111827',
    letterSpacing: -0.3,
  },
  versionBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  versionText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 11,
    color: '#6B7280',
  },
  stageContainer: {
    marginTop: 4,
  },
  instructionText: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 13.5,
    lineHeight: 20,
    color: '#4B5563',
    marginBottom: 14,
  },
  verseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 20,
    minHeight: 140,
    justifyContent: 'center',
  },
  verseBodyText: {
    fontFamily: Typography.fontYouVersionSerif,
    fontSize: 18,
    lineHeight: 28,
    color: '#1F2937',
  },
  tokensFlowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  tokenPlainText: {
    fontFamily: Typography.fontYouVersionSerif,
    fontSize: 18,
    lineHeight: 32,
    color: '#1F2937',
  },
  filledBlankPill: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginHorizontal: 3,
    marginVertical: 2,
    borderWidth: 1,
    borderColor: '#6EE7B7',
  },
  filledBlankText: {
    fontFamily: Typography.fontSansBold,
    fontSize: 15,
    color: '#065F46',
  },
  emptyBlankPill: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginHorizontal: 3,
    marginVertical: 2,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  currentBlankPill: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
    borderWidth: 1.5,
  },
  emptyBlankText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 14,
    color: '#9CA3AF',
  },
  currentBlankText: {
    color: '#B45309',
    fontWeight: '700',
  },
  masterLetterText: {
    fontFamily: Typography.fontSansBold,
    fontSize: 18,
    lineHeight: 32,
    color: '#111827',
    letterSpacing: 1,
  },
  audioBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 12,
    gap: 8,
  },
  audioBtnPlaying: {
    backgroundColor: '#8B1E1E',
  },
  audioBtnText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 14,
    color: '#111827',
  },
  audioBtnTextPlaying: {
    color: '#FFFFFF',
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111827',
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryBtnText: {
    fontFamily: Typography.fontSansBold,
    fontSize: 15,
    color: '#FFFFFF',
  },
  wordBankContainer: {
    marginTop: 6,
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  wordBankLabel: {
    fontFamily: Typography.fontSansBold,
    fontSize: 11,
    letterSpacing: 0.8,
    color: '#6B7280',
    marginBottom: 12,
  },
  tilesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  wordTile: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  wordTileUsed: {
    backgroundColor: '#E5E7EB',
    borderColor: '#E5E7EB',
    opacity: 0.4,
  },
  wordTileError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEE2E2',
  },
  wordTileText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 14,
    color: '#111827',
  },
  wordTileTextUsed: {
    color: '#9CA3AF',
  },
  wordTileTextError: {
    color: '#DC2626',
  },
  victoryContainer: {
    alignItems: 'center',
    paddingTop: 10,
  },
  mascotSealWrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  mascotSealImg: {
    width: 86,
    height: 86,
  },
  rewardXpPill: {
    position: 'absolute',
    bottom: -4,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  rewardXpText: {
    fontFamily: Typography.fontSansBold,
    fontSize: 11,
    color: '#FFFFFF',
  },
  victoryTitle: {
    fontFamily: Typography.fontSansBold,
    fontSize: 22,
    color: '#111827',
    marginBottom: 6,
    textAlign: 'center',
  },
  victorySubtitle: {
    fontFamily: Typography.fontYouVersionSerifItalic,
    fontSize: 13.5,
    lineHeight: 20,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  memorizedSummaryCard: {
    width: '100%',
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
  },
  summaryRef: {
    fontFamily: Typography.fontSansBold,
    fontSize: 12.5,
    color: '#8B1E1E',
    marginBottom: 6,
  },
  summaryBody: {
    fontFamily: Typography.fontYouVersionSerif,
    fontSize: 15,
    lineHeight: 23,
    color: '#374151',
  },
  shareBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  shareBtnText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 14,
    color: '#111827',
  },
});
