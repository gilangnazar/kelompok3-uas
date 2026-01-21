import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type NavItem = {
  key: string;
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
};

type BottomNavigatorProps = {
  items: NavItem[];
  activeKey?: string;
};

export default function BottomNavigator({ items, activeKey }: BottomNavigatorProps) {
  return (
    <View style={styles.container}>
      {items.map(item => {
        const isActive = item.key === activeKey;
        return (
          <TouchableOpacity
            key={item.key}
            style={styles.item}
            onPress={item.onPress}
            disabled={!item.onPress}
          >
            <Text style={[styles.label, isActive && styles.labelActive]}>{item.label}</Text>
            {isActive ? <View style={styles.activeDot} /> : null}
            {isActive ? (
              <View style={styles.overlay}>
                <Ionicons name={item.icon ?? 'home'} size={16} color='#ffffff' />
                <Text style={styles.overlayText}>{item.label}</Text>
              </View>
            ) : null}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6
  },
  item: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    position: 'relative'
  },
  overlay: {
    position: 'absolute',
    bottom: 8,
    width: 64,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#0A4FBF',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    shadowColor: '#0A4FBF',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8
  },
  overlayText: {
    marginTop: 2,
    fontSize: 11,
    color: '#ffffff'
  },
  label: {
    fontSize: 12,
    color: '#6B7280',
    zIndex: 1
  },
  labelActive: {
    color: '#0A4FBF'
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0A4FBF'
  }
});
