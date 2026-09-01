import { playDeepgramSpeech, stopDeepgramSpeech } from './deepgramVoices';

let Speech: any = null;
try {
  Speech = require('expo-speech');
} catch (e) {}

let isSpeakingGlobal = false;
let currentSpeakingId: string | null = null;

export const speakApostleMessage = async (
  messageId: string,
  text: string,
  apostleId: string,
  onStart?: () => void,
  onDone?: () => void
): Promise<void> => {
  if (currentSpeakingId === messageId && isSpeakingGlobal) {
    await stopApostleSpeech();
    if (onDone) onDone();
    return;
  }

  await stopApostleSpeech();
  isSpeakingGlobal = true;
  currentSpeakingId = messageId;
  if (onStart) onStart();

  try {
    // 1. Primary: High-Fidelity Deepgram Aura Character Voice
    await playDeepgramSpeech(
      messageId,
      text,
      apostleId,
      () => {
        if (onStart) onStart();
      },
      () => {
        isSpeakingGlobal = false;
        currentSpeakingId = null;
        if (onDone) onDone();
      }
    );
  } catch (e) {
    console.warn('Deepgram TTS failed, using fallback TTS:', e);

    // 2. Fallback: On-Device Speech
    if (Speech && Speech.speak) {
      Speech.speak(text, {
        language: 'en-US',
        onDone: () => {
          isSpeakingGlobal = false;
          currentSpeakingId = null;
          if (onDone) onDone();
        },
        onStopped: () => {
          isSpeakingGlobal = false;
          currentSpeakingId = null;
          if (onDone) onDone();
        },
        onError: () => {
          isSpeakingGlobal = false;
          currentSpeakingId = null;
          if (onDone) onDone();
        }
      });
    } else {
      setTimeout(() => {
        isSpeakingGlobal = false;
        currentSpeakingId = null;
        if (onDone) onDone();
      }, 3000);
    }
  }
};

export const stopApostleSpeech = async () => {
  await stopDeepgramSpeech();
  if (Speech && Speech.stop) {
    try {
      Speech.stop();
    } catch (e) {}
  }
  isSpeakingGlobal = false;
  currentSpeakingId = null;
};
