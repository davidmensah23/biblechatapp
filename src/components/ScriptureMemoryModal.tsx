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
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { InteractiveGestureSheet } from './InteractiveGestureSheet';
import { Typography } from '../theme/typography';
import { MascotAssets } from '../services/mascotAssets';
import { saveMemorizedVerse } from '../services/database';
import { recordDailyActivity } from '../services/gamificationService';
import { playDeepgramSpeech, stopDeepgramSpeech } from '../services/deepgramVoices';

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
  id: string;
  original: string;
  clean: string;
  prefix: string;
  suffix: string;
  isBlank: boolean;
  isFilled: boolean;
  filledWord?: string;
  filledTileId?: string;
}

interface WordTile {
  id: string;
  word: string;
  used: boolean;
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
  const [selectedBlankIdx, setSelectedBlankIdx] = useState<number>(0);
  const [tokens, setTokens] = useState<WordToken[]>([]);
  const [wordBank, setWordBank] = useState<WordTile[]>([]);
  const [errorWordId, setErrorWordId] = useState<string | null>(null);

  // Parse raw text into tokens preserving international Unicode characters (\p{L}) and punctuation
  const parseRawTokens = (text: string): { tokens: WordToken[] } => {
    // Split by whitespace
    const rawWords = text.trim().split(/\s+/);
    const parsedTokens: WordToken[] = rawWords.map((raw, idx) => {
      // Extract prefix (leading non-letters/numbers), clean (Unicode letters & numbers), suffix (trailing punctuation)
      const match = raw.match(/^([^\p{L}\p{N}]*)([\p{L}\p{N}]+(?:['’\-][\p{L}\p{N}]+)*)([^\p{L}\p{N}]*)$/u);
      if (match) {
        return {
          id: `t_${idx}`,
          original: raw,
          prefix: match[1] || '',
          clean: match[2],
          suffix: match[3] || '',
          isBlank: false,
          isFilled: false,
        };
      }
      return {
        id: `t_${idx}`,
        original: raw,
        prefix: '',
        clean: raw.replace(/[^\p{L}\p{N}]/gu, ''),
        suffix: '',
        isBlank: false,
        isFilled: false,
      };
    });
    return { tokens: parsedTokens };
  };

  // Reset state on open
  useEffect(() => {
    if (visible) {
      setStage(1);
      setIsPlayingAudio(false);
      setErrorWordId(null);
    } else {
      stopDeepgramSpeech();
      setIsPlayingAudio(false);
    }
  }, [visible, verseText]);

  // Setup Stage 2 (25% hidden) and Stage 3 (50% hidden)
  const setupGameStage = (targetStage: 2 | 3) => {
    const { tokens: baseTokens } = parseRawTokens(verseText);
    const eligibleIndices: number[] = [];

    baseTokens.forEach((t, i) => {
      if (t.clean.length >= 2) {
        eligibleIndices.push(i);
      }
    });

    // Determine target blank count
    const totalWords = eligibleIndices.length;
    let targetBlankCount = targetStage === 2
      ? Math.max(2, Math.round(totalWords * 0.28))
      : Math.max(4, Math.round(totalWords * 0.52));

    if (targetBlankCount > totalWords) {
      targetBlankCount = Math.max(1, totalWords - 1);
    }

    // Pick evenly spaced indices
    const step = Math.max(1, Math.floor(totalWords / targetBlankCount));
    const chosenBlankIndices = new Set<number>();
    for (let i = 0; i < totalWords && chosenBlankIndices.size < targetBlankCount; i += step) {
      chosenBlankIndices.add(eligibleIndices[i]);
    }

    // If still need more, fill remaining
    for (let i = 0; i < totalWords && chosenBlankIndices.size < targetBlankCount; i++) {
      chosenBlankIndices.add(eligibleIndices[i]);
    }

    const missingTiles: WordTile[] = [];
    const gameTokens: WordToken[] = baseTokens.map((t, i) => {
      if (chosenBlankIndices.has(i)) {
        const tileId = `tile_${i}_${t.clean}`;
        missingTiles.push({
          id: tileId,
          word: t.clean,
          used: false,
        });
        return {
          ...t,
          isBlank: true,
          isFilled: false,
        };
      }
      return t;
    });

    // Scramble word bank
    const scrambled = [...missingTiles].sort(() => Math.random() - 0.5);

    // Find first blank index
    const firstBlank = gameTokens.findIndex(t => t.isBlank);
    setSelectedBlankIdx(firstBlank !== -1 ? firstBlank : 0);
    setTokens(gameTokens);
    setWordBank(scrambled);
    setStage(targetStage);
  };

  // User taps a tile in the Word Bank
  const handleTilePress = (tile: WordTile) => {
    if (tile.used) return;

    // 1. Check if it matches currently selected blank
    const currentToken = tokens[selectedBlankIdx];
    let matchedTokenIdx = -1;

    if (
      currentToken &&
      currentToken.isBlank &&
      !currentToken.isFilled &&
      currentToken.clean.toLowerCase() === tile.word.toLowerCase()
    ) {
      matchedTokenIdx = selectedBlankIdx;
    } else {
      // 2. Smart Match: check if it matches ANY other unfilled blank
      matchedTokenIdx = tokens.findIndex(
        (t) => t.isBlank && !t.isFilled && t.clean.toLowerCase() === tile.word.toLowerCase()
      );
    }

    if (matchedTokenIdx !== -1) {
      // Correct Match!
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (e) {}
      setErrorWordId(null);

      // Fill token
      const updatedTokens = [...tokens];
      updatedTokens[matchedTokenIdx] = {
        ...updatedTokens[matchedTokenIdx],
        isFilled: true,
        filledWord: tile.word,
        filledTileId: tile.id,
      };
      setTokens(updatedTokens);

      // Mark tile as used
      setWordBank(prev => prev.map(w => w.id === tile.id ? { ...w, used: true } : w));

      // Advance selected blank to next unfilled blank
      const nextUnfilled = updatedTokens.findIndex((t, i) => i > matchedTokenIdx && t.isBlank && !t.isFilled);
      if (nextUnfilled !== -1) {
        setSelectedBlankIdx(nextUnfilled);
      } else {
        const wrapUnfilled = updatedTokens.findIndex(t => t.isBlank && !t.isFilled);
        setSelectedBlankIdx(wrapUnfilled !== -1 ? wrapUnfilled : matchedTokenIdx);
      }

      // Check if ALL blanks are filled
      const remainingUnfilled = updatedTokens.filter(t => t.isBlank && !t.isFilled).length;
      if (remainingUnfilled === 0) {
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (e) {}
        setTimeout(() => {
          if (stage === 2) {
            setupGameStage(3); // Advance to 50%
          } else if (stage === 3) {
            setStage(4); // Advance to Master mode
          }
        }, 600);
      }
    } else {
      // Incorrect Match
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } catch (e) {}
      setErrorWordId(tile.id);
      setTimeout(() => setErrorWordId(null), 450);
    }
  };

  // User taps a blank directly (either to select it or to UNDO a filled blank)
  const handleBlankPress = (tokenIndex: number) => {
    const token = tokens[tokenIndex];
    if (!token.isBlank) return;

    if (token.isFilled && token.filledTileId) {
      // UNDO ACTION: return word to word bank
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch (e) {}

      const tileIdToReturn = token.filledTileId;
      setWordBank(prev => prev.map(w => w.id === tileIdToReturn ? { ...w, used: false } : w));

      const updatedTokens = [...tokens];
      updatedTokens[tokenIndex] = {
        ...token,
        isFilled: false,
        filledWord: undefined,
        filledTileId: undefined,
      };
      setTokens(updatedTokens);
      setSelectedBlankIdx(tokenIndex);
    } else {
      // Select this blank as the active target
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (e) {}
      setSelectedBlankIdx(tokenIndex);
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
        'narrator',
        () => setIsPlayingAudio(true),
        () => setIsPlayingAudio(false)
      );
    }
  };

  // Master Mode Completion
  const handleMasterModeComplete = async () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {}
    setStage(5);

    // Save to Database and award XP
    await saveMemorizedVerse(reference, verseText, version);
    await recordDailyActivity('verse_memorized', 25);
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
      fullHeightRatio={0.94}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {/* Top Header Row with Progress Tracker */}
        <View style={styles.topHeader}>
          <View style={styles.badgePill}>
            <Ionicons name="bookmark-outline" size={13} color="#374151" />
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
              <Text style={styles.verseBodyText}>"{verseText || 'Thy word is a lamp unto my feet, and a light unto my path.'}"</Text>
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
                ? "Stage 2: 25% Hidden. Tap the matching word tiles below. Tap any filled word to undo."
                : "Stage 3: 50% Hidden. Deeper recall! Tap word tiles to reconstruct the scripture."}
            </Text>

            {/* Verse with Interactive Clickable Blanks */}
            <View style={styles.verseCard}>
              <View style={styles.tokensFlowWrap}>
                {tokens.map((token, idx) => {
                  if (!token.isBlank) {
                    return (
                      <Text key={token.id} style={styles.tokenPlainText}>
                        {token.original}{' '}
                      </Text>
                    );
                  }

                  if (token.isFilled) {
                    return (
                      <TouchableOpacity
                        key={token.id}
                        onPress={() => handleBlankPress(idx)}
                        activeOpacity={0.7}
                        style={styles.filledBlankPill}
                      >
                        <Text style={styles.tokenPrefixText}>{token.prefix}</Text>
                        <Text style={styles.filledBlankText}>{token.filledWord || token.clean}</Text>
                        <Text style={styles.tokenSuffixText}>{token.suffix}</Text>
                      </TouchableOpacity>
                    );
                  }

                  const isSelected = selectedBlankIdx === idx;
                  return (
                    <TouchableOpacity
                      key={token.id}
                      onPress={() => handleBlankPress(idx)}
                      activeOpacity={0.7}
                      style={[
                        styles.emptyBlankPill,
                        isSelected && styles.currentBlankPill
                      ]}
                    >
                      <Text style={styles.tokenPrefixText}>{token.prefix}</Text>
                      <Text style={[styles.emptyBlankText, isSelected && styles.currentBlankText]}>
                        {'___'}
                      </Text>
                      <Text style={styles.tokenSuffixText}>{token.suffix}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Word Bank Scrambled Tiles */}
            <View style={styles.wordBankContainer}>
              <View style={styles.wordBankHeader}>
                <Text style={styles.wordBankLabel}>WORD BANK</Text>
                <Text style={styles.wordBankSub}>Tap a word to fill the blank</Text>
              </View>
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
                    activeOpacity={0.75}
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
                {parseRawTokens(verseText).tokens.map((token, idx) => {
                  const firstChar = token.clean.charAt(0).toUpperCase();
                  const dots = '_'.repeat(Math.min(3, Math.max(1, token.clean.length - 1)));
                  return (
                    <Text key={idx} style={styles.masterLetterText}>
                      {token.prefix}{firstChar}{dots}{token.suffix}{' '}
                    </Text>
                  );
                })}
              </View>
            </View>

            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: '#111827' }]}
              onPress={handleMasterModeComplete}
              activeOpacity={0.85}
            >
              <Ionicons name="trophy" size={19} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.primaryBtnText}>I Recited It from Memory! 🏆</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ========================================================= */}
        {/* STAGE 5: VICTORY & REWARD */}
        {/* ========================================================= */}
        {stage === 5 && (
          <View style={[styles.stageContainer, styles.victoryContainer]}>
            <View style={styles.mascotSealWrap}>
              <Image source={MascotAssets.bread} style={styles.mascotSealImg} resizeMode="contain" />
              <View style={styles.rewardXpPill}>
                <Text style={styles.rewardXpText}>+25 XP</Text>
              </View>
            </View>

            <Text style={styles.victoryTitle}>Hidden in Your Heart!</Text>
            <Text style={styles.victorySubtitle}>
              “I have hidden your word in my heart that I might not sin against you.” — Psalm 119:11
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
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderRadius: 8,
    gap: 5,
  },
  badgePillText: {
    fontFamily: Typography.fontSansBold,
    fontSize: 10,
    letterSpacing: 0.8,
    color: '#374151',
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
    backgroundColor: '#DC2626',
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
    marginBottom: 18,
    minHeight: 140,
    justifyContent: 'center',
  },
  verseBodyText: {
    fontFamily: Typography.fontYouVersionSerif,
    fontSize: 19,
    lineHeight: 29,
    color: '#111111',
  },
  tokensFlowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  tokenPlainText: {
    fontFamily: Typography.fontYouVersionSerif,
    fontSize: 17.5,
    lineHeight: 32,
    color: '#1F2937',
  },
  tokenPrefixText: {
    fontFamily: Typography.fontYouVersionSerif,
    fontSize: 16,
    color: '#1F2937',
  },
  tokenSuffixText: {
    fontFamily: Typography.fontYouVersionSerif,
    fontSize: 16,
    color: '#1F2937',
  },
  filledBlankPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginHorizontal: 3,
    marginVertical: 3,
    borderWidth: 1,
    borderColor: '#6EE7B7',
  },
  filledBlankText: {
    fontFamily: Typography.fontSansBold,
    fontSize: 14.5,
    color: '#065F46',
  },
  emptyBlankPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    marginHorizontal: 3,
    marginVertical: 3,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
  },
  currentBlankPill: {
    backgroundColor: '#F3F4F6',
    borderColor: '#111111',
    borderWidth: 1.5,
  },
  emptyBlankText: {
    fontFamily: Typography.fontSansBold,
    fontSize: 13,
    color: '#9CA3AF',
    letterSpacing: 1.5,
  },
  currentBlankText: {
    color: '#111111',
  },
  masterLetterText: {
    fontFamily: Typography.fontSansBold,
    fontSize: 17,
    lineHeight: 32,
    color: '#111827',
    letterSpacing: 0.8,
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
    backgroundColor: '#DC2626',
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
    paddingVertical: 15,
    borderRadius: 14,
  },
  primaryBtnText: {
    fontFamily: Typography.fontSansBold,
    fontSize: 14.5,
    color: '#FFFFFF',
  },
  wordBankContainer: {
    marginTop: 4,
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  wordBankHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  wordBankLabel: {
    fontFamily: Typography.fontSansBold,
    fontSize: 11,
    letterSpacing: 0.8,
    color: '#6B7280',
  },
  wordBankSub: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 11,
    color: '#9CA3AF',
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
  },
  wordTileUsed: {
    backgroundColor: '#E5E7EB',
    borderColor: '#E5E7EB',
    opacity: 0.35,
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
    color: '#DC2626',
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
