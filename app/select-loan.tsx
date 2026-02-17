import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { LoanCard } from '@/components/LoanCard';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ThemeType } from '@/constants/theme';
import { useTranslation } from '@/context/LanguageContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function SelectLoanScreen() {
    const { t } = useTranslation();
    const router = useRouter();
    const colorScheme = (useColorScheme() ?? 'light') as ThemeType;

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

    return (
        <ThemedView style={styles.container}>
            <Stack.Screen options={{ title: 'Select Loan Type', headerShown: false }} />
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color="#000000" />
                    </TouchableOpacity>
                    <ThemedText style={styles.headerTitle}>Select Loan Type</ThemedText>
                    <ThemedText style={styles.headerSubtitle}>Choose a loan that fits your needs to start your application</ThemedText>
                </View>

                <View style={styles.content}>
                    <View style={styles.loanGrid}>
                        {LOAN_TYPES.map((loan) => (
                            <LoanCard
                                key={loan.id}
                                title={loan.title}
                                description={loan.description}
                                icon={loan.icon}
                                imageSource={loan.image}
                                variant="grid"
                                onPress={() => router.push({
                                    pathname: '/loan-details',
                                    params: { id: loan.id, title: loan.title }
                                })}
                            />
                        ))}
                    </View>
                </View>
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: 24,
        paddingBottom: 20,
    },
    backBtn: {
        marginBottom: 20,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F6F6F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: '#000000',
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#666666',
        lineHeight: 22,
    },
    content: {
        padding: 20,
    },
    loanGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
});
