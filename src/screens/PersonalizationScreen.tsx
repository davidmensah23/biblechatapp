import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  ScrollView,
  Animated as RNAnimated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../theme/typography';
import { ComprehensionLevel, UserProfile } from '../types';
import { fetchUserProfile, saveUserProfile } from '../services/database';
import { supabase, updateRemoteProfile } from '../services/supabase';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PersonalizationScreenProps {
  onComplete: () => void;
}

interface StepOption {
  id: string;
  label: string;
  subtitle?: string;
}

const AGE_OPTIONS: StepOption[] = [
  { id: 'under_18', label: 'Under 18' },
  { id: '18_24', label: '18 – 24' },
  { id: '25_34', label: '25 – 34' },
  { id: '35_50', label: '35 – 50' },
  { id: '50_plus', label: '50+' }
];

const GENDER_OPTIONS: StepOption[] = [
  { id: 'brother', label: 'Brother (Male)' },
  { id: 'sister', label: 'Sister (Female)' },
  { id: 'neutral', label: 'Prefer not to say' }
];

const CHURCH_ROLE_OPTIONS: StepOption[] = [
  { id: 'seeker', label: 'New to Faith / Curious Seeker', subtitle: 'Exploring Christianity and discovering Jesus' },
  { id: 'member', label: 'Everyday Believer / Church Member', subtitle: 'Attending church, reading scripture, growing in faith' },
  { id: 'leader', label: 'Small Group / Ministry Leader', subtitle: 'Serving others, leading Bible studies, or volunteering' },
  { id: 'pastor', label: 'Pastor / Teacher / Preacher', subtitle: 'Preaching God’s word and shepherding a congregation' },
  { id: 'questioning', label: 'Wrestling with Doubts', subtitle: 'Seeking honest answers to difficult theological questions' }
];

const COMPREHENSION_OPTIONS: StepOption[] = [
  {
    id: 'plain_simple',
    label: 'Plain & Simple',
    subtitle: 'Conversational and accessible. Explain big theological or archaic grammar words in plain English.'
  },
  {
    id: 'growing_believer',
    label: 'Everyday Believer',
    subtitle: 'Familiar with Scripture. Unpack 1st-century historical context and original roots when helpful.'
  },
  {
    id: 'deep_exegesis',
    label: 'Deep Exegesis / Scholar',
    subtitle: 'Unpack Greek & Hebrew syntax, Roman legal history, theology, and deep cross-references.'
  }
];

const TOTAL_STEPS = 5;

export const PersonalizationScreen: React.FC<PersonalizationScreenProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  // Form State
  const [firstName, setFirstName] = useState('');
  const [selectedAge, setSelectedAge] = useState<string | null>(null);
  const [selectedGender, setSelectedGender] = useState<'brother' | 'sister' | 'neutral'>('neutral');
  const [selectedChurchRole, setSelectedChurchRole] = useState<string | null>(null);
  const [selectedComprehension, setSelectedComprehension] = useState<ComprehensionLevel>('growing_believer');

  // Input ref for step 0 auto-focus
  const nameInputRef = useRef<TextInput>(null);

  // Animated progress line
  const progressAnim = useRef(new RNAnimated.Value(1 / TOTAL_STEPS)).current;

  useEffect(() => {
    // Preload profile if existing
    fetchUserProfile().then((p) => {
      if (p) {
        if (p.fullName && p.fullName !== 'Seeker') {
          setFirstName(p.fullName.split(' ')[0]);
        }
        if (p.gender) {
          setSelectedGender(p.gender as any);
        }
        if (p.churchRole) {
          setSelectedChurchRole(p.churchRole);
        }
        if (p.ageBracket) {
          setSelectedAge(p.ageBracket);
        }
        if (p.comprehensionLevel) {
          setSelectedComprehension(p.comprehensionLevel);
        }
      }
    });
  }, []);

  useEffect(() => {
    RNAnimated.timing(progressAnim, {
      toValue: (currentStep + 1) / TOTAL_STEPS,
      duration: 260,
      useNativeDriver: false
    }).start();

    if (currentStep === 0) {
      setTimeout(() => nameInputRef.current?.focus(), 300);
    }
  }, [currentStep]);

  const canContinue = (): boolean => {
    switch (currentStep) {
      case 0:
        return firstName.trim().length >= 1;
      case 1:
        return selectedAge !== null;
      case 2:
        return selectedGender !== null;
      case 3:
        return selectedChurchRole !== null;
      case 4:
        return selectedComprehension !== null;
      default:
        return false;
    }
  };

  const handleNext = async () => {
    if (!canContinue()) return;

    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Save completed profile
      const current = await fetchUserProfile();
      const cleanName = firstName.trim();
      const updatedProfile: UserProfile = {
        ...current,
        fullName: cleanName || current.fullName || 'Friend',
        ageBracket: selectedAge || '25_34',
        gender: selectedGender,
        churchRole: selectedChurchRole || 'member',
        comprehensionLevel: selectedComprehension,
        onboardingCompleted: true
      };
      await saveUserProfile(updatedProfile);

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.id) {
          await updateRemoteProfile(session.user.id, updatedProfile);
        }
      } catch (e) {
        console.warn('Personalization remote sync note:', e);
      }

      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%']
  });

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flexOne}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
      >
        {/* Top Header with Progress Bar and Back Chevron */}
        <View style={styles.topBar}>
          <View style={styles.backBtnWrap}>
            {currentStep > 0 ? (
              <TouchableOpacity onPress={handleBack} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                <Ionicons name="chevron-back" size={24} color="#111111" />
              </TouchableOpacity>
            ) : (
              <View style={{ width: 24 }} />
            )}
          </View>

          {/* Minimal Horizontal Progress Track */}
          <View style={styles.progressBarTrack}>
            <RNAnimated.View style={[styles.progressBarFill, { width: progressWidth }]} />
          </View>

          <View style={{ width: 24 }} />
        </View>

        {/* Dynamic Step Content */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* STEP 0: FIRST NAME */}
          {currentStep === 0 && (
            <View style={styles.stepContainer}>
              <Text style={styles.title}>What’s your first name?</Text>
              <View style={styles.inputWrap}>
                <TextInput
                  ref={nameInputRef}
                  style={styles.nameInput}
                  placeholder="First name"
                  placeholderTextColor="#C7C7CC"
                  value={firstName}
                  onChangeText={setFirstName}
                  autoCapitalize="words"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={handleNext}
                />
              </View>
            </View>
          )}

          {/* STEP 1: AGE */}
          {currentStep === 1 && (
            <View style={styles.stepContainer}>
              <Text style={styles.title}>How old are you?</Text>
              <Text style={styles.helperText}>Helps mentors tailor generational analogies.</Text>
              <View style={styles.optionsList}>
                {AGE_OPTIONS.map((opt) => {
                  const isSelected = selectedAge === opt.id;
                  return (
                    <TouchableOpacity
                      key={opt.id}
                      style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                      onPress={() => setSelectedAge(opt.id)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                        {opt.label}
                      </Text>
                      <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                        {isSelected && <View style={styles.radioDot} />}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* STEP 2: GENDER */}
          {currentStep === 2 && (
            <View style={styles.stepContainer}>
              <Text style={styles.title}>What is your gender?</Text>
              <Text style={styles.helperText}>Helps mentors address you with brotherly/sisterly care.</Text>
              <View style={styles.optionsList}>
                {GENDER_OPTIONS.map((opt) => {
                  const isSelected = selectedGender === opt.id;
                  return (
                    <TouchableOpacity
                      key={opt.id}
                      style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                      onPress={() => setSelectedGender(opt.id as any)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                        {opt.label}
                      </Text>
                      <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                        {isSelected && <View style={styles.radioDot} />}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* STEP 3: CHURCH ROLE / BACKGROUND */}
          {currentStep === 3 && (
            <View style={styles.stepContainer}>
              <Text style={styles.title}>What is your church background?</Text>
              <Text style={styles.helperText}>Select the description that best fits your season.</Text>
              <View style={styles.optionsList}>
                {CHURCH_ROLE_OPTIONS.map((opt) => {
                  const isSelected = selectedChurchRole === opt.id;
                  return (
                    <TouchableOpacity
                      key={opt.id}
                      style={[styles.optionCardRich, isSelected && styles.optionCardSelected]}
                      onPress={() => setSelectedChurchRole(opt.id)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.optionTextCol}>
                        <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                          {opt.label}
                        </Text>
                        {opt.subtitle && (
                          <Text style={[styles.optionSubtitle, isSelected && styles.optionSubtitleSelected]}>
                            {opt.subtitle}
                          </Text>
                        )}
                      </View>
                      <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                        {isSelected && <View style={styles.radioDot} />}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* STEP 4: COMPREHENSION LEVEL */}
          {currentStep === 4 && (
            <View style={styles.stepContainer}>
              <Text style={styles.title}>How deep do you like your study?</Text>
              <Text style={styles.helperText}>
                We will calibrate exegesis depth and vocabulary to your pace.
              </Text>
              <View style={styles.optionsList}>
                {COMPREHENSION_OPTIONS.map((opt) => {
                  const isSelected = selectedComprehension === opt.id;
                  return (
                    <TouchableOpacity
                      key={opt.id}
                      style={[styles.optionCardRich, isSelected && styles.optionCardSelected]}
                      onPress={() => setSelectedComprehension(opt.id as ComprehensionLevel)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.optionTextCol}>
                        <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                          {opt.label}
                        </Text>
                        {opt.subtitle && (
                          <Text style={[styles.optionSubtitle, isSelected && styles.optionSubtitleSelected]}>
                            {opt.subtitle}
                          </Text>
                        )}
                      </View>
                      <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                        {isSelected && <View style={styles.radioDot} />}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}
        </ScrollView>

        {/* Floating Continue Button */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={[styles.continueBtn, canContinue() ? styles.continueBtnActive : styles.continueBtnDisabled]}
            onPress={handleNext}
            disabled={!canContinue()}
            activeOpacity={0.85}
          >
            <Text style={[styles.continueBtnText, canContinue() ? styles.continueBtnTextActive : styles.continueBtnTextDisabled]}>
              {currentStep === TOTAL_STEPS - 1 ? 'Enter Bible Chat' : 'Continue'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  flexOne: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  backBtnWrap: {
    width: 24,
    alignItems: 'flex-start',
  },
  progressBarTrack: {
    width: 140,
    height: 3,
    backgroundColor: '#EBEBEB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#111111',
    borderRadius: 2,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 40,
  },
  stepContainer: {
    width: '100%',
    alignItems: 'center',
  },
  title: {
    fontFamily: Typography.fontSerif,
    fontSize: 32,
    color: '#111111',
    textAlign: 'center',
    lineHeight: 40,
    marginBottom: 8,
  },
  helperText: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 20,
    paddingHorizontal: 12,
  },
  inputWrap: {
    width: '100%',
    alignItems: 'center',
    marginTop: 40,
  },
  nameInput: {
    fontFamily: Typography.fontSerif,
    fontSize: 34,
    color: '#111111',
    textAlign: 'center',
    width: '100%',
    paddingVertical: 12,
  },
  optionsList: {
    width: '100%',
    gap: 12,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#EFEFEF',
    backgroundColor: '#FFFFFF',
  },
  optionCardRich: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#EFEFEF',
    backgroundColor: '#FFFFFF',
  },
  optionCardSelected: {
    borderColor: '#111111',
    backgroundColor: '#FAFAFA',
  },
  optionTextCol: {
    flex: 1,
    marginRight: 14,
  },
  optionLabel: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 16,
    color: '#111111',
  },
  optionLabelSelected: {
    color: '#111111',
    fontWeight: '600',
  },
  optionSubtitle: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 12.5,
    color: '#8E8E93',
    marginTop: 4,
    lineHeight: 17,
  },
  optionSubtitleSelected: {
    color: '#555555',
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#D1D1D6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: '#111111',
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#111111',
  },
  bottomBar: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 24 : 20,
    paddingTop: 12,
    backgroundColor: '#FFFFFF',
  },
  continueBtn: {
    width: '100%',
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueBtnActive: {
    backgroundColor: '#111111',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  continueBtnDisabled: {
    backgroundColor: '#F3F4F6',
  },
  continueBtnText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 15.5,
    letterSpacing: 0.2,
  },
  continueBtnTextActive: {
    color: '#FFFFFF',
  },
  continueBtnTextDisabled: {
    color: '#9CA3AF',
  },
});
