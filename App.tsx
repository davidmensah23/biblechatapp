import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, StatusBar, Dimensions, BackHandler, ToastAndroid, Platform, Modal } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold
} from '@expo-google-fonts/poppins';
import {
  Merriweather_300Light,
  Merriweather_400Regular,
  Merriweather_700Bold,
  Merriweather_900Black,
  Merriweather_300Light_Italic,
  Merriweather_400Regular_Italic,
  Merriweather_700Bold_Italic,
  Merriweather_900Black_Italic
} from '@expo-google-fonts/merriweather';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { AuthScreen } from './src/screens/AuthScreen';
import { PersonalizationScreen } from './src/screens/PersonalizationScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { ChatListScreen } from './src/screens/ChatListScreen';
import { ChatDetailScreen } from './src/screens/ChatDetailScreen';
import { GroupChatDetailScreen } from './src/screens/GroupChatDetailScreen';
import { BibleReaderScreen } from './src/screens/BibleReaderScreen';
import { CommunityScreen } from './src/screens/CommunityScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { YouVersionProvider } from './src/components/youversion';
import { FloatingNavBar, NavTabType } from './src/components/FloatingNavBar';
import { CircularRevealTransition } from './src/components/CircularRevealTransition';
import { ApostlePersona } from './src/types';
import { APOSTLE_PERSONAS } from './src/services/personas';
import { GroupCouncilThread } from './src/types/groupChat';
import { getDB, saveUserProfile, fetchUserProfile, migrateGuestDataToUser, clearLocalUserSession } from './src/services/database';
import { clearReadingProgressSession } from './src/services/readingProgressService';
import { UserProfile } from './src/types';
import {
  supabase,
  fetchRemoteProfile,
  signOutUser,
  handleAuthDeepLink,
  setHasCompletedOnboarding,
  getHasCompletedOnboarding,
  splitEmailToName
} from './src/services/supabase';
import { initializePushNotifications } from './src/services/pushNotificationService';
import * as Linking from 'expo-linking';
import { PrivacyOnboardingModal } from './src/components/PrivacyOnboardingModal';
import { initReferralsTable, extractReferralFromUrl, claimReferralCode } from './src/services/referralsService';

import { ScreenTransition } from './src/components/ScreenTransition';
import { GlobalAlertModal } from './src/components/GlobalAlertModal';
import { installAlertInterceptor } from './src/services/alertService';

// Automatically routes all Alert.alert() calls to our custom branded modal
installAlertInterceptor();

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type AppStage = 'onboarding' | 'auth' | 'profile_setup' | 'main' | 'checking';

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    'InstrumentSerif-Bold': require('./assets/fonts/InstrumentSerif-Bold.ttf'),
    'InstrumentSerif-Regular': require('./assets/fonts/InstrumentSerif-Regular.ttf'),
    'InstrumentSerif-Italic': require('./assets/fonts/InstrumentSerif-Italic.ttf'),
    Merriweather_300Light,
    Merriweather_400Regular,
    Merriweather_700Bold,
    Merriweather_900Black,
    Merriweather_300Light_Italic,
    Merriweather_400Regular_Italic,
    Merriweather_700Bold_Italic,
    Merriweather_900Black_Italic,
    // Aliases to ensure ALL legacy serif references everywhere instantly render in Merriweather
    'UntitledSerif-Regular': Merriweather_400Regular,
    'UntitledSerif-Bold': Merriweather_700Bold,
    'UntitledSerif-Italic': Merriweather_400Regular_Italic,
    'Literata_400Regular': Merriweather_400Regular,
    'Literata_500Medium': Merriweather_400Regular,
    'Literata_600SemiBold': Merriweather_700Bold,
    'Literata_700Bold': Merriweather_700Bold,
    'Literata_400Regular_Italic': Merriweather_400Regular_Italic,
    'Lora_400Regular': Merriweather_400Regular,
    'Lora_600SemiBold': Merriweather_700Bold,
    'Lora_700Bold': Merriweather_700Bold,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold
  });

  const [appStage, setAppStage] = useState<AppStage>('checking');
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [isRevealing, setIsRevealing] = useState<boolean>(false);
  const [revealCoords, setRevealCoords] = useState<{ x: number; y: number }>({
    x: SCREEN_WIDTH * 0.8,
    y: SCREEN_HEIGHT * 0.9
  });

  const [activeNavTab, setActiveNavTab] = useState<NavTabType>('home');
  const [currentView, setCurrentView] = useState<'main' | 'chat' | 'groupChat'>('main');
  const [selectedApostle, setSelectedApostle] = useState<ApostlePersona | null>(null);
  const [selectedGroupCouncil, setSelectedGroupCouncil] = useState<GroupCouncilThread | null>(null);
  const [bibleInitialTarget, setBibleInitialTarget] = useState<{ book?: string; chapter?: number } | undefined>(undefined);
  const [chatInitialMessage, setChatInitialMessage] = useState<string | undefined>(undefined);
  const [chatContextQuote, setChatContextQuote] = useState<{ text: string; reference: string } | undefined>(undefined);
  const [chatMinistryObjective, setChatMinistryObjective] = useState<'sermon_prep' | 'small_group' | 'personal_reflection' | 'seeker_explore' | undefined>(undefined);
  const [communityInitialSegment, setCommunityInitialSegment] = useState<'community' | 'my_prayers'>('community');
  const [forceRender, setForceRender] = useState<boolean>(false);
  const [isNavBarVisible, setIsNavBarVisible] = useState<boolean>(true);
  const [showPrivacyNotice, setShowPrivacyNotice] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    fetchUserProfile().then(p => {
      if (p) setUserProfile(p);
    });
  }, [activeNavTab]);

  // Determine whether the user needs to complete the personalization questionnaire
  const checkNeedsPersonalization = async (userId?: string): Promise<boolean> => {
    const hasCompleted = await getHasCompletedOnboarding();
    if (hasCompleted) return false;

    if (userId) {
      const remote = await fetchRemoteProfile(userId);
      if (remote?.onboardingCompleted || (remote?.ageBracket && remote?.comprehensionLevel)) {
        await setHasCompletedOnboarding(true);
        return false;
      }
    }

    const local = await fetchUserProfile();
    if (local?.onboardingCompleted || (local?.ageBracket && local?.comprehensionLevel && local.fullName !== 'Seeker')) {
      await setHasCompletedOnboarding(true);
      return false;
    }

    return true;
  };

  useEffect(() => {
    let isMounted = true;

    // Initialize Database, Push Notifications & Referral System
    getDB().catch(console.error);
    initializePushNotifications().catch(console.error);
    initReferralsTable().catch(console.error);

    // Handle deep links when app opens from 1-click email confirmation, OAuth, or Friend Invites
    const processDeepLink = (url: string) => {
      handleAuthDeepLink(url);
      const refCode = extractReferralFromUrl(url);
      if (refCode) {
        claimReferralCode(refCode).catch(console.warn);
      }
    };

    Linking.getInitialURL().then((url) => {
      if (url) processDeepLink(url);
    });

    const linkSubscription = Linking.addEventListener('url', (event) => {
      if (event.url) processDeepLink(event.url);
    });

    // Check existing Supabase session or persistent user state
    const verifyUserSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          migrateGuestDataToUser(session.user.id);
          const remoteProfile = await fetchRemoteProfile(session.user.id);
          if (remoteProfile) {
            await saveUserProfile(remoteProfile);
          }

          const needsPersonalization = await checkNeedsPersonalization(session.user.id);
          if (isMounted) {
            setAppStage(needsPersonalization ? 'profile_setup' : 'main');
          }
          return;
        }

        const needsPersonalization = await checkNeedsPersonalization();
        if (!needsPersonalization) {
          if (isMounted) setAppStage('main');
          return;
        }

        if (isMounted) setAppStage('onboarding');
      } catch (e) {
        console.warn('verifyUserSession error:', e);
        if (isMounted) setAppStage('onboarding');
      }
    };

    verifyUserSession();

    // Listen to Supabase auth events (e.g. Google, Apple, or Email sign-in)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setShowAuthModal(false);
        migrateGuestDataToUser(session.user.id);

        const meta = session.user.user_metadata;
        const authFullName = meta?.full_name || meta?.name || meta?.given_name || (session.user.email ? splitEmailToName(session.user.email) : '');
        const authAvatar = meta?.avatar_url || meta?.picture;

        const remote = await fetchRemoteProfile(session.user.id);
        if (remote) {
          await saveUserProfile(remote);
        } else if (authFullName || authAvatar) {
          const cur = await fetchUserProfile();
          await saveUserProfile({
            ...cur,
            fullName: authFullName || cur.fullName,
            avatarUrl: authAvatar || cur.avatarUrl,
            email: session.user.email || cur.email
          });
        }

        const needsPersonalization = await checkNeedsPersonalization(session.user.id);
        if (isMounted) {
          if (needsPersonalization) {
            setAppStage('profile_setup');
          } else {
            setAppStage('main');
          }
        }
      }
    });

    // Timeout safety to ensure the screen is never stuck blank
    const timer = setTimeout(() => {
      setForceRender(true);
    }, 600);

    return () => {
      isMounted = false;
      linkSubscription.remove();
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  const lastBackPressRef = useRef<number>(0);

  // Comprehensive Android Hardware Back Button & State Navigation Manager
  useEffect(() => {
    const onBackPress = () => {
      // 1. If Privacy Notice modal is open -> Close it
      if (showPrivacyNotice) {
        setShowPrivacyNotice(false);
        return true;
      }

      // 2. If Auth modal is open -> Close it
      if (showAuthModal) {
        setShowAuthModal(false);
        return true;
      }

      // 3. If in 1-on-1 Chat or Group Council -> Return to previous screen
      if (currentView === 'chat' || currentView === 'groupChat') {
        setCurrentView('main');
        return true;
      }

      // 4. If on another tab (chats, bible, profile) -> Return to Home tab
      if (appStage === 'main' && activeNavTab !== 'home') {
        setActiveNavTab('home');
        return true;
      }

      // 5. If on Auth screen -> Return to Onboarding
      if (appStage === 'auth') {
        setAppStage('onboarding');
        return true;
      }

      // 5b. If on Profile Setup screen -> Return to Auth
      if (appStage === 'profile_setup') {
        setAppStage('auth');
        return true;
      }

      // 6. If on Home root screen -> Press twice to exit gracefully
      if (appStage === 'main' && activeNavTab === 'home' && currentView === 'main') {
        const now = Date.now();
        if (now - lastBackPressRef.current < 2000) {
          BackHandler.exitApp();
          return true;
        }
        lastBackPressRef.current = now;
        if (Platform.OS === 'android') {
          ToastAndroid.show('Press back again to exit', ToastAndroid.SHORT);
        }
        return true;
      }

      return false;
    };

    const backHandlerSubscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => backHandlerSubscription.remove();
  }, [showPrivacyNotice, showAuthModal, currentView, activeNavTab, appStage]);

  const handleStartTransition = (originX?: number, originY?: number) => {
    if (originX && originY) {
      setRevealCoords({ x: originX, y: originY });
    }
    setIsRevealing(true);
  };

  const handleRevealFinished = () => {
    setIsRevealing(false);
    setAppStage('auth');
  };

  const handleLogout = async () => {
    await clearLocalUserSession();
    await clearReadingProgressSession();
    await signOutUser();
    setUserProfile(null);
    setAppStage('auth');
    setActiveNavTab('home');
    setCurrentView('main');
  };

  // If fonts are still loading or session check in progress, show a dark container
  if ((!fontsLoaded && !fontError && !forceRender) || appStage === 'checking') {
    return (
      <View style={styles.darkBackground}>
        <StatusBar barStyle="light-content" backgroundColor="#0B0B0B" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <YouVersionProvider appKey={process.env.EXPO_PUBLIC_YOUVERSION_APP_KEY || 'vTLO6ybbDqjJHgaMCPemruLzH0o9GpIrZmfyEow7eVoF5fyp'}>
        {/* 1. Onboarding Screen */}
        {appStage === 'onboarding' ? (
          <View style={styles.flexOne}>
          <StatusBar barStyle="light-content" backgroundColor="#0B0B0B" />
          <OnboardingScreen onComplete={handleStartTransition} />

          {/* Circular Ellipse Expanding Reveal Overlay with real AuthScreen clipped inside */}
          {isRevealing && (
            <CircularRevealTransition
              originX={revealCoords.x}
              originY={revealCoords.y}
              onFinished={handleRevealFinished}
            >
              <AuthScreen
                onAuthSuccess={async () => {
                  const needs = await checkNeedsPersonalization();
                  setAppStage(needs ? 'profile_setup' : 'main');
                }}
                onSkip={() => {
                  setAppStage('profile_setup');
                }}
              />
            </CircularRevealTransition>
          )}
        </View>
      ) : appStage === 'auth' ? (
        /* 2. Medium-Style Auth Screen */
        <ScreenTransition transitionKey="auth">
          <View style={styles.flexOne}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            <AuthScreen
              onAuthSuccess={async () => {
                const needs = await checkNeedsPersonalization();
                setAppStage(needs ? 'profile_setup' : 'main');
              }}
              onSkip={() => {
                setAppStage('profile_setup');
              }}
            />
          </View>
        </ScreenTransition>
      ) : appStage === 'profile_setup' ? (
        /* 2b. Minimalist Plain-Screen Personalization Questionnaire */
        <ScreenTransition transitionKey="profile_setup">
          <View style={styles.flexOne}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            <PersonalizationScreen
              onComplete={async () => {
                await setHasCompletedOnboarding(true);
                const p = await fetchUserProfile();
                if (p) setUserProfile(p);
                setAppStage('main');
                setShowPrivacyNotice(true);
              }}
            />
          </View>
        </ScreenTransition>
      ) : currentView === 'chat' && selectedApostle ? (
        /* 3. Chat Detail View */
        <ScreenTransition transitionKey={`chat_${selectedApostle.id}`} type="push">
          <View style={styles.flexOne}>
            <StatusBar barStyle="dark-content" backgroundColor="#F6F6F6" />
            <ChatDetailScreen
              apostle={selectedApostle}
              initialMessage={chatInitialMessage}
              onBack={() => {
                setCurrentView('main');
                setChatInitialMessage(undefined);
              }}
            />
          </View>
        </ScreenTransition>
      ) : currentView === 'groupChat' && selectedGroupCouncil ? (
        /* 3b. Group Council Detail View */
        <ScreenTransition transitionKey={`group_${selectedGroupCouncil.id}`} type="push">
          <View style={styles.flexOne}>
            <StatusBar barStyle="dark-content" backgroundColor="#FAF9F6" />
            <GroupChatDetailScreen
              thread={selectedGroupCouncil}
              onBack={() => setCurrentView('main')}
            />
          </View>
        </ScreenTransition>
      ) : (
        /* 4. Main App (Home / Chats / Bible / Profile) with 4-Tab Floating Nav Bar */
        <View style={styles.mainContainer}>
          <StatusBar barStyle="dark-content" backgroundColor="#F6F6F6" />

          {/* Smooth Screen Transition across Tabs */}
          <ScreenTransition transitionKey={activeNavTab} type="tab">
            {activeNavTab === 'home' && (
              <HomeScreen
                onSelectApostle={(apostle, initialMessage, contextQuote, ministryObjective) => {
                  setSelectedApostle(apostle);
                  setChatInitialMessage(initialMessage);
                  setChatContextQuote(contextQuote);
                  setChatMinistryObjective(ministryObjective);
                  setCurrentView('chat');
                }}
                onOpenBible={(book, chapter) => {
                  if (book && chapter) {
                    setBibleInitialTarget({ book, chapter });
                  }
                  setActiveNavTab('bible');
                }}
              />
            )}

            {activeNavTab === 'chats' && (
              <ChatListScreen
                onSelectConversation={(apostle, initialMessage) => {
                  setSelectedApostle(apostle);
                  setChatInitialMessage(initialMessage);
                  setCurrentView('chat');
                }}
                onSelectGroupCouncil={(thread) => {
                  setSelectedGroupCouncil(thread);
                  setCurrentView('groupChat');
                }}
                onBack={() => setActiveNavTab('home')}
                onSetNavBarVisible={setIsNavBarVisible}
              />
            )}

            {activeNavTab === 'bible' && (
              <BibleReaderScreen
                initialBook={bibleInitialTarget?.book}
                initialChapter={bibleInitialTarget?.chapter}
                onAskApostleWithVerse={(verseText, citation, apostle) => {
                  const targetApostle = apostle || APOSTLE_PERSONAS[0];
                  setSelectedApostle(targetApostle);
                  setChatInitialMessage(`Peace be with you, ${targetApostle.name}. I am reflecting on ${citation} and would value your biblical counsel and prayer.`);
                  setChatContextQuote({ text: verseText, reference: citation });
                  setCurrentView('chat');
                }}
                onSetNavBarVisible={setIsNavBarVisible}
              />
            )}

            {activeNavTab === 'community' && (
              <CommunityScreen initialSegment={communityInitialSegment} />
            )}

            {activeNavTab === 'profile' && (
              <ProfileScreen
                onLogout={handleLogout}
                onOpenAuthModal={() => setShowAuthModal(true)}
                onSelectApostle={() => setActiveNavTab('home')}
                onOpenBible={() => setActiveNavTab('bible')}
                onOpenCommunityPrayers={(seg) => {
                  setCommunityInitialSegment(seg || 'my_prayers');
                  setActiveNavTab('community');
                }}
                onOpenCommunityPosts={() => {
                  setCommunityInitialSegment('community');
                  setActiveNavTab('community');
                }}
              />
            )}
          </ScreenTransition>

          {/* Floating Bottom Nav Bar */}
          <FloatingNavBar
            activeTab={activeNavTab}
            onTabChange={(tab) => {
              setIsNavBarVisible(true);
              setActiveNavTab(tab);
            }}
            visible={isNavBarVisible}
            userInitial={userProfile?.fullName?.charAt(0) || 'D'}
            avatarUrl={userProfile?.avatarUrl}
          />

          {/* Auth Modal for Guests upgrading from Profile */}
          <Modal
            visible={showAuthModal}
            animationType="slide"
            transparent={false}
            onRequestClose={() => setShowAuthModal(false)}
          >
            <View style={styles.flexOne}>
              <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
              <AuthScreen
                onAuthSuccess={async () => {
                  setShowAuthModal(false);
                  const needs = await checkNeedsPersonalization();
                  if (needs) {
                    setAppStage('profile_setup');
                  }
                }}
                onSkip={() => setShowAuthModal(false)}
              />
            </View>
          </Modal>

          {/* Post-Onboarding Sacred Privacy Modal */}
          <PrivacyOnboardingModal
            visible={showPrivacyNotice}
            onDismiss={() => setShowPrivacyNotice(false)}
          />
        </View>
      )}

      {/* Universal Custom Alert & Action Sheet Modal */}
      <GlobalAlertModal />
      </YouVersionProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  flexOne: {
    flex: 1,
  },
  darkBackground: {
    flex: 1,
    backgroundColor: '#0B0B0B',
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#F6F6F6',
  }
});
