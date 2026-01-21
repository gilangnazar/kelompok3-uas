import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type HeaderType = 'logo' | 'title';

type AuthCardProps = {
  children: React.ReactNode;
  title?: string;
  logoSize?: number;
  headerType?: HeaderType;
  onBack?: () => void;
};

export default function AuthCard({
  children,
  title,
  logoSize = 72,
  headerType = 'logo',
  onBack
}: AuthCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        {headerType === 'logo' ? (
          <Image
            source={require('../../../assets/images/logo.png')}
            style={[styles.logo, { width: logoSize, height: logoSize }]}
            resizeMode='contain'
          />
        ) : (
          <View style={styles.titleRow}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={onBack}
              disabled={!onBack}
            >
              <Text style={styles.backText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{title}</Text>
            <View style={styles.backSpacer} />
          </View>
        )}
      </View>
      <View style={styles.body}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 26,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 6
  },
  header: {
    backgroundColor: '#0b4fb3',
    height: 130,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28
  },
  logo: {
    marginBottom: 2
  },
  titleRow: {
    width: '100%',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  backText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700'
  },
  backSpacer: {
    width: 32,
    height: 32
  },
  headerTitle: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16
  },
  body: {
    padding: 20
  }
});
