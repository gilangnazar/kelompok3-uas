
import React, { useState, useContext } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { QuizContext } from '../context/QuizContext';

// Import DateTimePicker secara kondisional untuk menghindari error bundling di Web
let DateTimePicker;
if (Platform.OS !== 'web') {
    DateTimePicker = require('@react-native-community/datetimepicker').default;
}

const CreateQuizScreen = ({ route, navigation }) => {
  const { classId } = route.params || {}; 
  const { addQuiz } = useContext(QuizContext);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [dueDateText, setDueDateText] = useState('');

  const [questions, setQuestions] = useState([
    { id: 1, text: '', options: ['Option A', 'Option B', 'Option C', 'Option D'], correctAnswerIndex: 3 }
  ]);

  const handleAddQuestion = () => {
    const newId = (questions.length + 1).toString();
    setQuestions([...questions, { id: newId, text: '', options: ['', '', '', ''], correctAnswerIndex: 0 }]);
  };

  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowPicker(Platform.OS === 'ios');
    setDate(currentDate);
    
    let fDate = currentDate.getFullYear() + '-' + 
                ('0' + (currentDate.getMonth() + 1)).slice(-2) + '-' + 
                ('0' + currentDate.getDate()).slice(-2);
    setDueDateText(fDate);
  };

  const handlePublish = async () => {
    if (!title || !description || !duration || !dueDateText) {
      const msg = "Please fill in all details including Due Date.";
      Platform.OS === 'web' ? window.alert(msg) : Alert.alert("Error", msg);
      return;
    }
    
    await addQuiz({
      classId, type: 'quiz', title, description,
      duration: parseInt(duration), dueDate: dueDateText,
      questions, status: 'active', createdAt: new Date().toISOString()
    });

    if (Platform.OS === 'web') {
       setTimeout(() => { window.alert("Quiz Created Successfully!"); navigation.goBack(); }, 100);
    } else {
       Alert.alert("Success", "Quiz Created Successfully!", [{ text: "OK", onPress: () => navigation.goBack() }]);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create New Quiz</Text>
        <View style={{width: 24}} /> 
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.card}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Quiz Title</Text>
            <TextInput style={styles.input} placeholder="e.g. Midterm Exam" value={title} onChangeText={setTitle} />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Description</Text>
            <TextInput style={[styles.input, styles.textArea]} placeholder="Short description..." value={description} onChangeText={setDescription} multiline />
          </View>
          
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <View style={{width: '48%'}}>
                <Text style={styles.label}>Duration (Mins)</Text>
                <TextInput style={styles.input} placeholder="60" value={duration} onChangeText={setDuration} keyboardType="numeric" />
            </View>
            
            <View style={{width: '48%'}}>
                <Text style={styles.label}>Due Date</Text>
                {Platform.OS === 'web' ? (
                    <input 
                        type="date" 
                        value={dueDateText}
                        onChange={(e) => setDueDateText(e.target.value)}
                        style={{
                            padding: '10px',
                            borderRadius: '10px',
                            border: '1px solid #E5E7EB',
                            backgroundColor: '#F9FAFB',
                            fontSize: '16px',
                            fontFamily: 'sans-serif',
                            width: '100%',
                            color: '#333',
                            height: '46px',
                            outline: 'none'
                        }}
                    />
                ) : (
                    <TouchableOpacity style={styles.dateInputBtn} onPress={() => setShowPicker(true)}>
                        <Text style={[styles.dateInputText, !dueDateText && {color: '#999'}]}>
                            {dueDateText || 'Select Date'}
                        </Text>
                        <Ionicons name="calendar-outline" size={20} color="#003366" />
                    </TouchableOpacity>
                )}

                {showPicker && Platform.OS !== 'web' && DateTimePicker && (
                    <DateTimePicker value={date} mode="date" display="default" onChange={onChangeDate} minimumDate={new Date()} />
                )}
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Questions Builder ({questions.length})</Text>

        {questions.map((q, index) => (
          <View key={q.id} style={styles.questionCard}>
            <View style={styles.questionHeader}>
              <Text style={styles.questionHeaderText}>Question #{index + 1}</Text>
              <TouchableOpacity onPress={() => setQuestions(questions.filter(item => item.id !== q.id))}>
                <Ionicons name="trash-outline" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
            <View style={styles.questionBody}>
              <TextInput 
                style={styles.questionInput} placeholder="Type your question here..." 
                value={q.text} onChangeText={(text) => {
                    const newQs = [...questions]; newQs[index].text = text; setQuestions(newQs);
                }}
              />
              <Text style={styles.optionsLabel}>Options:</Text>
              {q.options.map((opt, optIndex) => (
                <View key={optIndex} style={styles.optionRow}>
                  <TouchableOpacity onPress={() => {
                      const newQs = [...questions]; newQs[index].correctAnswerIndex = optIndex; setQuestions(newQs);
                  }}>
                    <View style={[styles.radioOuter, q.correctAnswerIndex === optIndex && styles.radioActiveBorder]}>
                      {q.correctAnswerIndex === optIndex && <View style={styles.radioInner} />}
                    </View>
                  </TouchableOpacity>
                  <TextInput 
                    style={[styles.optionInput, q.correctAnswerIndex === optIndex && styles.optionInputActive]}
                    placeholder={`Option ${optIndex + 1}`} value={opt}
                    onChangeText={(text) => {
                        const newQs = [...questions]; newQs[index].options[optIndex] = text; setQuestions(newQs);
                    }}
                  />
                </View>
              ))}
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.addQuestionButton} onPress={handleAddQuestion}>
            <Ionicons name="add" size={24} color="#003366" />
            <Text style={styles.addQuestionText}>Add New Question</Text>
        </TouchableOpacity>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.draftButton} onPress={() => navigation.goBack()}>
            <Text style={styles.draftButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.publishButton} onPress={handlePublish}>
            <Text style={styles.publishButtonText}>Publish Quiz</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F4F6F8' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#E0E0E0',
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  backButton: { padding: 5 },
  container: { flex: 1, padding: 20 },
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 24,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 5, elevation: 2,
  },
  inputContainer: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8 },
  input: {
    backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB',
    borderRadius: 10, paddingHorizontal: 15, paddingVertical: 12,
    fontSize: 16, color: '#333',
  },
  textArea: { height: 80, textAlignVertical: 'top' },
  dateInputBtn: {
    backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB',
    borderRadius: 10, paddingHorizontal: 15, paddingVertical: 12,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: 46
  },
  dateInputText: { fontSize: 16, color: '#333' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 16 },
  questionCard: {
    backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden',
    marginBottom: 16, borderWidth: 1, borderColor: '#E5E7EB',
  },
  questionHeader: { backgroundColor: '#003366', padding: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  questionHeaderText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  questionBody: { padding: 20 },
  questionInput: { fontSize: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB', paddingBottom: 10, marginBottom: 20, fontWeight: '500', color: '#333' },
  optionsLabel: { fontSize: 12, fontWeight: '600', color: '#666', marginBottom: 10, textTransform: 'uppercase' },
  optionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  radioOuter: { height: 22, width: 22, borderRadius: 11, borderWidth: 2, borderColor: '#D1D5DB', alignItems: 'center', justifyContent: 'center' },
  radioActiveBorder: { borderColor: '#003366' },
  radioInner: { height: 12, width: 12, borderRadius: 6, backgroundColor: '#003366' },
  optionInput: { flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, fontSize: 14, color: '#333' },
  optionInputActive: { borderColor: '#003366', backgroundColor: '#F0F5FF' },
  addQuestionButton: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 15, borderWidth: 2, borderColor: '#E5E7EB', borderStyle: 'dashed', borderRadius: 12, marginBottom: 30, backgroundColor: 'rgba(255,255,255,0.5)' },
  addQuestionText: { color: '#003366', fontWeight: 'bold', fontSize: 16, marginLeft: 8 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between' },
  draftButton: { flex: 1, backgroundColor: '#E5E7EB', padding: 16, borderRadius: 12, alignItems: 'center', marginRight: 10 },
  draftButtonText: { color: '#374151', fontWeight: 'bold', fontSize: 16 },
  publishButton: { flex: 1, backgroundColor: '#003366', padding: 16, borderRadius: 12, alignItems: 'center', marginLeft: 10, shadowColor: "#003366", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 5 },
  publishButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

export default CreateQuizScreen;
