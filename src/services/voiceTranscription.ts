import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';

const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY || '';
const GROQ_WHISPER_URL = 'https://api.groq.com/openai/v1/audio/transcriptions';

let activeRecording: Audio.Recording | null = null;

export const startVoiceRecording = async (): Promise<boolean> => {
  try {
    const permission = await Audio.requestPermissionsAsync();
    if (!permission.granted) {
      console.warn('Microphone permission not granted');
      return false;
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false
    });

    if (activeRecording) {
      try {
        await activeRecording.stopAndUnloadAsync();
      } catch (e) {}
      activeRecording = null;
    }

    const recording = new Audio.Recording();
    await recording.prepareToRecordAsync({
      android: {
        extension: '.m4a',
        outputFormat: Audio.AndroidOutputFormat.MPEG_4,
        audioEncoder: Audio.AndroidAudioEncoder.AAC,
        sampleRate: 44100,
        numberOfChannels: 1,
        bitRate: 128000
      },
      ios: {
        extension: '.m4a',
        audioQuality: Audio.IOSAudioQuality.HIGH,
        sampleRate: 44100,
        numberOfChannels: 1,
        bitRate: 128000,
        linearPCMBitDepth: 16,
        linearPCMIsBigEndian: false,
        linearPCMIsFloat: false
      },
      web: {}
    });

    await recording.startAsync();
    activeRecording = recording;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (e) {}

    return true;
  } catch (error) {
    console.error('Failed to start voice recording:', error);
    return false;
  }
};

export const stopVoiceRecordingAndTranscribe = async (): Promise<string | null> => {
  if (!activeRecording) return null;

  try {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}

    await activeRecording.stopAndUnloadAsync();
    const uri = activeRecording.getURI();
    activeRecording = null;

    if (!uri) return null;

    // Reset audio mode for playback
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false
    });

    // If Groq API key is present, transcribe via Groq Whisper
    if (GROQ_API_KEY) {
      const formData = new FormData();
      formData.append('file', {
        uri,
        name: 'audio.m4a',
        type: 'audio/m4a'
      } as any);
      formData.append('model', 'whisper-large-v3');
      formData.append('language', 'en');
      formData.append('response_format', 'json');

      const response = await fetch(GROQ_WHISPER_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`
        },
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        if (result.text && result.text.trim().length > 0) {
          return result.text.trim();
        }
      } else {
        console.warn('Whisper API returned non-OK status:', response.status);
      }
    }

    return null;
  } catch (error) {
    console.error('Error stopping and transcribing recording:', error);
    activeRecording = null;
    return null;
  }
};

export const cancelVoiceRecording = async (): Promise<void> => {
  if (!activeRecording) return;
  try {
    await activeRecording.stopAndUnloadAsync();
  } catch (e) {}
  activeRecording = null;
};