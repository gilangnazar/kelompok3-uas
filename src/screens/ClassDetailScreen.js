import React, { useState, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { QuizContext } from '../context/QuizContext';

const ClassDetailScreen = ({ route, navigation }) => {
  const { classId, className } = route.params;
  const { schedules, materials, quizzes } = useContext(QuizContext);
  const [activeTab, setActiveTab] = useState('quiz'); 

  const classSchedules = schedules.filter(s => s.classId === classId);
  const classMaterials = materials.filter(m => m.classId === classId);
  const classQuizzes = quizzes.filter(q => q.classId === classId);

  const renderSchedule = ({ item }) => (
    <View style={styles.card}>
        <View style={styles.scheduleRow}>
            <View style={styles.dateBox}>
                <Text style={styles.dateDay}>{item.date.split('-')[2]}</Text>
                <Text style={styles.dateMonth}>Jan</Text>
            </View>
            <View style={{flex: 1, marginLeft: 16}}>
                <Text style={styles.cardTitle}>{item.topic}</Text>
                <Text style={styles.cardSubtitle}>{item.time} • {item.location}</Text>
            </View>
        </View>
    </View>
  );

  const renderMaterial = ({ item }) => (
    <TouchableOpacity style={styles.card}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Ionicons name="document-text" size={32} color="#003366" />
            <View style={{marginLeft: 16, flex: 1}}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardSubtitle}>{item.type.toUpperCase()} • {item.size}</Text>
            </View>
            <Ionicons name="download-outline" size={24} color="#666" />
        </View>
    </TouchableOpacity>
  );

  const renderQuiz = ({ item }) => (
    <TouchableOpacity 
        style={styles.card}
        onPress={() => navigation.navigate('QuizDetail', { quiz: item })}
    >
        <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8}}>
            <View style={[styles.badge, styles.bgBlue]}>
                <Text style={[styles.badgeText, styles.textBlue]}>QUIZ</Text>
            </View>
            <Text style={styles.dueDate}>Due: {item.dueDate}</Text>
        </View>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{padding: 5}}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{className}</Text>
        <View style={{width: 24}} />
      </View>

      <View style={styles.tabContainer}>
        {['Schedule', 'Material', 'Quiz'].map((tab) => {
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
        {activeTab === 'quiz' && (
            <View style={styles.listHeaderRow}>
                <Text style={styles.sectionLabel}>Available Quizzes</Text>
                <TouchableOpacity 
                    style={styles.addBtn}
                    onPress={() => navigation.navigate('CreateQuiz', { classId: classId })}
                 >
                    <Ionicons name="add" size={20} color="#fff" />
                    <Text style={{color: '#fff', fontSize: 12, fontWeight: 'bold', marginLeft: 4}}>New Quiz</Text>
                 </TouchableOpacity>
            </View>
        )}

        {activeTab === 'schedule' && (
            <FlatList data={classSchedules} renderItem={renderSchedule} keyExtractor={i => i.id} />
        )}
        {activeTab === 'material' && (
            <FlatList data={classMaterials} renderItem={renderMaterial} keyExtractor={i => i.id} />
        )}
        {activeTab === 'quiz' && (
            <FlatList 
                data={classQuizzes} 
                renderItem={renderQuiz} 
                keyExtractor={i => i.id}
                contentContainerStyle={{paddingBottom: 80}}
            />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F4F6F8' },
  header: { backgroundColor: '#003366', padding: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
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
  badgeText: { fontSize: 10, fontWeight: 'bold' },
  textBlue: { color: '#003366' },
  dueDate: { fontSize: 12, color: '#666' },
  cardDesc: { fontSize: 12, color: '#666', marginTop: 4 },
});

export default ClassDetailScreen;