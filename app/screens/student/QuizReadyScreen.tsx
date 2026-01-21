import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function QuizReadyScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { quizId, quizTitle, questionCount, timeLimit } = params;

  const handleStartQuiz = () => {
    router.push({
      pathname: '/',
      params: {
        quizId,
        quizTitle,
        questionCount,
        timeLimit,
      }
    });
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

        <TouchableOpacity 
          style={styles.startButton}
          onPress={handleStartQuiz}
        >
          <Text style={styles.startButtonText}>Start Quiz</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  quizInfo: {
    marginBottom: 48,
  },
  quizTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 24,
  },
  infoBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 16,
  },
  readySection: {
    marginBottom: 32,
  },
  readyText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
  },
  startButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});