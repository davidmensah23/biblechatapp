import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { GroupCouncilThread, GroupCouncilMessage, GroupReplyContext } from '../types/groupChat';
import { ApostlePersona, UserProfile } from '../types';
import { APOSTLE_PERSONAS } from '../services/personas';
import { fetchGroupMessages, saveGroupMessage, fetchUserProfile, saveBookmark } from '../services/database';
import { pickNextSpeaker, generateGroupApostleReply } from '../services/groupConversationConductor';
import { calculateBubbleTypingDelay, calculateInitialContemplationDelay } from '../services/typingSpeed';

interface GroupChatDetailScreenProps {
  thread: GroupCouncilThread;
  onBack: () => void;
}

export const GroupChatDetailScreen: React.FC<GroupChatDetailScreenProps> = ({ thread, onBack }) => {
  const [messages, setMessages] = useState<GroupCouncilMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [activeSpeaker, setActiveSpeaker] = useState<ApostlePersona | null>(null);
  const [replyContext, setReplyContext] = useState<GroupReplyContext | null>(null);
  const [showMentionPopup, setShowMentionPopup] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);
  const activeDispatchIdRef = useRef<number>(0);

  // Filter full personas for room members
  const memberApostles = APOSTLE_PERSONAS.filter(a => thread.memberApostleIds.includes(a.id));

  useEffect(() => {
    fetchGroupMessages(thread.id).then(setMessages);
    fetchUserProfile().then(setUserProfile);
  }, [thread.id]);

  const handleInputChange = (text: string) => {
    setInputText(text);
    const lastWord = text.split(' ').pop() || '';
    if (lastWord.startsWith('@')) {
      setShowMentionPopup(true);
    } else {
      setShowMentionPopup(false);
    }
  };

  const handleInsertMention = (mentionTag: string) => {
    const words = inputText.split(' ');
    words.pop(); // Remove partial @
    words.push(`@${mentionTag} `);
    setInputText(words.join(' '));
    setShowMentionPopup(false);
    inputRef.current?.focus();
  };

  const handleSelectReply = (msg: GroupCouncilMessage) => {
    setReplyContext({
      messageId: msg.id,
      senderName: msg.senderType === 'user' ? (userProfile?.fullName || 'You') : (msg.apostleName || 'Apostle'),
      senderType: msg.senderType,
      textSnippet: msg.content.substring(0, 60),
      apostleId: msg.apostleId
    });
    inputRef.current?.focus();
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;

    activeDispatchIdRef.current += 1;
    const currentDispatch = activeDispatchIdRef.current;

    const userText = inputText.trim();
    const currentReply = replyContext;
    setInputText('');
    setReplyContext(null);
    setShowMentionPopup(false);

    const userMsg: GroupCouncilMessage = {
      id: `gmsg_user_${Date.now()}`,
      threadId: thread.id,
      senderType: 'user',
      content: userText,
      timestamp: Date.now(),
      replyTo: currentReply || undefined
    };

    setMessages(prev => [...prev, userMsg]);
    await saveGroupMessage(userMsg, thread.name);
    flatListRef.current?.scrollToEnd({ animated: true });

    // Multi-turn Autonomous Fellowship Orchestrator
    try {
      // 1. Pick first speaker
      const firstSpeaker = pickNextSpeaker(memberApostles, [...messages, userMsg], userText, currentReply || undefined);
      setActiveSpeaker(firstSpeaker);

      const contemplationDelay = calculateInitialContemplationDelay(userText);
      await new Promise(r => setTimeout(r, contemplationDelay));
      if (activeDispatchIdRef.current !== currentDispatch) return;

      const firstReply = await generateGroupApostleReply(
        firstSpeaker,
        memberApostles,
        thread.topic,
        [...messages, userMsg],
        userText,
        userProfile ? { fullName: userProfile.fullName, bio: userProfile.bio, gender: userProfile.gender } : undefined,
        false
      );

      const firstTypingDelay = calculateBubbleTypingDelay(firstSpeaker.id, firstReply);
      await new Promise(r => setTimeout(r, Math.min(firstTypingDelay, 3000)));
      if (activeDispatchIdRef.current !== currentDispatch) return;

      const firstApostleMsg: GroupCouncilMessage = {
        id: `gmsg_asst_${Date.now()}_1`,
        threadId: thread.id,
        senderType: 'apostle',
        apostleId: firstSpeaker.id,
        apostleName: firstSpeaker.name,
        content: firstReply,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, firstApostleMsg]);
      await saveGroupMessage(firstApostleMsg, thread.name);
      flatListRef.current?.scrollToEnd({ animated: true });

      // 2. Second Apostle inter-dialogue handoff (if more than 1 apostle in group)
      if (memberApostles.length > 1) {
        const secondSpeaker = pickNextSpeaker(
          memberApostles,
          [...messages, userMsg, firstApostleMsg],
          userText
        );

        if (secondSpeaker.id !== firstSpeaker.id) {
          setActiveSpeaker(secondSpeaker);
          await new Promise(r => setTimeout(r, 2000));
          if (activeDispatchIdRef.current !== currentDispatch) return;

          // Second speaker adds reflection and warmly turns to the user!
          const secondReply = await generateGroupApostleReply(
            secondSpeaker,
            memberApostles,
            thread.topic,
            [...messages, userMsg, firstApostleMsg],
            '',
            userProfile ? { fullName: userProfile.fullName, bio: userProfile.bio, gender: userProfile.gender } : undefined,
            true // Invites user input!
          );

          const secondTypingDelay = calculateBubbleTypingDelay(secondSpeaker.id, secondReply);
          await new Promise(r => setTimeout(r, Math.min(secondTypingDelay, 3000)));
          if (activeDispatchIdRef.current !== currentDispatch) return;

          const secondApostleMsg: GroupCouncilMessage = {
            id: `gmsg_asst_${Date.now()}_2`,
            threadId: thread.id,
            senderType: 'apostle',
            apostleId: secondSpeaker.id,
            apostleName: secondSpeaker.name,
            content: secondReply,
            timestamp: Date.now()
          };

          setMessages(prev => [...prev, secondApostleMsg]);
          await saveGroupMessage(secondApostleMsg, thread.name);
          flatListRef.current?.scrollToEnd({ animated: true });
        }
      }
    } catch (e) {
      console.warn('Group chat generation error:', e);
    } finally {
      if (activeDispatchIdRef.current === currentDispatch) {
        setActiveSpeaker(null);
      }
    }
  };

  const handleBookmark = async (msg: GroupCouncilMessage) => {
    await saveBookmark({
      id: `bm_${msg.id}`,
      type: 'insight',
      title: `${msg.apostleName || 'Council'} Insight`,
      content: msg.content,
      timestamp: Date.now()
    });
    Alert.alert('Saved', 'Added to your Bookmarks in Profile');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color="#111111" />
        </TouchableOpacity>

        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle} numberOfLines={1}>{thread.name}</Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>
            {memberApostles.map(a => a.name).join(' • ')}
          </Text>
        </View>

        {/* Member Avatars Stack */}
        <View style={styles.headerAvatarsStack}>
          {memberApostles.slice(0, 3).map((a, i) => (
            <Image
              key={a.id}
              source={a.avatar}
              style={[
                styles.headerAvatar,
                { marginLeft: i === 0 ? 0 : -10, zIndex: 10 - i }
              ]}
            />
          ))}
          {memberApostles.length > 3 && (
            <View style={[styles.headerAvatarMore, { marginLeft: -10, zIndex: 1 }]}>
              <Text style={styles.headerAvatarMoreText}>+{memberApostles.length - 3}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Focus Topic Banner */}
      <View style={styles.topicBanner}>
        <Ionicons name="book-outline" size={13} color="#D97706" style={{ marginRight: 6 }} />
        <Text style={styles.topicBannerText} numberOfLines={1}>
          Focus: {thread.topic}
        </Text>
      </View>

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const isUser = item.senderType === 'user';
          const apostle = memberApostles.find(a => a.id === item.apostleId);
          const accentColor = apostle?.accentColor || '#6366F1';

          return (
            <View style={[styles.messageRow, isUser ? styles.messageRowUser : styles.messageRowApostle]}>
              {!isUser && apostle && (
                <Image source={apostle.avatar} style={styles.msgAvatar} />
              )}

              <View style={[styles.bubbleWrap, isUser ? styles.bubbleWrapUser : styles.bubbleWrapApostle]}>
                {/* Apostle Name Tag */}
                {!isUser && (
                  <View style={styles.apostleNameRow}>
                    <Text style={[styles.apostleNameText, { color: accentColor }]}>
                      {item.apostleName || 'Apostle'}
                    </Text>
                    <TouchableOpacity onPress={() => handleBookmark(item)} activeOpacity={0.6} style={{ marginLeft: 6 }}>
                      <Ionicons name="bookmark-outline" size={13} color="#9CA3AF" />
                    </TouchableOpacity>
                  </View>
                )}

                {/* Reply To Quote Box */}
                {item.replyTo && (
                  <View style={styles.quoteBox}>
                    <Text style={styles.quoteSenderName}>{item.replyTo.senderName}</Text>
                    <Text style={styles.quoteSnippetText} numberOfLines={1}>
                      {item.replyTo.textSnippet}
                    </Text>
                  </View>
                )}

                {/* Message Text */}
                <TouchableOpacity
                  onLongPress={() => handleSelectReply(item)}
                  activeOpacity={0.9}
                >
                  <Text style={[styles.messageText, isUser ? styles.messageTextUser : styles.messageTextApostle]}>
                    {item.content}
                  </Text>
                </TouchableOpacity>

                {/* Quick Reply Trigger Pill */}
                {!isUser && (
                  <TouchableOpacity
                    style={styles.replyButtonPill}
                    onPress={() => handleSelectReply(item)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="return-up-back" size={12} color="#9CA3AF" style={{ marginRight: 3 }} />
                    <Text style={styles.replyButtonText}>Reply</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        }}
        ListFooterComponent={
          activeSpeaker ? (
            <View style={styles.typingRow}>
              <Image source={activeSpeaker.avatar} style={styles.msgAvatar} />
              <View style={styles.typingBubble}>
                <Text style={styles.typingText}>
                  {activeSpeaker.name} is reflecting...
                </Text>
              </View>
            </View>
          ) : null
        }
      />

      {/* Bottom Bar (Mention Popup + Reply Pill + Input) */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* @Mention Autocomplete Bar */}
        {showMentionPopup && (
          <View style={styles.mentionBar}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 12 }}>
              <TouchableOpacity
                style={styles.mentionPill}
                onPress={() => handleInsertMention('all')}
                activeOpacity={0.8}
              >
                <Text style={styles.mentionPillText}>✨ @all (Whole Council)</Text>
              </TouchableOpacity>
              {memberApostles.map(a => (
                <TouchableOpacity
                  key={a.id}
                  style={styles.mentionPill}
                  onPress={() => handleInsertMention(a.name)}
                  activeOpacity={0.8}
                >
                  <Image source={a.avatar} style={styles.mentionAvatar} />
                  <Text style={styles.mentionPillText}>@{a.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Reply Context Bar */}
        {replyContext && (
          <View style={styles.replyingToBar}>
            <View style={{ flex: 1 }}>
              <Text style={styles.replyingToLabel}>Replying to {replyContext.senderName}:</Text>
              <Text style={styles.replyingToSnippet} numberOfLines={1}>{replyContext.textSnippet}</Text>
            </View>
            <TouchableOpacity onPress={() => setReplyContext(null)} style={{ padding: 4 }}>
              <Ionicons name="close-circle" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        )}

        {/* Input Row */}
        <View style={styles.inputContainer}>
          <TextInput
            ref={inputRef}
            style={styles.textInput}
            placeholder={`Speak into the council (Type @ to mention)...`}
            placeholderTextColor="#9CA3AF"
            value={inputText}
            onChangeText={handleInputChange}
            multiline
            maxLength={1000}
          />

          <TouchableOpacity
            style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim()}
            activeOpacity={0.85}
          >
            <Ionicons name="arrow-up" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.cardSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  headerTitleWrap: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: Typography.fontSerif,
    fontSize: 19,
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 11.5,
    color: Colors.textMuted,
    marginTop: 1,
  },
  headerAvatarsStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  headerAvatarMore: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ECECEC',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAvatarMoreText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 10,
    color: '#4B5563',
  },
  topicBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECECEC',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  topicBannerText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 12,
    color: '#555555',
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
    gap: 12,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },
  messageRowApostle: {
    justifyContent: 'flex-start',
  },
  msgAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginTop: 2,
  },
  bubbleWrap: {
    maxWidth: '82%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleWrapUser: {
    backgroundColor: '#111111',
    borderBottomRightRadius: 4,
    alignSelf: 'flex-end',
  },
  bubbleWrapApostle: {
    backgroundColor: '#ECECEC',
    borderBottomLeftRadius: 4,
  },
  apostleNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  apostleNameText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 12,
  },
  quoteBox: {
    backgroundColor: '#E0E0E0',
    borderLeftWidth: 3,
    borderLeftColor: '#888888',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 6,
  },
  quoteSenderName: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 10.5,
    color: '#374151',
  },
  quoteSnippetText: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 11,
    color: '#6B7280',
  },
  messageText: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 14.5,
    lineHeight: 20,
  },
  messageTextUser: {
    color: '#FFFFFF',
  },
  messageTextApostle: {
    color: '#111111',
  },
  replyButtonPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginTop: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  replyButtonText: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 11,
    color: '#888888',
  },
  typingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  typingBubble: {
    backgroundColor: '#ECECEC',
    borderRadius: 14,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  typingText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 12,
    color: '#666666',
    fontStyle: 'italic',
  },
  mentionBar: {
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    paddingVertical: 8,
  },
  mentionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECECEC',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 6,
  },
  mentionAvatar: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  mentionPillText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 12,
    color: '#111111',
  },
  replyingToBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECECEC',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  replyingToLabel: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 11,
    color: '#111111',
  },
  replyingToSnippet: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 11.5,
    color: '#666666',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    gap: 10,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#ECECEC',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontFamily: Typography.fontSansRegular,
    fontSize: 15,
    color: '#111111',
    maxHeight: 100,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
});
