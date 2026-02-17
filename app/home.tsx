import { Ionicons } from '@expo/vector-icons';
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
  const [userName, setUserName] = useState<string | null>(null);

  const LOAN_TYPES = [
    {
      id: 'construction',
      title: t('construction'),
      description: 'Build your dream home from ground up with easy installments.',
      icon: 'construct-outline' as const,
      image: require('../assets/images/loans/construction.png'),
    },
    {
      id: 'renovation',
      title: t('renovation'),
      description: 'Give your home a fresh look with our flexible renovation plans.',
      icon: 'color-fill-outline' as const,
      image: require('../assets/images/loans/renovation.png'),
    },
    {
      id: 'flat-buying',
      title: t('flatBuying'),
      description: 'Own your perfect apartment with competitive interest rates.',
      icon: 'home-outline' as const,
      image: require('../assets/images/loans/flat_buying.png'),
    },
    {
      id: 'lap',
      title: t('lap'),
      description: 'Unlock the value of your property for your financial needs.',
      icon: 'business-outline' as const,
      image: require('../assets/images/loans/lap.png'),
    },
  ];

  useFocusEffect(
    useCallback(() => {
      const loadSession = async () => {
        const session = await AuthService.getSession();
        if (session) {
          if (session.profileImage) {
            setUserPhoto(session.profileImage);
          }
          if (session.name) {
            setUserName(session.name);
          }
        }
      };
      loadSession();
    }, [])
  );

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={[styles.headerContent, { justifyContent: 'flex-start', gap: 16 }]}>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/profile')}>
                {userPhoto ? (
                  <Image source={{ uri: userPhoto }} style={styles.profileImage} />
                ) : (
                  <Ionicons name="person-outline" size={24} color="#000000" />
                )}
              </TouchableOpacity>
            </View>
            <View>
              <ThemedText style={styles.welcomeText}>
                {userName ? `Hi, ${userName}` : t('welcome')}
              </ThemedText>
              <ThemedText style={styles.brandName}>Welcome to MAHTO Home Loans</ThemedText>
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
        </View>

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
              imageSource={loan.image}
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
              style={[styles.actionCard, { backgroundColor: Colors[colorScheme].surface, borderColor: Colors[colorScheme].border }]}
              onPress={() => router.push('/calculator')}
            >
              <Ionicons name="calculator-outline" size={32} color={Colors[colorScheme].tint} />
              <ThemedText style={styles.actionLabel}>{t('emiCalc')}</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: Colors[colorScheme].surface, borderColor: Colors[colorScheme].border }]}
              onPress={() => router.push('/track-status')}
            >
              <Ionicons name="document-text-outline" size={32} color={Colors[colorScheme].tint} />
              <ThemedText style={styles.actionLabel}>{t('trackStatus')}</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ThemedView >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F6F6F6',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 0,
  },
  welcomeText: {
    color: '#545454',
    fontSize: 14,
    marginBottom: 4,
  },
  brandName: {
    color: '#000000',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  iconBtn: {
    backgroundColor: '#F6F6F6',
    borderRadius: 50,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  promoCard: {
    backgroundColor: '#000000',
    padding: 24,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 10,
  },
  promoTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 4,
  },
  promoRate: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  applyNowBtn: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    alignSelf: 'flex-start',
  },
  applyNowText: {
    color: '#000000',
    fontWeight: '600',
    fontSize: 14,
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
    fontWeight: 'bold',
    color: '#000000',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    gap: 16,
  },
  actionCard: {
    flex: 1,
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#F6F6F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0,
  },
  actionLabel: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
  },
});


