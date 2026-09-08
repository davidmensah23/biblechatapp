export interface IdentityMemory {
  name?: string;
  preferredName?: string;
  lifeSeason?: string; // "new parent", "college student", "grieving", "career transition", etc.
}

export interface StudyStateMemory {
  currentBook?: string;
  currentChapter?: number;
  studyPlanId?: string;
  lastStudiedAt?: number;
  openQuestions?: string[]; // things the user said they would think about or revisit
}

export interface OngoingThread {
  id: string;
  topic: string; // e.g. "anxiety about job change"
  firstMentioned: number;
  lastMentioned: number;
  status: 'ongoing' | 'resolved' | 'faded';
  salience: number; // 0.0 to 1.0 (decays over time when unmentioned)
}

export interface PrayerRequestItem {
  id: string;
  request: string; // e.g. "healing for mom"
  created: number;
  lastFollowedUpAt?: number;
  followedUp: boolean;
  resolved: boolean;
}

export interface RelationalNote {
  id: string;
  person: string; // e.g. "dad", "Sarah", "pastor"
  context: string; // e.g. "strained relationship", "co-worker interested in faith"
  lastMentioned: number;
}

export interface CompanionProfile {
  userId: string;
  identity: IdentityMemory;
  studyState: StudyStateMemory;
  ongoingThreads: OngoingThread[];
  prayerJournal: PrayerRequestItem[];
  relationalNotes: RelationalNote[];
  updatedAt: number;
}

export interface VoiceTraits {
  sentenceRhythm: string;
  signatureMoves: string[];
  avoid: string[];
}

export interface ReferenceDomain {
  canReference: string[];
  cannotReference: string[];
}

export interface CharacterProfile {
  characterId: string;
  displayName: string;
  eraTitle: string;
  temperament: string[];
  voiceTraits: VoiceTraits;
  referenceDomain: ReferenceDomain;
  coreWoundAndGrace: string;
  openingLinesFirstMeeting: string[];
}
