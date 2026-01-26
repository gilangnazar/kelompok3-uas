import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, StatusBar, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { quizResultDetails } from '../data/dummyData';

const StudentResultScreen = ({ route, navigation }) => {
  const { studentName, score } = quizResultDetails;

  // SIMULASI: Data pertanyaan diperbanyak jadi 12 soal
  const longQuestionsList = [
    ...quizResultDetails.questions,
    ...quizResultDetails.questions, 
    ...quizResultDetails.questions
  ].map((q, index) => ({ ...q, id: index.toString() }));

  const renderQuestionItem = ({ item: q, index }) => (
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
      
      <Text style={styles.questionText}>{q.text}</Text>

      <View style={styles.optionsContainer}>
        {q.options.map((opt, i) => {
            const optionLabel = String.fromCharCode(65 + i);
            const isUserAnswer = q.userAnswer === optionLabel;
            const isCorrectAnswer = q.correctAnswer === optionLabel;
            
            let optionStyle = styles.optionBox;
            let textStyle = styles.optionText;

            if (isUserAnswer) {
              optionStyle = [styles.optionBox, q.isCorrect ? styles.optionUserCorrect : styles.optionUserWrong];
              textStyle = [styles.optionText, styles.textWhite];
            } else if (!q.isCorrect && isCorrectAnswer) {
                optionStyle = [styles.optionBox, styles.optionCorrectShow];
                textStyle = [styles.optionText, styles.textGreen];
            }

            return (
              <View key={i} style={optionStyle}>
                  <Text style={textStyle}><Text style={{fontWeight: 'bold'}}>{optionLabel}.</Text> {opt}</Text>
                  {isUserAnswer && (
                    <Ionicons 
                      name={q.isCorrect ? "checkmark-circle" : "close-circle"} 
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
            <Text style={styles.feedbackText}>Option {q.correctAnswer}</Text>
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
              <Text style={styles.studentNameValue}>{studentName}</Text>
          </View>
          <View style={styles.scoreBadge}>
            <Text style={styles.scoreValue}>{score}</Text>
            <Text style={styles.scoreLabel}>Score</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.detailRow}>
            <Text style={styles.detailText}>📅 {quizResultDetails.completedDate}</Text>
            <Text style={styles.detailText}>✅ Pass</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Detailed Analysis ({longQuestionsList.length} Questions)</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#003366" />
      
      {/* Header Fixed */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
           <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Review Result</Text>
        <View style={{width: 24}} /> 
      </View>

      {/* FlatList */}
      <View style={styles.listWrapper}>
        <FlatList
          data={longQuestionsList}
          renderItem={renderQuestionItem}
          keyExtractor={item => item.id}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={true}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1, // KUNCI: Flex 1 agar mengisi parent (yang sekarang sudah fixed di App.js)
    backgroundColor: '#F4F6F8',
  },
  header: {
    backgroundColor: '#003366',
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
    height: 60,
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
    flex: 1, // FlatList Wrapper juga harus Flex 1
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
  optionCorrectShow: {
    borderColor: '#28A745',
    backgroundColor: '#F0FFF4',
    borderWidth: 2,
  },
  optionText: {
    fontSize: 14,
    color: '#555',
  },
  textWhite: {
    color: '#fff',
    fontWeight: '600',
  },
  textGreen: {
    color: '#28A745',
    fontWeight: 'bold',
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