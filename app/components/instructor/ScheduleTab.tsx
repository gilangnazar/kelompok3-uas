import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ScheduleTab({ schedules, navigation, courseId }: any) {
  
  const formatDateFull = (dateString: string) => {
    if (!dateString) return '-';
    // Handle mock data format YYYY-MM-DD
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // Fallback if parsing fails
    
    return date.toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  const renderItem = ({ item, index }: any) => (
    <TouchableOpacity
      style={styles.meetingCard}
      // onPress={() => navigation.navigate('ScheduleDetailScreen', { schedule: item })}
    >
      <View>
        <Text style={styles.meetingTitle}>Session {index + 1}</Text>
        <Text style={styles.meetingTopic}>{item.topic || item.session_topic}</Text>
        <View style={styles.meetingMetaRow}>
          <Ionicons name="calendar-outline" size={14} color="#666" style={styles.meetingMetaIcon} />      
          <Text style={styles.meetingDate}>{formatDateFull(item.date || item.session_date)} {item.time ? `• ${item.time}` : ''}</Text>
        </View>
        <View style={styles.meetingMetaRow}>
          <Ionicons name="location-outline" size={14} color="#666" style={styles.meetingMetaIcon} />      
          <Text style={styles.meetingLocation}>{item.location}</Text>
        </View>
      </View>
      {/* <Ionicons name="chevron-forward" size={20} color="#CCC" /> */}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
        {schedules.length === 0 ? (
          <Text style={{textAlign: 'center', color: 'gray', marginTop: 20}}>
            No schedules found.
          </Text>
        ) : (
          <FlatList
            data={schedules}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            scrollEnabled={false}
          />
        )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 10 },
  meetingCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 20, backgroundColor: 'white', borderRadius: 15, marginBottom: 15,
    elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, borderWidth: 1, borderColor: '#F0F0F0'
  },
  meetingTitle: { fontSize: 12, color: '#003D79', fontWeight: 'bold', marginBottom: 2 },
  meetingTopic: { fontSize: 16, fontWeight: 'bold', color: '#333', marginVertical: 4 },
  meetingMetaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  meetingMetaIcon: { marginRight: 6 },
  meetingDate: { fontSize: 12, color: '#666' },
  meetingLocation: { fontSize: 12, color: '#666' },
});
