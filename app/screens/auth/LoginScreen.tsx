import React, { useMemo, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppModal from '../../components/AppModal';
import { API_URL } from '../../../config/api';

const API_BASE_URL = `${API_URL}/api`;

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalVariant, setModalVariant] = useState<'success' | 'error'>('success');

  const canSubmit = useMemo(() => {
    return email.trim().length > 0 && password.trim().length >= 6;
  }, [email, password]);

  const openModal = (variant: 'success' | 'error', title: string, message: string) => {
    setModalVariant(variant);
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
  };

  const onLogin = async () => {
    if (!canSubmit) {
      openModal('error', 'Login Failed', 'Please enter email and password (min 6 characters).');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        const message = data?.message ?? 'Login failed.';
        openModal('error', 'Login Failed', message);
        return;
      }

      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));

      openModal('success', 'Login Success', 'Welcome back!');
    } catch (err) {
      openModal('error', 'Login Failed', 'Failed to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  const handleModalConfirm = () => {
    setModalVisible(false);

    if (modalVariant === 'success') {
      AsyncStorage.getItem('user').then(userRaw => {
        const user = userRaw ? JSON.parse(userRaw) : null;
        if (user?.role === 'instructor') {
          router.replace('/screens/instructor/InstructorDashboard');
        } else {
          router.replace('/screens/student/StudentDashboard');
        }
      });
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle='light-content' />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps='handled'>
          <View style={styles.hero}>
            <View style={styles.logoBox}>
              <Image
                source={require('../../../assets/images/logo.png')}
                style={styles.logo}
                resizeMode='contain'
              />
            </View>
          </View>

          <View style={styles.cardWrap}>
            <View style={styles.card}>
              <Text style={styles.title}>Login</Text>

              <View style={styles.field}>
                <Text style={styles.label}>Email Address</Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder='yourname@example.com'
                  placeholderTextColor='#9CA3AF'
                  autoCapitalize='none'
                  keyboardType='email-address'
                  style={styles.input}
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder='********'
                  placeholderTextColor='#9CA3AF'
                  secureTextEntry
                  style={styles.input}
                />
              </View>

              <TouchableOpacity
                onPress={onLogin}
                activeOpacity={0.9}
                disabled={loading}
                style={[styles.primaryBtn, !canSubmit && styles.primaryBtnDisabled]}
              >
                <Text style={styles.primaryBtnText}>Login</Text>
              </TouchableOpacity>

              <View style={styles.bottomRow}>
                <Text style={styles.bottomText}>Don't Have Any Account? </Text>
                <TouchableOpacity onPress={() => router.push('/screens/auth/RegisterScreen')}>
                  <Text style={styles.bottomLink}>Sign Up</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.bgBlob} />
        </ScrollView>
      </KeyboardAvoidingView>

      <AppModal
        visible={modalVisible}
        title={modalTitle}
        message={modalMessage}
        variant={modalVariant}
        onConfirm={handleModalConfirm}
      />
    </SafeAreaView>
  );
}

const BLUE = '#0A4FBF';
const BLUE_DARK = '#083F98';
const CARD_BG = '#FFFFFF';
const PAGE_BG = '#F3F4F6';

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safe: { flex: 1, backgroundColor: PAGE_BG },
  scroll: { flexGrow: 1, paddingBottom: 28 },

  hero: {
    backgroundColor: BLUE,
    height: 240, // Increased from 170 to move content down
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingTop: 20,
  },
  logoBox: {
    width: 100,
    height: 100,
    borderRadius: 14,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center'
  },
  logo: {
    width: 100,
    height: 100
  },

  cardWrap: {
    paddingHorizontal: 20,
    marginTop: -50
  },
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingTop: 24,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8
  },

  title: {
    textAlign: 'center',
    fontSize: 26,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 20
  },

  field: { marginBottom: 16 },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8
  },
  input: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#FFFFFF'
  },

  primaryBtn: {
    marginTop: 10,
    height: 52,
    borderRadius: 12,
    backgroundColor: BLUE,
    justifyContent: 'center',
    alignItems: 'center'
  },
  primaryBtnDisabled: {
    backgroundColor: BLUE_DARK,
    opacity: 0.55
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2
  },

  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20
  },
  bottomText: { color: '#6B7280', fontSize: 13 },
  bottomLink: { color: BLUE, fontSize: 13, fontWeight: 'bold' },

  bgBlob: {
    position: 'absolute',
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: '#9CC2FF',
    opacity: 0.45,
    alignSelf: 'center',
    top: 100,
    zIndex: -1
  }
});