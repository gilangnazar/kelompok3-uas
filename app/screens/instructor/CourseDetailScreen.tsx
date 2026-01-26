import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import React, { useState, useCallback } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, StatusBar, ActivityIndicator, FlatList, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../../config/api';
import AppModal from '../../components/AppModal';

export default function CourseDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { classId, className } = params;
  
  const [activeTab, setActiveTab] = useState('assignment'); // assignment, schedule, material
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sessionExpiredVisible, setSessionExpiredVisible] = useState(false);

  const handleSessionConfirm = async () => {
    setSessionExpiredVisible(false);
    await AsyncStorage.multiRemove(['token', 'user']);
    router.replace('/screens/auth/LoginScreen');
  };

  // Data States
  const [schedules, setSchedules] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [assignments, setAssignments] = useState([]);

  const fetchData = useCallback(async () => {
    try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          setSessionExpiredVisible(true);
          return;
        }

        const headers = { 'Authorization': `Bearer ${token}` };

        // Fetch all data in parallel
        const [scheduleRes, materialRes, assignmentRes] = await Promise.all([
            fetch(`${API_URL}/api/instructor/course-content/${classId}/schedules`, { headers }),
            fetch(`${API_URL}/api/instructor/course-content/${classId}/materials`, { headers }),
            fetch(`${API_URL}/api/instructor/course-content/${classId}/assignments`, { headers })
        ]);

        if ([scheduleRes, materialRes, assignmentRes].some(r => r.status === 401 || r.status === 403)) {
            setSessionExpiredVisible(true);
            return;
        }

        if (scheduleRes.ok) setSchedules(await scheduleRes.json());
        if (materialRes.ok) setMaterials(await materialRes.json());
        if (assignmentRes.ok) setAssignments(await assignmentRes.json());

    } catch (error) {
        console.error('Error fetching course details:', error);
    } finally {
        setLoading(false);
        setRefreshing(false);
    }
  }, [classId]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/screens/instructor/CourseListScreen');
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  const renderSchedule = ({ item }: { item: any }) => (
    <View style={styles.card}>
        <View style={styles.scheduleRow}>
            <View style={styles.dateBox}>
                <Text style={styles.dateDay}>{item.session_date ? new Date(item.session_date).getDate() : '--'}</Text>
                <Text style={styles.dateMonth}>
                   {item.session_date ? new Date(item.session_date).toLocaleString('default', { month: 'short' }) : '--'}
                </Text>
            </View>
            <View style={{flex: 1, marginLeft: 16}}>
                <Text style={styles.cardTitle}>{item.session_topic}</Text>
                <Text style={styles.cardSubtitle}>{new Date(item.session_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} • {item.location}</Text>
            </View>
        </View>
    </View>
  );

  const renderMaterial = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.card}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Ionicons name="document-text" size={32} color="#003366" />
            <View style={{marginLeft: 16, flex: 1}}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardSubtitle}>
                    {item.file_path ? item.file_path.split('.').pop()?.toUpperCase() : 'FILE'} • {formatDate(item.uploaded_at)}
                </Text>
            </View>
            <Ionicons name="download-outline" size={24} color="#666" />
        </View>
    </TouchableOpacity>
  );

  const renderAssignment = ({ item }: { item: any }) => {
    const isQuiz = item.type === 'quiz';
    return (
        <TouchableOpacity 
            style={styles.card}
            onPress={() => {
                if (isQuiz) {
                    router.push({
                        pathname: '/screens/instructor/QuizDetailScreen',
                        params: { id: item.id, classId, className }
                    });
                }
            }}
        >
            <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8}}>
                <View style={[styles.badge, isQuiz ? styles.bgBlue : styles.bgGray]}>
                    <Text style={[styles.badgeText, isQuiz ? styles.textBlue : styles.textGray]}>
                        {isQuiz ? 'QUIZ' : 'ASSIGNMENT'}
                    </Text>
                </View>
                <Text style={styles.dueDate}>Due: {formatDate(item.due_date)}</Text>
            </View>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
        </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#003366" />
      <AppModal
        visible={sessionExpiredVisible}
        title="Session Expired"
        message="Sesi Anda telah habis. Silakan login ulang."
        variant="error"
        confirmText="Login"
        onConfirm={handleSessionConfirm}
      />
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={{padding: 5}}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{className}</Text>
        <View style={{width: 24}} />
      </View>

      <View style={styles.tabContainer}>
        {['Schedule', 'Material', 'Assignment'].map((tab) => {
            const key = tab.toLowerCase();
            const isActive = activeTab === key;
            return (
                <TouchableOpacity 
                    key={key} 
                    style={[styles.tabButton, isActive && styles.activeTab]}
                    onPress={() => setActiveTab(key)}
                >
                    <Text style={[styles.tabText, isActive && styles.activeTabText]}>{tab}</Text>
                </TouchableOpacity>
            )
        })}
      </View>

      <View style={styles.content}>
        {loading ? (
             <ActivityIndicator size="large" color="#003366" style={{marginTop: 50}} />
        ) : (
            <>
                {activeTab === 'assignment' && (
                    <>
                        <View style={styles.listHeaderRow}>
                            <Text style={styles.sectionLabel}>Assignments & Quizzes</Text>
                            <TouchableOpacity 
                                style={styles.addBtn}
                                onPress={() => router.push({
                                    pathname: '/screens/instructor/CreateAssignmentScreen',
                                    params: { classId }
                                })}
                            >
                                <Ionicons name="add" size={20} color="#fff" />
                                <Text style={{color: '#fff', fontSize: 12, fontWeight: 'bold', marginLeft: 4}}>New Assignment</Text>
                            </TouchableOpacity>
                        </View>
                        <FlatList 
                            data={assignments} 
                            renderItem={renderAssignment} 
                            keyExtractor={i => i.id.toString()}
                            contentContainerStyle={{paddingBottom: 80}}
                            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                            ListEmptyComponent={<Text style={{textAlign: 'center', marginTop: 20, color: '#999'}}>No assignments found.</Text>}
                        />
                    </>
                )}

                {activeTab === 'schedule' && (
                    <FlatList 
                        data={schedules} 
                        renderItem={renderSchedule} 
                        keyExtractor={i => i.id.toString()} 
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                        ListEmptyComponent={<Text style={{textAlign: 'center', marginTop: 20, color: '#999'}}>No schedules found.</Text>}
                    />
                )}
                {activeTab === 'material' && (
                    <FlatList 
                        data={materials} 
                        renderItem={renderMaterial} 
                        keyExtractor={i => i.id.toString()} 
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                        ListEmptyComponent={<Text style={{textAlign: 'center', marginTop: 20, color: '#999'}}>No materials found.</Text>}
                    />
                )}
            </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F4F6F8' },
  header: { 
      backgroundColor: '#003366', 
      padding: 20, 
      paddingTop: 50, // Added padding top for status bar
      flexDirection: 'row', 
      alignItems: 'center', 
      justifyContent: 'space-between' 
  },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', flex: 1, textAlign: 'center' },
  tabContainer: { flexDirection: 'row', backgroundColor: '#fff', elevation: 2 },
  tabButton: { flex: 1, paddingVertical: 16, alignItems: 'center', borderBottomWidth: 3, borderBottomColor: 'transparent' },
  activeTab: { borderBottomColor: '#003366' },
  tabText: { fontSize: 14, fontWeight: '600', color: '#999' },
  activeTabText: { color: '#003366' },
  content: { flex: 1, padding: 20 },
  listHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionLabel: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  addBtn: { 
      flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, 
      backgroundColor: '#003366', alignItems: 'center' 
  },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 1 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  cardSubtitle: { fontSize: 12, color: '#888' },
  scheduleRow: { flexDirection: 'row', alignItems: 'center' },
  dateBox: { backgroundColor: '#E6F0FF', borderRadius: 8, padding: 10, alignItems: 'center', width: 60 },
  dateDay: { fontSize: 18, fontWeight: 'bold', color: '#003366' },
  dateMonth: { fontSize: 10, color: '#003366' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, alignSelf: 'flex-start' },
  bgBlue: { backgroundColor: '#E6F0FF' },
  bgGray: { backgroundColor: '#F3F4F6' },
  badgeText: { fontSize: 10, fontWeight: 'bold' },
  textBlue: { color: '#003366' },
  textGray: { color: '#374151' },
  dueDate: { fontSize: 12, color: '#666' },
  cardDesc: { fontSize: 12, color: '#666', marginTop: 4 },
});
