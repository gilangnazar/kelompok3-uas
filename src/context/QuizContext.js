import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const QuizContext = createContext();

export const QuizProvider = ({ children }) => {
  
  const defaultClasses = [
    { id: 'c1', name: 'Algoritma & Pemrograman', code: 'IF-101', semester: 'Genap 2025/2026', studentsCount: 30 },
    { id: 'c2', name: 'Basis Data', code: 'IF-102', semester: 'Genap 2025/2026', studentsCount: 28 },
    { id: 'c3', name: 'Rekayasa Perangkat Lunak', code: 'IF-201', semester: 'Genap 2025/2026', studentsCount: 35 },
  ];

  const defaultSchedules = [
    { id: 's1', classId: 'c1', date: '2026-01-20', time: '08:00 - 10:00', topic: 'Pengenalan Algoritma', location: 'Lab 1' },
    { id: 's3', classId: 'c2', date: '2026-01-21', time: '13:00 - 15:00', topic: 'Konsep ERD', location: 'R. 302' },
  ];

  const defaultMaterials = [
    { id: 'm1', classId: 'c1', title: 'Modul 1: Pengantar', type: 'pdf', size: '2.4 MB', date: '2026-01-20' },
    { id: 'm3', classId: 'c2', title: 'Modul ERD Lengkap', type: 'pdf', size: '3.2 MB', date: '2026-01-21' },
  ];

  // HANYA QUIZ
  const defaultQuizzes = [
    { 
      id: '1', classId: 'c1', type: 'quiz', title: 'Kuis 1: Dasar Algoritma', 
      description: 'Tes pemahaman variabel dan logika dasar.', duration: 60, dueDate: '2026-02-01',
      questions: [
        { id: 'q1', text: 'Apa itu variabel?', options: ['Tempat simpan data', 'Fungsi', 'Loop', 'Class'], correctAnswerIndex: 0 }
      ]
    },
    { 
      id: '2', classId: 'c2', type: 'quiz', title: 'Kuis ERD', 
      description: 'Analisis kasus toko online.', duration: 45, dueDate: '2026-02-05',
      questions: []
    },
  ];

  const defaultStudents = [
    { id: '1', name: 'Alex Johnson', score: 95, completedDate: '2025-12-01' },
    { id: '2', name: 'Jane Doe', score: 85, completedDate: '2025-12-01' },
    { id: '3', name: 'John Smith', score: 100, completedDate: '2025-12-02' },
    { id: '4', name: 'Martin King', score: 75, completedDate: '2025-12-01' },
  ];

  const [classes] = useState(defaultClasses);
  const [schedules] = useState(defaultSchedules);
  const [materials] = useState(defaultMaterials);
  const [quizzes, setQuizzes] = useState([]);
  const [students] = useState(defaultStudents);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const stored = await AsyncStorage.getItem('@quizzes_lms');
      if (stored !== null) {
        setQuizzes(JSON.parse(stored));
      } else {
        setQuizzes(defaultQuizzes);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const addQuiz = async (newQuiz) => {
    const id = (Math.random() * 10000).toString();
    const updated = [...quizzes, { ...newQuiz, id }];
    setQuizzes(updated);
    try {
      await AsyncStorage.setItem('@quizzes_lms', JSON.stringify(updated));
    } catch (e) { console.error(e); }
  };

  const resetData = async () => {
    await AsyncStorage.removeItem('@quizzes_lms');
    setQuizzes(defaultQuizzes);
  };

  return (
    <QuizContext.Provider value={{ 
      classes, schedules, materials, quizzes, students, 
      addQuiz, loading, resetData 
    }}>
      {children}
    </QuizContext.Provider>
  );
};