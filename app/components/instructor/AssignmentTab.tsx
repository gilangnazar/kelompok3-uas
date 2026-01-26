import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';

export default function AssignmentTab({ assignments, formatDate }: any) {
  const router = useRouter();

  const renderItem = ({ item, index }: any) => {
    const isQuiz = item.type === 'quiz';
    
    return (
        <TouchableOpacity 
        key={item.id} 
        style={styles.card}
        onPress={() => {
            // Future navigation
            // router.push({ pathname: '/screens/instructor/AssignmentDetail', params: { id: item.id } });
        }}
        >
        <View>
            <View style={{flexDirection:'row', justifyContent:'space-between'}}>
            <Text style={styles.cardTitle}>{isQuiz ? 'Quiz' : 'Assignment'} {index + 1}</Text>
            <View style={[styles.badge, isQuiz ? styles.quizBadge : styles.assignBadge]}>
                <Text style={[styles.badgeText, isQuiz ? styles.quizText : styles.assignText]}>
                    {item.type ? item.type.toUpperCase() : 'ASSIGNMENT'}
                </Text>
            </View>
            </View>
            <Text style={styles.cardSub}>{item.title}</Text>
            <View style={styles.infoRow}>
            <View style={styles.infoItem}>
                <Ionicons name={isQuiz ? "help-circle-outline" : "clipboard-outline"} size={14} color="gray" />
                <Text style={styles.cardInfo}>{item.description ? item.description.substring(0, 30) + '...' : 'No description'}</Text>
            </View>
            </View>
            
            {item.due_date && (
                <View style={[styles.infoRow, { marginTop: 8 }]}>
                    <Ionicons name="calendar-outline" size={14} color="#EF4444" />
                    <Text style={{fontSize: 12, color: '#EF4444', marginLeft: 4}}>
                    Due: {formatDate(item.due_date)}
                    </Text>
                </View>
            )}
        </View>
        </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
       <Text style={styles.text}>Assignments & Quizzes</Text>
       <Text style={styles.subText}>List of all tasks for students.</Text>

       {assignments.length === 0 ? (
          <Text style={{color: 'gray', fontStyle: 'italic', marginTop: 10}}>No assignments found.</Text>
       ) : (
          <FlatList
            data={assignments}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
            contentContainerStyle={{marginTop: 15}}
          />
       )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 0 },
  text: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  subText: { fontSize: 14, color: '#666', marginTop: 5 },
  card: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1, borderColor: '#F0F0F0'
  },
  cardTitle: { fontWeight: 'bold', fontSize: 14, color: '#003D79' },
  cardSub: { color: '#333', fontSize: 16, fontWeight: 'bold', marginTop: 4 },
  infoRow: { flexDirection: 'row', marginTop: 12, gap: 20, alignItems: 'center' },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  cardInfo: { fontSize: 12, color: 'gray' },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  quizBadge: { backgroundColor: '#E1EFFE' },
  assignBadge: { backgroundColor: '#F3F4F6' },
  badgeText: { fontSize: 10, fontWeight: 'bold' },
  quizText: { color: '#1E429F' },
  assignText: { color: '#374151' }
});
