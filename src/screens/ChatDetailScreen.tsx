import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
  TouchableWithoutFeedback,
  Share
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { ApostlePersona, ChatMessage, UserProfile } from '../types';
import { fetchMessages, saveMessage, fetchUserProfile, saveBookmark } from '../services/database';
import { playDeepgramSpeech, stopDeepgramSpeech } from '../services/deepgramVoices';
import { Alert, Clipboard } from 'react-native';
import { generateApostleReply } from '../services/groq';
import { VoiceCallModal } from '../components/VoiceCallModal';
import { FormattedMessageText } from '../components/FormattedMessageText';
import { checkProactiveFollowUp } from '../services/companionFollowup';
import { splitIntoThoughtBubbles } from '../services/messageSplitter';
import { calculateBubbleTypingDelay, calculateInitialContemplationDelay } from '../services/typingSpeed';
import { AnimatedChatBubble } from '../components/AnimatedChatBubble';
import { getContextualChips } from '../services/quickChips';

interface ChatDetailScreenProps {
  apostle: ApostlePersona;
  onBack: () => void;
  initialMessage?: string;
}

const BouncingDots: React.FC = () => {
  const dot1 = useSharedValue(0);
  const dot2 = useSharedValue(0);
  const dot3 = useSharedValue(0);

  useEffect(() => {
    dot1.value = withRepeat(
      withSequence(
        withTiming(-5, { duration: 300, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 300, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    setTimeout(() => {
      dot2.value = withRepeat(
        withSequence(
          withTiming(-5, { duration: 300, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 300, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    }, 150);

    setTimeout(() => {
      dot3.value = withRepeat(
        withSequence(
          withTiming(-5, { duration: 300, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 300, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    }, 300);
  }, []);

  const style1 = useAnimatedStyle(() => ({ transform: [{ translateY: dot1.value }] }));
  const style2 = useAnimatedStyle(() => ({ transform: [{ translateY: dot2.value }] }));
  const style3 = useAnimatedStyle(() => ({ transform: [{ translateY: dot3.value }] }));

  return (
    <View style={styles.dotsRow}>
      <Animated.View style={[styles.typingDot, style1]} />
      <Animated.View style={[styles.typingDot, style2]} />
      <Animated.View style={[styles.typingDot, style3]} />
    </View>
  );
};

export const ChatDetailScreen: React.FC<ChatDetailScreenProps> = ({ apostle, onBack, initialMessage }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState(initialMessage || '');
  const [isLoading, setIsLoading] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<ChatMessage | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  
  const flatListRef = useRef<FlatList>(null);
  const activeDispatchIdRef = useRef<number>(0);
  const initialLoadedIdsRef = useRef<Set<string>>(new Set());

  const conversationId = `conv_${apostle.id}`;

  useEffect(() => {
    if (initialMessage) {
      setInputText(initialMessage);
    }
  }, [initialMessage]);

  useEffect(() => {
    loadChatHistory();
    loadProfileContext();
  }, [apostle.id]);

  const loadProfileContext = async () => {
    try {
      const p = await fetchUserProfile();
      setUserProfile(p);
    } catch (e) {
      console.warn('Could not load user profile context:', e);
    }
  };

  const loadChatHistory = async () => {
    const history = await fetchMessages(conversationId);
    if (history.length === 0) {
      const nameGreeting = userProfile?.fullName ? `, ${userProfile.fullName}` : '';
      const greeting: ChatMessage = {
        id: `msg_${Date.now()}`,
        conversationId: conversationId,
        sender: 'assistant',
        content: `Peace be with you${nameGreeting}! I am ${apostle.name}. What is on your heart today?`,
        timestamp: Date.now()
      };
      await saveMessage(greeting, apostle.title, apostle.id);
      initialLoadedIdsRef.current.add(greeting.id);
      setMessages([greeting]);
    } else {
      const followUp = checkProactiveFollowUp(apostle, history, userProfile?.fullName);
      if (followUp.shouldFollowUp) {
        const lastMsg = history[history.length - 1];
        if (lastMsg.sender === 'user' || Date.now() - lastMsg.timestamp > 6 * 60 * 60 * 1000) {
          const followUpMsg: ChatMessage = {
            id: `msg_followup_${Date.now()}`,
            conversationId: conversationId,
            sender: 'assistant',
            content: followUp.followUpMessage,
            timestamp: Date.now()
          };
          await saveMessage(followUpMsg, apostle.title, apostle.id);
          history.push(followUpMsg);
        }
      }
      history.forEach(m => initialLoadedIdsRef.current.add(m.id));
      setMessages(history);
    }
  };

  const handleSendText = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    activeDispatchIdRef.current += 1;
    const currentDispatchId = activeDispatchIdRef.current;

    const userText = textToSend.trim();
    setInputText('');

    const userMsg: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      conversationId: conversationId,
      sender: 'user',
      content: userText,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    await saveMessage(userMsg, apostle.title, apostle.id);

    setIsLoading(true);

    try {
      const initialDelay = calculateInitialContemplationDelay(userText);
      await new Promise(r => setTimeout(r, initialDelay));

      if (activeDispatchIdRef.current !== currentDispatchId) return;

      const replyText = await generateApostleReply(
        apostle,
        messages,
        userText,
        userProfile
          ? {
              fullName: userProfile.fullName,
              location: userProfile.location || 'Ghana',
              bio: userProfile.bio,
              gender: userProfile.gender
            }
          : undefined
      );

      if (activeDispatchIdRef.current !== currentDispatchId) return;

      const chunks = splitIntoThoughtBubbles(replyText);

      for (let i = 0; i < chunks.length; i++) {
        if (activeDispatchIdRef.current !== currentDispatchId) return;

        const chunk = chunks[i];
        const bubbleDelay = calculateBubbleTypingDelay(apostle.id, chunk);

        await new Promise(r => setTimeout(r, bubbleDelay));

        if (activeDispatchIdRef.current !== currentDispatchId) return;

        const assistantMsg: ChatMessage = {
          id: `msg_asst_${Date.now()}_${i}`,
          conversationId: conversationId,
          sender: 'assistant',
          content: chunk,
          timestamp: Date.now()
        };

        setMessages(prev => [...prev, assistantMsg]);
        await saveMessage(assistantMsg, apostle.title, apostle.id);
        flatListRef.current?.scrollToEnd({ animated: true });
      }
    } catch (error) {
      console.error('Error in multi-message generation:', error);
    } finally {
      if (activeDispatchIdRef.current === currentDispatchId) {
        setIsLoading(false);
      }
    }
  };

  const handleTogglePlayAudio = async (msgId: string, text: string) => {
    if (playingMessageId === msgId) {
      await stopDeepgramSpeech();
      setPlayingMessageId(null);
    } else {
      setPlayingMessageId(msgId);
      await playDeepgramSpeech(
        msgId,
        text,
        apostle.id,
        () => setPlayingMessageId(msgId),
        () => setPlayingMessageId(null)
      );
    }
  };

  const handleBookmarkMessage = async (msg: ChatMessage) => {
    await saveBookmark({
      id: `bm_counsel_${Date.now()}`,
      type: 'quote',
      title: `${apostle.name}'s Counsel`,
      content: msg.content,
      reference: apostle.title,
      author: apostle.name,
      timestamp: Date.now()
    });
    Alert.alert('Counsel Saved', `Saved ${apostle.name}'s reflection to your Profile.`);
  };

  const handleCopyMessage = (text: string) => {
    try {
      Clipboard.setString(text);
    } catch (e) {}
    Alert.alert('Copied', 'Message copied to clipboard.');
  };

  const formatMessageTime = (ts: number) => {
    const d = new Date(ts);
    const hours = d.getHours();
    const mins = d.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const formattedMins = mins < 10 ? `0${mins}` : mins;
    return `${formattedHours}:${formattedMins} ${ampm}`;
  };

  const handleSend = () => {
    handleSendText(inputText);
  };

  const lastAssistantMsg = [...messages].reverse().find(m => m.sender === 'assistant')?.content;
  const dynamicChips = getContextualChips(apostle.id, lastAssistantMsg);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.headerTitleGroup}>
          <View style={styles.headerAvatarWrap}>
            <Image source={apostle.avatar} style={styles.headerAvatar} />
          </View>
          <View>
            <Text style={styles.headerName}>{apostle.name}</Text>
            <Text style={styles.headerSubtitle} numberOfLines={1}>{apostle.title}</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => setShowCallModal(true)}
          style={styles.callBtn}
          activeOpacity={0.75}
        >
          <Ionicons name="call-outline" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Messages List with Elastic Anchor Pop */}
      <KeyboardAvoidingView
        style={styles.chatArea}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => {
            const isUser = item.sender === 'user';
            const isPreloaded = initialLoadedIdsRef.current.has(item.id);
            const isPlayingThis = playingMessageId === item.id;

            return (
              <View style={[styles.messageRow, isUser ? styles.userRow : styles.assistantRow]}>
                <AnimatedChatBubble isUser={isUser} animate={!isPreloaded}>
                  <TouchableOpacity
                    style={[styles.messageBubble, isUser ? styles.userBubble : styles.assistantBubble]}
                    onPress={() => setActionMessage(item)}
                    activeOpacity={0.88}
                  >
                    <FormattedMessageText
                      content={item.content}
                      isUser={isUser}
                      fontSize={15.5}
                    />

                    {/* Subtle Timestamp & Playing Indicator */}
                    <View style={styles.bubbleFooterRow}>
                      <Text style={[styles.bubbleTimeText, isUser && styles.bubbleTimeTextUser]}>
                        {formatMessageTime(item.timestamp)}
                      </Text>

                      {isPlayingThis && (
                        <View style={styles.playingIndicatorBadge}>
                          <Ionicons name="volume-high" size={12} color="#8B1E1E" style={{ marginRight: 3 }} />
                          <Text style={styles.playingIndicatorText}>Playing</Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                </AnimatedChatBubble>
              </View>
            );
          }}
          ListFooterComponent={
            isLoading ? (
              <View style={styles.typingContainer}>
                <Image source={apostle.avatar} style={styles.typingAvatar} />
                <View style={styles.typingBubble}>
                  <BouncingDots />
                </View>
              </View>
            ) : null
          }
        />

        {/* Dynamic Contextual Suggestion Chips */}
        <View style={styles.quickPromptsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickPromptsScroll}>
            {dynamicChips.map((prompt) => (
              <TouchableOpacity
                key={prompt.id}
                style={styles.quickPromptChip}
                onPress={() => handleSendText(prompt.text)}
                activeOpacity={0.75}
              >
                <Text style={styles.quickPromptText}>{prompt.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.textInput}
            placeholder={`Ask Apostle ${apostle.name}...`}
            placeholderTextColor={Colors.textMuted}
            value={inputText}
            onChangeText={setInputText}
            multiline
          />

          {inputText.trim().length === 0 ? (
            <TouchableOpacity
              style={styles.micBtn}
              onPress={() => setShowCallModal(true)}
              activeOpacity={0.75}
            >
              <Ionicons name="mic-outline" size={21} color={Colors.textPrimary} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
              onPress={handleSend}
              disabled={!inputText.trim()}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-up" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>

      {/* Floating Action Pill on Message Tap */}
      <Modal
        visible={Boolean(actionMessage)}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setActionMessage(null)}
      >
        <TouchableWithoutFeedback onPress={() => setActionMessage(null)}>
          <View style={styles.actionModalBackdrop}>
            <TouchableWithoutFeedback>
              <View style={styles.floatingActionPill}>
                {/* 1. Read / Listen Aloud */}
                {actionMessage && actionMessage.sender !== 'user' && (
                  <TouchableOpacity
                    style={styles.pillActionBtn}
                    onPress={() => {
                      const msg = actionMessage;
                      setActionMessage(null);
                      handleTogglePlayAudio(msg.id, msg.content);
                    }}
                    activeOpacity={0.75}
                  >
                    <Ionicons
                      name={playingMessageId === actionMessage?.id ? 'pause' : 'volume-high-outline'}
                      size={18}
                      color={playingMessageId === actionMessage?.id ? '#8B1E1E' : '#111111'}
                    />
                    <Text style={[styles.pillActionLabel, playingMessageId === actionMessage?.id && { color: '#8B1E1E' }]}>
                      {playingMessageId === actionMessage?.id ? 'Pause' : 'Read'}
                    </Text>
                  </TouchableOpacity>
                )}

                {/* 2. Save / Bookmark */}
                <TouchableOpacity
                  style={styles.pillActionBtn}
                  onPress={() => {
                    const msg = actionMessage;
                    setActionMessage(null);
                    if (msg) handleBookmarkMessage(msg);
                  }}
                  activeOpacity={0.75}
                >
                  <Ionicons name="bookmark-outline" size={18} color="#111111" />
                  <Text style={styles.pillActionLabel}>Save</Text>
                </TouchableOpacity>

                {/* 3. Copy */}
                <TouchableOpacity
                  style={styles.pillActionBtn}
                  onPress={() => {
                    const msg = actionMessage;
                    setActionMessage(null);
                    if (msg) handleCopyMessage(msg.content);
                  }}
                  activeOpacity={0.75}
                >
                  <Ionicons name="copy-outline" size={18} color="#111111" />
                  <Text style={styles.pillActionLabel}>Copy</Text>
                </TouchableOpacity>

                {/* 4. Share */}
                <TouchableOpacity
                  style={styles.pillActionBtn}
                  onPress={async () => {
                    const msg = actionMessage;
                    setActionMessage(null);
                    if (msg) {
                      try {
                        await Share.share({
                          message: `“${msg.content}”\n— ${apostle.name} (${apostle.title})\n\nBible Chat App`,
                          title: `${apostle.name}'s Counsel`
                        });
                      } catch (e) {}
                    }
                  }}
                  activeOpacity={0.75}
                >
                  <Ionicons name="share-outline" size={18} color="#111111" />
                  <Text style={styles.pillActionLabel}>Share</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Voice Call Modal */}
      <VoiceCallModal
        visible={showCallModal}
        apostle={apostle}
        onEndCall={() => setShowCallModal(false)}
      />
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
    backgroundColor: Colors.background,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.cardSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 12,
  },
  headerAvatarWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#9E9FA6',
    marginRight: 10,
  },
  headerAvatar: {
    width: '100%',
    height: '100%',
  },
  headerName: {
    fontFamily: Typography.fontSerif,
    fontSize: 20,
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 11.5,
    color: Colors.textMuted,
  },
  callBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.cardSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatArea: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  messageRow: {
    marginBottom: 10,
    width: '100%',
  },
  userRow: {
    alignItems: 'flex-end',
  },
  assistantRow: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '85%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: '#111111',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: '#ECECEC',
    borderBottomLeftRadius: 4,
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  typingAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#9E9FA6',
    marginRight: 8,
  },
  typingBubble: {
    backgroundColor: '#ECECEC',
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 10,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#666666',
  },
  quickPromptsContainer: {
    paddingVertical: 8,
    backgroundColor: Colors.background,
  },
  quickPromptsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  quickPromptChip: {
    backgroundColor: '#ECECEC',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  quickPromptText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 13,
    color: '#111111',
  },
  inputBar: {
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
  micBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ECECEC',
    alignItems: 'center',
    justifyContent: 'center',
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
  bubbleFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    paddingTop: 4,
  },
  bubbleTimeText: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 10.5,
    color: '#9CA3AF',
  },
  bubbleTimeTextUser: {
    color: 'rgba(255, 255, 255, 0.65)',
  },
  playingIndicatorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  playingIndicatorText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 10.5,
    color: '#8B1E1E',
  },
  actionModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  floatingActionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    gap: 16,
  },
  pillActionBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  pillActionLabel: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 11.5,
    color: '#111111',
    marginTop: 4,
  },
});
