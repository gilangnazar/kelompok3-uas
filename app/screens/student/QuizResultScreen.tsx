import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../../config/api';
import AppModal from '../../components/AppModal';

export default function QuizResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { assignmentId, quizId, quizTitle, classId, className } = params;

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<{ attemptId: number; assignmentId?: number; score: number; correctCount: number; totalQuestions: number } | null>(null);
  const [sessionExpiredVisible, setSessionExpiredVisible] = useState(false);

  const handleSessionConfirm = async () => {
    setSessionExpiredVisible(false);
    await AsyncStorage.multiRemove(['token', 'user']);
    router.replace('/screens/auth/LoginScreen');
  };

  useEffect(() => {
    fetchResult();
  }, [quizId]);

  const fetchResult = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setSessionExpiredVisible(true);
        return;
      }

      const response = await fetch(`${API_URL}/api/student/quizzes/${quizId}/result`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 401 || response.status === 403) {
        setSessionExpiredVisible(true);
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setResult({
          attemptId: Number(data.attempt_id),
          assignmentId: data.assignment_id ? Number(data.assignment_id) : undefined,
          score: Number(data.score),
          correctCount: Number(data.correctCount),
          totalQuestions: Number(data.totalQuestions)
        });
      } else {
        setResult(null);
      }
    } catch (error) {
      console.error('Error fetching quiz result:', error);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const scoreNumber = Number(result?.score || 0);
  const correctNumber = Number(result?.correctCount || 0);
  const totalNumber = Number(result?.totalQuestions || 0);
  const isPassed = scoreNumber >= 60;

  const handleBackToQuiz = () => {
    const targetAssignmentId = assignmentId || result?.assignmentId;
    if (targetAssignmentId) {
      router.replace({
        pathname: '/screens/student/QuizDetailScreen',
        params: { assignmentId: targetAssignmentId, classId, className }
      });
      return;
    }
    router.back();
  };

  const handleSeeDetail = () => {
    if (!result?.attemptId) return;
    router.push({
      pathname: '/screens/student/StudentResultScreen',
      params: {
        attemptId: result.attemptId,
        quizId,
        quizTitle,
        classId,
        className
      }
    });
  };

  return (
    <View style={styles.container}>
      <AppModal
        visible={sessionExpiredVisible}
        title="Session Expired"
        message="Your session has expired. Please log in again."
        variant="error"
        confirmText="Log In"
        onConfirm={handleSessionConfirm}
      />
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : !result ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.emptyText}>Result not found.</Text>
        </View>
      ) : (
      <View style={styles.content}>
        {/* Score Circle */}
        <View
          style={[
            styles.scoreCircle,
            isPassed ? styles.passedCircle : styles.failedCircle
          ]}
        >
          <Text style={styles.scorePercentage}>{scoreNumber}%</Text>
          <Text style={styles.scoreLabel}>Score</Text>
        </View>

        {/* Result Message */}
        <Text
          style={[
            styles.resultTitle,
            isPassed ? styles.passedText : styles.failedText
          ]}
        >
          {isPassed ? 'Congratulations! 🎉' : 'Keep Trying! 📚'}
        </Text>

        <Text style={styles.quizTitle}>{quizTitle}</Text>

        {/* Score Details */}
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Correct Answers</Text>
            <Text style={styles.detailValue}>
              {correctNumber} / {totalNumber}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Wrong Answers</Text>
            <Text style={styles.detailValue}>
              {totalNumber - correctNumber} / {totalNumber}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status</Text>
            <Text
              style={[
                styles.detailValue,
                isPassed ? styles.passedStatus : styles.failedStatus
              ]}
            >
              {isPassed ? 'Passed ✓' : 'Failed ✗'}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleSeeDetail}
          >
            <Text style={styles.primaryButtonText}>See Detail</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleBackToQuiz}
          >
            <Text style={styles.secondaryButtonText}>Back To Quiz</Text>
          </TouchableOpacity>
        </View>
      </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyText: {
    color: '#666',
    fontSize: 14
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center'
  },
  scoreCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8
  },
  passedCircle: {
    backgroundColor: '#34C759'
  },
  failedCircle: {
    backgroundColor: '#FF3B30'
  },
  scorePercentage: {
    fontSize: 52,
    fontWeight: 'bold',
    color: '#fff'
  },
  scoreLabel: {
    fontSize: 18,
    color: '#fff',
    marginTop: 4,
    fontWeight: '600'
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8
  },
  passedText: {
    color: '#34C759'
  },
  failedText: {
    color: '#FF3B30'
  },
  quizTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center'
  },
  detailsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  detailLabel: {
    fontSize: 16,
    color: '#666'
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a'
  },
  passedStatus: {
    color: '#34C759'
  },
  failedStatus: {
    color: '#FF3B30'
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 16
  },
  buttonContainer: {
    width: '100%',
    gap: 12
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  secondaryButton: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#007AFF'
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: 'bold'
  }
});
