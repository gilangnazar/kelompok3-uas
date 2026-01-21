import React, { useMemo, useState } from 'react';
import {
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
import { Ionicons } from '@expo/vector-icons';
import AppModal from '../../components/AppModal';
import { API_URL } from '../../../config/api';

const API_BASE_URL = `${API_URL}/api`;

export default function RegisterScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalVariant, setModalVariant] = useState<'success' | 'error'>('success');

  const canSubmit = useMemo(() => {
    const ok =
      fullName.trim().length > 0 &&
      email.trim().length > 0 &&
      password.length >= 6 &&
      confirmPassword.length >= 6 &&
      password === confirmPassword;
    return ok;
  }, [fullName, email, password, confirmPassword]);

  const openModal = (variant: 'success' | 'error', title: string, message: string) => {
    setModalVariant(variant);
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
  };

  const onSignUp = async () => {
    if (!canSubmit) {
      openModal('error', 'Registration Failed', 'Please complete all fields and match passwords.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: fullName.trim(), email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        const message = data?.message ?? 'Registration failed.';
        openModal('error', 'Registration Failed', message);
        return;
      }

      openModal('success', 'Registration Success', 'Please login to continue.');
    } catch (err) {
      openModal('error', 'Registration Failed', 'Failed to connect to server.');
    } finally {
      setLoading(false);
    }
  };

  const handleModalConfirm = () => {
    setModalVisible(false);
    if (modalVariant === 'success') {
      router.replace('/screens/auth/LoginScreen');
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
            <View style={styles.heroHeader}>
              <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                <Ionicons name="arrow-back" size={24} color="#FFF" />
              </TouchableOpacity>
              <Text style={styles.heroTitle}>Sign Up</Text>
              <View style={styles.placeholderBtn} />
            </View>
          </View>

          <View style={styles.cardWrap}>
            <View style={styles.card}>
              <Field label='Full Name'>
                <TextInput
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder='Full Name'
                  placeholderTextColor='#9CA3AF'
                  style={styles.input}
                />
              </Field>

              <Field label='Email Address'>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder='yourname@example.com'
                  placeholderTextColor='#9CA3AF'
                  autoCapitalize='none'
                  keyboardType='email-address'
                  style={styles.input}
                />
              </Field>

              <Field label='Password'>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder='********'
                  placeholderTextColor='#9CA3AF'
                  secureTextEntry
                  style={styles.input}
                />
              </Field>

              <Field label='Confirm Password'>
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder='********'
                  placeholderTextColor='#9CA3AF'
                  secureTextEntry
                  style={styles.input}
                />
              </Field>

              <TouchableOpacity
                onPress={onSignUp}
                activeOpacity={0.9}
                disabled={loading}
                style={[styles.primaryBtn, !canSubmit && styles.primaryBtnDisabled]}
              >
                <Text style={styles.primaryBtnText}>Sign Up</Text>
              </TouchableOpacity>

              <View style={styles.bottomRow}>
                <Text style={styles.bottomText}>Have an Account? </Text>
                <TouchableOpacity onPress={() => router.replace('/screens/auth/LoginScreen')}>
                  <Text style={styles.bottomLink}>Login</Text>
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
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
    height: 220, 
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingTop: 120, // Increased to move header closer to card
    justifyContent: 'flex-start',
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  placeholderBtn: {
    width: 40,
  },

  cardWrap: { paddingHorizontal: 20, marginTop: -50 },
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
    fontWeight: '600' 
  },

  bottomRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
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