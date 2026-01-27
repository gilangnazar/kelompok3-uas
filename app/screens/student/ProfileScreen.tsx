import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import AppModal from '../../components/AppModal';
import BottomNavigator from '../../components/navigation/BottomNavigator';

const { width } = Dimensions.get('window');

const COLORS = {
  primary: '#083d7f',
  background: '#F9FAFB',
  cardBg: '#FFFFFF',
  textMain: '#111827',
  textSecondary: '#4B5563',
  danger: '#EF4444',
  border: '#E5E7EB',
  accent: '#0A4FBF'
};

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: number; name: string; email: string; role: string } | null>(null);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem('user').then(userRaw => {
      if (userRaw) {
        setUser(JSON.parse(userRaw));
      }
      setLoading(false);
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

  const renderInfoItem = (icon: keyof typeof Ionicons.glyphMap, label: string, value: string) => (
    <View style={styles.infoItem}>
      <View style={styles.infoIconBox}>
        <Ionicons name={icon} size={20} color={COLORS.primary} />
      </View>
      <View style={styles.infoTextContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );

  const renderSettingLink = (icon: keyof typeof Ionicons.glyphMap, title: string, color = COLORS.textMain, showChevron = true) => (
    <TouchableOpacity style={styles.settingLink}>
      <View style={styles.settingLeft}>
        <Ionicons name={icon} size={22} color={color} />
        <Text style={[styles.settingTitle, { color }]}>{title}</Text>
      </View>
      {showChevron && <Ionicons name="chevron-forward" size={20} color={COLORS.border} />}
    </TouchableOpacity>
  );

  // Dynamic Navigation Items
  const navItems =
      [
        { key: 'home', label: 'Home', icon: 'home', onPress: () => router.replace('/screens/student/StudentDashboard') },
        { key: 'courses', label: 'Courses', icon: 'book', onPress: () => router.push('/screens/student/CourseListScreen') },
        { key: 'discussion', label: 'Discussion', icon: 'chatbubbles' },
        { key: 'profile', label: 'Profile', icon: 'person', onPress: () => {} }
      ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Modern Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Account Settings</Text>
        </View>

        <View style={styles.content}>
          {/* Main Identity Card */}
          <View style={styles.profileMainCard}>
            <View style={styles.avatarWrapper}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{user ? getInitials(user.name) : '??'}</Text>
              </View>
              <TouchableOpacity style={styles.editAvatarBtn}>
                <Ionicons name="camera" size={16} color="#FFF" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.userNameText}>{user?.name}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{user?.role === 'teacher' ? 'Instructor' : 'Student'}</Text>
            </View>
          </View>

          {/* Personal Information Section */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Personal Information</Text>
            <View style={styles.infoCard}>
              {renderInfoItem('mail-outline', 'Email Address', user?.email || '-')}
              <View style={styles.line} />
              {renderInfoItem('finger-print-outline', 'User ID', `#${user?.id?.toString().padStart(4, '0')}`)}
              <View style={styles.line} />
              {renderInfoItem('shield-checkmark-outline', 'Account Status', 'Verified Member')}
            </View>
          </View>

          {/* Account Actions Section */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Account & Security</Text>
            <View style={styles.infoCard}>
              {renderSettingLink('lock-closed-outline', 'Change Password')}
              <View style={styles.line} />
              {renderSettingLink('notifications-outline', 'Notification Settings')}
              <View style={styles.line} />
              {renderSettingLink('help-circle-outline', 'Help & Support')}
              <View style={styles.line} />
              <TouchableOpacity 
                style={styles.settingLink} 
                onPress={() => setConfirmVisible(true)}
              >
                <View style={styles.settingLeft}>
                  <Ionicons name="log-out-outline" size={22} color={COLORS.danger} />
                  <Text style={[styles.settingTitle, { color: COLORS.danger }]}>Sign Out</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.versionText}>Version 1.0.2 (Production)</Text>
        </View>
      </ScrollView>

      <BottomNavigator
        activeKey='profile'
        items={navItems as any}
      />

      <AppModal
        visible={confirmVisible}
        title='Sign Out'
        message='Are you sure you want to exit from your account?'
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: COLORS.primary,
    height: 160,
    paddingTop: 60,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  content: {
    paddingHorizontal: 20,
    marginTop: -60,
  },
  profileMainCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    marginBottom: 24,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFF',
    elevation: 2,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.accent,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFF',
  },
  userNameText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.textMain,
    marginBottom: 6,
  },
  roleBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textMain,
    marginBottom: 12,
    marginLeft: 4,
  },
  infoCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  infoIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F0F7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  infoTextContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMain,
  },
  line: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 4,
  },
  settingLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 14,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 8,
  }
});
