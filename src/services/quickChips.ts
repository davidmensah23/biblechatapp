export interface QuickPromptChipItem {
  id: string;
  label: string;
  text: string;
}

/**
 * Returns dynamic contextual reply chips based on the conversation state & last message
 */
export const getContextualChips = (
  apostleId: string,
  lastAssistantMessage?: string
): QuickPromptChipItem[] => {
  if (!lastAssistantMessage) {
    // Initial conversation starters unique per Apostle
    switch (apostleId) {
      case 'peter':
        return [
          { id: 'p1', label: '🌊 Walking on water', text: 'Peter, what did it feel like to walk on the water and then sink?' },
          { id: 'p2', label: '🔥 Restored by charcoal', text: 'How did Jesus restore your heart after you denied Him?' },
          { id: 'p3', label: '🎙️ Help me preach Sunday', text: 'Peter, can you help me prepare a sermon for this Sunday?' }
        ];
      case 'john':
        return [
          { id: 'j1', label: '❤️ Abiding in love', text: 'John, what does it truly mean to abide in His love daily?' },
          { id: 'j2', label: '🕯️ The Upper Room', text: 'What was the atmosphere like when you leaned on Jesus at the Last Supper?' },
          { id: 'j3', label: '🕊️ Pray for peace', text: 'Could you pray with me for stillness and peace in my spirit?' }
        ];
      case 'paul':
        return [
          { id: 'pa1', label: '⚡ Damascus Road', text: 'Paul, tell me about the moment you were blinded on the road to Damascus.' },
          { id: 'pa2', label: '🏃 Running the race', text: 'How do I keep endurance when spiritual exhaustion sets in?' },
          { id: 'pa3', label: '🎙️ Sermon on grace', text: 'Paul, help me structure a message on grace and justification for Sunday.' }
        ];
      case 'thomas':
        return [
          { id: 't1', label: '🔍 Honest doubts', text: 'Thomas, how do I handle doubts when my faith feels weak?' },
          { id: 't2', label: '✋ Touching His wounds', text: 'What did you feel when Jesus asked you to touch His hands?' },
          { id: 't3', label: '🕊️ Pray with me', text: 'Can you pray with me for clarity and genuine faith?' }
        ];
      default:
        return [
          { id: 'd1', label: '📖 Today’s wisdom', text: 'Share a word of encouragement from your walk with Jesus.' },
          { id: 'd2', label: '🙏 Pray with me', text: 'Could you pray with me for strength today?' },
          { id: 'd3', label: '🎙️ Sunday sermon help', text: 'Can you help me prepare a message for church this Sunday?' }
        ];
    }
  }

  const lower = lastAssistantMessage.toLowerCase();

  // If Apostle just asked about sermon prep options
  if (lower.includes('step-by-step') || lower.includes('full sermon') || lower.includes('manuscript')) {
    return [
      { id: 's_step', label: '🛠️ Guide me step-by-step', text: 'Let’s do it step-by-step. Guide me through the scripture and heart themes.' },
      { id: 's_full', label: '📜 Write the whole thing', text: 'Please write out the full sermon manuscript for me.' },
      { id: 's_themes', label: '💡 Suggest 3 sermon topics', text: 'Can you suggest 3 powerful scripture themes we could focus on?' }
    ];
  }

  // If Apostle offered prayer or comfort
  if (lower.includes('pray') || lower.includes('peace') || lower.includes('mercy') || lower.includes('rest')) {
    return [
      { id: 'amen', label: '🙏 Amen, thank you', text: 'Amen. Thank you so much for this encouragement.' },
      { id: 'family', label: '🕊️ Pray for my family', text: 'Could you also say a prayer of protection for my family?' },
      { id: 'verse', label: '📖 A verse to meditate on', text: 'What scripture verse can I hold in my heart as I sleep tonight?' }
    ];
  }

  // If Apostle shared an eyewitness story
  if (lower.includes('remember') || lower.includes('sea') || lower.includes('cross') || lower.includes('jesus')) {
    return [
      { id: 'more', label: '⛵ Tell me more', text: 'What happened right after that moment?' },
      { id: 'lesson', label: '💡 How did it change you?', text: 'How did that experience change the way you followed Jesus?' },
      { id: 'advice', label: '🌱 Advice for my life', text: 'How can I apply what you learned to my life today?' }
    ];
  }

  return [
    { id: 'q1', label: '📖 Tell me more', text: 'Can you explain more about that from the scriptures?' },
    { id: 'q2', label: '🙏 Pray with me', text: 'Could we pray together about this?' },
    { id: 'q3', label: '💡 Practical step', text: 'What is one practical step I can take today?' }
  ];
};
