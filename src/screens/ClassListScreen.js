
import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, StatusBar, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { QuizContext } from '../context/QuizContext';

const ClassListScreen = ({ navigation }) => {
  const { classes } = useContext(QuizContext);

  const renderClassItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.classCard}
      activeOpacity={0.8}
      onPress={() => navigation.navigate('ClassDetail', { classId: item.id, className: item.name })}
    >
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
            <Ionicons name="book" size={24} color="#fff" />
        </View>
        <View style={{flex: 1}}>
            <Text style={styles.classCode}>{item.code}</Text>
            <Text style={styles.className}>{item.name}</Text>
        </View>
      </View>
      
      <View style={styles.cardFooter}>
         <View style={styles.footerItem}>
            <Ionicons name="people-outline" size={16} color="#666" />
            <Text style={styles.footerText}>{item.studentsCount} Students</Text>
         </View>
         <View style={styles.footerItem}>
            <Ionicons name="calendar-outline" size={16} color="#666" />
            <Text style={styles.footerText}>{item.semester}</Text>
         </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F6F8" />
      
      <View style={styles.header}>
        <View>
            <Text style={styles.greeting}>Welcome Back,</Text>
            <Text style={styles.headerTitle}>My Classes</Text>
        </View>
        <TouchableOpacity style={styles.profileBtn}>
            <Ionicons name="person-circle" size={40} color="#003366" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={classes}
        renderItem={renderClassItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F4F6F8' },
  header: {
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: { fontSize: 14, color: '#666' },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#003366' },
  listContainer: { padding: 24, paddingTop: 0 },
  classCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  iconContainer: {
    width: 48, height: 48, borderRadius: 12, backgroundColor: '#003366',
    alignItems: 'center', justifyContent: 'center', marginRight: 16
  },
  classCode: { fontSize: 12, color: '#888', fontWeight: 'bold' },
  className: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  cardFooter: { 
      flexDirection: 'row', justifyContent: 'space-between', 
      borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 12 
  },
  footerItem: { flexDirection: 'row', alignItems: 'center' },
  footerText: { marginLeft: 6, color: '#666', fontSize: 12, fontWeight: '500' }
});

export default ClassListScreen;
