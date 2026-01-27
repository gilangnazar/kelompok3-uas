import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, RefreshControl, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { API_URL } from '../../../config/api';
import AppModal from '../../components/AppModal';
import BottomNavigator from '../../components/navigation/BottomNavigator';

const CourseListScreen = () => {
  const router = useRouter();
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sessionExpiredVisible, setSessionExpiredVisible] = useState(false);

  const handleSessionConfirm = async () => {
    setSessionExpiredVisible(false);
    await AsyncStorage.multiRemove(['token', 'user']);
    router.replace('/screens/auth/LoginScreen');
  };

  const fetchCourses = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setSessionExpiredVisible(true);
        return;
      }

      const response = await fetch(`${API_URL}/api/instructor/courses`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401 || response.status === 403) {
        setSessionExpiredVisible(true);
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setClasses(data);
      } else {
        console.error('Failed to fetch courses');
        Alert.alert('Error', 'Failed to load courses');
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      Alert.alert('Error', 'Network error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCourses();
  }, []);

  const renderClassItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.classCard}
      activeOpacity={0.8}
      onPress={() => router.push({
        pathname: '/screens/instructor/CourseDetailScreen',
        params: { classId: item.id, className: item.name }
      })}
    >
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
            <Ionicons name="book" size={24} color="#fff" />
        </View>
        <View style={{flex: 1}}>
            <Text style={styles.classCode}>#ID{item.id}</Text>
            <Text style={styles.className}>{item.name}</Text>
        </View>
      </View>
      
      <View style={styles.cardFooter}>
         <View style={styles.footerItem}>
            <Ionicons name="people-outline" size={16} color="#666" />
            <Text style={styles.footerText}>{item.studentsCount} Students</Text>
         </View>
         <View style={styles.footerItem}>
            <Ionicons name="calendar-outline" size={16} color="#666" />
            <Text style={styles.footerText}>
              {item.start_date ? new Date(item.start_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}
              {' - '}
              {item.end_date ? new Date(item.end_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}
            </Text>
         </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#F4F6F8' }}>
      <SafeAreaView style={styles.safeArea}>
        <AppModal
          visible={sessionExpiredVisible}
          title="Session Expired"
          message="Your session has expired. Please log in again."
          variant="error"
          confirmText="Log In"
          onConfirm={handleSessionConfirm}
        />
        <StatusBar barStyle="dark-content" backgroundColor="#F4F6F8" />
        
        <View style={styles.header}>
          <View>
              <Text style={styles.headerTitle}>My Courses</Text>
          </View>
        </View>

        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#003366" />
          </View>
        ) : (
          <FlatList
            data={classes}
            renderItem={renderClassItem}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#003366']} />
            }
            ListEmptyComponent={
              <Text style={{ textAlign: 'center', marginTop: 20, color: '#666' }}>
                No courses assigned yet.
              </Text>
            }
          />
        )}
      </SafeAreaView>

      <BottomNavigator
        activeKey='courses'
        items={[
          { key: 'home', label: 'Dashboard', icon: 'grid', onPress: () => router.push('/screens/instructor/InstructorDashboard') },
          { key: 'courses', label: 'Courses', icon: 'book', onPress: () => {} },
          { key: 'discussion', label: 'Discussion', icon: 'chatbubbles' },
          { key: 'profile', label: 'Profile', icon: 'person', onPress: () => router.push('/screens/instructor/ProfileScreen') }
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    padding: 24,
    paddingTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: { fontSize: 14, color: '#666' },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#003366' },
  profileBtn: { marginLeft: 'auto' }, 
  listContainer: { padding: 24, paddingTop: 0 },
  classCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  iconContainer: {
    width: 48, height: 48, borderRadius: 12, backgroundColor: '#003366',
    alignItems: 'center', justifyContent: 'center', marginRight: 16
  },
  classCode: { fontSize: 12, color: '#888', fontWeight: 'bold' },
  className: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  cardFooter: { 
      flexDirection: 'row', justifyContent: 'space-between', 
      borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 12 
  },
  footerItem: { flexDirection: 'row', alignItems: 'center' },
  footerText: { marginLeft: 6, color: '#666', fontSize: 12, fontWeight: '500' }
});

export default CourseListScreen;
