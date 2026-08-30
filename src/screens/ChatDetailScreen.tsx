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
  Alert
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
import { ApostlePersona, ChatMessage } from '../types';
import { fetchMessages, saveMessage, saveBookmark } from '../services/database';
import { generateApostleReply } from '../services/groq';
import { VoiceCallModal } from '../components/VoiceCallModal';

interface ChatDetailScreenProps {
  apostle: ApostlePersona;
  onBack: () => void;
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

export const ChatDetailScreen: React.FC<ChatDetailScreenProps> = ({ apostle, onBack }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const conversationId = `conv_${apostle.id}`;

  useEffect(() => {
    loadChatHistory();
  }, [apostle.id]);

  const loadChatHistory = async () => {
    const history = await fetchMessages(conversationId);
    if (history.length === 0) {
      const greeting: ChatMessage = {
        id: `msg_${Date.now()}`,
        conversationId: conversationId,
        sender: 'assistant',
        content: `Peace be with you! I am ${apostle.name}. How may I encourage your faith or reflect on the scriptures with you today?`,
        timestamp: Date.now()
      };
      await saveMessage(greeting, apostle.title, apostle.id);
      setMessages([greeting]);
    } else {
      setMessages(history);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userText = inputText.trim();
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
      const replyText = await generateApostleReply(apostle, messages, userText);

      const assistantMsg: ChatMessage = {
        id: `msg_asst_${Date.now()}`,
        conversationId: conversationId,
        sender: 'assistant',
        content: replyText,
        timestamp: Date.now()
      };

      const finalMessages = [...updated, assistantMsg];
      setMessages(finalMessages);
      await saveMessage(assistantMsg, apostle.title, apostle.id);
    } catch (err) {
      console.error('Error generating reply:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookmarkMessage = async (msg: ChatMessage) => {
    await saveBookmark({
      id: `bm_msg_${msg.id}`,
      type: 'quote',
      title: `${apostle.name}'s Insight`,
      content: msg.content,
      author: apostle.name,
      timestamp: Date.now()
    });
    Alert.alert('Saved', `Saved quote from ${apostle.name} to your profile bookmarks!`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.headerBtn}>
            <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Image source={apostle.avatar} style={styles.headerAvatar} />
            <View>
              <Text style={styles.headerTitle}>{apostle.name}</Text>
              <Text style={styles.headerSubtitle} numberOfLines={1}>
                {apostle.subtitle}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.callBtn}
            onPress={() => setShowCallModal(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="call-outline" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Message Feed */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => {
            const isUser = item.sender === 'user';
            return (
              <TouchableOpacity
                style={[styles.bubbleWrapper, isUser ? styles.userWrapper : styles.assistantWrapper]}
                onLongPress={() => !isUser && handleBookmarkMessage(item)}
                activeOpacity={0.9}
              >
                {!isUser && (
                  <Image source={apostle.avatar} style={styles.bubbleAvatar} />
                )}

                <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
                  <Text style={[styles.messageText, isUser ? styles.userText : styles.assistantText]}>
                    {item.content}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }}
          ListFooterComponent={
            isLoading ? (
              <View style={styles.typingIndicator}>
                <Image source={apostle.avatar} style={styles.bubbleAvatar} />
                <View style={[styles.bubble, styles.assistantBubble, styles.typingBubble]}>
                  <BouncingDots />
                  <Text style={styles.typingText}>{apostle.name} is writing...</Text>
                </View>
              </View>
            ) : null
          }
        />

        {/* Input Bar */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder={`Ask Apostle ${apostle.name}...`}
            placeholderTextColor={Colors.textMuted}
            value={inputText}
            onChangeText={setInputText}
            multiline
          />

          <TouchableOpacity
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim() || isLoading}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-up" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Voice Call Modal */}
        <VoiceCallModal
          visible={showCallModal}
          apostle={apostle}
          onEndCall={() => setShowCallModal(false)}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
    backgroundColor: Colors.background,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.cardSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  headerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 10,
  },
  headerTitle: {
    fontFamily: Typography.fontSerif,
    fontSize: 22,
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 12,
    color: Colors.textMuted,
    width: 175,
  },
  callBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.cardSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageList: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  bubbleWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  userWrapper: {
    justifyContent: 'flex-end',
  },
  assistantWrapper: {
    justifyContent: 'flex-start',
  },
  bubbleAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    marginRight: 8,
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userBubble: {
    backgroundColor: Colors.userBubble,
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: Colors.assistantBubble,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 15.5,
    lineHeight: 23,
  },
  userText: {
    color: Colors.userBubbleText,
  },
  assistantText: {
    color: Colors.assistantBubbleText,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  typingDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.textMuted,
  },
  typingText: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 13,
    color: Colors.textMuted,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  textInput: {
    flex: 1,
    fontFamily: Typography.fontSansRegular,
    fontSize: 15,
    color: Colors.textPrimary,
    backgroundColor: Colors.cardSecondary,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    marginRight: 10,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.35,
  }
});
