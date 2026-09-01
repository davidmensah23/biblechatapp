let Speech: any = null;
try {
  Speech = require('expo-speech');
} catch (e) {
  console.log('expo-speech module not yet linked in local runtime, using fallback');
}

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
    stopApostleSpeech();
    if (onDone) onDone();
    return;
  }

  stopApostleSpeech();

  if (!Speech || !Speech.speak) {
    if (onStart) onStart();
    setTimeout(() => {
      if (onDone) onDone();
    }, 2000);
    return;
  }

  isSpeakingGlobal = true;
  currentSpeakingId = messageId;
  if (onStart) onStart();

  const pitch = apostleId === 'john' ? 0.95 : apostleId === 'peter' ? 1.05 : 1.0;
  const rate = apostleId === 'john' ? 0.9 : apostleId === 'peter' ? 1.05 : 0.95;

  Speech.speak(text, {
    language: 'en-US',
    pitch: pitch,
    rate: rate,
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
};

export const stopApostleSpeech = () => {
  if (Speech && Speech.stop) {
    try {
      Speech.stop();
    } catch (e) {}
  }
  isSpeakingGlobal = false;
  currentSpeakingId = null;
};
