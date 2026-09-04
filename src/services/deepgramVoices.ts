import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

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
  narrator: { voiceModel: 'aura-orion-en', description: 'Reverent, articulate, majestic' }
};

let currentSound: Audio.Sound | null = null;
let activeAudioId: string | null = null;

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
 */
export function prepareReverentCadenceText(raw: string): string {
  let spoken = raw.replace(/[*_#"`]/g, '').trim();

  // 1. Give deep breath pauses between major sections/paragraphs
  spoken = spoken.replace(/\n\s*\n/g, '. ... \n\n');

  // 2. Ensure pauses after sentence-ending punctuation so thoughts don't collide
  spoken = spoken.replace(/([.!?])\s+/g, '$1 ... ');

  // 3. Ensure natural pauses after semicolons, colons, and em-dashes
  spoken = spoken.replace(/([:;—–])\s*/g, ', ... ');

  // 4. Add natural breathing pause after common prayer/transition invocations
  spoken = spoken.replace(/\b(Peace be with you|Grace and peace|Good morning|Good evening|Hello|Beloved|Lord Jesus|Father God|In Jesus' name|Amen|First, let us hear|Now, let us join|Receive this blessing)\b/gi, '$1, ... ');

  // 5. Clean up redundant duplicate ellipses or whitespace
  spoken = spoken.replace(/(\.{3,}\s*){2,}/g, '... ');
  spoken = spoken.replace(/\s{2,}/g, ' ');

  return spoken.trim();
}

/**
 * Direct, low-latency neural TTS synthesis via Deepgram Aura with reverent pacing
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
    // Acoustic synthesis text with breath pauses (on-screen text is never modified)
    const cleanText = prepareReverentCadenceText(text);
    if (!cleanText) return;

    if (onStart) onStart();
    activeAudioId = audioId;

    // Configure Audio Mode for crisp, loud, immersive playback
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: false,
      playThroughEarpieceAndroid: false
    });

    if (!DEEPGRAM_API_KEY) {
      console.warn('DEEPGRAM_API_KEY not configured');
      if (onDone) onDone();
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
      console.warn('Deepgram TTS response not ok:', response.status);
      if (onDone) onDone();
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
    // Reverent, unhurried spiritual delivery: 0.85 rate + max clarity volume
    await sound.setVolumeAsync(1.0);
    await sound.setRateAsync(0.85, true);
    await sound.playAsync();
  } catch (e) {
    console.error('Deepgram play error:', e);
    await stopDeepgramSpeech();
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
