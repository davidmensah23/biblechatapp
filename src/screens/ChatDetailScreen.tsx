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
      setMessages(history);
    }
  };

  const handleSendText = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userText = textToSend.trim();
    setInputText('');

    const userMsg: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      conversationId: conversationId,
      sender: 'user',
      content: userText,
      timestamp: Date.now()
    };

    const updated = [...messages, userMsg];
    setMessages(updated);
    await saveMessage(userMsg, apostle.title, apostle.id);

    setIsLoading(true);

    try {
      const replyText = await generateApostleReply(
        apostle,
        messages,
        userText,
        userProfile
          ? {
              fullName: userProfile.fullName,
              age: '24',
              location: userProfile.location || 'Ghana',
              bio: userProfile.bio
            }
          : undefined
      );

      const assistantMsg: ChatMessage = {
        id: `msg_asst_${Date.now()}`,
        conversationId: conversationId,
        sender: 'assistant',
        content: replyText,
        timestamp: Date.now()
      };

      setMessages([...updated, assistantMsg]);
      await saveMessage(assistantMsg, apostle.title, apostle.id);
    } catch (error) {
      console.error('Error generating reply:', error);
    } finally {
      setIsLoading(false);
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
      {/* Top Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.headerProfile}>
          <View style={styles.headerAvatarContainer}>
            <Image source={apostle.avatar} style={styles.headerAvatar} resizeMode="cover" />
          </View>
          <View style={styles.headerTexts}>
            <Text style={styles.headerTitle}>{apostle.name}</Text>
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              {apostle.subtitle}
            </Text>
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

      {/* Messages List */}
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
              disabled={!inputText.trim() || isLoading}
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
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.cardSecondary,
  },
  headerProfile: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  headerAvatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#ECECF0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  headerAvatar: {
    width: '100%',
    height: '100%',
    transform: [{ scale: 1.4 }, { translateY: 2 }],
  },
  headerTexts: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: Typography.fontSerif,
    fontSize: 22,
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 1,
  },
  callBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.cardSecondary,
  },
  chatArea: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  messageRow: {
    marginBottom: 14,
    flexDirection: 'row',
  },
  userRow: {
    justifyContent: 'flex-end',
  },
  assistantRow: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '84%',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  userBubble: {
    backgroundColor: '#1E1E24',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: Colors.cardSecondary,
    borderBottomLeftRadius: 4,
  },
  bookmarkBtn: {
    alignSelf: 'flex-end',
    marginTop: 6,
    padding: 3,
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  typingAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  typingBubble: {
    backgroundColor: Colors.cardSecondary,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 12,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#888888',
  },
  quickPromptsContainer: {
    paddingVertical: 6,
  },
  quickPromptsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  quickPromptChip: {
    backgroundColor: Colors.cardSecondary,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  quickPromptText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 12.5,
    color: Colors.textPrimary,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    backgroundColor: Colors.background,
  },
  textInput: {
    flex: 1,
    backgroundColor: Colors.cardSecondary,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontFamily: Typography.fontSansRegular,
    fontSize: 15,
    color: Colors.textPrimary,
    maxHeight: 100,
    marginRight: 10,
  },
  micBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.cardSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#CCCCCC',
  }
});
