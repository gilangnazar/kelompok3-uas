import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Platform, RefreshControl, SafeAreaView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { API_URL } from '../../../config/api';
import AppModal from '../../components/AppModal';
import DownloadModal from '../../components/DownloadModal';

const ScoreListScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { quizId, quizTitle, assignmentId, classId, className } = params;

  const [students, setStudents] = useState<any[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [downloadModalVisible, setDownloadModalVisible] = useState(false);
  const [sessionExpiredVisible, setSessionExpiredVisible] = useState(false);

  const handleSessionConfirm = async () => {
    setSessionExpiredVisible(false);
    await AsyncStorage.multiRemove(['token', 'user']);
    router.replace('/screens/auth/LoginScreen');
  };

  const fetchScores = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setSessionExpiredVisible(true);
        return;
      }

      const response = await fetch(`${API_URL}/api/instructor/scores/quiz/${quizId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 401 || response.status === 403) {
        setSessionExpiredVisible(true);
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setStudents(data);
        setFilteredStudents(data);
      } else {
        console.error('Failed to fetch scores');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchScores();
  }, [quizId]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchScores();
  }, [quizId]);

  const handleDownload = async (format: 'pdf' | 'xlsx') => {
      setDownloadModalVisible(false);
      try {
          const token = await AsyncStorage.getItem('token');
          if (!token) {
            setSessionExpiredVisible(true);
            return;
          }

          const url = `${API_URL}/api/instructor/scores/quiz/${quizId}/export?format=${format}`;

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
            const safeTitle = sanitizeFileName(String(quizTitle || 'quiz').toLowerCase()) || 'quiz';
            return `${safeTitle}_${ts}.${format}`;
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
              Alert.alert('Error', 'Failed to generate report');
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
            Alert.alert('Error', 'Failed to generate report');
            return;
          }

          if (Platform.OS === 'android') {
            const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
            if (!permissions.granted) {
              Alert.alert('Cancelled', 'Storage access was denied.');
              return;
            }

            const base64 = await FileSystem.readAsStringAsync(downloadRes.uri, {
              encoding: FileSystem.EncodingType.Base64
            });
            const mimeType =
              format === 'pdf'
                ? 'application/pdf'
                : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

            const createdUri = await FileSystem.StorageAccessFramework.createFileAsync(
              permissions.directoryUri,
              fallbackName,
              mimeType
            );
            await FileSystem.writeAsStringAsync(createdUri, base64, {
              encoding: FileSystem.EncodingType.Base64
            });
            Alert.alert('Success', 'File saved to the selected folder.');
            return;
          }

          if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(downloadRes.uri);
          } else {
            Alert.alert('Success', `File saved: ${downloadRes.uri}`);
          }
      } catch (error) {
          console.error(error);
          Alert.alert('Error', 'Network error');
      }
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (text.trim() === '') {
      setFilteredStudents(students);
    } else {
      const filtered = students.filter(s => 
        s.student_name.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredStudents(filtered);
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      if (assignmentId) {
        router.replace({
          pathname: '/screens/instructor/QuizDetailScreen',
          params: { id: assignmentId, classId, className }
        });
      } else {
        router.replace('/screens/instructor/CourseListScreen');
      }
    }
  };

  const getInitials = (name: string) => {
    if (!name) return '??';
    return name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const datePart = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const timePart = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    return `${datePart} ${timePart}`;
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.studentCard}
      activeOpacity={0.7}
      onPress={() => router.push({ 
          pathname: '/screens/instructor/StudentResultScreen', 
          params: { attemptId: item.attempt_id, quizId, quizTitle, assignmentId, classId, className } 
      })}
    >
      <View style={styles.avatarContainer}>
        <Text style={styles.avatarText}>{getInitials(item.student_name)}</Text>
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.studentName}>{item.student_name}</Text>
        <Text style={styles.completedDate}>Submitted: {formatDate(item.submitted_at)}</Text>
      </View>
      
      <View style={styles.scoreWrapper}>
        <Text style={styles.scoreText}>{Math.round(item.score)}</Text>
        <Text style={styles.scoreTotal}>/100</Text>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${item.score}%` }]} />
        </View>
      </View>
      
      <Ionicons name="chevron-forward" size={20} color="#ccc" style={{marginLeft: 10}} />
    </TouchableOpacity>
  );

  const headerElement = useMemo(
    () => (
      <View style={styles.headerContent}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={{ marginRight: 10 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search student..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={handleSearch}
          />
          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="filter" size={20} color="#003366" />
          </TouchableOpacity>
        </View>

        <Text style={styles.listHeader}>Student List ({filteredStudents.length})</Text>
      </View>
    ),
    [searchQuery, filteredStudents.length]
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <DownloadModal 
        visible={downloadModalVisible}
        onClose={() => setDownloadModalVisible(false)}
        onSelectFormat={handleDownload}
      />
      <AppModal
        visible={sessionExpiredVisible}
        title="Session Expired"
        message="Your session has expired. Please log in again."
        variant="error"
        confirmText="Log In"
        onConfirm={handleSessionConfirm}
      />
      <StatusBar barStyle="light-content" backgroundColor="#003366" />
      
      <View style={styles.topHeader}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{quizTitle} Results</Text>
        <TouchableOpacity onPress={() => setDownloadModalVisible(true)}>
           <Ionicons name="download-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#003366" />
        </View>
      ) : (
        <FlatList
          data={filteredStudents}
          renderItem={renderItem}
          keyExtractor={item => item.attempt_id.toString()}
          ListHeaderComponent={headerElement}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#003366']} />
          }
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', marginTop: 50, color: '#999', fontStyle: 'italic' }}>
              No submissions found.
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F6F8',
  },
  topHeader: {
    backgroundColor: '#003366',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginHorizontal: 10,
  },
  backButton: {
    padding: 5,
  },
  listContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  headerContent: {
    marginBottom: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  filterButton: {
    padding: 5,
    borderLeftWidth: 1,
    borderLeftColor: '#eee',
    paddingLeft: 10,
    marginLeft: 10,
  },
  listHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E6F0FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: '#003366',
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoContainer: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  completedDate: {
    fontSize: 12,
    color: '#888',
  },
  scoreWrapper: {
    alignItems: 'flex-end',
    width: 70,
  },
  scoreText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#003366',
  },
  scoreTotal: {
    fontSize: 10,
    color: '#999',
    marginBottom: 4,
  },
  progressBarBg: {
    width: '100%',
    height: 4,
    backgroundColor: '#F0F0F0',
    borderRadius: 2,
  },
  progressBarFill: {
    height: 4,
    backgroundColor: '#28A745',
    borderRadius: 2,
  },
});

export default ScoreListScreen;
