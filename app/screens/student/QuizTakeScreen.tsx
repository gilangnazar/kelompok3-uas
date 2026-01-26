import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

// Mock quiz questions - replace with API call later
const mockQuestions = [
  {
    id: 1,
    question: 'What is React Native?',
    options: [
      'A mobile framework for building native apps',
      'A web framework',
      'A database system',
      'A programming language'
    ],
    correctAnswer: 0
  },
  {
    id: 2,
    question: 'Which company developed React Native?',
    options: ['Google', 'Facebook/Meta', 'Apple', 'Microsoft'],
    correctAnswer: 1
  },
  {
    id: 3,
    question: 'What language is primarily used in React Native?',
    options: ['Python', 'Java', 'JavaScript', 'Swift'],
    correctAnswer: 2
  },
  {
    id: 4,
    question: 'Can React Native apps run on both iOS and Android?',
    options: [
      'Only iOS',
      'Only Android',
      'Yes, both platforms',
      'Neither platform'
    ],
    correctAnswer: 2
  }
];

export default function QuizTakeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { quizTitle } = params;

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});

  const currentQuestion = mockQuestions[currentQuestionIndex];
  const totalQuestions = mockQuestions.length;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

  const handleSelectAnswer = (optionIndex: number) => {
    setSelectedAnswer(optionIndex);
  };

  const handleNext = () => {
    if (selectedAnswer === null) {
      return; // Button should be disabled, but just in case
    }

    // Save the answer
    const newAnswers = {
      ...answers,
      [currentQuestion.id]: selectedAnswer
    };
    setAnswers(newAnswers);

    if (isLastQuestion) {
      // Show confirmation before submitting
      Alert.alert(
        'Submit Quiz',
        'Are you sure you want to submit your quiz? You cannot change your answers after submission.',
        [
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'Submit',
            onPress: () => handleSubmitQuiz(newAnswers)
          }
        ]
      );
    } else {
      // Move to next question
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
    }
  };

  const handleSubmitQuiz = (finalAnswers: { [key: number]: number }) => {
    // Calculate score
    let correctCount = 0;
    mockQuestions.forEach(question => {
      if (finalAnswers[question.id] === question.correctAnswer) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / totalQuestions) * 100);

    // Navigate to results screen
    router.replace({
      pathname: '/screens/student/QuizResultScreen',
      params: {
        quizTitle,
        score,
        correctCount,
        totalQuestions
      }
    });
  };

  return (
    <View style={styles.container}>
      {/* Progress Header */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          Question {currentQuestionIndex + 1} of {totalQuestions}
        </Text>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%`
              }
            ]}
          />
        </View>
      </View>

      {/* Question Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.questionContainer}>
          <Text style={styles.questionNumber}>
            Question {currentQuestionIndex + 1}
          </Text>
          <Text style={styles.questionText}>{currentQuestion.question}</Text>
        </View>

        {/* Answer Options */}
        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                selectedAnswer === index && styles.selectedOption
              ]}
              onPress={() => handleSelectAnswer(index)}
            >
              <View
                style={[
                  styles.radioCircle,
                  selectedAnswer === index && styles.radioCircleSelected
                ]}
              >
                {selectedAnswer === index && <View style={styles.radioDot} />}
              </View>
              <Text
                style={[
                  styles.optionText,
                  selectedAnswer === index && styles.selectedOptionText
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Next/Submit Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            selectedAnswer === null && styles.disabledButton
          ]}
          onPress={handleNext}
          disabled={selectedAnswer === null}
        >
          <Text style={styles.nextButtonText}>
            {isLastQuestion ? 'Submit Quiz' : 'Next Question'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  progressContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center'
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 3
  },
  content: {
    flex: 1
  },
  contentContainer: {
    padding: 20
  },
  questionContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  questionNumber: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
    marginBottom: 8
  },
  questionText: {
    fontSize: 18,
    color: '#1a1a1a',
    lineHeight: 26,
    fontWeight: '500'
  },
  optionsContainer: {
    gap: 12
  },
  optionButton: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1
  },
  selectedOption: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f7ff'
  },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ccc',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  radioCircleSelected: {
    borderColor: '#007AFF'
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#007AFF'
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
    lineHeight: 22
  },
  selectedOptionText: {
    color: '#007AFF',
    fontWeight: '500'
  },
  footer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0'
  },
  nextButton: {
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
  disabledButton: {
    backgroundColor: '#ccc',
    shadowOpacity: 0
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  }
});
