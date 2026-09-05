import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Typography } from '../theme/typography';
import { Colors } from '../theme/colors';
import { findGlossaryTerm, GlossaryEntry, BIBLICAL_GLOSSARY } from '../services/biblicalGlossary';

interface FormattedMessageTextProps {
  content: string;
  isUser: boolean;
  fontSize?: number;
  onSelectWord?: (entry: GlossaryEntry) => void;
}

export const FormattedMessageText: React.FC<FormattedMessageTextProps> = ({
  content,
  isUser,
  fontSize = 16.5,
  onSelectWord
}) => {
  if (isUser) {
    return (
      <Text style={[styles.userText, { fontSize, lineHeight: fontSize * 1.48 }]}>
        {content}
      </Text>
    );
  }

  // Parse paragraphs and special blocks for Assistant
  const paragraphs = content.split('\n\n');

  return (
    <View style={styles.assistantContainer}>
      {paragraphs.map((paragraph, pIdx) => {
        const trimmed = paragraph.trim();
        if (!trimmed) return null;

        // Check if paragraph is a scripture quote (starts with ">" or quote block)
        const isQuoteBlock =
          trimmed.startsWith('>') ||
          (trimmed.startsWith('"') && (trimmed.includes('(') || trimmed.endsWith('"')));

        if (isQuoteBlock) {
          const cleanQuote = trimmed.replace(/^>\s*/, '');
          return (
            <View key={pIdx} style={styles.scriptureQuoteCard}>
              <Text style={[styles.scriptureQuoteText, { fontSize: fontSize * 1.05, lineHeight: fontSize * 1.55 }]}>
                {renderTokensWithGlossary(cleanQuote, fontSize * 1.05, onSelectWord)}
              </Text>
            </View>
          );
        }

        // Standard text paragraph: parse **bold**, *italic*, and glossary terms
        return (
          <Text
            key={pIdx}
            style={[
              styles.assistantText,
              { fontSize, lineHeight: fontSize * 1.54, marginBottom: pIdx < paragraphs.length - 1 ? 12 : 0 }
            ]}
          >
            {renderTokensWithGlossary(trimmed, fontSize, onSelectWord)}
          </Text>
        );
      })}
    </View>
  );
};

// Regex pattern matching all multi-word and single-word glossary keys
const glossaryKeys = Object.keys(BIBLICAL_GLOSSARY).sort((a, b) => b.length - a.length);
const glossaryRegexPattern = new RegExp(`\\b(${glossaryKeys.map(k => k.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')).join('|')})\\b`, 'gi');

/**
 * Parses inline **bold**, *italic*, and interactive glossary tokens
 */
function renderTokensWithGlossary(
  text: string,
  baseFontSize: number,
  onSelectWord?: (entry: GlossaryEntry) => void
): React.ReactNode[] {
  // 1. Split by dynamic [[term|definition]], bold (**text**) and italic (*text*)
  const tokens = text.split(/(\[\[[^\]]+\]\]|\*\*[^*]+\*\*|\*[^*]+\*)/g);

  return tokens.map((token, idx) => {
    // Dynamic AI glossary tag: [[term|definition]] or [[term|definition|origin]]
    if (token.startsWith('[[') && token.endsWith(']]')) {
      const inner = token.slice(2, -2);
      const parts = inner.split('|');
      const term = parts[0]?.trim() || '';
      const definition = parts[1]?.trim() || '';
      const origin = parts[2]?.trim() || 'Apostolic Insight';

      const entry: GlossaryEntry = {
        term: term.charAt(0).toUpperCase() + term.slice(1),
        category: 'historical_idiom',
        originLabel: origin,
        definition: definition || 'A significant biblical, cultural, or theological term.',
        exampleContext: text.length > 120 ? text.slice(0, 120) + '...' : text
      };

      if (onSelectWord) {
        return (
          <Text
            key={idx}
            style={styles.glossaryWord}
            onPress={() => onSelectWord(entry)}
          >
            {term}
          </Text>
        );
      }
      return <Text key={idx}>{term}</Text>;
    }

    // Bold tokens
    if (token.startsWith('**') && token.endsWith('**')) {
      const inner = token.slice(2, -2);
      const glossaryEntry = findGlossaryTerm(inner);
      if (glossaryEntry && onSelectWord) {
        return (
          <Text
            key={idx}
            style={[styles.boldText, styles.glossaryWord]}
            onPress={() => onSelectWord(glossaryEntry)}
          >
            {inner}
          </Text>
        );
      }
      return (
        <Text key={idx} style={styles.boldText}>
          {inner}
        </Text>
      );
    }

    // Italic tokens (frequently Greek/Hebrew words)
    if (token.startsWith('*') && token.endsWith('*')) {
      const inner = token.slice(1, -1);
      const glossaryEntry = findGlossaryTerm(inner);
      if (glossaryEntry && onSelectWord) {
        return (
          <Text
            key={idx}
            style={[styles.italicText, styles.glossaryWord]}
            onPress={() => onSelectWord(glossaryEntry)}
          >
            {inner}
          </Text>
        );
      }
      return (
        <Text key={idx} style={styles.italicText}>
          {inner}
        </Text>
      );
    }

    // Plain text: scan for embedded glossary words & phrases
    if (!onSelectWord) {
      return <Text key={idx}>{token}</Text>;
    }

    const subTokens = token.split(glossaryRegexPattern);
    return (
      <React.Fragment key={idx}>
        {subTokens.map((subToken, sIdx) => {
          const entry = findGlossaryTerm(subToken);
          if (entry) {
            return (
              <Text
                key={sIdx}
                style={styles.glossaryWord}
                onPress={() => onSelectWord(entry)}
              >
                {subToken}
              </Text>
            );
          }
          return <Text key={sIdx}>{subToken}</Text>;
        })}
      </React.Fragment>
    );
  });
}

const styles = StyleSheet.create({
  userText: {
    fontFamily: Typography.fontSansRegular,
    color: '#FFFFFF',
  },
  assistantContainer: {
    width: '100%',
  },
  assistantText: {
    fontFamily: Typography.fontSansRegular,
    color: Colors.textPrimary,
  },
  boldText: {
    fontFamily: Typography.fontSansBold,
    color: Colors.textPrimary,
  },
  italicText: {
    fontFamily: Typography.fontYouVersionSerifItalic,
    color: Colors.textPrimary,
  },
  glossaryWord: {
    color: '#8B1E1E',
    textDecorationLine: 'underline',
    textDecorationStyle: 'dotted',
    textDecorationColor: 'rgba(139, 30, 30, 0.45)',
    fontWeight: '600',
  },
  scriptureQuoteCard: {
    backgroundColor: 'rgba(139, 30, 30, 0.05)',
    borderLeftWidth: 3,
    borderLeftColor: '#8B1E1E',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginVertical: 6,
  },
  scriptureQuoteText: {
    fontFamily: Typography.fontYouVersionSerif,
    fontSize: 16,
    lineHeight: 24,
    color: '#111111',
  }
});

