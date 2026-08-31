import React, { useState, useEffect } from 'react';
import { View, StyleSheet, StatusBar, Dimensions } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold
} from '@expo-google-fonts/poppins';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { AuthScreen } from './src/screens/AuthScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { ChatListScreen } from './src/screens/ChatListScreen';
import { ChatDetailScreen } from './src/screens/ChatDetailScreen';
import { BibleReaderScreen } from './src/screens/BibleReaderScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { FloatingNavBar, NavTabType } from './src/components/FloatingNavBar';
import { CircularRevealTransition } from './src/components/CircularRevealTransition';
import { ApostlePersona } from './src/types';
import { getDB, saveUserProfile } from './src/services/database';
import { supabase, fetchRemoteProfile, signOutUser, handleAuthDeepLink } from './src/services/supabase';
import * as Linking from 'expo-linking';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type AppStage = 'onboarding' | 'auth' | 'main';

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    'InstrumentSerif-Bold': require('./assets/fonts/InstrumentSerif-Bold.ttf'),
    'InstrumentSerif-Regular': require('./assets/fonts/InstrumentSerif-Regular.ttf'),
    'InstrumentSerif-Italic': require('./assets/fonts/InstrumentSerif-Italic.ttf'),
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold
  });

  const [appStage, setAppStage] = useState<AppStage>('onboarding');
  const [isRevealing, setIsRevealing] = useState<boolean>(false);
  const [revealCoords, setRevealCoords] = useState<{ x: number; y: number }>({
    x: SCREEN_WIDTH * 0.8,
    y: SCREEN_HEIGHT * 0.9
  });

  const [activeNavTab, setActiveNavTab] = useState<NavTabType>('home');
  const [currentView, setCurrentView] = useState<'main' | 'chat'>('main');
  const [selectedApostle, setSelectedApostle] = useState<ApostlePersona | null>(null);
  const [forceRender, setForceRender] = useState<boolean>(false);

  useEffect(() => {
    // Initialize Database
    getDB().catch(console.error);

    // Handle deep links when app opens from 1-click email confirmation or OAuth redirect
    Linking.getInitialURL().then((url) => {
      if (url) handleAuthDeepLink(url);
    });

    const linkSubscription = Linking.addEventListener('url', (event) => {
      if (event.url) handleAuthDeepLink(event.url);
    });

    // Check existing Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setAppStage('main');
        fetchRemoteProfile(session.user.id).then((profile) => {
          if (profile) saveUserProfile(profile);
        });
      }
    });

    // Listen to Supabase auth events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setAppStage('main');
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
      linkSubscription.remove();
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

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

  // If fonts are still loading and timeout hasn't fired yet, show a dark container
  if (!fontsLoaded && !fontError && !forceRender) {
    return (
      <View style={styles.darkBackground}>
        <StatusBar barStyle="light-content" backgroundColor="#0B0B0B" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      {/* 1. Onboarding Screen */}
      {appStage === 'onboarding' ? (
        <View style={styles.flexOne}>
          <StatusBar barStyle="light-content" backgroundColor="#0B0B0B" />
          <OnboardingScreen onComplete={handleStartTransition} />

          {/* Circular Ellipse Expanding Reveal Overlay */}
          {isRevealing && (
            <CircularRevealTransition
              originX={revealCoords.x}
              originY={revealCoords.y}
              onFinished={handleRevealFinished}
            />
          )}
        </View>
      ) : appStage === 'auth' ? (
        /* 2. Medium-Style Auth Screen */
        <View style={styles.flexOne}>
          <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
          <AuthScreen
            onAuthSuccess={() => setAppStage('main')}
            onSkip={() => setAppStage('main')}
          />
        </View>
      ) : currentView === 'chat' && selectedApostle ? (
        /* 3. Chat Detail View */
        <View style={styles.flexOne}>
          <StatusBar barStyle="dark-content" backgroundColor="#F6F6F6" />
          <ChatDetailScreen
            apostle={selectedApostle}
            onBack={() => setCurrentView('main')}
          />
        </View>
      ) : (
        /* 4. Main App (Home / Chats / Bible / Profile) with 4-Tab Floating Nav Bar */
        <View style={styles.mainContainer}>
          <StatusBar barStyle="dark-content" backgroundColor="#F6F6F6" />

          {activeNavTab === 'home' && (
            <HomeScreen
              onSelectApostle={(apostle) => {
                setSelectedApostle(apostle);
                setCurrentView('chat');
              }}
            />
          )}

          {activeNavTab === 'chats' && (
            <ChatListScreen
              onSelectConversation={(apostle) => {
                setSelectedApostle(apostle);
                setCurrentView('chat');
              }}
              onBack={() => setActiveNavTab('home')}
            />
          )}

          {activeNavTab === 'bible' && <BibleReaderScreen />}

          {activeNavTab === 'profile' && (
            <ProfileScreen onLogout={handleLogout} />
          )}

          {/* Floating Bottom Nav Bar */}
          <FloatingNavBar
            activeTab={activeNavTab}
            onTabChange={(tab) => setActiveNavTab(tab)}
          />
        </View>
      )}
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
