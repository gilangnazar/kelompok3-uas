import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  StatusBar,
  Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import BottomNavigator from '../../components/navigation/BottomNavigator';
import AppModal from '../../components/AppModal';

const { width } = Dimensions.get('window');
const COLORS = {
  primary: '#083d7f',
  background: '#F9FAFB',
  cardBg: '#FFFFFF',
  textMain: '#111827',
  textSecondary: '#4B5563',
  danger: '#EF4444',
  border: '#E5E7EB'
};

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);
  const [confirmVisible, setConfirmVisible] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('user').then(userRaw => {
      if (userRaw) {
        setUser(JSON.parse(userRaw));
      }
    });
  }, []);

  const handleSignOut = async () => {
    await AsyncStorage.multiRemove(['token', 'user']);
    setConfirmVisible(false);
    router.replace('/screens/auth/LoginScreen');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Profile</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.content}>
          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>
                {user ? getInitials(user.name) : '??'}
              </Text>
            </View>
            
            <Text style={styles.userName}>{user?.name || 'Loading...'}</Text>
            <Text style={styles.userRole}>{user?.role || 'Student'}</Text>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Ionicons name="mail-outline" size={20} color={COLORS.textSecondary} />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Email Address</Text>
                <Text style={styles.infoValue}>{user?.email || '-'}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="shield-checkmark-outline" size={20} color={COLORS.textSecondary} />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Account Status</Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>Active</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Settings / Actions */}
          <View style={styles.actionSection}>
            <Text style={styles.sectionTitle}>Settings</Text>
            
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="lock-closed-outline" size={20} color={COLORS.textMain} />
              <Text style={styles.actionText}>Change Password</Text>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, styles.logoutButton]} 
              onPress={() => setConfirmVisible(true)}
            >
              <Ionicons name="log-out-outline" size={20} color={COLORS.danger} />
              <Text style={[styles.actionText, { color: COLORS.danger }]}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <BottomNavigator
        activeKey='profile'
        items={[
          { 
            key: 'home', 
            label: 'Home', 
            icon: 'home', 
            onPress: () => router.replace('/screens/student/StudentDashboard') 
          },
          { key: 'courses', label: 'Courses', icon: 'book' },
          { key: 'discussion', label: 'Discussion', icon: 'chatbubbles' },
          { 
            key: 'profile', 
            label: 'Profile', 
            icon: 'person',
            onPress: () => {} // Already here
          }
        ]}
      />

      <AppModal
        visible={confirmVisible}
        title='Sign Out'
        message='Are you sure you want to sign out?'
        variant='confirm'
        showCancel
        confirmText='Sign Out'
        onConfirm={handleSignOut}
        onCancel={() => setConfirmVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    height: 180,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 40,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  content: {
    paddingHorizontal: 20,
    marginTop: -60,
  },
  profileCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 24,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E0E7FF', // Light Indigo
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.primary,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textMain,
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textTransform: 'capitalize',
    marginBottom: 20,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  infoTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMain,
  },
  statusBadge: {
    backgroundColor: '#DEF7EC',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#03543F',
  },
  
  actionSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textMain,
    marginBottom: 12,
    marginLeft: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMain,
  },
  logoutButton: {
    borderWidth: 1,
    borderColor: '#FEE2E2',
    backgroundColor: '#FEF2F2', // Light Red bg
    elevation: 0,
  },
});
