import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router';
import { apiService } from '../../services/api';
import { sessionService } from '../../services/session';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password)
    {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!isValidEmail(email))
    {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);

    try
    {
      const response = await apiService.login(email, password);

      if (response.success && response.data)
      {
        await sessionService.saveSession(
          response.data.user_id,
          response.data.email,
          response.data.name
        );
        router.replace('/home');
      }
      else
      {
        Alert.alert('Error', response.error || 'Failed to sign in. Please check your credentials.');
      }
    }
    catch (error)
    {
      Alert.alert('Error', 'Failed to sign in. Please check your credentials.');
    }
    finally
    {
      setLoading(false);
    }
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignUp = () => {
    router.push('/pages/signup');
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.background}>
        {/* Decorative background elements */}
        <View style={styles.gradientTop} />
        <View style={styles.gradientBottom} />
        <View style={styles.floatingCircle1} />
        <View style={styles.floatingCircle2} />
        <View style={styles.floatingCircle3} />
        
        {/* Decorative dots */}
        <View style={styles.dot1} />
        <View style={styles.dot2} />
        <View style={styles.dot3} />
        <View style={styles.dot4} />
        
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
          <KeyboardAvoidingView 
            style={styles.keyboardAvoid}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.iconContainer}>
                  <Text style={styles.title}>♻️</Text>
                </View>
                <Text style={styles.appName}>Bottles Ping</Text>
                <Text style={styles.subtitle}>Log in to your account</Text>
              </View>

              {/* Form */}
              <View style={styles.form}>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Email Address"
                    placeholderTextColor="#64748b"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    editable={!loading}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor="#64748b"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    autoCapitalize="none"
                    editable={!loading}
                  />
                </View>

                <TouchableOpacity style={styles.forgotPassword}>
                  <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                  onPress={handleLogin}
                  disabled={loading}
                >
                  <Text style={styles.loginButtonText}>
                    {loading ? 'Logging In...' : 'Log In'}
                  </Text>
                </TouchableOpacity>

                <View style={styles.signUpContainer}>
                  <Text style={styles.signUpText}>Don't have an account? </Text>
                  <TouchableOpacity onPress={handleSignUp} disabled={loading}>
                    <Text style={styles.signUpLink}>Sign Up</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
    </>
  );
}



const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#0f172a',
    position: 'relative',
  },
  gradientTop: {
    position: 'absolute',
    top: -80,
    left: -80,
    right: -80,
    height: 350,
    backgroundColor: '#1e40af',
    opacity: 0.12,
    borderRadius: 175,
    transform: [{ scaleX: 1.5 }],
  },
  gradientBottom: {
    position: 'absolute',
    bottom: -100,
    left: -80,
    right: -80,
    height: 400,
    backgroundColor: '#059669',
    opacity: 0.1,
    borderRadius: 200,
    transform: [{ scaleX: 1.5 }],
  },
  floatingCircle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#10b981',
    opacity: 0.08,
    top: 100,
    right: -60,
  },
  floatingCircle2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#8b5cf6',
    opacity: 0.06,
    bottom: 200,
    left: -40,
  },
  floatingCircle3: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#fbbf24',
    opacity: 0.07,
    top: 300,
    right: 30,
  },
  dot1: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#34d399',
    opacity: 0.5,
    top: 150,
    left: 60,
  },
  dot2: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#a78bfa',
    opacity: 0.6,
    top: 250,
    right: 80,
  },
  dot3: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#fbbf24',
    opacity: 0.4,
    bottom: 300,
    left: 40,
  },
  dot4: {
    position: 'absolute',
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#60a5fa',
    opacity: 0.5,
    bottom: 150,
    right: 50,
  },
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    marginBottom: 16,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderRadius: 60,
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  title: {
    fontSize: 70,
    textShadowColor: 'rgba(16, 185, 129, 0.5)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 12,
  },
  appName: {
    fontSize: 36,
    fontWeight: '900',
    color: '#10b981',
    marginBottom: 8,
    textShadowColor: 'rgba(16, 185, 129, 0.5)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 8,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderWidth: 2,
    borderColor: 'rgba(148, 163, 184, 0.2)',
    borderRadius: 16,
    padding: 18,
    fontSize: 16,
    color: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
    marginTop: 8,
  },
  forgotPasswordText: {
    color: '#34d399',
    fontSize: 14,
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: '#10b981',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 2,
    borderColor: 'rgba(52, 211, 153, 0.3)',
  },
  loginButtonDisabled: {
    backgroundColor: '#64748b',
    shadowColor: '#000',
    borderColor: 'rgba(148, 163, 184, 0.2)',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  signUpText: {
    color: '#94a3b8',
    fontSize: 15,
  },
  signUpLink: {
    color: '#34d399',
    fontSize: 15,
    fontWeight: '700',
  },
});