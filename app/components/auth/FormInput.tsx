import React from 'react';
import { KeyboardTypeOptions, StyleSheet, Text, TextInput, View } from 'react-native';

type FormInputProps = {
  label: string;
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  placeholderTextColor?: string;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  secureTextEntry?: boolean;
};

export default function FormInput({
  label,
  value,
  onChangeText,
  placeholder,
  placeholderTextColor = '#9aa5b1',
  keyboardType,
  autoCapitalize,
  secureTextEntry
}: FormInputProps) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        secureTextEntry={secureTextEntry}
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  inputGroup: {
    marginBottom: 12
  },
  label: {
    fontSize: 12,
    color: '#5a6b7b',
    marginBottom: 6
  },
  input: {
    backgroundColor: '#f7f9fc',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e6ebf2',
    color: '#1d2a39'
  }
});
