import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#007AFF'
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold'
        }
      }}
    >
      <Stack.Screen
        name='index'
        options={{
          title: 'My Classes',
          headerTitleAlign: 'center'
        }}
      />
      <Stack.Screen
        name='QuizListScreen'
        options={{
          title: 'Quizzes',
          headerTitleAlign: 'center'
        }}
      />
      <Stack.Screen
        name='QuizReadyScreen'
        options={{
          title: 'Quiz',
          headerTitleAlign: 'center'
        }}
      />
      <Stack.Screen
        name='QuizTakeScreen'
        options={{
          title: 'Take Quiz',
          headerTitleAlign: 'center',
          headerLeft: () => null, // Disable back button during quiz
          gestureEnabled: false // Prevent swipe back during quiz
        }}
      />
      <Stack.Screen
        name='QuizResultScreen'
        options={{
          title: 'Quiz Result',
          headerTitleAlign: 'center',
          headerLeft: () => null, // Disable back button on results
          gestureEnabled: false // Prevent swipe back on results
        }}
      />
    </Stack>
  );
}
