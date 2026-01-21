import { useRouter } from 'expo-router';
import React from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

// Mock data - replace with API call later
const mockClasses = [
  { id: 1, name: 'Mobile Programming', quizCount: 3 },
  { id: 2, name: 'Web Development', quizCount: 5 },
  { id: 3, name: 'Database Systems', quizCount: 2 },
  { id: 4, name: 'Data Structures', quizCount: 4 },
  { id: 5, name: 'Software Engineering', quizCount: 3 }
];

export default function MyClassesScreen() {
  const router = useRouter();

  const handleQuizPress = (classItem: any) => {
    router.push({
      pathname: '/QuizListScreen',
      params: {
        classId: classItem.id,
        className: classItem.name,
        quizCount: classItem.quizCount
      }
    });
  };

  const renderClassCard = ({ item }: any) => (
    <View style={styles.cardContainer}>
      <View style={styles.card}>
        <Text style={styles.className} numberOfLines={2}>
          {item.name}
        </Text>

        <TouchableOpacity
          style={styles.quizButton}
          onPress={() => handleQuizPress(item)}
        >
          <Text style={styles.quizIcon}>📝</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={mockClasses}
        renderItem={renderClassCard}
        keyExtractor={item => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        columnWrapperStyle={styles.row}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  listContainer: {
    padding: 12
  },
  row: {
    justifyContent: 'space-between'
  },
  cardContainer: {
    width: '48%',
    marginBottom: 16
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    minHeight: 140,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  className: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12
  },
  quizButton: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center'
  },
  quizIcon: {
    fontSize: 24
  }
});
