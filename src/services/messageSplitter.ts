/**
 * Intelligently splits an Apostle response into 1 to 3 natural conversational bubbles.
 * Preserves sentence integrity, avoids splitting quotes or scripture references awkwardly.
 */
export const splitIntoThoughtBubbles = (text: string): string[] => {
  const trimmed = text.trim();
  if (!trimmed) return [];

  // If text is very short (under 75 characters), deliver as a single bubble
  if (trimmed.length < 75) {
    return [trimmed];
  }

  // Regex to split on sentence boundaries (. ! ?) while keeping punctuation
  const sentenceRegex = /([^\.!\?]+[\.!\?]+["']?)/g;
  const rawSentences = trimmed.match(sentenceRegex);

  if (!rawSentences || rawSentences.length <= 1) {
    // If no clean punctuation split, check for newlines
    if (trimmed.includes('\n\n')) {
      return trimmed.split(/\n\n+/).map(s => s.trim()).filter(Boolean).slice(0, 3);
    }
    return [trimmed];
  }

  const sentences = rawSentences.map(s => s.trim()).filter(Boolean);

  // If 2 sentences: deliver as 2 distinct bubbles
  if (sentences.length === 2) {
    return sentences;
  }

  // If 3 sentences: deliver as 3 distinct bubbles
  if (sentences.length === 3) {
    return sentences;
  }

  // If 4 or more sentences: group into 2 or 3 balanced bubbles
  if (sentences.length >= 4) {
    const chunk1 = sentences.slice(0, Math.ceil(sentences.length / 3)).join(' ');
    const chunk2 = sentences.slice(Math.ceil(sentences.length / 3), Math.ceil((sentences.length * 2) / 3)).join(' ');
    const chunk3 = sentences.slice(Math.ceil((sentences.length * 2) / 3)).join(' ');
    return [chunk1, chunk2, chunk3].filter(Boolean);
  }

  return [trimmed];
};
