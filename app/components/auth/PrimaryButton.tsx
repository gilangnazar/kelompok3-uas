import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';

type PrimaryButtonProps = {
  title: string;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
};

export default function PrimaryButton({
  title,
  onPress,
  loading = false,
  disabled = false
}: PrimaryButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[styles.button, isDisabled && styles.buttonDisabled]}
      onPress={onPress}
      disabled={isDisabled}
    >
      {loading ? (
        <ActivityIndicator color='#fff' />
      ) : (
        <Text style={styles.buttonText}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#0b4fb3',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 6
  },
  buttonDisabled: {
    opacity: 0.7
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '700'
  }
});
