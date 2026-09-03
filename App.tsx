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
  Literata_400Regular,
  Literata_500Medium,
  Literata_600SemiBold,
  Literata_700Bold,
  Literata_400Regular_Italic
} from '@expo-google-fonts/literata';
import {
  Lora_400Regular,
  Lora_600SemiBold,
  Lora_700Bold
} from '@expo-google-fonts/lora';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { AuthScreen } from './src/screens/AuthScreen';
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
import { GroupCouncilThread } from './src/types/groupChat';
import { getDB, saveUserProfile, migrateGuestDataToUser } from './src/services/database';
import {
  supabase,
  fetchRemoteProfile,
  signOutUser,
  handleAuthDeepLink,
  setHasCompletedOnboarding,
  getHasCompletedOnboarding
} from './src/services/supabase';
import { initializePushNotifications } from './src/services/pushNotificationService';
import * as Linking from 'expo-linking';
import { PrivacyOnboardingModal } from './src/components/PrivacyOnboardingModal';
import { initReferralsTable, extractReferralFromUrl, claimReferralCode } from './src/services/referralsService';

import { ScreenTransition } from './src/components/ScreenTransition';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type AppStage = 'onboarding' | 'auth' | 'main' | 'checking';

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    'InstrumentSerif-Bold': require('./assets/fonts/InstrumentSerif-Bold.ttf'),
    'InstrumentSerif-Regular': require('./assets/fonts/InstrumentSerif-Regular.ttf'),
    'InstrumentSerif-Italic': require('./assets/fonts/InstrumentSerif-Italic.ttf'),
    'UntitledSerif-Regular': require('./assets/fonts/UntitledSerif-Regular.ttf'),
    'UntitledSerif-Bold': require('./assets/fonts/UntitledSerif-Bold.ttf'),
    'UntitledSerif-Italic': require('./assets/fonts/UntitledSerif-Italic.ttf'),
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Literata_400Regular,
    Literata_500Medium,
    Literata_600SemiBold,
    Literata_700Bold,
    Literata_400Regular_Italic,
    Lora_400Regular,
    Lora_600SemiBold,
    Lora_700Bold
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
  const [chatInitialMessage, setChatInitialMessage] = useState<string | undefined>(undefined);
  const [forceRender, setForceRender] = useState<boolean>(false);
  const [showPrivacyNotice, setShowPrivacyNotice] = useState<boolean>(false);

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
          if (isMounted) setAppStage('main');
          await setHasCompletedOnboarding(true);
          migrateGuestDataToUser(session.user.id);
          fetchRemoteProfile(session.user.id).then((profile) => {
            if (profile) saveUserProfile(profile);
          });
          return;
        }

        const hasCompleted = await getHasCompletedOnboarding();
        if (hasCompleted) {
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

    // Listen to Supabase auth events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setAppStage('main');
        setShowAuthModal(false);
        setHasCompletedOnboarding(true);
        migrateGuestDataToUser(session.user.id);
        fetchRemoteProfile(session.user.id).then((profile) => {
          if (profile) saveUserProfile(profile);
        });
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
    await signOutUser();
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
                onAuthSuccess={() => {
                  setHasCompletedOnboarding(true);
                  setAppStage('main');
                  setShowPrivacyNotice(true);
                }}
                onSkip={() => {
                  setHasCompletedOnboarding(true);
                  setAppStage('main');
                  setShowPrivacyNotice(true);
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
              onAuthSuccess={() => {
                setHasCompletedOnboarding(true);
                setAppStage('main');
                setShowPrivacyNotice(true);
              }}
              onSkip={() => {
                setHasCompletedOnboarding(true);
                setAppStage('main');
                setShowPrivacyNotice(true);
              }}
            />
          </View>
        </ScreenTransition>
      ) : currentView === 'chat' && selectedApostle ? (
        /* 3. Chat Detail View */
        <ScreenTransition transitionKey={`chat_${selectedApostle.id}`}>
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
        <ScreenTransition transitionKey={`group_${selectedGroupCouncil.id}`}>
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
          <ScreenTransition transitionKey={activeNavTab}>
            {activeNavTab === 'home' && (
              <HomeScreen
                onSelectApostle={(apostle) => {
                  setSelectedApostle(apostle);
                  setChatInitialMessage(undefined);
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
              />
            )}

            {activeNavTab === 'bible' && (
              <BibleReaderScreen
                initialBook={bibleInitialTarget?.book}
                initialChapter={bibleInitialTarget?.chapter}
              />
            )}

            {activeNavTab === 'community' && <CommunityScreen />}

            {activeNavTab === 'profile' && (
              <ProfileScreen
                onLogout={handleLogout}
                onOpenAuthModal={() => setShowAuthModal(true)}
                onSelectApostle={() => setActiveNavTab('home')}
                onOpenBible={() => setActiveNavTab('bible')}
              />
            )}
          </ScreenTransition>

          {/* Floating Bottom Nav Bar */}
          <FloatingNavBar
            activeTab={activeNavTab}
            onTabChange={(tab) => setActiveNavTab(tab)}
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
                onAuthSuccess={() => {
                  setHasCompletedOnboarding(true);
                  setShowAuthModal(false);
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
