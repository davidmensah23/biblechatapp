import { ApostlePersona } from './index';

export interface GroupCouncilThread {
  id: string;
  name: string;
  topic: string;
  memberApostleIds: string[];
  lastMessage: string;
  lastMessageSenderName: string;
  updatedAt: number;
  unreadCount?: number;
}

export interface GroupReplyContext {
  messageId: string;
  senderName: string;
  senderType: 'user' | 'apostle';
  textSnippet: string;
  apostleId?: string;
}

export interface GroupCouncilMessage {
  id: string;
  threadId: string;
  senderType: 'user' | 'apostle';
  apostleId?: string;
  apostleName?: string;
  content: string;
  timestamp: number;
  replyTo?: GroupReplyContext;
  mentions?: string[];
  bookmarked?: boolean;
}

export interface CouncilPreset {
  id: string;
  name: string;
  subtitle: string;
  topic: string;
  icon: string;
  color: string;
  apostleIds: string[];
}
