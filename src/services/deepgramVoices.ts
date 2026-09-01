import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

const DEEPGRAM_API_KEY = process.env.EXPO_PUBLIC_DEEPGRAM_API_KEY || '71faeae2c16de8413f5b5a3ab7865e798afaf83b';

export interface ApostleVoiceConfig {
  voiceModel: string;
  description: string;
}

export const APOSTLE_VOICE_PROFILES: Record<string, ApostleVoiceConfig> = {
  // Simon Peter: Deep, rugged, mature Galilean fisherman
  peter: { voiceModel: 'aura-arcas-en', description: 'Deep, rugged, authoritative' },
  // John: Gentle, warm, comforting elder
  john: { voiceModel: 'aura-angus-en', description: 'Gentle, comforting, contemplative' },
  // Paul: Passionate, articulate, bold preacher
  paul: { voiceModel: 'aura-perseus-en', description: 'Articulate, energetic, bold' },
  // Thomas: Resonant, thoughtful, honest
  thomas: { voiceModel: 'aura-orion-en', description: 'Resonant, measured, sincere' },
  // Andrew: Kind, faithful, conversational
  andrew: { voiceModel: 'aura-orpheus-en', description: 'Warm, brotherly, inviting' },
  // Philip: Approachable, friendly
  philip: { voiceModel: 'aura-helios-en', description: 'Bright, approachable, earnest' },
  // Matthew: Structured, dignified, deep
  matthew: { voiceModel: 'aura-zeus-en', description: 'Structured, dignified, solemn' },
  // James (Son of Thunder): Bold, fiery
  james: { voiceModel: 'aura-arcas-en', description: 'Bold, commanding, direct' },
  // James the Less: Humble, steadfast
  james_less: { voiceModel: 'aura-orion-en', description: 'Humble, steady, gentle' },
  // Bartholomew: Genuine, sincere
  bartholomew: { voiceModel: 'aura-helios-en', description: 'Open, sincere, clear' },
  // Simon the Zealot: Intense, zealous
  simon_zealot: { voiceModel: 'aura-perseus-en', description: 'Zealous, resolute, strong' },
  // Thaddaeus: Encouraging, tender
  thaddaeus: { voiceModel: 'aura-orpheus-en', description: 'Encouraging, faithful, soft' },
  // Scripture Reader: Majestic, reverent, clear
  narrator: { voiceModel: 'aura-orion-en', description: 'Reverent, articulate, majestic' }
};

let currentSound: Audio.Sound | null = null;
let activeAudioId: string | null = null;

/**
 * Fetches and plays high-fidelity neural speech using Deepgram Aura
 */
export const playDeepgramSpeech = async (
  audioId: string,
  text: string,
  characterId: string,
  onStart?: () => void,
  onDone?: () => void
): Promise<void> => {
  try {
    // If already playing this exact message, toggle stop
    if (activeAudioId === audioId && currentSound) {
      await stopDeepgramSpeech();
      if (onDone) onDone();
      return;
    }

    await stopDeepgramSpeech();

    const voiceConfig = APOSTLE_VOICE_PROFILES[characterId] || APOSTLE_VOICE_PROFILES.peter;
    const cleanText = text.replace(/[*_#"`]/g, '').trim();
    if (!cleanText) return;

    if (onStart) onStart();
    activeAudioId = audioId;

    // Enable audio playback mode
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false
    });

    // Request Deepgram Aura TTS Stream
    const res = await fetch(`https://api.deepgram.com/v1/speak?model=${voiceConfig.voiceModel}`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${DEEPGRAM_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text: cleanText })
    });

    if (!res.ok) {
      throw new Error(`Deepgram TTS request failed: ${res.status}`);
    }

    // Convert response stream to base64 audio and save temporarily
    const blob = await res.blob();
    const reader = new FileReader();

    reader.onloadend = async () => {
      try {
        const base64Data = (reader.result as string).split(',')[1];
        const tempUri = `${FileSystem.cacheDirectory}dg_tts_${Date.now()}.mp3`;

        await FileSystem.writeAsStringAsync(tempUri, base64Data, {
          encoding: FileSystem.EncodingType.Base64
        });

        const { sound } = await Audio.Sound.createAsync(
          { uri: tempUri },
          { shouldPlay: true },
          (status) => {
            if (status.isLoaded && status.didJustFinish) {
              stopDeepgramSpeech();
              if (onDone) onDone();
            }
          }
        );

        currentSound = sound;
        await sound.playAsync();
      } catch (err) {
        console.warn('Audio creation error:', err);
        stopDeepgramSpeech();
        if (onDone) onDone();
      }
    };

    reader.readAsDataURL(blob);
  } catch (e) {
    console.error('Deepgram play error:', e);
    stopDeepgramSpeech();
    if (onDone) onDone();
  }
};

export const stopDeepgramSpeech = async () => {
  if (currentSound) {
    try {
      await currentSound.stopAsync();
      await currentSound.unloadAsync();
    } catch (e) {}
    currentSound = null;
  }
  activeAudioId = null;
};
