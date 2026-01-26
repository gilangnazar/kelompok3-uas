
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';

// Import Screens Baru
import ClassListScreen from './src/screens/ClassListScreen';
import ClassDetailScreen from './src/screens/ClassDetailScreen';
import QuizDetailScreen from './src/screens/QuizDetailScreen';

// Import Screens Lama (Tetap dipakai)
import DashboardScreen from './src/screens/DashboardScreen'; // Mungkin tidak dipakai sbg home, tapi tetap ada
import CreateQuizScreen from './src/screens/CreateQuizScreen';
import ScoreListScreen from './src/screens/ScoreListScreen';
import StudentResultScreen from './src/screens/StudentResultScreen';

import { QuizProvider } from './src/context/QuizContext';

const Stack = createStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F6F8" />
      <QuizProvider>
        <NavigationContainer>
          <Stack.Navigator 
            initialRouteName="ClassList" // GANTI HOME JADI CLASS LIST
            screenOptions={{
              headerShown: false,
              cardStyle: { flex: 1 }
            }}
          >
            {/* New Flow */}
            <Stack.Screen name="ClassList" component={ClassListScreen} />
            <Stack.Screen name="ClassDetail" component={ClassDetailScreen} />
            <Stack.Screen name="QuizDetail" component={QuizDetailScreen} />

            {/* Existing Screens (Connected to Flow) */}
            <Stack.Screen name="Dashboard" component={DashboardScreen} />
            <Stack.Screen name="CreateQuiz" component={CreateQuizScreen} />
            <Stack.Screen name="ScoreList" component={ScoreListScreen} />
            <Stack.Screen name="StudentResult" component={StudentResultScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </QuizProvider>
    </SafeAreaProvider>
  );
}
