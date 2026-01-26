
export const quizzes = [
  { id: '1', title: 'Quizz I', description: 'Basic Algorithms', duration: 60 },
  { id: '2', title: 'Quizz II', description: 'Data Structures', duration: 45 },
  { id: '3', title: 'Quizz III', description: 'Object Oriented Programming', duration: 90 },
];

export const students = [
  { id: '1', name: 'Alex', score: 95, completedDate: '2025-12-01' },
  { id: '2', name: 'Jane', score: 85, completedDate: '2025-12-01' },
  { id: '3', name: 'John', score: 100, completedDate: '2025-12-02' },
  { id: '4', name: 'Martin', score: 75, completedDate: '2025-12-01' },
];

export const quizResultDetails = {
  studentName: 'Alex',
  score: 95,
  completedDate: '2025-12-01',
  questions: [
    {
      id: 1,
      text: 'Question Text 1',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      userAnswer: 'A',
      correctAnswer: 'A',
      isCorrect: true,
    },
    {
      id: 2,
      text: 'Question Text 2',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      userAnswer: 'C',
      correctAnswer: 'D',
      isCorrect: false,
    },
    {
      id: 3,
      text: 'Question Text 3',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      userAnswer: 'B',
      correctAnswer: 'B',
      isCorrect: true,
    },
    {
      id: 4,
      text: 'Question Text 4',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      userAnswer: 'D',
      correctAnswer: 'D',
      isCorrect: true,
    },
  ]
};
