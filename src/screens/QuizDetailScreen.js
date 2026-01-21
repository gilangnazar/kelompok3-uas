
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const QuizDetailScreen = ({ route, navigation }) => {
  const { quiz } = route.params;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#003366" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{padding: 5}}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quiz Detail</Text>
        <TouchableOpacity>
             <Ionicons name="create-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.mainCard}>
            <Text style={styles.title}>{quiz.title}</Text>
            
            <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                    <Ionicons name="time-outline" size={16} color="#666" />
                    <Text style={styles.metaText}>{quiz.duration} Mins</Text>
                </View>
                <View style={styles.metaItem}>
                    <Ionicons name="calendar-outline" size={16} color="#666" />
                    <Text style={styles.metaText}>Due: {quiz.dueDate}</Text>
                </View>
            </View>

            <View style={styles.divider} />
            <Text style={styles.descLabel}>Description</Text>
            <Text style={styles.descText}>{quiz.description}</Text>
        </View>

        <View style={styles.statsCard}>
            <Text style={styles.sectionTitle}>Performance Summary</Text>
            <View style={styles.statsRow}>
                <View style={styles.statBox}>
                    <Text style={styles.statValue}>28</Text>
                    <Text style={styles.statLabel}>Submitted</Text>
                </View>
                <View style={styles.statBox}>
                    <Text style={styles.statValue}>2</Text>
                    <Text style={styles.statLabel}>Pending</Text>
                </View>
                <View style={styles.statBox}>
                    <Text style={styles.statValue}>85</Text>
                    <Text style={styles.statLabel}>Avg Score</Text>
                </View>
            </View>
        </View>

        {/* Action Button */}
        <TouchableOpacity 
            style={styles.actionBtn}
            onPress={() => navigation.navigate('ScoreList', { quizTitle: quiz.title, quizId: quiz.id })}
        >
            <Text style={styles.actionText}>View Student Scores</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>

         {/* Questions Preview (Read Only) */}
         <Text style={styles.sectionTitle}>Questions Preview</Text>
         {quiz.questions && quiz.questions.map((q, i) => (
             <View key={i} style={styles.qCard}>
                 <Text style={styles.qText}>{i+1}. {q.text}</Text>
                 {q.options.map((opt, idx) => (
                     <Text key={idx} style={[
                         styles.optText, 
                         idx === q.correctAnswerIndex && styles.correctOpt
                     ]}>
                        - {opt} {idx === q.correctAnswerIndex ? '(Correct)' : ''}
                     </Text>
                 ))}
             </View>
         ))}

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F4F6F8' },
  header: { 
      backgroundColor: '#003366', padding: 20, flexDirection: 'row', 
      alignItems: 'center', justifyContent: 'space-between' 
  },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  content: { padding: 20, paddingBottom: 50 },
  mainCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 20 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 12 },
  metaRow: { flexDirection: 'row', marginBottom: 16 },
  metaItem: { flexDirection: 'row', alignItems: 'center', marginRight: 20 },
  metaText: { marginLeft: 6, color: '#666' },
  divider: { height: 1, backgroundColor: '#eee', marginBottom: 16 },
  descLabel: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  descText: { fontSize: 14, color: '#666', lineHeight: 22 },
  
  statsCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 16 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statBox: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#003366' },
  statLabel: { fontSize: 12, color: '#666' },
  
  actionBtn: { 
      backgroundColor: '#003366', borderRadius: 12, padding: 18, 
      flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 30
  },
  actionText: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginRight: 8 },

  qCard: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 10 },
  qText: { fontWeight: 'bold', marginBottom: 8 },
  optText: { marginLeft: 10, color: '#555', marginBottom: 2 },
  correctOpt: { color: '#28a745', fontWeight: 'bold' }
});

export default QuizDetailScreen;
