import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import { API_URL } from '../../../config/api';
import BottomNavigator from '../../components/navigation/BottomNavigator';

const { width } = Dimensions.get('window');

const COLORS = {
  primary: '#083d7f',
  primaryDark: '#062e61',
  background: '#F3F4F6',
  cardBg: '#FFFFFF',
  textMain: '#111827',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  accent: '#F59E0B', 
  danger: '#EF4444',
  success: '#10B981',
  info: '#3B82F6'
};

interface DashboardData {
  stats: {
    active_courses: number;
    attendance_rate: number;
    average_score: number;
    needs_grading: number;
  };
  upcoming_schedules: Array<{
    id: number;
    session_topic: string;
    session_date: string;
    location: string;
    course_title: string;
  }>;
  grading_queue: Array<{
    submission_id: number;
    submitted_at: string;
    assignment_title: string;
    course_title: string;
    student_name: string;
  }>;
}

export default function InstructorDashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState('Instructor');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<DashboardData | null>(null);

  const fetchDashboardData = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userRaw = await AsyncStorage.getItem('user');
      if (userRaw) {
        const user = JSON.parse(userRaw);
        setUserName(user.name);
      }

      if (!token) {
        router.replace('/screens/auth/LoginScreen');
        return;
      }

      const response = await fetch(`${API_URL}/api/instructor/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401 || response.status === 403) {
        await AsyncStorage.multiRemove(['token', 'user']);
        router.replace('/screens/auth/LoginScreen');
        return;
      }

      const json = await response.json();
      setData(json);
    } catch (error) {
      console.error('Fetch error:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDashboardData();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const renderHeaderStat = (label: string, value: string | number, icon: keyof typeof Ionicons.glyphMap, color: string = COLORS.primary) => (
    <View style={styles.headerStatItem}>
      <View style={[styles.headerStatIconBox, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <View>
        <Text style={styles.headerStatValue}>{value}</Text>
        <Text style={styles.headerStatLabel}>{label}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <ScrollView 
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <View>
                <Text style={styles.welcomeLabel}>Good Morning,</Text>
                <Text style={styles.userName}>{userName}</Text>
              </View>
              <View style={styles.dateBadge}>
                 <Text style={styles.dateText}>{new Date().toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })}</Text>
              </View>
            </View>

            {/* Quality Metrics Row */}
            <View style={styles.statsRow}>
              {renderHeaderStat('Courses', data?.stats?.active_courses || 0, 'book', COLORS.primary)}
              <View style={styles.statDivider} />
              {renderHeaderStat('Attendance', `${data?.stats?.attendance_rate || 0}%`, 'calendar', COLORS.success)}
              <View style={styles.statDivider} />
              {renderHeaderStat('Avg Score', data?.stats?.average_score || 0, 'ribbon', COLORS.info)} 
            </View>
          </View>

          <View style={styles.body}>
            {/* Needs Grading Highlight */}
            <TouchableOpacity style={styles.urgentCard}>
              <View style={styles.urgentContent}>
                <Text style={styles.urgentTitle}>Needs Grading</Text>
                <Text style={styles.urgentSubtitle}>
                  You have <Text style={{ fontWeight: 'bold' }}>{data?.stats?.needs_grading || 0}</Text> assignments pending review.
                </Text>
              </View>
              <View style={styles.urgentIcon}>
                <Ionicons name="alert-circle" size={32} color={COLORS.accent} />
              </View>
            </TouchableOpacity>

            {/* Quick Actions */}
            <View style={styles.actionGrid}>
              <TouchableOpacity style={styles.actionBtn}>
                <View style={[styles.actionIcon, { backgroundColor: '#E0E7FF' }]}>
                  <Ionicons name="add" size={24} color={COLORS.primary} />
                </View>
                <Text style={styles.actionLabel}>New Task</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn}>
                <View style={[styles.actionIcon, { backgroundColor: '#DEF7EC' }]}>
                  <Ionicons name="cloud-upload-outline" size={24} color={COLORS.success} />
                </View>
                <Text style={styles.actionLabel}>Material</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn}>
                <View style={[styles.actionIcon, { backgroundColor: '#FEF3C7' }]}>
                  <Ionicons name="calendar-outline" size={24} color={COLORS.accent} />
                </View>
                <Text style={styles.actionLabel}>Schedule</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn}>
                <View style={[styles.actionIcon, { backgroundColor: '#F3F4F6' }]}>
                  <Ionicons name="megaphone-outline" size={24} color={COLORS.textSecondary} />
                </View>
                <Text style={styles.actionLabel}>Announce</Text>
              </TouchableOpacity>
            </View>

            {/* Grading Queue */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Grading Queue</Text>
                <TouchableOpacity><Text style={styles.seeAll}>See All</Text></TouchableOpacity>
              </View>
              {data?.grading_queue && data.grading_queue.length > 0 ? (
                data.grading_queue.map((item) => (
                  <View key={item.submission_id} style={styles.queueItem}>
                    <View style={styles.queueLeft}>
                      <Text style={styles.queueStudent}>{item.student_name}</Text>
                      <Text style={styles.queueTask}>{item.assignment_title}</Text>
                      <Text style={styles.queueCourse}>{item.course_title}</Text>
                    </View>
                    <View style={styles.queueRight}>
                      <Text style={styles.timeAgo}>New</Text>
                      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>No pending grading.</Text>
              )}
            </View>

            {/* Schedule */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Teaching Schedule</Text>
                <TouchableOpacity><Text style={styles.seeAll}>Full Calendar</Text></TouchableOpacity>
              </View>
              {data?.upcoming_schedules && data.upcoming_schedules.length > 0 ? (
                data.upcoming_schedules.map((item) => (
                  <View key={item.id} style={styles.scheduleRow}>
                    <View style={styles.scheduleTimeBox}>
                      <Text style={styles.scheduleTime}>{formatTime(item.session_date)}</Text>
                      <Text style={styles.scheduleDate}>{formatDate(item.session_date)}</Text>
                    </View>
                    <View style={styles.scheduleLine} />
                    <View style={styles.scheduleDetails}>
                      <Text style={styles.scheduleTitle}>{item.course_title}</Text>
                      <Text style={styles.scheduleTopic}>{item.session_topic}</Text>
                      <Text style={styles.scheduleLoc}>{item.location}</Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>No classes this week.</Text>
              )}
            </View>
          </View>
        </ScrollView>
      )}

      <BottomNavigator
        activeKey='home'
        items={[
          { key: 'home', label: 'Dashboard', icon: 'grid', onPress: () => {} },
          { key: 'courses', label: 'My Classes', icon: 'book' },
          { key: 'students', label: 'Students', icon: 'people' },
          { key: 'profile', label: 'Profile', icon: 'person', onPress: () => router.push('/screens/student/ProfileScreen') }
        ]}
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
    paddingTop: 50,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  welcomeLabel: {
    fontSize: 14,
    color: '#E0E7FF',
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  dateBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  dateText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600'
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  headerStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  headerStatIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerStatValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.textMain,
  },
  headerStatLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '500'
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 8,
  },
  body: {
    padding: 20,
  },
  urgentCard: {
    backgroundColor: COLORS.primaryDark,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  urgentContent: {
    flex: 1,
  },
  urgentTitle: {
    color: COLORS.accent,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  urgentSubtitle: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 22,
  },
  urgentIcon: {
    width: 44,
    height: 44,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  actionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  actionBtn: {
    alignItems: 'center',
    width: '22%',
  },
  actionIcon: {
    width: 54,
    height: 54,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 }
  },
  actionLabel: {
    fontSize: 11,
    color: COLORS.textMain,
    fontWeight: '600',
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  seeAll: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  queueItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accent,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 }
  },
  queueLeft: {
    flex: 1,
  },
  queueStudent: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textMain,
    marginBottom: 2,
  },
  queueTask: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  queueCourse: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '600'
  },
  queueRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeAgo: {
    fontSize: 11,
    color: COLORS.success,
    fontWeight: '700',
    marginRight: 4,
  },
  scheduleRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  scheduleTimeBox: {
    width: 55,
    alignItems: 'center',
  },
  scheduleTime: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  scheduleDate: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  scheduleLine: {
    width: 2,
    backgroundColor: COLORS.border,
    marginHorizontal: 12,
    borderRadius: 1,
  },
  scheduleDetails: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 14,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    elevation: 1,
  },
  scheduleTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  scheduleTopic: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginVertical: 4,
  },
  scheduleLoc: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
  }
});
