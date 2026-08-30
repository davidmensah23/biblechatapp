import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Typography } from '../theme/typography';
import { Colors } from '../theme/colors';

interface FormattedMessageTextProps {
  content: string;
  isUser: boolean;
  fontSize?: number;
}

export const FormattedMessageText: React.FC<FormattedMessageTextProps> = ({
  content,
  isUser,
  fontSize = 15.5
}) => {
  if (isUser) {
    return (
      <Text style={[styles.userText, { fontSize, lineHeight: fontSize * 1.45 }]}>
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

        // Check if paragraph is a scripture quote (e.g. starts with quote or ">" or contains Bible citation)
        const isQuoteBlock =
          trimmed.startsWith('>') ||
          (trimmed.startsWith('"') && (trimmed.includes('(') || trimmed.endsWith('"')));

        if (isQuoteBlock) {
          const cleanQuote = trimmed.replace(/^>\s*/, '');
          return (
            <View key={pIdx} style={styles.scriptureQuoteCard}>
              <Text style={[styles.scriptureQuoteText, { fontSize: fontSize * 1.05, lineHeight: fontSize * 1.55 }]}>
                {cleanQuote}
              </Text>
            </View>
          );
        }

        // Standard text paragraph: parse **bold** and *italic* tokens
        return (
          <Text key={pIdx} style={[styles.assistantText, { fontSize, lineHeight: fontSize * 1.52, marginBottom: pIdx < paragraphs.length - 1 ? 10 : 0 }]}>
            {renderFormattedInline(trimmed, fontSize)}
          </Text>
        );
      })}
    </View>
  );
};

// Parses inline **bold** and *italic* markup
function renderFormattedInline(text: string, baseFontSize: number): React.ReactNode[] {
  // Regex to split by bold (**text**) and italic (*text*)
  const tokens = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);

  return tokens.map((token, idx) => {
    if (token.startsWith('**') && token.endsWith('**')) {
      const inner = token.slice(2, -2);
      return (
        <Text key={idx} style={styles.boldText}>
          {inner}
        </Text>
      );
    }
    if (token.startsWith('*') && token.endsWith('*')) {
      const inner = token.slice(1, -1);
      return (
        <Text key={idx} style={styles.italicText}>
          {inner}
        </Text>
      );
    }
    return <Text key={idx}>{token}</Text>;
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
    fontFamily: Typography.fontSerifItalic,
    color: Colors.textPrimary,
  },
  scriptureQuoteCard: {
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
    borderLeftWidth: 3,
    borderLeftColor: Colors.accentBlue,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginVertical: 6,
  },
  scriptureQuoteText: {
    fontFamily: Typography.fontSerifItalic,
    color: '#1E293B',
  }
});
