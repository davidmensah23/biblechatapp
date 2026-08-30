import React, { useState, useEffect } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold
} from '@expo-google-fonts/poppins';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { ChatListScreen } from './src/screens/ChatListScreen';
import { ChatDetailScreen } from './src/screens/ChatDetailScreen';
import { BibleReaderScreen } from './src/screens/BibleReaderScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { FloatingNavBar } from './src/components/FloatingNavBar';
import { ApostlePersona } from './src/types';
import { getDB } from './src/services/database';

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    'InstrumentSerif-Regular': require('./assets/fonts/InstrumentSerif-Regular.ttf'),
    'InstrumentSerif-Italic': require('./assets/fonts/InstrumentSerif-Italic.ttf'),
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold
  });

  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(false);
  const [activeNavTab, setActiveNavTab] = useState<'home' | 'bible' | 'profile'>('home');
  const [currentView, setCurrentView] = useState<'main' | 'chatList' | 'chat'>('main');
  const [selectedApostle, setSelectedApostle] = useState<ApostlePersona | null>(null);
  const [forceRender, setForceRender] = useState<boolean>(false);

  useEffect(() => {
    // Initialize Database
    getDB().catch(console.error);

    // Timeout safety to ensure the screen is never stuck blank
    const timer = setTimeout(() => {
      setForceRender(true);
    }, 600);

    return () => clearTimeout(timer);
  }, []);

  // If fonts are still loading and timeout hasn't fired yet, show a dark container
  if (!fontsLoaded && !fontError && !forceRender) {
    return (
      <View style={styles.darkBackground}>
        <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      {/* 1. Onboarding Flow */}
      {!hasCompletedOnboarding ? (
        <>
          <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />
          <OnboardingScreen onComplete={() => setHasCompletedOnboarding(true)} />
        </>
      ) : currentView === 'chat' && selectedApostle ? (
        /* 2. Chat Detail View */
        <>
          <StatusBar barStyle="dark-content" backgroundColor="#F6F6F6" />
          <ChatDetailScreen
            apostle={selectedApostle}
            onBack={() => setCurrentView('main')}
          />
        </>
      ) : currentView === 'chatList' ? (
        /* 3. Chat List View */
        <>
          <StatusBar barStyle="dark-content" backgroundColor="#F6F6F6" />
          <ChatListScreen
            onSelectConversation={(apostle) => {
              setSelectedApostle(apostle);
              setCurrentView('chat');
            }}
            onBack={() => setCurrentView('main')}
          />
        </>
      ) : (
        /* 4. Main App (Home / Bible / Profile) with Floating Nav Bar */
        <View style={styles.mainContainer}>
          <StatusBar barStyle="dark-content" backgroundColor="#F6F6F6" />

          {activeNavTab === 'home' && (
            <HomeScreen
              onSelectApostle={(apostle) => {
                setSelectedApostle(apostle);
                setCurrentView('chat');
              }}
              onOpenChatList={() => setCurrentView('chatList')}
            />
          )}

          {activeNavTab === 'bible' && <BibleReaderScreen />}

          {activeNavTab === 'profile' && <ProfileScreen />}

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
  darkBackground: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#F6F6F6',
  }
});
