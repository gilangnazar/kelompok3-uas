import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function MaterialTab({ materials, navigation, courseId }: any) {
  
  // Adapted grouping logic to handle potential missing date or simple structure
  const groupedByDate = useMemo(() => {
    const groups: { [key: string]: any[] } = {};
    
    materials.forEach((item: any) => {
      // Use uploaded_at or fallback to 'General'
      let dateKey = 'General';
      if (item.uploaded_at) {
          dateKey = new Date(item.uploaded_at).toLocaleDateString('en-GB', {
            day: '2-digit', month: 'long', year: 'numeric'
          });
      }

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(item);
    });
    
    return groups;
  }, [materials]);

  const renderMaterialItem = (item: any) => (
    <TouchableOpacity
      key={item.id}
      style={styles.materialItem}
      // onPress={() => navigation.navigate('MaterialDetailScreen', { material: item })}
    >
      <Text style={styles.materialTitle}>{item.title}</Text>
      {item.content ? <Text style={styles.materialContent}>{item.content}</Text> : null}
      <View style={styles.materialMeta}>
        <Ionicons name="document-text-outline" size={14} color="gray" />
        <Text style={styles.materialMetaText}>{item.type || 'File'} • {item.size || 'Unknown size'}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View>
      <Text style={styles.sectionTitle}>Course Materials</Text>
      <Text style={styles.description}>
        All materials uploaded for this course.
      </Text>

      {/* List File Grouped by Date */}
      <View style={styles.fileList}>
        {materials.length === 0 ? (
          <Text style={{color: 'gray', fontStyle: 'italic', marginTop: 10}}>No materials uploaded yet.</Text>
        ) : (
          Object.keys(groupedByDate).map((date) => (
            <View key={date} style={styles.dateGroup}>
              <View style={styles.dateHeaderContainer}>
                 <Ionicons name="calendar-outline" size={16} color="#003D79" />
                 <Text style={styles.dateHeader}>{date}</Text>
              </View>
              <View style={styles.groupContent}>
                {groupedByDate[date].map((item) => renderMaterialItem(item))}
              </View>
            </View>
          ))
        )}
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  description: { fontSize: 14, color: '#666', marginTop: 10, lineHeight: 22 },
  fileList: { marginTop: 20 },
  dateGroup: { marginBottom: 25 },
  dateHeaderContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F0F4F8', padding: 8, borderRadius: 8, alignSelf: 'flex-start'
  },
  dateHeader: { fontSize: 13, fontWeight: 'bold', color: '#003D79', marginLeft: 6 },
  groupContent: {
    marginTop: 10, borderLeftWidth: 2, borderLeftColor: '#EEE', paddingLeft: 15, marginLeft: 10
  },
  materialItem: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    elevation: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2,
  },
  materialTitle: { fontSize: 13, fontWeight: '600', color: '#333' },
  materialContent: { fontSize: 12, color: '#777', marginTop: 6 },
  materialMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  materialMetaText: { fontSize: 11, color: 'gray' },
});
