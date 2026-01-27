import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, StatusBar, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../../config/api';
import AppModal from '../../components/AppModal';

const QuizDetailScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { assignmentId, classId, className } = params;

  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sessionExpiredVisible, setSessionExpiredVisible] = useState(false);

  const handleSessionConfirm = async () => {
    setSessionExpiredVisible(false);
    await AsyncStorage.multiRemove(['token', 'user']);
    router.replace('/screens/auth/LoginScreen');
  };

  useEffect(() => {
    fetchQuizDetails();
  }, [assignmentId]);

  const fetchQuizDetails = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setSessionExpiredVisible(true);
        return;
      }

      const response = await fetch(`${API_URL}/api/student/quizzes/assignment/${assignmentId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 401 || response.status === 403) {
        setSessionExpiredVisible(true);
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setQuiz(data);
      } else {
        console.error('Failed to fetch quiz details');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (classId) {
      router.replace({
        pathname: '/screens/student/CourseDetailScreen',
        params: { classId, className, tab: 'assignment' }
      });
      return;
    }
    router.replace('/screens/student/CourseListScreen');
  };

  const handleStartQuiz = () => {
    router.push({
      pathname: '/screens/student/QuizReadyScreen',
      params: {
        assignmentId: quiz.assignment_id,
        quizId: quiz.quiz_id,
        quizTitle: quiz.title,
        questionCount: quiz.question_count,
        timeLimit: quiz.time_limit_minutes ? `${quiz.time_limit_minutes} minutes` : 'Unlimited',
        timeLimitMinutes: quiz.time_limit_minutes,
        classId,
        className
      }
    });
  };

  const handleViewResult = () => {
    if (!quiz?.attempt_id) {
      return;
    }
    router.push({
      pathname: '/screens/student/StudentResultScreen',
      params: {
        attemptId: quiz.attempt_id,
        quizId: quiz.quiz_id,
        quizTitle: quiz.title,
        classId,
        className
      }
    });
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#003366" />
      </View>
    );
  }

  if (!quiz) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Quiz not found.</Text>
      </View>
    );
  }

  const dueDate = quiz.due_date ? new Date(quiz.due_date) : null;
  const completedAt = quiz.completed_at ? new Date(quiz.completed_at) : null;
  const now = new Date();
  let statusLabel = 'Pending';
  let statusStyle = styles.statusPending;

  if (quiz.has_attempted) {
    if (dueDate && completedAt && completedAt.getTime() > dueDate.getTime()) {
      statusLabel = 'Submitted Late';
      statusStyle = styles.statusLate;
    } else {
      statusLabel = 'Submitted On Time';
      statusStyle = styles.statusOnTime;
    }
  } else if (dueDate && now.getTime() > dueDate.getTime()) {
    statusLabel = 'Overdue';
    statusStyle = styles.statusOverdue;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppModal
        visible={sessionExpiredVisible}
        title="Session Expired"
        message="Your session has expired. Please log in again."
        variant="error"
        confirmText="Log In"
        onConfirm={handleSessionConfirm}
      />
      <StatusBar barStyle="light-content" backgroundColor="#003366" />

      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={{ padding: 5 }}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quiz Detail</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.mainCard}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{quiz.title}</Text>
            <View style={[styles.statusBadge, statusStyle]}>
              <Text style={styles.statusText}>{statusLabel}</Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={16} color="#666" />
              <Text style={styles.metaText}>
                {quiz.time_limit_minutes ? `${quiz.time_limit_minutes} Mins` : 'No Limit'}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={16} color="#666" />
              <Text style={styles.metaText}>
                Due: {quiz.due_date ? new Date(quiz.due_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
              </Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="list-outline" size={16} color="#666" />
              <Text style={styles.metaText}>{quiz.question_count} Questions</Text>
            </View>
          </View>

          <View style={styles.divider} />
          <Text style={styles.descLabel}>Description</Text>
          <Text style={styles.descText}>{quiz.description || 'No description provided.'}</Text>
        </View>

        {!quiz.has_attempted ? (
          <TouchableOpacity style={styles.actionBtn} onPress={handleStartQuiz}>
            <Text style={styles.actionText}>Take Quiz</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.resultBtn} onPress={handleViewResult}>
            <Text style={styles.actionText}>See Result</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F4F6F8' },
  header: {
    backgroundColor: '#003366',
    padding: 20,
    paddingTop: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  content: { padding: 20, paddingBottom: 50 },
  mainCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 20 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  title: { flex: 1, fontSize: 22, fontWeight: 'bold', color: '#333', marginRight: 12 },
  metaRow: { flexDirection: 'row', marginBottom: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', marginRight: 20 },
  metaText: { marginLeft: 6, color: '#666' },
  divider: { height: 1, backgroundColor: '#eee', marginBottom: 16 },
  descLabel: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  descText: { fontSize: 14, color: '#666', lineHeight: 22 },
  actionBtn: {
    backgroundColor: '#003366',
    borderRadius: 12,
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30
  },
  actionText: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginRight: 8 },
  resultBtn: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12
  },
  statusText: { fontSize: 11, fontWeight: '700', color: '#fff' },
  statusPending: { backgroundColor: '#F59E0B' },
  statusOnTime: { backgroundColor: '#10B981' },
  statusLate: { backgroundColor: '#EF4444' },
  statusOverdue: { backgroundColor: '#6B7280' }
});

export default QuizDetailScreen;
