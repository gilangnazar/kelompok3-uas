import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

// Mock quiz data - replace with API call later
const mockQuizzes = [
  {
    id: 1,
    title: 'Introduction to React Native',
    questionCount: 10,
    isCompleted: false,
    score: null
  },
  {
    id: 2,
    title: 'Components and Props',
    questionCount: 8,
    isCompleted: true,
    score: 85
  }
];

export default function QuizListScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { className, classId } = params;

  const handleQuizPress = (quiz: any) => {
    router.push({
      pathname: '/screens/student/QuizReadyScreen',
      params: {
        quizId: quiz.id,
        quizTitle: quiz.title,
        questionCount: quiz.questionCount,
        timeLimit: '30 minutes', // You can make this dynamic from API
        className: className
      }
    });
  };

  const renderQuizItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.quizCard}
      onPress={() => handleQuizPress(item)}
    >
      <View style={styles.quizHeader}>
        <Text style={styles.quizTitle}>{item.title}</Text>
        {item.isCompleted && (
          <View style={styles.completedBadge}>
            <Text style={styles.completedText}>✓ Completed</Text>
          </View>
        )}
        {!item.isCompleted && (
          <View style={styles.notCompletedBadge}>
            <Text style={styles.notCompletedText}>Not Taken</Text>
          </View>
        )}
      </View>

      <View style={styles.quizDetails}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Questions:</Text>
          <Text style={styles.detailValue}>{item.questionCount}</Text>
        </View>

        {item.isCompleted && item.score !== null && (
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Score:</Text>
            <Text
              style={[
                styles.detailValue,
                styles.scoreValue,
                item.score >= 60 ? styles.passScore : styles.failScore
              ]}
            >
              {item.score}%
            </Text>
          </View>
        )}
      </View>

      <View style={styles.quizFooter}>
        <Text style={styles.actionText}>
          {item.isCompleted ? 'Retake Quiz →' : 'Start Quiz →'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerInfo}>
        <Text style={styles.className}>{className}</Text>
        <Text style={styles.quizCount}>
          {mockQuizzes.length} Quizzes Available
        </Text>
      </View>

      <FlatList
        data={mockQuizzes}
        renderItem={renderQuizItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  headerInfo: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  className: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4
  },
  quizCount: {
    fontSize: 14,
    color: '#666'
  },
  listContainer: {
    padding: 16
  },
  quizCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  quizHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12
  },
  quizTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
    marginRight: 12
  },
  completedBadge: {
    backgroundColor: '#34C759',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12
  },
  completedText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600'
  },
  notCompletedBadge: {
    backgroundColor: '#FF9500',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12
  },
  notCompletedText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600'
  },
  quizDetails: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 12
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 6
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a'
  },
  scoreValue: {
    fontSize: 16
  },
  passScore: {
    color: '#34C759'
  },
  failScore: {
    color: '#FF3B30'
  },
  quizFooter: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12
  },
  actionText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600'
  }
});
