import React, { useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { QuizContext } from '../context/QuizContext';

const ScoreListScreen = ({ route, navigation }) => {
  const { quizTitle } = route.params || { quizTitle: 'Quiz' };
  const { students } = useContext(QuizContext);

  const getInitials = (name) => {
    return name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
  };

  // Komponen Item Siswa
  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.studentCard}
      activeOpacity={0.7}
      onPress={() => navigation.navigate('StudentResult', { studentId: item.id, studentName: item.name })}
    >
      <View style={styles.avatarContainer}>
        <Text style={styles.avatarText}>{getInitials(item.name)}</Text>
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.studentName}>{item.name}</Text>
        <Text style={styles.completedDate}>Submitted: {item.completedDate}</Text>
      </View>
      
      <View style={styles.scoreWrapper}>
        <Text style={styles.scoreText}>{item.score}</Text>
        <Text style={styles.scoreTotal}>/100</Text>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${item.score}%` }]} />
        </View>
      </View>
      
      <Ionicons name="chevron-forward" size={20} color="#ccc" style={{marginLeft: 10}} />
    </TouchableOpacity>
  );

  // Bagian Header (Search Bar & Judul) agar ikut terscroll
  const renderHeader = () => (
    <View style={styles.headerContent}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={{marginRight: 10}} />
        <TextInput 
          style={styles.searchInput}
          placeholder="Search student..."
          placeholderTextColor="#999"
        />
        <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="filter" size={20} color="#003366" />
        </TouchableOpacity>
      </View>

      <Text style={styles.listHeader}>Student List ({students.length})</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#003366" />
      
      {/* Fixed Top Header (Back Button) */}
      <View style={styles.topHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{quizTitle} Results</Text>
        <TouchableOpacity>
           <Ionicons name="download-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* FlatList menangani scroll untuk SEMUA konten */}
      <FlatList
        data={students}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        ListHeaderComponent={renderHeader} // Masukkan Search Bar di sini
        contentContainerStyle={styles.listContainer} // Padding untuk scroll
        showsVerticalScrollIndicator={false}
      />
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 20,
    paddingBottom: 100, // Ruang ekstra di bawah untuk scroll
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