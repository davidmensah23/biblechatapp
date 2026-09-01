import React, { useState, useRef, useEffect } from 'react';
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
import {
  signInWithGoogle,
  signInWithApple,
  signInWithEmail,
  signUpWithEmail,
  verifyEmailOtp,
  sendPasswordReset,
  updateUserPassword,
  resendVerificationEmail
} from '../services/supabase';
import { MascotSpriteAnimator } from '../components/MascotSpriteAnimator';
import { FrameSequencePlayer } from '../components/FrameSequencePlayer';
import { MascotSequences } from '../services/mascotAssets';

interface AuthScreenProps {
  onAuthSuccess: () => void;
  onSkip: () => void;
}

type AuthViewMode =
  | 'main'
  | 'email_form'
  | 'otp_verify'
  | 'forgot_password'
  | 'new_password';

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
  const [viewMode, setViewMode] = useState<AuthViewMode>('main');
  const [isSignUp, setIsSignUp] = useState(true);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // 6-Digit OTP State
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [otpType, setOtpType] = useState<'signup' | 'recovery'>('signup');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Loading States
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);

  // Refs for 6 OTP input boxes
  const otpInputRefs = useRef<Array<TextInput | null>>([]);

  // Cooldown countdown timer for OTP resend
  useEffect(() => {
    let timer: any;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Google Sign In (Native Bottom Sheet + WebBrowser Fallback)
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

  // Apple Sign In (iOS Native Face ID Bottom Sheet)
  const handleAppleAuth = async () => {
    setAppleLoading(true);
    try {
      const { user, error } = await signInWithApple();
      if (error) {
        Alert.alert('Sign In Error', error.message || 'Apple sign in could not be completed.');
      } else if (user) {
        onAuthSuccess();
      }
    } catch (err: any) {
      Alert.alert('Sign In Error', err?.message || 'An unexpected error occurred.');
    } finally {
      setAppleLoading(false);
    }
  };

  // Submit Email Sign In / Sign Up
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
        } else if (session) {
          // Email confirmation disabled -> instant session
          onAuthSuccess();
        } else if (user) {
          // Verification code sent -> Switch to OTP Screen
          setOtpType('signup');
          setOtpDigits(['', '', '', '', '', '']);
          setResendCooldown(60);
          setViewMode('otp_verify');
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

  // Handle individual OTP digit change with auto-focus advancing
  const handleOtpDigitChange = (value: string, index: number) => {
    // Handle paste of full 6-digit code
    if (value.length > 1) {
      const cleanDigits = value.replace(/[^0-9]/g, '').slice(0, 6).split('');
      const newDigits = [...otpDigits];
      cleanDigits.forEach((digit, i) => {
        newDigits[i] = digit;
      });
      setOtpDigits(newDigits);

      if (cleanDigits.length === 6) {
        verifyOtpCode(newDigits.join(''));
      } else if (cleanDigits.length > 0) {
        otpInputRefs.current[Math.min(cleanDigits.length, 5)]?.focus();
      }
      return;
    }

    const newDigits = [...otpDigits];
    newDigits[index] = value;
    setOtpDigits(newDigits);

    // Auto-advance to next input
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    // Auto-submit if all 6 digits entered
    const completeCode = newDigits.join('');
    if (completeCode.length === 6 && !newDigits.includes('')) {
      verifyOtpCode(completeCode);
    }
  };

  // Handle Backspace on OTP
  const handleOtpKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Verify OTP with Supabase
  const verifyOtpCode = async (token: string) => {
    setLoading(true);
    try {
      const { session, user, error } = await verifyEmailOtp(email, token, otpType);
      if (error) {
        Alert.alert('Invalid Code', error.message || 'The verification code entered is invalid or expired.');
      } else if (otpType === 'recovery') {
        // Recovery OTP verified -> proceed to set new password
        setViewMode('new_password');
      } else if (session || user) {
        Alert.alert('Verified!', 'Your account has been confirmed.');
        onAuthSuccess();
      }
    } catch (err: any) {
      Alert.alert('Verification Error', err?.message || 'Could not verify code.');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP Code
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setLoading(true);
    try {
      if (otpType === 'recovery') {
        await sendPasswordReset(email);
      } else {
        await resendVerificationEmail(email);
      }
      setResendCooldown(60);
      Alert.alert('Code Resent', `A new 6-digit verification code has been sent to ${email}`);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to resend code.');
    } finally {
      setLoading(false);
    }
  };

  // Submit Password Recovery Request
  const handleSendRecovery = async () => {
    if (!email.trim()) {
      Alert.alert('Email Required', 'Please enter your registered email address.');
      return;
    }
    setLoading(true);
    try {
      const { error } = await sendPasswordReset(email);
      if (error) {
        Alert.alert('Error', error.message);
      } else {
        setOtpType('recovery');
        setOtpDigits(['', '', '', '', '', '']);
        setResendCooldown(60);
        setViewMode('otp_verify');
      }
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Could not send recovery email.');
    } finally {
      setLoading(false);
    }
  };

  // Submit New Password after Recovery
  const handleSaveNewPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      Alert.alert('Password Length', 'Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Mismatch', 'Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const { error } = await updateUserPassword(newPassword);
      if (error) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert('Password Updated', 'Your password has been reset successfully.');
        onAuthSuccess();
      }
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to update password.');
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
          {/* Top Bar with Navigation & Skip */}
          <View style={styles.topBar}>
            {viewMode !== 'main' ? (
              <TouchableOpacity
                onPress={() => {
                  if (viewMode === 'otp_verify' || viewMode === 'forgot_password') {
                    setViewMode('email_form');
                  } else if (viewMode === 'email_form') {
                    setViewMode('main');
                  } else {
                    setViewMode('main');
                  }
                }}
                activeOpacity={0.7}
                style={styles.backBtn}
              >
                <Ionicons name="arrow-back" size={20} color="#111111" />
              </TouchableOpacity>
            ) : (
              <View style={styles.brandIconWrap}>
                <View style={styles.brandDot} />
                <View style={[styles.brandDot, styles.brandDotMedium]} />
                <View style={[styles.brandDot, styles.brandDotSmall]} />
              </View>
            )}

            <TouchableOpacity onPress={onSkip} activeOpacity={0.7} style={styles.skipBtn}>
              <Text style={styles.skipText}>Skip for now</Text>
              <Ionicons name="chevron-forward" size={14} color="#666666" />
            </TouchableOpacity>
          </View>

          {/* ========================================================================= */}
          {/* 1. MAIN / DEFAULT AUTH VIEW (Medium Style) */}
          {/* ========================================================================= */}
          {viewMode === 'main' && (
            <>
              <View style={styles.headerBlock}>
                {/* 6-Frame Asynchronous Mascot Animation (Anticipation ➔ Staggered Acting ➔ Surprise ➔ Bliss) */}
                <View style={{ alignItems: 'center', marginBottom: 16 }}>
                  <FrameSequencePlayer frames={MascotSequences.group_async} fps={3} width={180} height={120} />
                </View>

                <Text style={styles.mainTitle}>
                  {isSignUp ? 'Join Akorno.' : 'Welcome back.'}
                </Text>
                <Text style={styles.mainSubtitle}>
                  {isSignUp
                    ? 'Discover ancient wisdom, walk in faith, and converse with the Apostles.'
                    : 'Sign in to access your saved reflections and conversations.'}
                </Text>
              </View>

              <View style={styles.authButtonsContainer}>
                {/* Google Sign In Button */}
                <TouchableOpacity
                  style={styles.pillButton}
                  onPress={handleGoogleAuth}
                  activeOpacity={0.85}
                  disabled={googleLoading || appleLoading || loading}
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

                {/* Apple Sign In Button (iOS Native Face ID / Touch ID Bottom Sheet) */}
                {Platform.OS === 'ios' && (
                  <TouchableOpacity
                    style={[styles.pillButton, { backgroundColor: '#000000', borderColor: '#000000' }]}
                    onPress={handleAppleAuth}
                    activeOpacity={0.85}
                    disabled={googleLoading || appleLoading || loading}
                  >
                    {appleLoading ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <Ionicons name="logo-apple" size={20} color="#FFFFFF" />
                        <Text style={[styles.pillButtonText, { color: '#FFFFFF' }]}>
                          {isSignUp ? 'Sign up with Apple' : 'Sign in with Apple'}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}

                {/* Email Sign In / Sign Up Button */}
                <TouchableOpacity
                  style={styles.pillButton}
                  onPress={() => setViewMode('email_form')}
                  activeOpacity={0.85}
                  disabled={googleLoading || loading}
                >
                  <Ionicons name="mail-outline" size={20} color="#111111" />
                  <Text style={styles.pillButtonText}>
                    {isSignUp ? 'Sign up with Email' : 'Sign in with Email'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Switcher between Sign In and Sign Up */}
              <View style={styles.toggleRow}>
                <Text style={styles.togglePrompt}>
                  {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                </Text>
                <TouchableOpacity
                  onPress={() => setIsSignUp(!isSignUp)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.toggleAction}>
                    {isSignUp ? 'Sign in.' : 'Sign up.'}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* ========================================================================= */}
          {/* 2. EMAIL FORM VIEW (Sign In / Sign Up) */}
          {/* ========================================================================= */}
          {viewMode === 'email_form' && (
            <View style={styles.formViewWrap}>
              <View style={styles.headerBlock}>
                <Text style={styles.mainTitle}>
                  {isSignUp ? 'Create account.' : 'Sign in.'}
                </Text>
                <Text style={styles.mainSubtitle}>
                  {isSignUp
                    ? 'Enter your details to receive your 6-digit verification code.'
                    : 'Enter your credentials to continue.'}
                </Text>
              </View>

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
                  <View style={styles.passwordLabelRow}>
                    <Text style={styles.inputLabel}>Password</Text>
                    {!isSignUp && (
                      <TouchableOpacity
                        onPress={() => setViewMode('forgot_password')}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.forgotPasswordLink}>Forgot password?</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  <TextInput
                    style={styles.inputField}
                    placeholder="••••••••"
                    placeholderTextColor="#999999"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                  />
                </View>

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
                      {isSignUp ? 'Continue' : 'Sign In'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>

              <View style={styles.toggleRow}>
                <Text style={styles.togglePrompt}>
                  {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                </Text>
                <TouchableOpacity
                  onPress={() => setIsSignUp(!isSignUp)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.toggleAction}>
                    {isSignUp ? 'Sign in.' : 'Sign up.'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* ========================================================================= */}
          {/* 3. 6-DIGIT OTP VERIFICATION VIEW */}
          {/* ========================================================================= */}
          {viewMode === 'otp_verify' && (
            <View style={styles.formViewWrap}>
              <View style={styles.headerBlock}>
                <Text style={styles.mainTitle}>Enter code.</Text>
                <Text style={styles.mainSubtitle}>
                  We sent a 6-digit verification code to{'\n'}
                  <Text style={styles.highlightEmail}>{email}</Text>
                </Text>
              </View>

              {/* 6 Individual Pin Input Boxes */}
              <View style={styles.otpBoxesRow}>
                {otpDigits.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => (otpInputRefs.current[index] = ref)}
                    style={[
                      styles.otpBox,
                      digit ? styles.otpBoxFilled : null
                    ]}
                    keyboardType="number-pad"
                    maxLength={1}
                    value={digit}
                    onChangeText={(val) => handleOtpDigitChange(val, index)}
                    onKeyPress={(e) => handleOtpKeyPress(e, index)}
                    autoFocus={index === 0}
                    selectTextOnFocus
                  />
                ))}
              </View>

              {/* Manual Submit Button (if needed) */}
              <TouchableOpacity
                style={[
                  styles.submitEmailBtn,
                  otpDigits.includes('') && styles.submitBtnDisabled
                ]}
                onPress={() => verifyOtpCode(otpDigits.join(''))}
                activeOpacity={0.85}
                disabled={loading || otpDigits.includes('')}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitEmailText}>Verify Code</Text>
                )}
              </TouchableOpacity>

              {/* Resend Code Section */}
              <View style={styles.resendRow}>
                <Text style={styles.resendPrompt}>Didn't receive the code? </Text>
                <TouchableOpacity
                  onPress={handleResendOtp}
                  disabled={resendCooldown > 0 || loading}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.resendLink,
                      resendCooldown > 0 && styles.resendLinkDisabled
                    ]}
                  >
                    {resendCooldown > 0
                      ? `Resend in ${resendCooldown}s`
                      : 'Resend Code'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* ========================================================================= */}
          {/* 4. FORGOT PASSWORD VIEW */}
          {/* ========================================================================= */}
          {viewMode === 'forgot_password' && (
            <View style={styles.formViewWrap}>
              <View style={styles.headerBlock}>
                <Text style={styles.mainTitle}>Reset password.</Text>
                <Text style={styles.mainSubtitle}>
                  Enter your registered email and we'll send you a 6-digit recovery code.
                </Text>
              </View>

              <View style={styles.emailFormCard}>
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
                    autoFocus
                  />
                </View>

                <TouchableOpacity
                  style={styles.submitEmailBtn}
                  onPress={handleSendRecovery}
                  activeOpacity={0.85}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.submitEmailText}>Send Recovery Code</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* ========================================================================= */}
          {/* 5. SET NEW PASSWORD VIEW */}
          {/* ========================================================================= */}
          {viewMode === 'new_password' && (
            <View style={styles.formViewWrap}>
              <View style={styles.headerBlock}>
                <Text style={styles.mainTitle}>New password.</Text>
                <Text style={styles.mainSubtitle}>
                  Choose a new, secure password for your account.
                </Text>
              </View>

              <View style={styles.emailFormCard}>
                <View style={styles.inputWrap}>
                  <Text style={styles.inputLabel}>New Password</Text>
                  <TextInput
                    style={styles.inputField}
                    placeholder="••••••••"
                    placeholderTextColor="#999999"
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry
                    autoFocus
                  />
                </View>

                <View style={styles.inputWrap}>
                  <Text style={styles.inputLabel}>Confirm New Password</Text>
                  <TextInput
                    style={styles.inputField}
                    placeholder="••••••••"
                    placeholderTextColor="#999999"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                  />
                </View>

                <TouchableOpacity
                  style={styles.submitEmailBtn}
                  onPress={handleSaveNewPassword}
                  activeOpacity={0.85}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.submitEmailText}>Save Password</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Footer Disclaimer */}
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
    marginBottom: 36,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
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
    marginBottom: 36,
  },
  mainTitle: {
    fontFamily: Typography.fontSerif,
    fontSize: 46,
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
    maxWidth: '88%',
  },
  highlightEmail: {
    fontFamily: Typography.fontSansSemiBold,
    color: '#111111',
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
  formViewWrap: {
    width: '100%',
  },
  emailFormCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 14,
    marginBottom: 24,
  },
  inputWrap: {
    gap: 5,
  },
  inputLabel: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 13,
    color: '#374151',
  },
  passwordLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  forgotPasswordLink: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 12.5,
    color: '#16A34A',
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
  submitBtnDisabled: {
    backgroundColor: '#9CA3AF',
  },
  submitEmailText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 15,
    color: '#FFFFFF',
  },
  otpBoxesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 24,
  },
  otpBox: {
    flex: 1,
    height: 54,
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    textAlign: 'center',
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 22,
    color: '#111111',
  },
  otpBoxFilled: {
    borderColor: '#111111',
    backgroundColor: '#FFFFFF',
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 24,
  },
  resendPrompt: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 13.5,
    color: '#6B7280',
  },
  resendLink: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 13.5,
    color: '#16A34A',
  },
  resendLinkDisabled: {
    color: '#9CA3AF',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
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
