import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, StatusBar, SafeAreaView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { QuizContext } from '../context/QuizContext';

const DashboardScreen = ({ navigation }) => {
  const { quizzes, loading, resetData } = useContext(QuizContext);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#003366" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F6F8" />
      <View style={styles.container}>
        
        {/* Header Area */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greetingText}>Hello, Instructor!</Text>
            <Text style={styles.headerTitle}>Dashboard</Text>
          </View>
          <View style={{flexDirection: 'row'}}>
             <TouchableOpacity onPress={resetData} style={{marginRight: 10, padding: 5}}>
               <Ionicons name="refresh-circle-outline" size={35} color="#666" />
             </TouchableOpacity>
             <TouchableOpacity style={styles.profileButton}>
               <Ionicons name="person-circle-outline" size={40} color="#003366" />
             </TouchableOpacity>
          </View>
        </View>

        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }} // FIX SCROLL: Memberi ruang di bawah
        >
          
          {/* Class Card */}
          <View style={styles.classCard}>
            <View style={styles.classHeaderRow}>
              <Text style={styles.classTitle}>Class A</Text>
              <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
                <TextInput 
                  style={styles.searchInput}
                  placeholder="Search..."
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            <Text style={styles.subHeader}>Active Quizzes ({quizzes.length})</Text>
            
            {quizzes.map((quiz) => (
              <TouchableOpacity 
                key={quiz.id} 
                style={styles.quizCard}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('ScoreList', { quizId: quiz.id, quizTitle: quiz.title })}
              >
                <View style={styles.quizIconContainer}>
                  <Ionicons name="document-text" size={24} color="#003366" />
                </View>
                <View style={styles.quizInfo}>
                  <Text style={styles.quizTitle}>{quiz.title}</Text>
                  <Text style={styles.quizDesc}>{quiz.description} • {quiz.duration} mins</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#ccc" />
              </TouchableOpacity>
            ))}

            {/* Create New Quiz Button */}
            <TouchableOpacity 
              style={styles.createButton}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('CreateQuiz')}
            >
              <Ionicons name="add-circle" size={24} color="#fff" style={{marginRight: 10}} />
              <Text style={styles.createButtonText}>Create New Quiz</Text>
            </TouchableOpacity>

          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F6F8',
  },
  container: {
    flex: 1,
    backgroundColor: '#F4F6F8',
  },
  center: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center'
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greetingText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#003366',
  },
  profileButton: {
    padding: 5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  classCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 30,
  },
  classHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  classTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F2F5',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    width: 140,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    padding: 0,
  },
  subHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#888',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  quizCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EFF1F5',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  quizIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: '#E6F0FF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  quizInfo: {
    flex: 1,
  },
  quizTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  quizDesc: {
    fontSize: 12,
    color: '#888',
  },
  createButton: {
    backgroundColor: '#003366',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 18,
    borderRadius: 16,
    marginTop: 10,
    shadowColor: "#003366",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DashboardScreen;