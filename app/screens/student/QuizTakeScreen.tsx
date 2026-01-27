import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  AppState,
  BackHandler,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../../config/api';
import AppModal from '../../components/AppModal';

type QuizOption = { id: number; option_text: string };
type QuizQuestion = { id: number; question_text: string; options: QuizOption[] };

export default function QuizTakeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { assignmentId, quizTitle, timeLimit, timeLimitMinutes, classId, className } = params;

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [sessionExpiredVisible, setSessionExpiredVisible] = useState(false);
  const [timeUpVisible, setTimeUpVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    title: string;
    message: string;
    variant: 'success' | 'error' | 'confirm';
    showCancel?: boolean;
    confirmText?: string;
    onConfirm: () => void;
  }>({
    title: '',
    message: '',
    variant: 'error',
    onConfirm: () => setModalVisible(false)
  });
  const [backgroundWarningVisible, setBackgroundWarningVisible] = useState(false);
  const [autoSubmitted, setAutoSubmitted] = useState(false);
  const timeUpHandledRef = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const hasTimeLimit = Number(timeLimitMinutes || 0) > 0;
  const autoSubmitRef = useRef(false);
  const autoSubmittedRef = useRef(false);
  const appStateRef = useRef(AppState.currentState);
  const backgroundedRef = useRef(false);

  const quizId = String(params.quizId || '');
  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

  const handleSessionConfirm = async () => {
    setSessionExpiredVisible(false);
    await AsyncStorage.multiRemove(['token', 'user']);
    router.replace('/screens/auth/LoginScreen');
  };

  const fetchQuestions = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setSessionExpiredVisible(true);
        return;
      }

      const response = await fetch(`${API_URL}/api/student/quizzes/${quizId}/questions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 401 || response.status === 403) {
        setSessionExpiredVisible(true);
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setQuestions(data.questions || []);
      } else {
        setModalConfig({
          title: 'Error',
          message: 'Failed to load quiz questions',
          variant: 'error',
          onConfirm: () => setModalVisible(false)
        });
        setModalVisible(true);
      }
    } catch (error) {
      console.error('Error fetching quiz questions:', error);
      setModalConfig({
        title: 'Error',
        message: 'Network error',
        variant: 'error',
        onConfirm: () => setModalVisible(false)
      });
      setModalVisible(true);
    } finally {
      setLoading(false);
    }
  }, [quizId]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, []);

  useEffect(() => {
    const minutes = Number(timeLimitMinutes || 0);
    if (minutes > 0) {
      setRemainingSeconds(minutes * 60);
    }
  }, [timeLimitMinutes]);

  useEffect(() => {
    if (!hasTimeLimit || remainingSeconds <= 0 || loading || questions.length === 0) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (hasTimeLimit && remainingSeconds === 0 && !loading && questions.length > 0 && !timeUpHandledRef.current) {
        timeUpHandledRef.current = true;
        setTimeUpVisible(true);
      }
      return;
    }

    timerRef.current = setInterval(() => {
      setRemainingSeconds(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [remainingSeconds, loading, questions.length]);

  const formatTime = (total: number) => {
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const seconds = total % 60;
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };

  const handleSelectAnswer = (optionId: number) => {
    setSelectedAnswer(optionId);
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: optionId
    }));
  };

  const handleNext = () => {
    const newAnswers = answers;

    if (isLastQuestion) {
      const unanswered = questions.filter(q => newAnswers[q.id] === undefined).length;
      if (unanswered > 0) {
        setModalConfig({
          title: 'Unanswered Questions',
          message: `You still have ${unanswered} unanswered question${unanswered > 1 ? 's' : ''}. Submit anyway?`,
          variant: 'confirm',
          showCancel: true,
          confirmText: 'Submit',
          onConfirm: () => {
            setModalVisible(false);
            handleSubmitQuiz(newAnswers);
          }
        });
        setModalVisible(true);
        return;
      }
      setModalConfig({
        title: 'Submit Quiz',
        message: 'Are you sure you want to submit your quiz? You cannot change your answers after submission.',
        variant: 'confirm',
        showCancel: true,
        confirmText: 'Submit',
        onConfirm: () => {
          setModalVisible(false);
          handleSubmitQuiz(newAnswers);
        }
      });
      setModalVisible(true);
    } else {
      // Move to next question
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      const nextId = questions[currentQuestionIndex + 1]?.id;
      setSelectedAnswer(nextId ? (newAnswers as any)[nextId] ?? null : null);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex === 0) return;
    const prevIndex = currentQuestionIndex - 1;
    const prevId = questions[prevIndex]?.id;
    setCurrentQuestionIndex(prevIndex);
    setSelectedAnswer(prevId ? (answers as any)[prevId] ?? null : null);
  };

  const handleJumpTo = (index: number) => {
    const targetId = questions[index]?.id;
    setCurrentQuestionIndex(index);
    setSelectedAnswer(targetId ? (answers as any)[targetId] ?? null : null);
  };

  const handleSubmitQuiz = (finalAnswers: { [key: number]: number }) => {
    submitQuiz(finalAnswers);
  };

  const buildFinalAnswers = () => {
    return { ...answers };
  };

  const handleTimeUpConfirm = () => {
    setTimeUpVisible(false);
    const finalAnswers = buildFinalAnswers();
    submitQuiz(finalAnswers);
  };

  const handleAppStateChange = (nextState: string) => {
    const prevState = appStateRef.current;
    appStateRef.current = nextState;
    if (prevState === 'active' && (nextState === 'inactive' || nextState === 'background')) {
      backgroundedRef.current = true;
      if (loading || questions.length === 0) {
        return;
      }
      if (!autoSubmitRef.current) {
        autoSubmitRef.current = true;
        const finalAnswers = buildFinalAnswers();
        submitQuiz(finalAnswers);
      }
    }
    if ((prevState === 'inactive' || prevState === 'background') && nextState === 'active') {
      if (autoSubmittedRef.current) {
        setBackgroundWarningVisible(true);
      }
      backgroundedRef.current = false;
    }
  };

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => true;
      const sub = AppState.addEventListener('change', handleAppStateChange);
      const backSub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => {
        sub.remove();
        backSub.remove();
      };
    }, [loading, questions.length, submitting, handleAppStateChange])
  );

  const submitQuiz = async (finalAnswers: { [key: number]: number }) => {
    if (submitting) return;
    try {
      setSubmitting(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setSessionExpiredVisible(true);
        return;
      }

      const answersPayload = Object.entries(finalAnswers).map(([question_id, selected_option_id]) => ({
        question_id: Number(question_id),
        selected_option_id: Number(selected_option_id)
      }));

      const response = await fetch(`${API_URL}/api/student/quizzes/${quizId}/attempt`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ answers: answersPayload })
      });

      if (response.status === 401 || response.status === 403) {
        setSessionExpiredVisible(true);
        return;
      }

      if (response.ok) {
        if (autoSubmitRef.current) {
          setAutoSubmitted(true);
          autoSubmittedRef.current = true;
          if (appStateRef.current === 'active') {
            setBackgroundWarningVisible(true);
          }
        } else {
          router.replace({
            pathname: '/screens/student/QuizResultScreen',
            params: {
              assignmentId,
              quizId,
              quizTitle,
              classId,
              className
            }
          });
        }
      } else {
        autoSubmitRef.current = false;
        const errorJson = await response.json().catch(() => null);
        setModalConfig({
          title: 'Error',
          message: errorJson?.message || 'Failed to submit quiz',
          variant: 'error',
          onConfirm: () => setModalVisible(false)
        });
        setModalVisible(true);
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      autoSubmitRef.current = false;
      setModalConfig({
        title: 'Error',
        message: 'Network error',
        variant: 'error',
        onConfirm: () => setModalVisible(false)
      });
      setModalVisible(true);
    } finally {
      setSubmitting(false);
    }
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
      <AppModal
        visible={modalVisible}
        title={modalConfig.title}
        message={modalConfig.message}
        variant={modalConfig.variant}
        showCancel={modalConfig.showCancel}
        confirmText={modalConfig.confirmText}
        onConfirm={modalConfig.onConfirm}
        onCancel={() => setModalVisible(false)}
      />
      <AppModal
        visible={backgroundWarningVisible}
        title="Quiz Submitted"
        message="You left the app. Your quiz was submitted automatically."
        variant="error"
        confirmText="View Result"
        onConfirm={() => {
          setBackgroundWarningVisible(false);
          setAutoSubmitted(false);
          autoSubmittedRef.current = false;
          if (!submitting) {
            router.replace({
              pathname: '/screens/student/QuizResultScreen',
              params: {
                assignmentId,
                quizId,
                quizTitle,
                classId,
                className
              }
            });
          }
        }}
      />
      <AppModal
        visible={timeUpVisible}
        title="Time's Up"
        message="Your time is up. Answers will be submitted automatically."
        variant="error"
        confirmText="View Result"
        onConfirm={handleTimeUpConfirm}
      />
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : questions.length === 0 ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.emptyText}>No questions available.</Text>
        </View>
      ) : (
      <>
      {/* Progress Header */}
      <View style={styles.progressContainer}>
        <View style={styles.progressHeaderRow}>
          <Text style={styles.progressText}>
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </Text>
          {hasTimeLimit && (
            <View style={styles.timeBadge}>
              <Text style={styles.timeBadgeText}>{formatTime(remainingSeconds)}</Text>
            </View>
          )}
        </View>
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

      <View style={styles.navigatorRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {questions.map((q, index) => {
            const isCurrent = index === currentQuestionIndex;
            const isAnswered = answers[q.id] !== undefined;
            return (
              <TouchableOpacity
                key={q.id}
                style={[
                  styles.navItem,
                  isCurrent && styles.navItemActive,
                  isAnswered && !isCurrent && styles.navItemAnswered
                ]}
                onPress={() => handleJumpTo(index)}
              >
                <Text style={[
                  styles.navText,
                  isCurrent && styles.navTextActive,
                  isAnswered && !isCurrent && styles.navTextAnswered
                ]}>
                  {index + 1}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
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
          <Text style={styles.questionText}>{currentQuestion.question_text}</Text>
        </View>

        {/* Answer Options */}
        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionButton,
                selectedAnswer === option.id && styles.selectedOption
              ]}
              onPress={() => handleSelectAnswer(option.id)}
            >
              <View
                style={[
                  styles.radioCircle,
                  selectedAnswer === option.id && styles.radioCircleSelected
                ]}
              >
                {selectedAnswer === option.id && <View style={styles.radioDot} />}
              </View>
              <Text
                style={[
                  styles.optionText,
                  selectedAnswer === option.id && styles.selectedOptionText
                ]}
              >
                {option.option_text}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Next/Submit Button */}
      <View style={styles.footer}>
        <View style={styles.footerRow}>
          <TouchableOpacity
            style={[styles.prevButton, currentQuestionIndex === 0 && styles.disabledButton]}
            onPress={handlePrev}
            disabled={currentQuestionIndex === 0 || submitting}
          >
            <Text style={styles.prevButtonText}>Previous</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.nextButton,
              submitting && styles.disabledButton
            ]}
            onPress={handleNext}
            disabled={submitting}
          >
            <Text style={styles.nextButtonText}>
              {submitting ? 'Submitting...' : (isLastQuestion ? 'Submit Quiz' : 'Next Question')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      </>
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
  progressContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  progressHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center'
  },
  timeBadge: {
    backgroundColor: '#eef2ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12
  },
  timeBadgeText: {
    fontSize: 12,
    color: '#4338ca',
    fontWeight: '600'
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
  navigatorRow: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  navItem: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8
  },
  navItemActive: {
    backgroundColor: '#007AFF'
  },
  navItemAnswered: {
    backgroundColor: '#10B981'
  },
  navText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6b7280'
  },
  navTextActive: {
    color: '#fff'
  },
  navTextAnswered: {
    color: '#fff'
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
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  prevButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  prevButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: 'bold'
  },
  nextButton: {
    flex: 1,
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
