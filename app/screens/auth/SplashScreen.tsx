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

    const checkSession = async () => {
      try {
        const token = await AsyncStorage.getItem('token');

        if (!token) {
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

          if (isMounted) {
            router.replace('/screens/auth/LoginScreen');
          }
          return;
        }

        const user = await res.json();
        await AsyncStorage.setItem('user', JSON.stringify(user));

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
