import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, ThemeType } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TermsScreen() {
    const colorScheme = (useColorScheme() ?? 'light') as ThemeType;
    const router = useRouter();

    return (
        <ThemedView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={Colors[colorScheme].text} />
                </TouchableOpacity>
                <ThemedText style={styles.headerTitle}>Terms & Conditions</ThemedText>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <ThemedText style={styles.lastUpdated}>Last Updated: February 2026</ThemedText>

                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>1. Acceptance of Terms</ThemedText>
                    <ThemedText style={styles.text}>
                        By accessing and using MAHTO Home Loans (part of the MAHTO Home Building OS), you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our services.
                    </ThemedText>
                </View>

                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>2. Service Description</ThemedText>
                    <ThemedText style={styles.text}>
                        MAHTO provides a platform for home building services, including but not limited to home loans, construction services (Mine), and land listings. We act as a marketplace connecting users with service providers and financial institutions.
                    </ThemedText>
                </View>

                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>3. Eligibility</ThemedText>
                    <ThemedText style={styles.text}>
                        You must be at least 18 years of age to use our services. By using our platform, you represent that you have the legal capacity to enter into binding contracts.
                    </ThemedText>
                </View>

                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>4. Loan Application Process</ThemedText>
                    <ThemedText style={styles.text}>
                        Submitting a loan application through our platform does not guarantee approval. All loan approvals are subject to the terms, conditions, and credit assessments of the respective financial institutions.
                    </ThemedText>
                </View>

                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>5. User Responsibilities</ThemedText>
                    <ThemedText style={styles.text}>
                        You are responsible for providing accurate and truthful information during registration and application processes. Misrepresentation of information may lead to the termination of your account and legal action.
                    </ThemedText>
                </View>

                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>6. Intellectual Property</ThemedText>
                    <ThemedText style={styles.text}>
                        All content on this platform, including logos, designs, and text, is the property of MAHTO and protected by intellectual property laws.
                    </ThemedText>
                </View>

                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>7. Limitation of Liability</ThemedText>
                    <ThemedText style={styles.text}>
                        MAHTO shall not be liable for any indirect, incidental, or consequential damages arising out of the use or inability to use our services or the actions of third-party vendors.
                    </ThemedText>
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#00000008',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
    },
    content: {
        padding: 24,
    },
    lastUpdated: {
        fontSize: 14,
        opacity: 0.5,
        marginBottom: 24,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 12,
        color: '#D4AF37',
    },
    text: {
        fontSize: 15,
        lineHeight: 22,
        opacity: 0.8,
    },
});
