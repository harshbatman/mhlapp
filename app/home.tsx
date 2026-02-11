import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { LoanCard } from '@/components/LoanCard';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useTranslation } from '@/context/LanguageContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthService } from '@/utils/auth';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const router = useRouter();
  const { t } = useTranslation();
  const [userPhoto, setUserPhoto] = useState<string | null>(null);

  const LOAN_TYPES = [
    {
      id: 'construction',
      title: t('construction'),
      description: 'Build your dream home from ground up with easy installments.',
      icon: 'construct-outline' as const,
    },
    {
      id: 'renovation',
      title: t('renovation'),
      description: 'Give your home a fresh look with our flexible renovation plans.',
      icon: 'color-fill-outline' as const,
    },
    {
      id: 'flat-buying',
      title: t('flatBuying'),
      description: 'Own your perfect apartment with competitive interest rates.',
      icon: 'home-outline' as const,
    },
    {
      id: 'lap',
      title: t('lap'),
      description: 'Unlock the value of your property for your financial needs.',
      icon: 'business-outline' as const,
    },
  ];

  useFocusEffect(
    useCallback(() => {
      const loadSession = async () => {
        const session = await AuthService.getSession();
        if (session && session.profileImage) {
          setUserPhoto(session.profileImage);
        }
      };
      loadSession();
    }, [])
  );

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <LinearGradient
          colors={colorScheme === 'light' ? ['#002D62', '#0056b3'] : ['#0F172A', '#1E293B']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View>
              <ThemedText style={styles.welcomeText}>{t('welcome')}</ThemedText>
              <ThemedText style={styles.brandName}>MAHTO Home Loans</ThemedText>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/profile')}>
                {userPhoto ? (
                  <Image source={{ uri: userPhoto }} style={styles.profileImage} />
                ) : (
                  <Ionicons name="person-outline" size={24} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.promoCard}>
            <ThemedText style={styles.promoTitle}>{t('lowestRates')}</ThemedText>
            <ThemedText style={styles.promoRate}>{t('startingAt')}</ThemedText>
            <TouchableOpacity
              style={styles.applyNowBtn}
              onPress={() => router.push('/apply')}
            >
              <ThemedText style={styles.applyNowText}>{t('applyNow')}</ThemedText>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>{t('loanProducts')}</ThemedText>
          </View>

          {LOAN_TYPES.map((loan) => (
            <LoanCard
              key={loan.id}
              title={loan.title}
              description={loan.description}
              icon={loan.icon}
              onPress={() => router.push({
                pathname: '/loan-details',
                params: { id: loan.id, title: loan.title }
              })}
            />
          ))}

          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>{t('quickActions')}</ThemedText>
          </View>

          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: Colors[colorScheme].surface }]}
              onPress={() => router.push('/calculator')}
            >
              <Ionicons name="calculator-outline" size={32} color={Colors[colorScheme].tint} />
              <ThemedText style={styles.actionLabel}>{t('emiCalc')}</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: Colors[colorScheme].surface }]}
              onPress={() => router.push('/track-status')}
            >
              <Ionicons name="document-text-outline" size={32} color={Colors[colorScheme].tint} />
              <ThemedText style={styles.actionLabel}>{t('trackStatus')}</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 40,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  welcomeText: {
    color: '#E0E0E0',
    fontSize: 16,
  },
  brandName: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 12,
  },
  promoCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  promoTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.9,
  },
  promoRate: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    marginVertical: 4,
  },
  applyNowBtn: {
    backgroundColor: '#D4AF37',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  applyNowText: {
    color: '#002D62',
    fontWeight: '700',
  },
  content: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  actionCard: {
    width: (width - 50) / 2,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionLabel: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
  },
});
