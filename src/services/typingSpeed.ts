/**
 * Character-specific typing speed and dynamic delay calculator.
 */
export interface TypingProfile {
  wpm: number;
  msPerChar: number;
  minDelayMs: number;
  maxDelayMs: number;
}

const DEFAULT_TYPING_PROFILE: TypingProfile = {
  wpm: 190,
  msPerChar: 38,
  minDelayMs: 380,
  maxDelayMs: 1100
};

const APOSTLE_TYPING_PROFILES: Record<string, TypingProfile> = {
  // Simon Peter: Fast, impulsive, punchy
  peter: {
    wpm: 240,
    msPerChar: 28,
    minDelayMs: 300,
    maxDelayMs: 800
  },
  // John: Gentle, unhurried, contemplative
  john: {
    wpm: 160,
    msPerChar: 46,
    minDelayMs: 450,
    maxDelayMs: 1200
  },
  // Paul: Passionate, articulate, steady
  paul: {
    wpm: 205,
    msPerChar: 34,
    minDelayMs: 350,
    maxDelayMs: 950
  },
  // Thomas: Methodical, reflective
  thomas: {
    wpm: 175,
    msPerChar: 42,
    minDelayMs: 400,
    maxDelayMs: 1050
  },
  // Matthew: Structured, measured
  matthew: {
    wpm: 195,
    msPerChar: 36,
    minDelayMs: 360,
    maxDelayMs: 900
  }
};

/**
 * Calculates typing duration for a specific text chunk based on character profile
 */
export const calculateBubbleTypingDelay = (
  apostleId: string,
  chunkText: string
): number => {
  const profile = APOSTLE_TYPING_PROFILES[apostleId] || DEFAULT_TYPING_PROFILE;
  const rawDelay = chunkText.length * profile.msPerChar;
  return Math.min(Math.max(rawDelay, profile.minDelayMs), profile.maxDelayMs);
};

/**
 * Calculates initial contemplation pause before first bubble starts typing.
 * Longer for deep emotional/theological user queries, instant for greetings.
 */
export const calculateInitialContemplationDelay = (
  userPrompt: string
): number => {
  const trimmed = userPrompt.trim();
  if (trimmed.length < 15) {
    return 150; // Snappy for "hi", "hey"
  }
  if (trimmed.length < 60) {
    return 350;
  }
  return 650; // Thoughtful pause for longer user reflections
};
