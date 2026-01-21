import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type ModalVariant = 'success' | 'error' | 'confirm';

type AppModalProps = {
  visible: boolean;
  title: string;
  message?: string;
  variant?: ModalVariant;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
};

const VARIANT_STYLES: Record<ModalVariant, { accent: string; bg: string }> = {
  success: { accent: '#2f9e44', bg: '#e9f7ef' },
  error: { accent: '#d9534f', bg: '#fdecea' },
  confirm: { accent: '#0b4fb3', bg: '#edf3ff' }
};

export default function AppModal({
  visible,
  title,
  message,
  variant = 'confirm',
  confirmText = 'OK',
  cancelText = 'Batal',
  showCancel = false,
  onConfirm,
  onCancel
}: AppModalProps) {
  const colors = VARIANT_STYLES[variant];

  return (
    <Modal transparent visible={visible} animationType='fade'>
      <View style={styles.backdrop}>
        <View style={[styles.card, { borderTopColor: colors.accent }]}> 
          <View style={[styles.iconBadge, { backgroundColor: colors.bg }]}> 
            <View style={[styles.iconDot, { backgroundColor: colors.accent }]} />
          </View>
          <Text style={styles.title}>{title}</Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}

          <View style={styles.actions}>
            {showCancel ? (
              <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
                <Text style={styles.cancelText}>{cancelText}</Text>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity
              style={[styles.confirmButton, { backgroundColor: colors.accent }]}
              onPress={onConfirm}
            >
              <Text style={styles.confirmText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24
  },
  card: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    borderTopWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 6
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12
  },
  iconDot: {
    width: 16,
    height: 16,
    borderRadius: 8
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1d2a39',
    textAlign: 'center'
  },
  message: {
    marginTop: 8,
    fontSize: 13,
    color: '#556677',
    textAlign: 'center'
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#edf1f5'
  },
  cancelText: {
    color: '#4b5b6b',
    fontWeight: '600'
  },
  confirmButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10
  },
  confirmText: {
    color: '#fff',
    fontWeight: '700'
  }
});
