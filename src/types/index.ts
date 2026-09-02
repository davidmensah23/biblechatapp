export interface ApostlePersona {
  id: string;
  name: string;
  title: string;
  subtitle: string;
  bio: string;
  shortQuote: string;
  avatar: any; // ImageSourcePropType
  systemPrompt: string;
  accentColor: string;
  keyScriptures: string[];
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: number;
  bookmarked?: boolean;
}

export interface ConversationThread {
  id: string;
  personaId: string;
  personaName: string;
  lastMessage: string;
  lastMessageSender: 'user' | 'assistant';
  updatedAt: number;
  unreadCount?: number;
}

export interface BibleVerse {
  id?: number;
  book: string;
  chapter: number;
  verse: number | string;
  text: string;
  translation: string;
}

export interface BibleBook {
  name: string;
  testament: 'OT' | 'NT';
  chaptersCount: number;
}

export interface SavedBookmark {
  id: string;
  type: 'verse' | 'quote' | 'insight';
  title: string;
  content: string;
  reference?: string;
  author?: string;
  timestamp: number;
}

export interface UserProfile {
  id?: string;
  fullName: string;
  email: string;
  bio: string;
  location: string;
  dateOfBirth: string;
  avatarUrl?: string;
  gender?: 'brother' | 'sister' | 'neutral' | string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'daily_scripture' | 'apostle_word' | 'faith_streak' | 'chat_followup' | 'sermon_workshop' | 'badge_earned' | 'badge_level_up' | 'friend_activity';
  icon: string;
  iconColor: string;
  targetParam?: string; // apostleId (e.g. 'peter') or badgeId (e.g. 'highlight')
  badgeId?: string;
  badgeLevel?: number;
  mascotKey?: string;
  relativeTime?: string;
  avatarUrl?: any;
  isRead: boolean;
  timestamp: number;
}
