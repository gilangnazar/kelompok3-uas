import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import { API_URL } from '../../../config/api';
import AppModal from '../../components/AppModal';
import BottomNavigator from '../../components/navigation/BottomNavigator';

const { width } = Dimensions.get('window');

// Color Palette
const COLORS = {
  primary: '#083d7f',
  background: '#F9FAFB',
  cardBg: '#FFFFFF',
  textMain: '#111827',
  textSecondary: '#4B5563',
  border: '#D1D5DB',
  success: '#10B981',
  warning: '#F59E0B',
  info: '#3B82F6',
  purple: '#8B5CF6'
};

interface DashboardData {
  stats: {
    active_courses: number;
    attendance: { present: number; total: number };
    submissions: { submitted: number; total: number };
    pending_tasks: number;
  };
  upcoming_schedules: Array<{
    id: number;
    session_topic: string;
    session_date: string;
    location: string;
    course_title: string;
  }>;
  pending_assignments: Array<{
    id: number;
    title: string;
    due_date: string;
    course_id: number;
    course_title: string;
    type: 'quiz' | 'assignment';
  }>;
}

export default function StudentDashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState('Student');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<DashboardData | null>(null);
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [coursePickerVisible, setCoursePickerVisible] = useState(false);
  const [coursePickerTab, setCoursePickerTab] = useState<'assignment' | 'schedule'>('assignment');
  const [courses, setCourses] = useState<any[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);

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

      const response = await fetch(`${API_URL}/api/student/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401 || response.status === 403) {
        // Token invalid, force logout
        await AsyncStorage.multiRemove(['token', 'user']);
        router.replace('/screens/auth/LoginScreen');
        return;
      }

      const json = await response.json();
      setData(json);
    } catch (error) {
      console.error('Fetch error:', error);
      setErrorMessage('Failed to load dashboard data');
      setErrorVisible(true);
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

  const openCoursePicker = async (tab: 'assignment' | 'schedule') => {
    setCoursePickerTab(tab);
    setCoursePickerVisible(true);
    if (courses.length === 0) {
      await fetchCourses();
    }
  };

  const fetchCourses = async () => {
    try {
      setCoursesLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        router.replace('/screens/auth/LoginScreen');
        return;
      }

      const response = await fetch(`${API_URL}/api/student/courses`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 401 || response.status === 403) {
        await AsyncStorage.multiRemove(['token', 'user']);
        router.replace('/screens/auth/LoginScreen');
        return;
      }

      if (response.ok) {
        const json = await response.json();
        setCourses(json || []);
      } else {
        setErrorMessage('Failed to load courses.');
        setErrorVisible(true);
      }
    } catch (error) {
      console.error('Fetch courses error:', error);
      setErrorMessage('Network error.');
      setErrorVisible(true);
    } finally {
      setCoursesLoading(false);
    }
  };

  const renderStatsCard = (title: string, value: string, icon: keyof typeof Ionicons.glyphMap, color: string) => (
    <View style={styles.card}>
      <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardValue}>{value}</Text>
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <AppModal
        visible={errorVisible}
        title="Error"
        message={errorMessage}
        variant="error"
        confirmText="OK"
        onConfirm={() => setErrorVisible(false)}
      />
      <Modal transparent visible={coursePickerVisible} animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Course</Text>
              <TouchableOpacity onPress={() => setCoursePickerVisible(false)}>
                <Ionicons name="close" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
            {coursesLoading ? (
              <View style={styles.modalLoading}>
                <ActivityIndicator size="small" color={COLORS.primary} />
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false}>
                {courses.map((course) => (
                  <TouchableOpacity
                    key={course.id}
                    style={styles.courseItem}
                    onPress={() => {
                      setCoursePickerVisible(false);
                      router.push({
                        pathname: '/screens/student/CourseDetailScreen',
                        params: {
                          classId: course.id,
                          className: course.name,
                          tab: coursePickerTab
                        }
                      });
                    }}
                  >
                    <View style={styles.courseIcon}>
                      <Ionicons name="book" size={16} color={COLORS.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.courseName}>{course.name}</Text>
                      <Text style={styles.courseMeta}>
                        {course.start_date ? new Date(course.start_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '-'} - 
                        {course.end_date ? new Date(course.end_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
                {courses.length === 0 && !coursesLoading ? (
                  <Text style={styles.emptyTextModal}>No courses found.</Text>
                ) : null}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
      
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
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.headerTopRow}>
              <View>
                <Text style={styles.welcomeLabel}>Welcome back,</Text>
                <Text style={styles.userName}>{userName}</Text>
              </View>
              {/* Logout button removed as it moved to Profile Screen */}
              <View style={styles.dateBadge}>
                 <Text style={styles.dateText}>{new Date().toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })}</Text>
              </View>
            </View>
          </View>

          {/* Main Content with Negative Margin */}
          <View style={styles.mainContent}>
            
            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              {renderStatsCard(
                'Attendance', 
                data?.stats?.attendance ? `${data.stats.attendance.present}/${data.stats.attendance.total}` : '-', 
                'calendar', 
                COLORS.success
              )}
              {renderStatsCard(
                'Pending Assignments', 
                data?.stats?.pending_tasks?.toString() || '0', 
                'time', 
                COLORS.warning
              )}
              {renderStatsCard(
                'Courses', 
                data?.stats?.active_courses?.toString() || '0', 
                'book', 
                COLORS.info
              )}
              {renderStatsCard(
                'Submissions', 
                data?.stats?.submissions ? `${data.stats.submissions.submitted}/${data.stats.submissions.total}` : '-', 
                'cloud-upload', 
                COLORS.purple
              )}
            </View>

            {/* Upcoming Schedule */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Upcoming Schedule</Text>
                <TouchableOpacity onPress={() => openCoursePicker('schedule')}>
                  <Text style={styles.seeAll}>See All</Text>
                </TouchableOpacity>
              </View>
              
              {data?.upcoming_schedules && data.upcoming_schedules.length > 0 ? (
                data.upcoming_schedules.map((item) => (
                  <View key={item.id} style={styles.scheduleItem}>
                    <View style={styles.dateBox}>
                      <Text style={styles.dateMonth}>{new Date(item.session_date).toLocaleDateString('en-US', { month: 'short' })}</Text>
                      <Text style={styles.dateDay}>{new Date(item.session_date).getDate()}</Text>
                    </View>
                    <View style={styles.itemContent}>
                      <Text style={styles.itemTitle} numberOfLines={1}>{item.course_title}</Text>
                      <Text style={styles.itemSubtitle} numberOfLines={1}>{item.session_topic}</Text>
                      <View style={styles.metaRow}>
                        <View style={styles.metaBadge}>
                          <Ionicons name="time-outline" size={12} color={COLORS.textSecondary} />
                          <Text style={styles.metaText}>{formatTime(item.session_date)}</Text>
                        </View>
                        <View style={[styles.metaBadge, { marginLeft: 8 }]}>
                          <Ionicons name="location-outline" size={12} color={COLORS.textSecondary} />
                          <Text style={styles.metaText}>{item.location}</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>No upcoming classes.</Text>
                </View>
              )}
            </View>

            {/* Pending Assignments */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Pending Assignments</Text>
                <TouchableOpacity onPress={() => openCoursePicker('assignment')}>
                  <Text style={styles.seeAll}>See All</Text>
                </TouchableOpacity>
              </View>

              {data?.pending_assignments && data.pending_assignments.length > 0 ? (
                data.pending_assignments.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={item.type === 'quiz' ? 0.8 : 1}
                    onPress={() => {
                      if (item.type === 'quiz') {
                        router.push({
                          pathname: '/screens/student/QuizDetailScreen',
                          params: { assignmentId: item.id, classId: item.course_id, className: item.course_title }
                        });
                      }
                    }}
                  >
                    <View style={styles.assignmentItem}>
                    <View style={[styles.typeIndicator, { backgroundColor: item.type === 'quiz' ? '#EF4444' : '#3B82F6' }]} />
                    <View style={{ flex: 1, paddingVertical: 12, paddingRight: 12 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                        <Text style={styles.categoryLabel}>{item.type === 'quiz' ? 'Quiz' : 'Assignment'}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          {item.due_date && new Date(item.due_date).getTime() < Date.now() && (
                            <View style={styles.overdueBadge}>
                              <Text style={styles.overdueText}>Overdue</Text>
                            </View>
                          )}
                          <Text style={styles.dueLabel}>Due {formatDate(item.due_date)}</Text>
                        </View>
                      </View>
                      <Text style={styles.itemTitle}>{item.title}</Text>
                      <Text style={styles.itemSubtitle}>{item.course_title}</Text>
                    </View>
                  </View>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>All caught up! No pending tasks.</Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      )}

      <BottomNavigator
        activeKey='home'
        items={[
          { 
            key: 'home', 
            label: 'Home', 
            icon: 'home', 
            onPress: () => {} // Already here 
          },
          { key: 'courses', label: 'Courses', icon: 'book', onPress: () => router.push('/screens/student/CourseListScreen') },
          { key: 'discussion', label: 'Discussion', icon: 'chatbubbles' },
          { 
            key: 'profile', 
            label: 'Profile', 
            icon: 'person', 
            onPress: () => router.push('/screens/student/ProfileScreen') 
          }
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
  
  // Header
  header: {
    backgroundColor: COLORS.primary,
    height: 180,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingTop: 50,
    paddingHorizontal: 24,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeLabel: {
    fontSize: 14,
    color: '#E0E7FF',
    marginBottom: 4,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  dateBadge: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  dateText: {
    color: '#E0E7FF',
    fontSize: 12,
    fontWeight: '600'
  },

  // Main Content
  mainContent: {
    paddingHorizontal: 20,
    marginTop: -60, // Overlap effect
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  card: {
    width: (width - 48) / 2, // 2 columns with spacing
    backgroundColor: COLORS.cardBg,
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    flexDirection: 'column',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    alignSelf: 'flex-start'
  },
  cardContent: {
    
  },
  cardValue: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textMain,
    marginBottom: 2,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },

  // Sections
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  seeAll: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },

  // Schedule Item
  scheduleItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  dateBox: {
    width: 54,
    height: 54,
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  dateMonth: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
  },
  dateDay: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textMain,
    marginBottom: 2,
  },
  itemSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  metaText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginLeft: 4,
    fontWeight: '500',
  },

  // Assignment Item
  assignmentItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden', // for the left border strip
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  typeIndicator: {
    width: 6,
    height: '100%',
    marginRight: 12,
  },
  categoryLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dueLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EF4444',
  },
  overdueBadge: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10
  },
  overdueText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700'
  },

  // Empty State
  emptyState: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontStyle: 'italic',
  }
  ,
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    padding: 24
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    maxHeight: '70%'
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textMain
  },
  modalLoading: {
    paddingVertical: 24,
    alignItems: 'center'
  },
  courseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6'
  },
  courseIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  courseName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMain
  },
  courseMeta: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2
  },
  emptyTextModal: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    paddingVertical: 12
  }
});
