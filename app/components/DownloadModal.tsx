import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type DownloadModalProps = {
  visible: boolean;
  onClose: () => void;
  onSelectFormat: (format: 'pdf' | 'xlsx') => void;
  hideExcel?: boolean;
};

export default function DownloadModal({ visible, onClose, onSelectFormat, hideExcel = false }: DownloadModalProps) {
  return (
    <Modal transparent visible={visible} animationType='fade' onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose}>
        <View style={styles.card}>
          <Text style={styles.title}>Download Report</Text>
          <Text style={styles.subtitle}>Select file format</Text>

          <View style={styles.optionsRow}>
            <TouchableOpacity 
                style={styles.optionBtn}
                onPress={() => onSelectFormat('pdf')}
            >
                <View style={[styles.iconBox, { backgroundColor: '#FEE2E2' }]}>
                    <Ionicons name="document-text" size={32} color="#DC2626" />
                </View>
                <Text style={styles.optionLabel}>PDF</Text>
            </TouchableOpacity>

            {!hideExcel && (
                <TouchableOpacity 
                    style={styles.optionBtn}
                    onPress={() => onSelectFormat('xlsx')}
                >
                    <View style={[styles.iconBox, { backgroundColor: '#D1FAE5' }]}>
                        <Ionicons name="grid" size={32} color="#059669" />
                    </View>
                    <Text style={styles.optionLabel}>Excel</Text>
                </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end', // Bottom sheet style
  },
  card: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
    marginBottom: 32,
    width: '100%',
  },
  optionBtn: {
    alignItems: 'center',
  },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  cancelBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4B5563',
  },
});