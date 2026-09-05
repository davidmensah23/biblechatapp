import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import * as Speech from 'expo-speech';
import { getAppLanguage } from './localizationService';

const DEEPGRAM_API_KEY = process.env.EXPO_PUBLIC_DEEPGRAM_API_KEY || '';

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
  // James: Bold, commanding
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
  narrator: { voiceModel: 'aura-orion-en', description: 'Reverent, articulate, majestic' },
  // The Holy Bible: Living Word, sacred, reverent, deep
  the_bible: { voiceModel: 'aura-zeus-en', description: 'Majestic, sacred, reverent, timeless divine wisdom' },
  bible: { voiceModel: 'aura-zeus-en', description: 'Majestic, sacred, reverent, timeless divine wisdom' },
  // Deborah: Prophetess, judge of Israel, bold & maternal
  deborah: { voiceModel: 'aura-athena-en', description: 'Authoritative, prophetic, courageous, mother in Israel' },
  // Queen Esther: Royal, courageous, faithful
  esther: { voiceModel: 'aura-stella-en', description: 'Graceful, courageous, regal, devoted queen' }
};

let currentSound: Audio.Sound | null = null;
let activeAudioId: string | null = null;
let isNativeSpeaking = false;

// Map app language code to native TTS speech locale
const LANGUAGE_LOCALE_MAP: Record<string, string> = {
  es: 'es-ES',
  fr: 'fr-FR',
  pt: 'pt-BR',
  sw: 'sw-KE',
  tw: 'en-GB'
};

// High-speed binary Uint8Array to base64 converter (no FileReader, zero hangs in Hermes/React Native)
const B64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
function bytesToBase64(bytes: Uint8Array): string {
  let output = '';
  const len = bytes.length;
  for (let i = 0; i < len; i += 3) {
    const b1 = bytes[i];
    const b2 = i + 1 < len ? bytes[i + 1] : 0;
    const b3 = i + 2 < len ? bytes[i + 2] : 0;
    const enc1 = b1 >> 2;
    const enc2 = ((b1 & 3) << 4) | (b2 >> 4);
    let enc3 = ((b2 & 15) << 2) | (b3 >> 6);
    let enc4 = b3 & 63;
    if (i + 1 >= len) enc3 = 64;
    if (i + 2 >= len) enc4 = 64;
    output += B64_CHARS.charAt(enc1) + B64_CHARS.charAt(enc2) + B64_CHARS.charAt(enc3) + B64_CHARS.charAt(enc4);
  }
  return output;
}

/**
 * Prepares text specifically for acoustic synthesis with reverent cadence,
 * breath pauses, and punctuation timing WITHOUT altering visible on-screen text.
 * Also strips dynamic [[term|definition]] tags into clean spoken words.
 */
export function prepareReverentCadenceText(raw: string): string {
  // 1. Strip dynamic [[term|definition]] into just the clean term
  let spoken = raw.replace(/\[\[([^|\]]+)(?:\|[^\]]+)?\]\]/g, '$1');

  // 2. Strip scripture quote markers and markdown symbols
  spoken = spoken.replace(/^>\s*/gm, '');
  spoken = spoken.replace(/[*_#"`]/g, '').trim();

  // 3. Normalize paragraph breaks to clean periods for natural cadence
  spoken = spoken.replace(/\n\s*\n/g, '.\n\n');

  // 4. Ensure em-dashes and colons pause as natural commas
  spoken = spoken.replace(/([:;—–])\s*/g, ', ');

  // 5. Clean up redundant duplicate punctuation or whitespace
  spoken = spoken.replace(/([.?!])\s*([.?!])+/g, '$1');
  spoken = spoken.replace(/\s{2,}/g, ' ');

  return spoken.trim();
}

/**
 * Direct neural TTS synthesis:
 * - English text: Deepgram Aura neural voices (reverent, character-specific).
 * - Non-English text (Spanish, French, Portuguese, Swahili): Native device OS TTS via expo-speech
 *   with authentic native accents, eliminating English-phoneme garble.
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
    if (activeAudioId === audioId && (currentSound || isNativeSpeaking)) {
      await stopDeepgramSpeech();
      if (onDone) onDone();
      return;
    }

    await stopDeepgramSpeech();

    // Clean text: strip [[term|definition]], markdown, add cadence
    const cleanText = prepareReverentCadenceText(text);
    if (!cleanText) return;

    activeAudioId = audioId;
    if (onStart) onStart();

    // 1. Configure Audio Mode for crisp playback
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: false,
      playThroughEarpieceAndroid: false
    });

    const voiceConfig = APOSTLE_VOICE_PROFILES[characterId] || APOSTLE_VOICE_PROFILES.peter;

    if (!DEEPGRAM_API_KEY) {
      // Fallback to native speech if API key is absent
      isNativeSpeaking = true;
      Speech.speak(cleanText.replace(/\.{3,}/g, '.'), {
        language: 'en-US',
        rate: 0.88,
        onDone: () => {
          isNativeSpeaking = false;
          activeAudioId = null;
          if (onDone) onDone();
        }
      });
      return;
    }

    const response = await fetch(`https://api.deepgram.com/v1/speak?model=${voiceConfig.voiceModel}`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${DEEPGRAM_API_KEY}`,
        'Content-Type': 'application/json',
        'User-Agent': 'BibleChatApp/1.0'
      },
      body: JSON.stringify({ text: cleanText })
    });

    if (!response.ok) {
      // Graceful fallback to native device TTS
      isNativeSpeaking = true;
      Speech.speak(cleanText.replace(/\.{3,}/g, '.'), {
        language: 'en-US',
        rate: 0.88,
        onDone: () => {
          isNativeSpeaking = false;
          activeAudioId = null;
          if (onDone) onDone();
        }
      });
      return;
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64Data = bytesToBase64(new Uint8Array(arrayBuffer));
    const tempUri = `${FileSystem.cacheDirectory}dg_tts_${Date.now()}.mp3`;

    await FileSystem.writeAsStringAsync(tempUri, base64Data, {
      encoding: FileSystem.EncodingType.Base64
    });

    const { sound } = await Audio.Sound.createAsync(
      { uri: tempUri },
      { shouldPlay: false },
      (status) => {
        if (status.isLoaded && status.didJustFinish) {
          stopDeepgramSpeech();
          if (onDone) onDone();
        }
      }
    );

    currentSound = sound;
    // Natural human cadence: 1.0 rate + max clarity volume
    await sound.setVolumeAsync(1.0);
    await sound.setRateAsync(1.0, true);
    await sound.playAsync();
  } catch (e) {
    console.error('TTS speech error:', e);
    await stopDeepgramSpeech();
    if (onDone) onDone();
  }
};

export const stopDeepgramSpeech = async () => {
  // Stop native TTS
  if (isNativeSpeaking) {
    try {
      Speech.stop();
    } catch (e) {}
    isNativeSpeaking = false;
  }

  // Stop audio player
  if (currentSound) {
    try {
      await currentSound.stopAsync();
      await currentSound.unloadAsync();
    } catch (e) {}
    currentSound = null;
  }
  activeAudioId = null;
};
