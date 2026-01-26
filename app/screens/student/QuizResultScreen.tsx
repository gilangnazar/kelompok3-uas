import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function QuizResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { quizTitle, score, correctCount, totalQuestions } = params;

  const scoreNumber = Number(score);
  const correctNumber = Number(correctCount);
  const totalNumber = Number(totalQuestions);
  const isPassed = scoreNumber >= 60;

  const handleBackToQuizzes = () => {
    // Go back to quiz list (2 screens back)
    router.back();
    router.back();
  };

  const handleBackToHome = () => {
    // Go back to home screen
    router.replace('/');
  };

  return (
    <View style={styles.container}>
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
            onPress={handleBackToQuizzes}
          >
            <Text style={styles.primaryButtonText}>Back to Quizzes</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleBackToHome}
          >
            <Text style={styles.secondaryButtonText}>Back to Home</Text>
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
