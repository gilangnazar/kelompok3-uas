import React, { useEffect } from 'react';
import { ActivityIndicator, Image, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../../config/api';

const API_BASE_URL = `${API_URL}/api`;

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    const minSplashMs = 1500;
    const startTime = Date.now();

    const waitForMinimumSplash = async () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, minSplashMs - elapsed);
      if (remaining === 0) return;
      await new Promise(resolve => setTimeout(resolve, remaining));
    };

    const checkSession = async () => {
      try {
        const token = await AsyncStorage.getItem('token');

        if (!token) {
          await waitForMinimumSplash();
          if (isMounted) {
            router.replace('/screens/auth/LoginScreen');
          }
          return;
        }

        const res = await fetch(`${API_BASE_URL}/auth/me`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        });

        if (!res.ok) {
          await AsyncStorage.multiRemove(['token', 'user']);

          await waitForMinimumSplash();
          if (isMounted) {
            router.replace('/screens/auth/LoginScreen');
          }
          return;
        }

        const user = await res.json();
        await AsyncStorage.setItem('user', JSON.stringify(user));

        await waitForMinimumSplash();
        if (!isMounted) return;

        if (user?.role === 'instructor') {
          router.replace('/screens/instructor/InstructorDashboard');
          return;
        }

        if (user?.role === 'student') {
          router.replace('/screens/student/StudentDashboard');
          return;
        }

        router.replace('/screens/auth/LoginScreen');
      } catch (err) {
        if (isMounted) {
          await AsyncStorage.multiRemove(['token', 'user']);
          await waitForMinimumSplash();
          router.replace('/screens/auth/LoginScreen');
        }
      }
    };

    checkSession();

    return () => {
      isMounted = false;
    };
  }, [router]);

  return (
    <View style={styles.container}>
      <Image
        source={require('../../../assets/images/logo.png')}
        style={styles.logo}
        resizeMode='contain'
      />
      <ActivityIndicator style={styles.loader} color='#ffffff' />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0b1d3a'
  },
  logo: {
    width: 180,
    height: 180
  },
  loader: {
    marginTop: 16
  }
});
