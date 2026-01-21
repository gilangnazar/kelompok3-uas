import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppModal from '../../components/AppModal';
import BottomNavigator from '../../components/navigation/BottomNavigator';

export default function InstructorDashboard() {
  const router = useRouter();
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [userName, setUserName] = useState('instructor');

  useEffect(() => {
    let isMounted = true;
    AsyncStorage.getItem('user').then(userRaw => {
      if (!isMounted) return;
      const user = userRaw ? JSON.parse(userRaw) : null;
      setUserName(user?.name ?? 'instructor');
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSignOut = async () => {
    await AsyncStorage.multiRemove(['token', 'user']);
    setConfirmVisible(false);
    router.replace('/screens/auth/LoginScreen');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hi, {userName}</Text>
      <TouchableOpacity style={styles.button} onPress={() => setConfirmVisible(true)}>
        <Text style={styles.buttonText}>Sign Out</Text>
      </TouchableOpacity>

      <AppModal
        visible={confirmVisible}
        title='Konfirmasi Keluar'
        message='Yakin ingin sign out?'
        variant='confirm'
        showCancel
        confirmText='Sign Out'
        onConfirm={handleSignOut}
        onCancel={() => setConfirmVisible(false)}
      />

      <BottomNavigator
        activeKey='home'
        items={[
          { key: 'home', label: 'Home', icon: 'home' },
          { key: 'courses', label: 'Courses', icon: 'book' },
          { key: 'discussion', label: 'Discussion', icon: 'chatbubbles' },
          { key: 'profile', label: 'Profile', icon: 'person' }
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f7fb'
  },
  title: {
    fontSize: 22,
    color: '#1d2a39',
    marginBottom: 16
  },
  button: {
    backgroundColor: '#0b4fb3',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 10
  },
  buttonText: {
    color: '#fff'
  }
});
