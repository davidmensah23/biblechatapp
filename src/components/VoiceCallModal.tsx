import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Dimensions,
  Platform,
  ActivityIndicator
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
import * as Haptics from 'expo-haptics';
import { Typography } from '../theme/typography';
import { ApostlePersona, ChatMessage } from '../types';
import { playDeepgramSpeech, stopDeepgramSpeech } from '../services/deepgramVoices';
import { startVoiceRecording, stopVoiceRecordingAndTranscribe, cancelVoiceRecording } from '../services/voiceTranscription';
import { generateApostleReply } from '../services/groq';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface VoiceCallModalProps {
  visible: boolean;
  apostle: ApostlePersona;
  onEndCall: () => void;
}

type CallState = 'connecting' | 'speaking' | 'listening' | 'recording' | 'thinking';

const QUICK_PROMPTS = [
  'Pray with me for peace',
  'A word of encouragement',
  'How do I overcome worry?',
  'Tell me about walking with Jesus',
  'Give me a verse for today'
];

export const VoiceCallModal: React.FC<VoiceCallModalProps> = ({
  visible,
  apostle,
  onEndCall
}) => {
  const [callState, setCallState] = useState<CallState>('connecting');
  const [callDuration, setCallDuration] = useState(0);
  const [captionText, setCaptionText] = useState<string>('Connecting with Apostle...');
  const [showTextInput, setShowTextInput] = useState(false);
  const [typedMessage, setTypedMessage] = useState('');
  const [isMuted, setIsMuted] = useState(false);

  const conversationHistoryRef = useRef<ChatMessage[]>([]);
  const isMountedRef = useRef<boolean>(true);

  // Soft breathing halo glow animation around avatar while speaking
  const haloScale = useSharedValue(1.0);
  const haloOpacity = useSharedValue(0.2);

  useEffect(() => {
    if (callState === 'speaking') {
      haloScale.value = withRepeat(
        withSequence(
          withTiming(1.14, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
          withTiming(1.0, { duration: 1200, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
      haloOpacity.value = withRepeat(
        withSequence(
          withTiming(0.45, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.15, { duration: 1200, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    } else {
      haloScale.value = withTiming(1.0, { duration: 400 });
      haloOpacity.value = withTiming(0.12, { duration: 400 });
    }
  }, [callState]);

  const haloAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: haloScale.value }],
    opacity: haloOpacity.value
  }));

  useEffect(() => {
    isMountedRef.current = true;
    let timer: NodeJS.Timeout;

    if (visible) {
      setCallDuration(0);
      setCallState('connecting');
      conversationHistoryRef.current = [];

      timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);

      startCallSession();
    } else {
      cleanupCallSession();
    }

    return () => {
      isMountedRef.current = false;
      if (timer) clearInterval(timer);
      cleanupCallSession();
    };
  }, [visible, apostle.id]);

  const cleanupCallSession = async () => {
    try {
      await stopDeepgramSpeech();
      await cancelVoiceRecording();
    } catch (e) {}
    setCallDuration(0);
    setCallState('connecting');
  };

  const startCallSession = async () => {
    const greetingSamples: Record<string, string> = {
      peter: `Peace be with you, my friend. Simon Peter here. What is on your heart today?`,
      john: `Beloved, grace and peace to you. I am glad you called. What would you like to speak about?`,
      paul: `Grace and peace from God our Father. What is on your mind today, my brother?`,
      thomas: `Hello, my friend. Thomas here. I am listening—what questions or thoughts are with you?`
    };

    const initialGreeting =
      greetingSamples[apostle.id] ||
      `Peace be with you. I am ${apostle.name}. I am here with you—what is on your heart?`;

    conversationHistoryRef.current.push({
      id: `call_msg_${Date.now()}`,
      conversationId: `call_${apostle.id}`,
      sender: 'assistant',
      content: initialGreeting,
      timestamp: Date.now()
    });

    setCaptionText(initialGreeting);
    await playSpokenResponse(initialGreeting);
  };

  const playSpokenResponse = async (textToSpeak: string) => {
    setCallState('speaking');
    setCaptionText(textToSpeak);

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}

    await playDeepgramSpeech(
      `call_speech_${Date.now()}`,
      textToSpeak,
      apostle.id,
      () => {
        if (isMountedRef.current) setCallState('speaking');
      },
      () => {
        if (isMountedRef.current) {
          // When Apostle finishes speaking, transition to peaceful listening state
          setCallState('listening');
          try {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          } catch (e) {}
        }
      }
    );
  };

  const handleStartSpeaking = async () => {
    if (callState === 'speaking') {
      await stopDeepgramSpeech();
    }

    setCallState('recording');
    setCaptionText('Listening to your voice...');
    const started = await startVoiceRecording();
    if (!started) {
      setCallState('listening');
      setCaptionText('Microphone ready. Tap again or select a question below.');
    }
  };

  const handleStopSpeakingAndSend = async () => {
    setCallState('thinking');
    setCaptionText('Discerning scripture & prayer...');

    const transcribedText = await stopVoiceRecordingAndTranscribe();

    if (transcribedText && transcribedText.trim().length > 0) {
      await processUserSpeech(transcribedText.trim());
    } else {
      setCallState('listening');
      setCaptionText('I am listening. Tap the microphone to speak, or pick a prayer below.');
    }
  };

  const processUserSpeech = async (userText: string) => {
    setCaptionText(`"${userText}"`);
    setCallState('thinking');

    conversationHistoryRef.current.push({
      id: `call_user_${Date.now()}`,
      conversationId: `call_${apostle.id}`,
      sender: 'user',
      content: userText,
      timestamp: Date.now()
    });

    try {
      const reply = await generateApostleReply(
        apostle,
        conversationHistoryRef.current,
        userText
      );

      conversationHistoryRef.current.push({
        id: `call_asst_${Date.now()}`,
        conversationId: `call_${apostle.id}`,
        sender: 'assistant',
        content: reply,
        timestamp: Date.now()
      });

      await playSpokenResponse(reply);
    } catch (error) {
      console.error('Error in call reply generation:', error);
      const fallback = `Peace be with you. Cast all your anxieties upon the Lord, for He cares for you deeply.`;
      await playSpokenResponse(fallback);
    }
  };

  const handleQuickPrompt = async (prompt: string) => {
    if (callState === 'speaking') {
      await stopDeepgramSpeech();
    }
    await processUserSpeech(prompt);
  };

  const handleSendTypedMessage = async () => {
    if (!typedMessage.trim()) return;
    const text = typedMessage.trim();
    setTypedMessage('');
    setShowTextInput(false);
    if (callState === 'speaking') {
      await stopDeepgramSpeech();
    }
    await processUserSpeech(text);
  };

  const handleEndCall = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch (e) {}
    await cleanupCallSession();
    onEndCall();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={handleEndCall}>
      <SafeAreaView style={styles.container}>
        {/* Top Header: Status Badge & Live Chat Time */}
        <View style={styles.topHeader}>
          <View style={styles.statusBadge}>
            <View
              style={[
                styles.statusIndicatorDot,
                callState === 'speaking'
                  ? styles.dotSpeaking
                  : callState === 'recording'
                  ? styles.dotRecording
                  : callState === 'thinking'
                  ? styles.dotThinking
                  : styles.dotListening
              ]}
            />
            <Text style={styles.statusBadgeText}>
              {callState === 'connecting'
                ? 'Connecting...'
                : callState === 'speaking'
                ? `${apostle.name} Speaking`
                : callState === 'recording'
                ? 'Listening to You...'
                : callState === 'thinking'
                ? 'Discerning Scripture...'
                : 'Listening to You'}
            </Text>
          </View>

          {/* Chat Duration */}
          <Text style={styles.durationText}>{formatDuration(callDuration)}</Text>
        </View>

        {/* Centerpiece: Apostle Avatar & Identity */}
        <View style={styles.centerSection}>
          <View style={styles.avatarWrapper}>
            {/* Subtle soft breathing halo */}
            <Animated.View
              style={[
                styles.haloCircle,
                { backgroundColor: apostle.accentColor || '#3B82F6' },
                haloAnimatedStyle
              ]}
            />

            <View style={styles.avatarContainer}>
              <Image source={apostle.avatar} style={styles.avatarImg} />
            </View>
          </View>

          <Text style={styles.apostleName}>{apostle.name}</Text>
          <Text style={styles.apostleTitle}>{apostle.title}</Text>
        </View>

        {/* Transcribing Texts / Live Captions in Literata Serif */}
        <View style={styles.captionsArea}>
          <ScrollView
            contentContainerStyle={styles.captionsScroll}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.captionText}>
              “{captionText}”
            </Text>
          </ScrollView>
        </View>

        {/* Quick Topic Prompts */}
        {!showTextInput && (
          <View style={styles.quickPromptsWrap}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.quickPromptsScroll}
            >
              {QUICK_PROMPTS.map((p, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.quickPromptPill}
                  onPress={() => handleQuickPrompt(p)}
                  activeOpacity={0.75}
                >
                  <Text style={styles.quickPromptPillText}>{p}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Text Whisper Input Bar (if toggled) */}
        {showTextInput && (
          <View style={styles.textInputBar}>
            <TextInput
              style={styles.whisperInput}
              value={typedMessage}
              onChangeText={setTypedMessage}
              placeholder={`Type prayer to Apostle ${apostle.name}...`}
              placeholderTextColor="#9CA3AF"
              onSubmitEditing={handleSendTypedMessage}
              autoFocus
            />
            <TouchableOpacity onPress={handleSendTypedMessage} style={styles.whisperSendBtn} activeOpacity={0.8}>
              <Ionicons name="arrow-up" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}

        {/* Bottom Call Controls (Matching Soft UI Design) */}
        <View style={styles.bottomControls}>
          {/* 1. Mute / Mic Toggle */}
          <TouchableOpacity
            style={[styles.circleBtn, isMuted && styles.circleBtnActive]}
            onPress={() => setIsMuted(!isMuted)}
            activeOpacity={0.75}
          >
            <Ionicons
              name={isMuted ? 'mic-off' : 'mic'}
              size={22}
              color={isMuted ? '#EF4444' : '#111111'}
            />
          </TouchableOpacity>

          {/* 2. Soft Coral / Rose End Call Button (Matching Settings) */}
          <TouchableOpacity
            style={styles.endCallPillBtn}
            onPress={handleEndCall}
            activeOpacity={0.8}
          >
            <Ionicons name="call" size={18} color="#3B1818" style={{ marginRight: 8, transform: [{ rotate: '135deg' }] }} />
            <Text style={styles.endCallPillText}>End Call</Text>
          </TouchableOpacity>

          {/* 3. Whisper Keyboard Toggle */}
          <TouchableOpacity
            style={[styles.circleBtn, showTextInput && styles.circleBtnActive]}
            onPress={() => setShowTextInput(!showTextInput)}
            activeOpacity={0.75}
          >
            <Ionicons
              name={showTextInput ? 'mic-outline' : 'chatbubble-ellipses-outline'}
              size={22}
              color="#111111"
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  topHeader: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F4F6',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  statusIndicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  dotSpeaking: {
    backgroundColor: '#10B981',
  },
  dotListening: {
    backgroundColor: '#3B82F6',
  },
  dotRecording: {
    backgroundColor: '#EF4444',
  },
  dotThinking: {
    backgroundColor: '#F59E0B',
  },
  statusBadgeText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 13,
    color: '#374151',
  },
  durationText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 15,
    color: '#111111',
    letterSpacing: 0.5,
  },
  centerSection: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  avatarWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  haloCircle: {
    position: 'absolute',
    width: 136,
    height: 136,
    borderRadius: 68,
  },
  avatarContainer: {
    width: 110,
    height: 110,
    borderRadius: 55,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    backgroundColor: '#F3F4F6',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  apostleName: {
    fontFamily: Typography.fontSerif,
    fontSize: 26,
    color: '#111111',
    letterSpacing: -0.3,
  },
  apostleTitle: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  captionsArea: {
    flex: 1,
    maxHeight: 140,
    paddingHorizontal: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  captionsScroll: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  captionText: {
    fontFamily: Typography.fontSerif,
    fontSize: 18,
    lineHeight: 27,
    color: '#1F2937',
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  quickPromptsWrap: {
    marginBottom: 16,
  },
  quickPromptsScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  quickPromptPill: {
    backgroundColor: '#F4F4F6',
    borderWidth: 1,
    borderColor: '#ECECEE',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  quickPromptPillText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 13,
    color: '#111111',
  },
  textInputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F4F6',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginHorizontal: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ECECEE',
  },
  whisperInput: {
    flex: 1,
    fontFamily: Typography.fontSansRegular,
    fontSize: 14,
    color: '#111111',
  },
  whisperSendBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  bottomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
    paddingTop: 8,
    paddingBottom: 14,
  },
  circleBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F4F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ECECEE',
  },
  circleBtnActive: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5',
  },
  endCallPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3A7A7',
    borderRadius: 28,
    paddingHorizontal: 34,
    paddingVertical: 15,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  endCallPillText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 15,
    color: '#3B1818',
  }
});
