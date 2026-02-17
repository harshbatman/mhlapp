import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, ThemeType } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const LOAN_DETAILS: Record<string, any> = {
    'construction': {
        title: 'Construction Loan',
        features: [
            'Flexible disbursement as per construction stage',
            'Lower interest rates for self-construction',
            'Technical guidance from experts',
            'Loan tenure up to 30 years'
        ],
        eligibility: 'Individuals owning a plot or wanting to purchase a plot and build.',
        documents: ['Plot ownership proof', 'Approved building plan', 'Estimate for construction']
    },
    'lap': {
        title: 'Loan Against Property',
        features: [
            'Higher loan amount based on property value',
            'Use for business or personal needs',
            'Minimum documentation',
            'Attractive interest rates'
        ],
        eligibility: 'Salaried or Self-employed individuals with owned property.',
        documents: ['Property documents', 'Income proof (6 months)', 'KYC documents']
    },
    'renovation': {
        title: 'Renovation Loan',
        features: [
            'Simple application process',
            'Improve your home value',
            'Covers repairs, painting, tiling etc.',
            'No collateral for smaller amounts'
        ],
        eligibility: 'Existing homeowners looking to upgrade.',
        documents: ['Estimated cost of renovation', 'Ownership proof', 'Income proof']
    },
    'flat-buying': {
        title: 'Flat Buying Loan',
        features: [
            'Approved projects list for faster processing',
            'Zero processing fee for select partners',
            'Insurance coverage',
            'Balance transfer facility'
        ],
        eligibility: 'Salaried or Self-employed individuals.',
        documents: ['Allotment letter', 'Sale agreement', 'NOC from builder']
    }
};

export default function LoanDetailsScreen() {
    const { id, title } = useLocalSearchParams<{ id: string, title: string }>();
    const colorScheme = (useColorScheme() ?? 'light') as ThemeType;
    const router = useRouter();

    const details = LOAN_DETAILS[id as string] || LOAN_DETAILS['construction'];

    return (
        <ThemedView style={styles.container}>
            <Stack.Screen options={{ title: details.title, headerShown: false }} />

            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color="#000000" />
                    </TouchableOpacity>
                    <ThemedText style={styles.headerTitle}>{details.title}</ThemedText>
                </View>

                <View style={styles.content}>
                    <View style={[styles.section, { backgroundColor: Colors[colorScheme].surface }]}>
                        <ThemedText type="subtitle" style={styles.sectionTitle}>Key Features</ThemedText>
                        {details.features.map((feature: string, idx: number) => (
                            <View key={idx} style={styles.listItem}>
                                <Ionicons name="checkmark-circle" size={20} color={Colors[colorScheme].success} />
                                <ThemedText style={styles.listText}>{feature}</ThemedText>
                            </View>
                        ))}
                    </View>

                    <View style={[styles.section, { backgroundColor: Colors[colorScheme].surface }]}>
                        <ThemedText type="subtitle" style={styles.sectionTitle}>Eligibility</ThemedText>
                        <ThemedText style={styles.text}>{details.eligibility}</ThemedText>
                    </View>

                    <View style={[styles.section, { backgroundColor: Colors[colorScheme].surface }]}>
                        <ThemedText type="subtitle" style={styles.sectionTitle}>Required Documents</ThemedText>
                        {details.documents.map((doc: string, idx: number) => (
                            <View key={idx} style={styles.listItem}>
                                <Ionicons name="document-outline" size={20} color={Colors[colorScheme].tint} />
                                <ThemedText style={styles.listText}>{doc}</ThemedText>
                            </View>
                        ))}
                    </View>

                    <TouchableOpacity
                        style={styles.applyBtn}
                        onPress={() => router.push({
                            pathname: '/apply',
                            params: { type: id }
                        })}
                    >
                        <ThemedText style={styles.applyBtnText}>Apply for this Loan</ThemedText>
                    </TouchableOpacity>
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
        color: '#000000',
        fontSize: 28,
        fontWeight: '800',
    },
    content: {
        padding: 20,
        marginTop: -20,
    },
    section: {
        padding: 20,
        borderRadius: 24,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 16,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        gap: 12,
    },
    listText: {
        fontSize: 15,
        opacity: 0.8,
        flex: 1,
    },
    text: {
        fontSize: 15,
        opacity: 0.8,
        lineHeight: 22,
    },
    applyBtn: {
        backgroundColor: '#000000',
        height: 60,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 40,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    applyBtnText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
    },
});
