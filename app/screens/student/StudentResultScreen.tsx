import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, StatusBar, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { API_URL } from '../../../config/api';
import AppModal from '../../components/AppModal';
import DownloadModal from '../../components/DownloadModal';

const StudentResultScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { attemptId, quizId, quizTitle, classId, className } = params;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sessionExpiredVisible, setSessionExpiredVisible] = useState(false);
  const [downloadModalVisible, setDownloadModalVisible] = useState(false);
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [feedbackConfig, setFeedbackConfig] = useState<{
    title: string;
    message: string;
    variant: 'success' | 'error' | 'confirm';
  }>({
    title: '',
    message: '',
    variant: 'error'
  });

  const handleSessionConfirm = async () => {
    setSessionExpiredVisible(false);
    await AsyncStorage.multiRemove(['token', 'user']);
    router.replace('/screens/auth/LoginScreen');
  };

  useEffect(() => {
    fetchResultDetails();
  }, [attemptId]);

  const fetchResultDetails = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setSessionExpiredVisible(true);
        return;
      }

      const response = await fetch(`${API_URL}/api/student/quizzes/attempt/${attemptId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 401 || response.status === 403) {
        setSessionExpiredVisible(true);
        return;
      }

      if (response.ok) {
        const json = await response.json();
        setData(json);
      } else {
        console.error('Failed to fetch results');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (data?.assignment_id) {
      router.replace({
        pathname: '/screens/student/QuizDetailScreen',
        params: { assignmentId: data.assignment_id, classId, className }
      });
      return;
    }
    if (classId) {
      router.replace({
        pathname: '/screens/student/CourseDetailScreen',
        params: { classId, className }
      });
      return;
    }
    router.replace('/screens/student/CourseListScreen');
  };

  const handleDownload = async (format?: 'pdf' | 'xlsx') => {
    setDownloadModalVisible(false);
    if (format && format !== 'pdf') {
      setFeedbackConfig({ title: 'Error', message: 'Only PDF is supported.', variant: 'error' });
      setFeedbackVisible(true);
      return;
    }
    let completedSuccessfully = false;
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setSessionExpiredVisible(true);
        return;
      }

      const url = `${API_URL}/api/student/quizzes/attempt/${attemptId}/export?format=pdf`;

      const sanitizeFileName = (value: string) =>
        value
          .replace(/[\\/:*?"<>|]/g, '_')
          .replace(/\s+/g, '_')
          .replace(/_+/g, '_')
          .replace(/_+$/g, '')
          .trim();

      const buildFallbackName = () => {
        const now = new Date();
        const pad2 = (n: number) => String(n).padStart(2, '0');
        const ts = `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}_${pad2(now.getHours())}-${pad2(now.getMinutes())}-${pad2(now.getSeconds())}`;
        const safeStudent = sanitizeFileName(String(data?.student_name || 'student').toLowerCase()) || 'student';
        const safeQuiz = sanitizeFileName(String(data?.quiz_title || 'quiz').toLowerCase()) || 'quiz';
        return `${safeStudent}_${safeQuiz}_${ts}.pdf`;
      };

      const getFileNameFromDisposition = (value: string | null) => {
        if (!value) return '';
        const match = value.match(/filename\\*?=(?:UTF-8'')?\"?([^\";]+)\"?/i);
        return match ? decodeURIComponent(match[1]) : '';
      };

      if (Platform.OS === 'web') {
        const response = await fetch(url, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.status === 401 || response.status === 403) {
          setSessionExpiredVisible(true);
          return;
        }

        if (!response.ok) {
          setFeedbackConfig({ title: 'Error', message: 'Failed to generate report', variant: 'error' });
          setFeedbackVisible(true);
          return;
        }

        const disposition = response.headers.get('content-disposition');
        const fileName = sanitizeFileName(getFileNameFromDisposition(disposition)) || buildFallbackName();
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = blobUrl;
        anchor.download = fileName;
        anchor.style.display = 'none';
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        window.URL.revokeObjectURL(blobUrl);
        completedSuccessfully = true;
        return;
      }

      const fallbackName = buildFallbackName();
      const targetUri = FileSystem.cacheDirectory + fallbackName;
      const downloadRes = await FileSystem.downloadAsync(url, targetUri, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (downloadRes.status === 401 || downloadRes.status === 403) {
        setSessionExpiredVisible(true);
        return;
      }

      if (downloadRes.status < 200 || downloadRes.status >= 300) {
        setFeedbackConfig({ title: 'Error', message: 'Failed to generate report', variant: 'error' });
        setFeedbackVisible(true);
        return;
      }

      if (Platform.OS === 'android') {
        const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
        if (!permissions.granted) {
          setFeedbackConfig({ title: 'Cancelled', message: 'Storage access was denied.', variant: 'error' });
          setFeedbackVisible(true);
          return;
        }

        const base64 = await FileSystem.readAsStringAsync(downloadRes.uri, {
          encoding: FileSystem.EncodingType.Base64
        });

        const createdUri = await FileSystem.StorageAccessFramework.createFileAsync(
          permissions.directoryUri,
          fallbackName,
          'application/pdf'
        );
        await FileSystem.writeAsStringAsync(createdUri, base64, {
          encoding: FileSystem.EncodingType.Base64
        });
        setFeedbackConfig({ title: 'Success', message: 'File saved to the selected folder.', variant: 'success' });
        setFeedbackVisible(true);
        completedSuccessfully = true;
        return;
      }

      if (await Sharing.isAvailableAsync()) {
        try {
          await Sharing.shareAsync(downloadRes.uri);
        } catch (shareError) {
          // Ignore user-cancelled share dialogs
        }
      } else {
        setFeedbackConfig({ title: 'Success', message: `File saved: ${downloadRes.uri}`, variant: 'success' });
        setFeedbackVisible(true);
      }
      completedSuccessfully = true;
    } catch (error) {
      console.error(error);
      if (!completedSuccessfully) {
        const errorText = String(error || '');
        if (errorText.includes('ERR_BLOCKED_BY_CLIENT')) {
          setFeedbackConfig({
            title: 'Download Handled',
            message: 'Download was handled by a browser extension (e.g. IDM/AdBlock). If the file downloaded, you can ignore this.',
            variant: 'success'
          });
        } else {
          setFeedbackConfig({ title: 'Error', message: 'Network error', variant: 'error' });
        }
        setFeedbackVisible(true);
      }
    }
  };

  const renderQuestionItem = ({ item: q, index }: any) => (
    <View
      style={[
        styles.questionCard,
        q.isCorrect ? styles.borderGreen : styles.borderRed
      ]}
    >
      <View style={styles.questionHeader}>
        <Text style={styles.questionNumber}>Question {index + 1}</Text>
        <View style={[
          styles.statusBadge,
          q.isCorrect ? styles.bgGreen : styles.bgRed
        ]}>
          <Ionicons
            name={q.isCorrect ? "checkmark" : "close"}
            size={16}
            color="#fff"
          />
          <Text style={styles.statusText}>{q.isCorrect ? 'Correct' : 'Incorrect'}</Text>
        </View>
      </View>

      <Text style={styles.questionText}>{q.question_text}</Text>

      <View style={styles.optionsContainer}>
        {q.options.map((opt: any, i: number) => {
          const isUserAnswer = q.selected_option_id === opt.id;
          const isCorrectAnswer = opt.is_correct === 1;

          let optionStyle: any = styles.optionBox;
          let textStyle: any = styles.optionText;

          if (isUserAnswer) {
            optionStyle = [styles.optionBox, isCorrectAnswer ? styles.optionUserCorrect : styles.optionUserWrong];
            textStyle = [styles.optionText, styles.textWhite];
          }

          return (
            <View key={i} style={optionStyle}>
              <Text style={textStyle}>{opt.option_text}</Text>
              {isUserAnswer && (
                <Ionicons
                  name={isCorrectAnswer ? "checkmark-circle" : "close-circle"}
                  size={18}
                  color="#fff"
                />
              )}
            </View>
          );
        })}
      </View>

      {!q.isCorrect && (
        <View style={styles.feedbackBox}>
          <Text style={styles.feedbackTitle}>Correct Answer:</Text>
          <Text style={styles.feedbackText}>
            {q.options.find((o: any) => o.is_correct === 1)?.option_text}
          </Text>
        </View>
      )}

    </View>
  );

  const renderHeader = () => (
    <View style={styles.headerContent}>
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={24} color="#003366" />
          </View>
          <View style={styles.studentInfo}>
            <Text style={styles.studentLabel}>Student</Text>
            <Text style={styles.studentNameValue}>{data?.student_name}</Text>
          </View>
          <View style={styles.scoreBadge}>
            <Text style={styles.scoreValue}>{Math.round(data?.score || 0)}</Text>
            <Text style={styles.scoreLabel}>Score</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.detailRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="calendar-outline" size={16} color="#666" />
            <Text style={[styles.detailText, { marginLeft: 4 }]}>
              {data?.completed_at ? new Date(data.completed_at).toLocaleDateString() : '-'}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons
              name={data?.score >= 60 ? "checkmark-circle" : "close-circle"}
              size={16}
              color={data?.score >= 60 ? "#28A745" : "#DC3545"}
            />
            <Text style={[styles.detailText, { marginLeft: 4, color: data?.score >= 60 ? "#28A745" : "#DC3545" }]}>
              {data?.score >= 60 ? 'Pass' : 'Fail'}
            </Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Detailed Analysis ({data?.questions?.length || 0} Questions)</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <DownloadModal
        visible={downloadModalVisible}
        onClose={() => setDownloadModalVisible(false)}
        onSelectFormat={handleDownload}
        hideExcel={true}
      />
      <AppModal
        visible={sessionExpiredVisible}
        title="Session Expired"
        message="Your session has expired. Please log in again."
        variant="error"
        confirmText="Log In"
        onConfirm={handleSessionConfirm}
      />
      <AppModal
        visible={feedbackVisible}
        title={feedbackConfig.title}
        message={feedbackConfig.message}
        variant={feedbackConfig.variant}
        confirmText="OK"
        onConfirm={() => setFeedbackVisible(false)}
      />
      <StatusBar barStyle="light-content" backgroundColor="#003366" />

      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Review Result</Text>
        <TouchableOpacity onPress={() => setDownloadModalVisible(true)}>
          <Ionicons name="download-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#003366" style={{ marginTop: 50 }} />
      ) : (
        <View style={styles.listWrapper}>
          <FlatList
            data={data?.questions || []}
            renderItem={renderQuestionItem}
            keyExtractor={item => item.question_id.toString()}
            ListHeaderComponent={renderHeader}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={true}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F6F8',
  },
  header: {
    backgroundColor: '#003366',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  listWrapper: {
    flex: 1,
    width: '100%',
  },
  listContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  headerContent: {
    marginBottom: 10,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E6F0FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  studentInfo: {
    flex: 1,
  },
  studentLabel: {
    fontSize: 12,
    color: '#888',
    textTransform: 'uppercase',
  },
  studentNameValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  scoreBadge: {
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#003366',
  },
  scoreLabel: {
    fontSize: 10,
    color: '#003366',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#EFF1F5',
    marginVertical: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  questionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'transparent',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  borderGreen: {
    borderColor: '#28A745',
    borderLeftWidth: 6,
  },
  borderRed: {
    borderColor: '#DC3545',
    borderLeftWidth: 6,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  questionNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#888',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  bgGreen: { backgroundColor: '#28A745' },
  bgRed: { backgroundColor: '#DC3545' },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    lineHeight: 24,
  },
  optionsContainer: {
    marginBottom: 10,
  },
  optionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EFF1F5',
    marginBottom: 8,
    backgroundColor: '#F9FAFB',
  },
  optionUserCorrect: {
    backgroundColor: '#28A745',
    borderColor: '#28A745',
  },
  optionUserWrong: {
    backgroundColor: '#DC3545',
    borderColor: '#DC3545',
  },
  optionText: {
    fontSize: 14,
    color: '#555',
  },
  textWhite: {
    color: '#fff',
    fontWeight: '600',
  },
  feedbackBox: {
    marginTop: 10,
    backgroundColor: '#FFF5F5',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FED7D7',
  },
  feedbackTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#C53030',
    marginBottom: 2,
  },
  feedbackText: {
    fontSize: 14,
    color: '#C53030',
  }
});

export default StudentResultScreen;
