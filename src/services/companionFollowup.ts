import { ApostlePersona, ChatMessage } from '../types';

export interface FollowUpCandidate {
  shouldFollowUp: boolean;
  followUpMessage: string;
}

/**
 * Intelligent proactive check-in generator.
 * Analyzes previous conversation context to see if the Apostle should offer a warm check-in.
 */
export const checkProactiveFollowUp = (
  persona: ApostlePersona,
  conversationHistory: ChatMessage[],
  userName: string = 'my friend'
): FollowUpCandidate => {
  if (!conversationHistory || conversationHistory.length === 0) {
    return { shouldFollowUp: false, followUpMessage: '' };
  }

  // If last message was from user and older than 12 hours or conversation ended on a prayer/struggle
  const lastUserMessage = [...conversationHistory].reverse().find(m => m.sender === 'user');
  if (!lastUserMessage) {
    return { shouldFollowUp: false, followUpMessage: '' };
  }

  const content = lastUserMessage.content.toLowerCase();

  if (content.includes('anxious') || content.includes('worry') || content.includes('stress')) {
    return {
      shouldFollowUp: true,
      followUpMessage: `Peace be with you, ${userName}. I was reflecting on our conversation about your worries. How is your heart resting today?`
    };
  }

  if (content.includes('pray') || content.includes('sick') || content.includes('help')) {
    return {
      shouldFollowUp: true,
      followUpMessage: `Grace to you, ${userName}. I have been keeping you in my prayers regarding what you shared. How are things unfolding?`
    };
  }

  if (content.includes('doubt') || content.includes('question') || content.includes('hard to believe')) {
    return {
      shouldFollowUp: true,
      followUpMessage: `Peace, ${userName}. I wanted to check in on our conversation about your questions. Remember, honest seeking is always welcomed by our Lord.`
    };
  }

  return { shouldFollowUp: false, followUpMessage: '' };
};
