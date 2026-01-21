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
          title: 'Are You Ready?',
          headerTitleAlign: 'center'
        }}
      />
      {/* <Stack.Screen
        name=''
        options={{
          title: 'Take Quiz',
          headerTitleAlign: 'center',
          headerLeft: () => null, // Disable back button during quiz
          gestureEnabled: false // Prevent swipe back during quiz
        }}
      /> */}
    </Stack>
  );
}
