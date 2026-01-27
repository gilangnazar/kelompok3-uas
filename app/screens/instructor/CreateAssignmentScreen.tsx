import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { API_URL } from '../../../config/api';
import AppModal from '../../components/AppModal';

const CreateAssignmentScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { classId, assignmentId, className } = params; // Add assignmentId param
  const [loading, setLoading] = useState(false);
  const isEditMode = !!assignmentId; // Check if editing

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    title: string;
    message: string;
    variant: 'success' | 'error' | 'confirm';
    onConfirm: () => void;
  }>({
    title: '',
    message: '',
    variant: 'confirm',
    onConfirm: () => setModalVisible(false),
  });

  const showAlert = (title: string, message: string, variant: 'success' | 'error' | 'confirm' = 'error', onConfirm?: () => void) => {
    setModalConfig({
      title,
      message,
      variant,
      onConfirm: onConfirm || (() => setModalVisible(false)),
    });
    setModalVisible(true);
  };

  // New state for Assignment Type selector
  const [assignmentType, setAssignmentType] = useState<'quiz' | 'assignment' | null>('quiz');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [dueDateText, setDueDateText] = useState('');
  const [dueTimeText, setDueTimeText] = useState('23:59');
  const [showDueDatePicker, setShowDueDatePicker] = useState(false);
  const [showDueTimePicker, setShowDueTimePicker] = useState(false);

  const [questions, setQuestions] = useState([
    { id: '1', text: '', options: ['', '', '', ''], correctAnswerIndex: 0 }
  ]);

  // Fetch data if in Edit Mode
  React.useEffect(() => {
    if (isEditMode) {
        fetchAssignmentDetails();
    }
  }, [assignmentId]);

  const fetchAssignmentDetails = async () => {
      try {
          setLoading(true);
          const token = await AsyncStorage.getItem('token');
          if (!token) return;
          
          const response = await fetch(`${API_URL}/api/instructor/assignments/${assignmentId}`, {
              headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (response.ok) {
              const data = await response.json();
              setTitle(data.title);
              setDescription(data.description);
              if (data.due_date) {
                const parsed = new Date(data.due_date);
                const formattedDate = formatDateValue(parsed);
                const formattedTime = formatTimeValue(parsed);
                setDueDateText(formattedDate);
                setDueTimeText(formattedTime);
              } else {
                setDueDateText('');
                setDueTimeText('23:59');
              }
              setAssignmentType(data.type);

              if (data.type === 'quiz' && data.quiz) {
                  setDuration(data.quiz.time_limit_minutes.toString());
                  if (data.questions) {
                      const formattedQuestions = data.questions.map((q: any) => ({
                          id: q.id.toString(),
                          text: q.question_text,
                          options: q.options.map((o: any) => o.option_text),
                          correctAnswerIndex: q.options.findIndex((o: any) => o.is_correct === 1)
                      }));
                      setQuestions(formattedQuestions);
                  }
              }
          }
      } catch (error) {
          console.error(error);
          showAlert("Error", "Failed to load assignment details");
      } finally {
          setLoading(false);
      }
  };

  const onDueDateChange = (event: any, selectedDate?: Date) => {
    setShowDueDatePicker(false);
    if (selectedDate) {
      const formatted = formatDateValue(selectedDate);
      setDueDateText(formatted);
    }
  };

  const onDueTimeChange = (event: any, selectedTime?: Date) => {
    setShowDueTimePicker(false);
    if (selectedTime) {
      const formatted = formatTimeValue(selectedTime);
      setDueTimeText(formatted);
    }
  };

  const handleWebDateChange = (value: string) => {
    if (!value) return;
    setDueDateText(value);
  };

  const handleWebTimeChange = (value: string) => {
    if (!value) return;
    setDueTimeText(value);
  };

  const getDueDateTime = () => {
    if (!dueDateText) return null;
    const [y, m, d] = dueDateText.split('-').map(Number);
    if (!y || !m || !d) return null;
    const [h, min] = dueTimeText.split(':').map(Number);
    const next = new Date(y, m - 1, d, h ?? 23, min ?? 59, 0);
    return next;
  };

  const getDueTimeDate = () => {
    const [h, min] = dueTimeText.split(':').map(Number);
    return new Date(0, 0, 1, h ?? 23, min ?? 59, 0);
  };

  const formatDateValue = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatTimeValue = (d: Date) => {
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const formatDateLabel = (d: Date) => {
    return d.toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  const formatTimeLabel = (d: Date) => {
    return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const handleAddQuestion = () => {
    const newId = (questions.length + 1).toString();
    setQuestions([...questions, { id: newId, text: '', options: ['', '', '', ''], correctAnswerIndex: 0 }]);
  };

  const navigateToCourseDetail = () => {
    if (classId) {
      router.replace({
        pathname: '/screens/instructor/CourseDetailScreen',
        params: { classId, className, initialTab: 'assignment' }
      });
    } else {
      router.replace('/screens/instructor/CourseListScreen');
    }
  };

  const goBackOrReplace = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      navigateToCourseDetail();
    }
  };

  const handleBack = () => {
    if (title || description || (questions.length > 0 && questions[0].text)) {
      setModalConfig({
        title: 'Cancel',
        message: 'Are you sure you want to go back? Your changes will not be saved.',
        variant: 'confirm',
        onConfirm: () => {
          setModalVisible(false);
          goBackOrReplace();
        },
      });
      setModalVisible(true);
    } else {
      goBackOrReplace();
    }
  };

  const handlePublish = async () => {
    if (!title || !description || !duration || !dueDateText) {
      showAlert("Error", "Please fill in all details including Due Date.");
      return;
    }
    if (!dueTimeText) {
      showAlert("Error", "Please select a due time.");
      return;
    }
    if (assignmentType === 'quiz') {
      const hasQuestion = questions.some((q) => q.text.trim().length > 0);
      if (!hasQuestion) {
        showAlert("Error", "Please add at least one question.");
        return;
      }
    }

    try {
        setLoading(true);
        const token = await AsyncStorage.getItem('token');
        if (!token) return;

        const url = isEditMode 
            ? `${API_URL}/api/instructor/assignments/${assignmentId}`
            : `${API_URL}/api/instructor/assignments/create`;
        
        const method = isEditMode ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                classId,
                type: assignmentType,
                title,
                description,
                duration,
                dueDate: `${dueDateText} ${dueTimeText}:00`,
                questions: assignmentType === 'quiz' ? questions : undefined
            })
        });

        if (response.ok) {
            showAlert(
              "Success", 
              `${assignmentType === 'quiz' ? 'Quiz' : 'Assignment'} ${isEditMode ? 'Updated' : 'Created'} Successfully!`, 
              'success',
              () => {
                setModalVisible(false);
                goBackOrReplace();
              }
            );
        } else {
            const error = await response.json();
            showAlert("Error", error.message || "Failed to save assignment");
        }
    } catch (error) {
        console.error(error);
        showAlert("Error", "Network error");
    } finally {
        setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppModal
        visible={modalVisible}
        title={modalConfig.title}
        message={modalConfig.message}
        variant={modalConfig.variant}
        showCancel={modalConfig.variant === 'confirm'}
        onConfirm={modalConfig.onConfirm}
        onCancel={() => setModalVisible(false)}
      />
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditMode ? 'Edit Assignment' : 'Create Assignment'}</Text>
        <View style={{width: 24}} /> 
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* Assignment Type Selector */}
        <View style={styles.typeSelectorContainer}>
          <Text style={styles.label}>Select Assignment Type</Text>
          <View style={styles.typeRow}>
            <TouchableOpacity 
                style={[styles.typeButton, assignmentType === 'assignment' && styles.typeButtonActive, { opacity: 0.5 }]}
                onPress={() => { /* Disabled logic: setAssignmentType('assignment') */ }}
                disabled={true}
            >
                <Ionicons name="document-text-outline" size={24} color={assignmentType === 'assignment' ? "#fff" : "#666"} />
                <Text style={[styles.typeText, assignmentType === 'assignment' && styles.typeTextActive]}>Assignment</Text>
            </TouchableOpacity>

            <TouchableOpacity 
                style={[styles.typeButton, assignmentType === 'quiz' && styles.typeButtonActive]}
                onPress={() => setAssignmentType('quiz')}
            >
                <Ionicons name="help-circle-outline" size={24} color={assignmentType === 'quiz' ? "#fff" : "#666"} />
                <Text style={[styles.typeText, assignmentType === 'quiz' && styles.typeTextActive]}>Quiz</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Form Content - Only visible if type is selected */}
        {assignmentType === 'quiz' && (
            <>
                <View style={styles.card}>
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Quiz Title</Text>
                    <TextInput style={styles.input} placeholder="e.g. Midterm Exam" value={title} onChangeText={setTitle} />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Description</Text>
                    <TextInput style={[styles.input, styles.textArea]} placeholder="Short description..." value={description} onChangeText={setDescription} multiline />
                </View>
                
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Duration (Mins)</Text>
                    <TextInput style={styles.input} placeholder="60" value={duration} onChangeText={setDuration} keyboardType="numeric" />
                </View>

                <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                    <View style={{width: '48%'}}>
                        <Text style={styles.label}>Due Date</Text>
                        {Platform.OS === 'web' ? (
                            <View style={styles.webInputRow}>
                              <Ionicons name="calendar-outline" size={18} color="#003366" />
                              <input
                                type="date"
                                value={dueDateText}
                                onChange={(e) => handleWebDateChange(e.target.value)}
                                style={styles.webInput as any}
                              />
                            </View>
                        ) : (
                            <TouchableOpacity
                              style={styles.pickerBtn}
                              onPress={() => setShowDueDatePicker(true)}
                            >
                              <Ionicons name="calendar-outline" size={18} color="#003366" />
                              <Text style={styles.pickerBtnText}>
                                {dueDateText ? formatDateLabel(getDueDateTime() || new Date()) : 'Select date'}
                              </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                    <View style={{width: '48%'}}>
                      <Text style={styles.label}>Due Time</Text>
                      {Platform.OS === 'web' ? (
                        <View style={styles.webInputRow}>
                          <Ionicons name="time-outline" size={18} color="#003366" />
                          <input
                            type="time"
                            value={dueTimeText}
                            onChange={(e) => handleWebTimeChange(e.target.value)}
                            style={styles.webInput as any}
                          />
                        </View>
                      ) : (
                        <TouchableOpacity
                          style={styles.pickerBtn}
                          onPress={() => setShowDueTimePicker(true)}
                        >
                          <Ionicons name="time-outline" size={18} color="#003366" />
                          <Text style={styles.pickerBtnText}>
                            {formatTimeLabel(getDueDateTime() || getDueTimeDate())}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                </View>
                </View>
                {showDueDatePicker && Platform.OS !== 'web' && (
                  <DateTimePicker
                    value={getDueDateTime() || new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={onDueDateChange}
                  />
                )}
                {showDueTimePicker && Platform.OS !== 'web' && (
                  <DateTimePicker
                    value={getDueDateTime() || getDueTimeDate()}
                    mode="time"
                    is24Hour={true}
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={onDueTimeChange}
                  />
                )}

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
                <TouchableOpacity style={styles.draftButton} onPress={handleBack}>
                    <Text style={styles.draftButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.publishButton, loading && { opacity: 0.7 }]} 
                    onPress={handlePublish}
                    disabled={loading}
                >
                    <Text style={styles.publishButtonText}>
                        {loading ? 'Processing...' : (isEditMode ? 'Update' : 'Publish Assignment')}
                    </Text>
                </TouchableOpacity>
                </View>
            </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F4F6F8' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 15, paddingTop: 50, backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#E0E0E0',
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  backButton: { padding: 5 },
  container: { flex: 1, padding: 20 },
  typeSelectorContainer: { marginBottom: 24 },
  typeRow: { flexDirection: 'row', gap: 16 },
  typeButton: {
      flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      padding: 16, backgroundColor: '#fff', borderRadius: 12,
      borderWidth: 2, borderColor: '#E5E7EB', gap: 8
  },
  typeButtonActive: {
      backgroundColor: '#003366', borderColor: '#003366'
  },
  typeText: { fontSize: 16, fontWeight: '600', color: '#666' },
  typeTextActive: { color: '#fff' },
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
  pickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  pickerBtnText: { fontSize: 14, color: '#333', fontWeight: '500' },
  webInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    flex: 1,
    overflow: 'hidden',
  },
  webInput: {
    flex: 1,
    minWidth: 0,
    width: '100%',
    borderWidth: 0,
    outlineStyle: 'none',
    fontSize: 14,
    color: '#333',
    backgroundColor: 'transparent',
    padding: 0,
    margin: 0,
  },
  addQuestionButton: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 15, borderWidth: 2, borderColor: '#E5E7EB', borderStyle: 'dashed', borderRadius: 12, marginBottom: 30, backgroundColor: 'rgba(255,255,255,0.5)' },
  addQuestionText: { color: '#003366', fontWeight: 'bold', fontSize: 16, marginLeft: 8 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between' },
  draftButton: { flex: 1, backgroundColor: '#E5E7EB', padding: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  draftButtonText: { color: '#374151', fontWeight: 'bold', fontSize: 16, textAlign: 'center' },
  publishButton: { flex: 1, backgroundColor: '#003366', padding: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginLeft: 10, shadowColor: "#003366", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 5 },
  publishButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16, textAlign: 'center' },
});

export default CreateAssignmentScreen;
