import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'My Classes',
          headerTitleAlign: 'center'
        }}
      />

      <Stack.Screen
        name="screens/student/QuizListScreen"
        options={{
          title: 'Quizzes',
          headerTitleAlign: 'center'
        }}
      />

      <Stack.Screen
        name="screens/student/QuizReadyScreen"
        options={{
          title: 'Quiz',
          headerTitleAlign: 'center'
        }}
      />

      <Stack.Screen
        name="screens/auth/SplashScreen"
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="screens/auth/LoginScreen"
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="screens/auth/RegisterScreen"
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="screens/student/StudentDashboard"
        options={{ title: 'Student', headerTitleAlign: 'center' }}
      />

      <Stack.Screen
        name="screens/instructor/InstructorDashboard"
        options={{ title: 'Instructor', headerTitleAlign: 'center' }}
      />
      
      <Stack.Screen
        name="screens/instructor/CourseListScreen"
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="screens/instructor/CourseDetailScreen"
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="screens/instructor/QuizDetailScreen"
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="screens/instructor/ScoreListScreen"
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="screens/instructor/StudentResultScreen"
        options={{ headerShown: false }}
      />
      
      <Stack.Screen
        name="screens/instructor/CreateAssignmentScreen"
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="screens/student/QuizTakeScreen"
        options={{
          title: 'Take Quiz',
          headerTitleAlign: 'center',
          headerLeft: () => null,
          gestureEnabled: false
        }}
      />

      <Stack.Screen
        name="screens/student/QuizResultScreen"
        options={{
          title: 'Quiz Result',
          headerTitleAlign: 'center',
          headerLeft: () => null,
          gestureEnabled: false
        }}
      />
    </Stack>
  );
}
