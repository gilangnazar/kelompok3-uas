import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function QuizReadyScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { assignmentId, quizId, quizTitle, questionCount, timeLimit, timeLimitMinutes, classId, className } = params;

  const handleStartQuiz = () => {
    router.push({
      pathname: '/screens/student/QuizTakeScreen',
      params: {
        assignmentId,
        quizId,
        quizTitle,
        questionCount,
        timeLimit,
        timeLimitMinutes,
        classId,
        className
      }
    });
  };

  const handleCancel = () => {
    if (assignmentId) {
      router.replace({
        pathname: '/screens/student/QuizDetailScreen',
        params: { assignmentId, classId, className }
      });
      return;
    }
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.quizInfo}>
          <Text style={styles.quizTitle}>{quizTitle}</Text>

          <View style={styles.infoBox}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Questions:</Text>
              <Text style={styles.infoValue}>{questionCount}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Time Limit:</Text>
              <Text style={styles.infoValue}>{timeLimit || 'Unlimited'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.readySection}>
          <Text style={styles.readyText}>Are you ready?</Text>
        </View>

        <View style={styles.rulesCard}>
          <Text style={styles.rulesTitle}>Quiz Rules</Text>
          <View style={styles.ruleItem}>
            <Text style={styles.ruleBullet}>•</Text>
            <Text style={styles.ruleText}>Do not leave or minimize the app. Your quiz will be auto-submitted.</Text>
          </View>
          <View style={styles.ruleItem}>
            <Text style={styles.ruleBullet}>•</Text>
            <Text style={styles.ruleText}>Back and refresh are disabled during the quiz.</Text>
          </View>
          <View style={styles.ruleItem}>
            <Text style={styles.ruleBullet}>•</Text>
            <Text style={styles.ruleText}>Time runs continuously until it ends.</Text>
          </View>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.startButton} onPress={handleStartQuiz}>
            <Text style={styles.startButtonText}>Start Quiz</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center'
  },
  quizInfo: {
    marginBottom: 48
  },
  quizTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 24
  },
  infoBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  infoLabel: {
    fontSize: 16,
    color: '#666'
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a'
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 16
  },
  readySection: {
    marginBottom: 32
  },
  readyText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center'
  },
  rulesCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  rulesTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6
  },
  ruleBullet: {
    fontSize: 14,
    fontWeight: '700',
    color: '#007AFF',
    marginRight: 6,
    marginTop: 1
  },
  ruleText: {
    flex: 1,
    fontSize: 13,
    color: '#555',
    lineHeight: 18
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold'
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#007AFF'
  },
  cancelButtonText: {
    color: '#007AFF',
    fontSize: 18,
    fontWeight: 'bold'
  },
  startButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5
  }
});
