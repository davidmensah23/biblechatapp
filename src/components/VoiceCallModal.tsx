import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Dimensions,
  Platform,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Typography } from '../theme/typography';
import { ApostlePersona, ChatMessage } from '../types';
import { playDeepgramSpeech, stopDeepgramSpeech } from '../services/deepgramVoices';
import { startVoiceRecording, stopVoiceRecordingAndTranscribe, cancelVoiceRecording } from '../services/voiceTranscription';
import { generateApostleReply } from '../services/groq';
import { AstroidSpectrumVisualizer } from './AstroidSpectrumVisualizer';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface VoiceCallModalProps {
  visible: boolean;
  apostle: ApostlePersona;
  durationMinutes?: number;
  onEndCall: () => void;
}

type CallState = 'connecting' | 'speaking' | 'listening' | 'recording' | 'thinking';

const QUICK_PROMPTS = [
  'Pray with me for strength today',
  'What did Jesus teach about peace?',
  'How do I overcome worry?',
  'Share a story from your ministry',
  'Give me a verse for encouragement'
];

export const VoiceCallModal: React.FC<VoiceCallModalProps> = ({
  visible,
  apostle,
  onEndCall
}) => {
  const [callState, setCallState] = useState<CallState>('connecting');
  const [callDuration, setCallDuration] = useState(0);
  const [captionText, setCaptionText] = useState<string>('Connecting call...');
  const [showTextInput, setShowTextInput] = useState(false);
  const [typedMessage, setTypedMessage] = useState('');
  
  const conversationHistoryRef = useRef<ChatMessage[]>([]);
  const isMountedRef = useRef<boolean>(true);

  useEffect(() => {
    isMountedRef.current = true;
    let timer: NodeJS.Timeout;

    if (visible) {
      setCallDuration(0);
      setCallState('connecting');
      conversationHistoryRef.current = [];

      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);

      // Start initial call greeting
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
    setCallState('speaking');

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
          // When Apostle finishes speaking, automatically transition to listening mode
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
    setCaptionText('Transcribing and consulting scripture...');

    const transcribedText = await stopVoiceRecordingAndTranscribe();

    if (transcribedText && transcribedText.trim().length > 0) {
      await processUserSpeech(transcribedText.trim());
    } else {
      // Fallback if audio was too short or quiet
      setCallState('listening');
      setCaptionText('I could not hear you clearly. Tap the microphone to speak again.');
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
      <View style={styles.container}>
        {/* Top Header Bar */}
        <View style={styles.topHeader}>
          <View style={styles.statusBadge}>
            <View
              style={[
                styles.statusIndicatorDot,
                callState === 'recording'
                  ? styles.dotRecording
                  : callState === 'thinking'
                  ? styles.dotThinking
                  : styles.dotActive
              ]}
            />
            <Text style={styles.statusBadgeText}>
              {callState === 'connecting'
                ? 'Connecting...'
                : callState === 'speaking'
                ? `${apostle.name} Speaking`
                : callState === 'recording'
                ? 'Recording Your Voice...'
                : callState === 'thinking'
                ? 'Consulting Scripture...'
                : 'Listening to You'}
            </Text>
          </View>

          <Text style={styles.title}>{apostle.name}</Text>
          <Text style={styles.durationText}>{formatDuration(callDuration)}</Text>
        </View>

        {/* Center Harmonic Astroid Spectral Visualizer */}
        <View style={styles.spectrumCenterArea}>
          <AstroidSpectrumVisualizer isSpeaking={callState === 'speaking' || callState === 'recording'} />
        </View>

        {/* Live Spoken Captions */}
        <View style={styles.captionsContainer}>
          <Text style={styles.captionText} numberOfLines={4}>
            {captionText}
          </Text>
        </View>

        {/* Quick Suggestion Chips (Visible during listening mode) */}
        {callState === 'listening' && !showTextInput && (
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

        {/* Text Whisper Input Sheet (if toggled) */}
        {showTextInput && (
          <View style={styles.textInputBar}>
            <TextInput
              style={styles.whisperInput}
              value={typedMessage}
              onChangeText={setTypedMessage}
              placeholder="Type your question or prayer..."
              placeholderTextColor="#777777"
              onSubmitEditing={handleSendTypedMessage}
              autoFocus
            />
            <TouchableOpacity onPress={handleSendTypedMessage} style={styles.whisperSendBtn} activeOpacity={0.8}>
              <Ionicons name="arrow-up" size={18} color="#000000" />
            </TouchableOpacity>
          </View>
        )}

        {/* Bottom Interactive Call Controls */}
        <View style={styles.bottomControls}>
          {/* 1. Toggle Keyboard Whisper Input */}
          <TouchableOpacity
            style={styles.auxControlBtn}
            onPress={() => setShowTextInput((prev) => !prev)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={showTextInput ? 'mic-outline' : 'chatbox-ellipses-outline'}
              size={22}
              color="#FFFFFF"
            />
          </TouchableOpacity>

          {/* 2. Main Central Talk Button */}
          {callState === 'recording' ? (
            <TouchableOpacity
              style={[styles.mainTalkBtn, styles.mainTalkBtnRecording]}
              onPress={handleStopSpeakingAndSend}
              activeOpacity={0.85}
            >
              <Ionicons name="stop" size={30} color="#FFFFFF" />
            </TouchableOpacity>
          ) : callState === 'thinking' ? (
            <View style={[styles.mainTalkBtn, styles.mainTalkBtnThinking]}>
              <ActivityIndicator size="small" color="#FFFFFF" />
            </View>
          ) : (
            <TouchableOpacity
              style={styles.mainTalkBtn}
              onPress={handleStartSpeaking}
              activeOpacity={0.85}
            >
              <Ionicons name="mic" size={32} color="#000000" />
            </TouchableOpacity>
          )}

          {/* 3. Hang Up Red Button */}
          <TouchableOpacity
            style={styles.endCallBtn}
            onPress={handleEndCall}
            activeOpacity={0.85}
          >
            <Ionicons name="call" size={24} color="#FFFFFF" style={{ transform: [{ rotate: '135deg' }] }} />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0B0B',
    justifyContent: 'space-between',
    paddingTop: 54,
    paddingBottom: 44,
    paddingHorizontal: 20,
  },
  topHeader: {
    alignItems: 'center',
    width: '100%',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 8,
  },
  statusIndicatorDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },
  dotActive: {
    backgroundColor: '#10B981',
  },
  dotRecording: {
    backgroundColor: '#EF4444',
  },
  dotThinking: {
    backgroundColor: '#F59E0B',
  },
  statusBadgeText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 12,
    color: '#D1D5DB',
  },
  title: {
    fontFamily: Typography.fontSerif,
    fontSize: 30,
    color: '#FFFFFF',
    marginBottom: 2,
    textAlign: 'center',
  },
  durationText: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 13,
    color: '#9CA3AF',
  },
  spectrumCenterArea: {
    width: '100%',
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captionsContainer: {
    paddingHorizontal: 16,
    minHeight: 90,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captionText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 20,
    lineHeight: 28,
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -0.3,
    opacity: 0.95,
  },
  quickPromptsWrap: {
    height: 38,
    marginVertical: 4,
  },
  quickPromptsScroll: {
    paddingHorizontal: 4,
    gap: 8,
  },
  quickPromptPill: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  quickPromptPillText: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 12.5,
    color: '#E5E7EB',
  },
  textInputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginHorizontal: 10,
    marginBottom: 10,
  },
  whisperInput: {
    flex: 1,
    fontFamily: Typography.fontSansRegular,
    fontSize: 14,
    color: '#FFFFFF',
    paddingVertical: 6,
  },
  whisperSendBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  bottomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    width: '100%',
    paddingTop: 10,
  },
  auxControlBtn: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainTalkBtn: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  mainTalkBtnRecording: {
    backgroundColor: '#DC2626',
    shadowColor: '#EF4444',
  },
  mainTalkBtnThinking: {
    backgroundColor: '#4B5563',
  },
  endCallBtn: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 6,
  }
});
