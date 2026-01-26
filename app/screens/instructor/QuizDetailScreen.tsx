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
  const { id, classId, className } = params; // Assignment ID

  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sessionExpiredVisible, setSessionExpiredVisible] = useState(false);
  
  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    title: string;
    message: string;
    variant: 'success' | 'error' | 'confirm';
    onConfirm: () => void;
  }>({
    title: '',
    message: '',
    variant: 'confirm',
    onConfirm: () => setModalVisible(false),
  });

  const handleSessionConfirm = async () => {
    setSessionExpiredVisible(false);
    await AsyncStorage.multiRemove(['token', 'user']);
    router.replace('/screens/auth/LoginScreen');
  };

  useEffect(() => {
    fetchQuizDetails();
  }, [id]);

  const fetchQuizDetails = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setSessionExpiredVisible(true);
        return;
      }

      const response = await fetch(`${API_URL}/api/instructor/assignments/${id}`, {
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

  const handleDelete = () => {
    setModalConfig({
        title: 'Delete Quiz',
        message: 'Are you sure you want to delete this quiz? This action cannot be undone and will remove all student submissions.',
        variant: 'confirm',
        onConfirm: confirmDelete
    });
    setModalVisible(true);
  };

  const confirmDelete = async () => {
      try {
        setModalVisible(false); // Close confirmation
        setLoading(true);
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          setSessionExpiredVisible(true);
          return;
        }

        const response = await fetch(`${API_URL}/api/instructor/assignments/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.status === 401 || response.status === 403) {
            setSessionExpiredVisible(true);
            return;
        }

        if (response.ok) {
            // Show success modal? Or just go back?
            // Going back is cleaner for now
            handleBack();
        } else {
            alert("Failed to delete quiz");
        }
      } catch (error) {
          console.error(error);
          alert("Error deleting quiz");
      } finally {
          setLoading(false);
      }
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      if (classId) {
        router.replace({
          pathname: '/screens/instructor/CourseDetailScreen',
          params: { classId, className }
        });
      } else {
        router.replace('/screens/instructor/CourseListScreen');
      }
    }
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppModal
        visible={modalVisible}
        title={modalConfig.title}
        message={modalConfig.message}
        variant={modalConfig.variant}
        showCancel={modalConfig.variant === 'confirm'}
        onConfirm={modalConfig.onConfirm}
        onCancel={() => setModalVisible(false)}
      />
      <AppModal
        visible={sessionExpiredVisible}
        title="Session Expired"
        message="Sesi Anda telah habis. Silakan login ulang."
        variant="error"
        confirmText="Login"
        onConfirm={handleSessionConfirm}
      />
      <StatusBar barStyle="light-content" backgroundColor="#003366" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={{padding: 5}}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quiz Detail</Text>
        <View style={{flexDirection: 'row', gap: 15}}>
             <TouchableOpacity 
                onPress={() => router.push({
                    pathname: '/screens/instructor/CreateAssignmentScreen',
                    params: { assignmentId: id, classId: quiz.course_id } // Pass both IDs
                })}
             >
                 <Ionicons name="create-outline" size={24} color="#fff" />
             </TouchableOpacity>
             <TouchableOpacity onPress={handleDelete}>
                 <Ionicons name="trash-outline" size={24} color="#FF6B6B" />
             </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.mainCard}>
            <Text style={styles.title}>{quiz.title}</Text>
            
            <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                    <Ionicons name="time-outline" size={16} color="#666" />
                    <Text style={styles.metaText}>
                        {quiz.quiz ? `${quiz.quiz.time_limit_minutes} Mins` : 'No Limit'}
                    </Text>
                </View>
                <View style={styles.metaItem}>
                    <Ionicons name="calendar-outline" size={16} color="#666" />
                    <Text style={styles.metaText}>
                        Due: {quiz.due_date ? new Date(quiz.due_date).toLocaleDateString() : '-'}
                    </Text>
                </View>
            </View>

            <View style={styles.divider} />
            <Text style={styles.descLabel}>Description</Text>
            <Text style={styles.descText}>{quiz.description || 'No description provided.'}</Text>
        </View>

        <View style={styles.statsCard}>
            <Text style={styles.sectionTitle}>Performance Summary</Text>
            <View style={styles.statsRow}>
                <View style={styles.statBox}>
                    <Text style={styles.statValue}>{quiz.stats?.submitted || 0}</Text>
                    <Text style={styles.statLabel}>Submitted</Text>
                </View>
                <View style={styles.statBox}>
                    <Text style={styles.statValue}>{quiz.stats?.pending ?? 0}</Text>
                    <Text style={styles.statLabel}>Pending</Text>
                </View>
                <View style={styles.statBox}>
                    <Text style={styles.statValue}>{quiz.stats?.avg_score || 0}</Text>
                    <Text style={styles.statLabel}>Avg Score</Text>
                </View>
            </View>
        </View>

        {/* Action Button */}
        <TouchableOpacity 
            style={styles.actionBtn}
            onPress={() => router.push({ 
                pathname: '/screens/instructor/ScoreListScreen', 
                params: { quizId: quiz.quiz?.id, quizTitle: quiz.title, assignmentId: id, classId, className } 
            })}
        >
            <Text style={styles.actionText}>View Student Scores</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>

         {/* Questions Preview (Read Only) */}
         <Text style={styles.sectionTitle}>Questions Preview ({quiz.questions?.length || 0})</Text>
         {quiz.questions && quiz.questions.map((q: any, i: number) => (
             <View key={i} style={styles.qCard}>
                 <Text style={styles.qText}>{i+1}. {q.question_text}</Text>
                 {q.options && q.options.map((opt: any, idx: number) => (
                     <Text key={idx} style={[
                         styles.optText, 
                         opt.is_correct === 1 && styles.correctOpt
                     ]}>
                        - {opt.option_text} {opt.is_correct === 1 ? '(Correct)' : ''}
                     </Text>
                 ))}
             </View>
         ))}

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F4F6F8' },
  header: { 
      backgroundColor: '#003366', padding: 20, paddingTop: 50, flexDirection: 'row', 
      alignItems: 'center', justifyContent: 'space-between' 
  },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  content: { padding: 20, paddingBottom: 50 },
  mainCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 20 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 12 },
  metaRow: { flexDirection: 'row', marginBottom: 16 },
  metaItem: { flexDirection: 'row', alignItems: 'center', marginRight: 20 },
  metaText: { marginLeft: 6, color: '#666' },
  divider: { height: 1, backgroundColor: '#eee', marginBottom: 16 },
  descLabel: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  descText: { fontSize: 14, color: '#666', lineHeight: 22 },
  
  statsCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 16 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statBox: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#003366' },
  statLabel: { fontSize: 12, color: '#666' },
  
  actionBtn: { 
      backgroundColor: '#003366', borderRadius: 12, padding: 18, 
      flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 30
  },
  actionText: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginRight: 8 },

  qCard: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 10 },
  qText: { fontWeight: 'bold', marginBottom: 8, color: '#333' },
  optText: { marginLeft: 10, color: '#555', marginBottom: 2 },
  correctOpt: { color: '#28a745', fontWeight: 'bold' }
});

export default QuizDetailScreen;
