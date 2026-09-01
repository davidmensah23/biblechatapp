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
  Alert,
  ScrollView
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
import { fetchMessages, saveMessage, saveBookmark, fetchUserProfile } from '../services/database';
import { generateApostleReply } from '../services/groq';
import { VoiceCallModal } from '../components/VoiceCallModal';
import { FormattedMessageText } from '../components/FormattedMessageText';
import { checkProactiveFollowUp } from '../services/companionFollowup';
import { splitIntoThoughtBubbles } from '../services/messageSplitter';
import { calculateBubbleTypingDelay, calculateInitialContemplationDelay } from '../services/typingSpeed';
import { AnimatedChatBubble } from '../components/AnimatedChatBubble';

interface ChatDetailScreenProps {
  apostle: ApostlePersona;
  onBack: () => void;
}

const QUICK_PROMPTS = [
  { id: '1', label: '🕊️ Pray with me', text: 'Could you pray with me for peace and strength today?' },
  { id: '2', label: '📖 Today’s wisdom', text: 'Share a word of encouragement from your time with Jesus.' },
  { id: '3', label: '🌊 Faith in storms', text: 'How did you keep faith when the waves grew high?' },
  { id: '4', label: '💡 Explain a parable', text: 'What is the true meaning behind the Parable of the Sower?' }
];

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

export const ChatDetailScreen: React.FC<ChatDetailScreenProps> = ({ apostle, onBack }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  
  const flatListRef = useRef<FlatList>(null);
  const activeDispatchIdRef = useRef<number>(0);

  const conversationId = `conv_${apostle.id}`;

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
      setMessages([greeting]);
    } else {
      // Check for proactive follow-up check-in if user returns after some time
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
      setMessages(history);
    }
  };

  const handleSendText = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    // Instant Interrupt & Pivot: Increment dispatch ID to cancel any pending chunk sequence
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

    // Append user message immediately
    setMessages(prev => [...prev, userMsg]);
    await saveMessage(userMsg, apostle.title, apostle.id);

    setIsLoading(true);

    try {
      // Initial contemplative pause (longer for deep/emotional questions)
      const initialDelay = calculateInitialContemplationDelay(userText);
      await new Promise(r => setTimeout(r, initialDelay));

      // Check if user interrupted with another message during initial delay
      if (activeDispatchIdRef.current !== currentDispatchId) return;

      const replyText = await generateApostleReply(
        apostle,
        messages,
        userText,
        userProfile
          ? {
              fullName: userProfile.fullName,
              location: userProfile.location || 'Ghana',
              bio: userProfile.bio
            }
          : undefined
      );

      // Check if user interrupted during API request
      if (activeDispatchIdRef.current !== currentDispatchId) return;

      // Split reply into 1-3 natural thought bubbles
      const chunks = splitIntoThoughtBubbles(replyText);

      // Sequentially deliver each thought bubble with character typing cadence
      for (let i = 0; i < chunks.length; i++) {
        // Check for interruption before each bubble
        if (activeDispatchIdRef.current !== currentDispatchId) return;

        const chunk = chunks[i];
        const bubbleDelay = calculateBubbleTypingDelay(apostle.id, chunk);

        // Simulate Apostle typing cadence
        await new Promise(r => setTimeout(r, bubbleDelay));

        // Check again after typing delay
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

        // Smooth scroll to bottom
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

  const handleSend = () => {
    handleSendText(inputText);
  };

  const handleBookmark = async (msg: ChatMessage) => {
    await saveBookmark({
      id: `bm_${msg.id}`,
      type: 'insight',
      title: `${apostle.name}'s Insight`,
      content: msg.content,
      timestamp: Date.now()
    });
    Alert.alert('Saved', 'Added to your Bookmarks in Profile');
  };

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
            return (
              <View style={[styles.messageRow, isUser ? styles.userRow : styles.assistantRow]}>
                <AnimatedChatBubble isUser={isUser}>
                  <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.assistantBubble]}>
                    <FormattedMessageText
                      content={item.content}
                      isUser={isUser}
                      fontSize={15.5}
                    />

                    {!isUser && (
                      <TouchableOpacity
                        onPress={() => handleBookmark(item)}
                        style={styles.bookmarkBtn}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="bookmark-outline" size={14} color={Colors.textMuted} />
                      </TouchableOpacity>
                    )}
                  </View>
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

        {/* Quick Suggestion Chips */}
        <View style={styles.quickPromptsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickPromptsScroll}>
            {QUICK_PROMPTS.map((prompt) => (
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
    maxWidth: '82%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: '#2563EB',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: '#DCDCE1',
    borderBottomLeftRadius: 4,
  },
  bookmarkBtn: {
    alignSelf: 'flex-end',
    marginTop: 4,
    padding: 2,
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
    backgroundColor: '#DCDCE1',
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
    backgroundColor: '#DCDCE1',
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
    backgroundColor: '#DCDCE1',
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
    backgroundColor: '#DCDCE1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.5,
  }
});
