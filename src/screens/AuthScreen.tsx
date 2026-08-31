import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../theme/typography';
import { signInWithGoogle, signInWithEmail, signUpWithEmail } from '../services/supabase';

interface AuthScreenProps {
  onAuthSuccess: () => void;
  onSkip: () => void;
}

// Pixel-perfect Official Google Multi-Color Logo
const GoogleIcon: React.FC<{ size?: number }> = ({ size = 22 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <Path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <Path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      fill="#FBBC05"
    />
    <Path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      fill="#EA4335"
    />
  </Svg>
);

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthSuccess, onSkip }) => {
  const [isSignUp, setIsSignUp] = useState(true);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Handle Google OAuth Sign In
  const handleGoogleAuth = async () => {
    setGoogleLoading(true);
    try {
      const { user, error } = await signInWithGoogle();
      if (error) {
        Alert.alert('Sign In Error', error.message || 'Google sign in could not be completed.');
      } else if (user) {
        onAuthSuccess();
      }
    } catch (err: any) {
      Alert.alert('Sign In Error', err?.message || 'An unexpected error occurred.');
    } finally {
      setGoogleLoading(false);
    }
  };

  // Handle Email / Password Sign In or Sign Up
  const handleEmailAuth = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Required Fields', 'Please enter your email and password.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Password Length', 'Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        const { user, session, error } = await signUpWithEmail(email, password, fullName);
        if (error) {
          Alert.alert('Sign Up Error', error.message);
        } else if (session || user) {
          Alert.alert('Welcome!', 'Account created successfully.');
          onAuthSuccess();
        } else {
          Alert.alert('Check your email', 'A confirmation link has been sent to your email.');
          onAuthSuccess();
        }
      } else {
        const { user, error } = await signInWithEmail(email, password);
        if (error) {
          Alert.alert('Sign In Error', error.message);
        } else if (user) {
          onAuthSuccess();
        }
      }
    } catch (err: any) {
      Alert.alert('Authentication Error', err?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top Bar with Skip Button */}
          <View style={styles.topBar}>
            <View style={styles.brandIconWrap}>
              <View style={styles.brandDot} />
              <View style={[styles.brandDot, styles.brandDotMedium]} />
              <View style={[styles.brandDot, styles.brandDotSmall]} />
            </View>

            <TouchableOpacity onPress={onSkip} activeOpacity={0.7} style={styles.skipBtn}>
              <Text style={styles.skipText}>Skip for now</Text>
              <Ionicons name="chevron-forward" size={14} color="#666666" />
            </TouchableOpacity>
          </View>

          {/* Main Hero Title (Medium style Serif) */}
          <View style={styles.headerBlock}>
            <Text style={styles.mainTitle}>
              {isSignUp ? 'Join Akorno.' : 'Welcome back.'}
            </Text>
            <Text style={styles.mainSubtitle}>
              {isSignUp
                ? 'Discover ancient wisdom, walk in faith, and converse with the Apostles.'
                : 'Sign in to access your saved reflections and conversations.'}
            </Text>
          </View>

          {/* Main Auth Buttons */}
          <View style={styles.authButtonsContainer}>
            {/* Google Sign In Button */}
            <TouchableOpacity
              style={styles.pillButton}
              onPress={handleGoogleAuth}
              activeOpacity={0.85}
              disabled={googleLoading || loading}
            >
              {googleLoading ? (
                <ActivityIndicator size="small" color="#111111" />
              ) : (
                <>
                  <GoogleIcon size={20} />
                  <Text style={styles.pillButtonText}>
                    {isSignUp ? 'Sign up with Google' : 'Sign in with Google'}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {/* Email Form Expand / Collapse Button */}
            {!showEmailForm ? (
              <TouchableOpacity
                style={styles.pillButton}
                onPress={() => setShowEmailForm(true)}
                activeOpacity={0.85}
                disabled={googleLoading || loading}
              >
                <Ionicons name="mail-outline" size={20} color="#111111" />
                <Text style={styles.pillButtonText}>
                  {isSignUp ? 'Sign up with Email' : 'Sign in with Email'}
                </Text>
              </TouchableOpacity>
            ) : (
              /* Inline Email Form */
              <View style={styles.emailFormCard}>
                {isSignUp && (
                  <View style={styles.inputWrap}>
                    <Text style={styles.inputLabel}>Full Name</Text>
                    <TextInput
                      style={styles.inputField}
                      placeholder="e.g. Samuel Adjei"
                      placeholderTextColor="#999999"
                      value={fullName}
                      onChangeText={setFullName}
                      autoCapitalize="words"
                    />
                  </View>
                )}

                <View style={styles.inputWrap}>
                  <Text style={styles.inputLabel}>Email Address</Text>
                  <TextInput
                    style={styles.inputField}
                    placeholder="name@example.com"
                    placeholderTextColor="#999999"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputWrap}>
                  <Text style={styles.inputLabel}>Password</Text>
                  <TextInput
                    style={styles.inputField}
                    placeholder="••••••••"
                    placeholderTextColor="#999999"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                  />
                </View>

                {/* Submit Email Button */}
                <TouchableOpacity
                  style={styles.submitEmailBtn}
                  onPress={handleEmailAuth}
                  activeOpacity={0.85}
                  disabled={loading || googleLoading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.submitEmailText}>
                      {isSignUp ? 'Create Account' : 'Sign In'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Toggle between Sign Up and Sign In */}
          <View style={styles.toggleRow}>
            <Text style={styles.togglePrompt}>
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setIsSignUp(!isSignUp);
                setShowEmailForm(false);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.toggleAction}>
                {isSignUp ? 'Sign in.' : 'Sign up.'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Medium-style Terms and Privacy Disclaimer */}
          <View style={styles.footerDisclaimer}>
            <Text style={styles.disclaimerText}>
              By signing up, you agree to our{' '}
              <Text style={styles.disclaimerLink}>Terms of Service</Text> and acknowledge
              that our <Text style={styles.disclaimerLink}>Privacy Policy</Text> applies to you.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 28,
    paddingTop: 16,
    paddingBottom: 40,
    minHeight: '100%',
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  brandIconWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  brandDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#111111',
  },
  brandDotMedium: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#444444',
  },
  brandDotSmall: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#888888',
  },
  skipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
  },
  skipText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 13,
    color: '#4B5563',
    marginRight: 2,
  },
  headerBlock: {
    alignItems: 'center',
    marginBottom: 44,
  },
  mainTitle: {
    fontFamily: Typography.fontSerif,
    fontSize: 48,
    color: '#111111',
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 10,
  },
  mainSubtitle: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 14.5,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: '85%',
  },
  authButtonsContainer: {
    gap: 16,
    marginBottom: 32,
  },
  pillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.2,
    borderColor: '#111111',
    borderRadius: 30,
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  pillButtonText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 15.5,
    color: '#111111',
  },
  emailFormCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 14,
  },
  inputWrap: {
    gap: 5,
  },
  inputLabel: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 13,
    color: '#374151',
  },
  inputField: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: Typography.fontSansRegular,
    fontSize: 14.5,
    color: '#111111',
  },
  submitEmailBtn: {
    backgroundColor: '#111111',
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  submitEmailText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 15,
    color: '#FFFFFF',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  togglePrompt: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 14,
    color: '#6B7280',
  },
  toggleAction: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 14,
    color: '#16A34A',
  },
  footerDisclaimer: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  disclaimerText: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 12.5,
    lineHeight: 18,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  disclaimerLink: {
    color: '#16A34A',
    textDecorationLine: 'underline',
  },
});
