import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, ThemeType } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function RefundScreen() {
    const colorScheme = (useColorScheme() ?? 'light') as ThemeType;
    const router = useRouter();

    return (
        <ThemedView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={Colors[colorScheme].text} />
                </TouchableOpacity>
                <ThemedText style={styles.headerTitle}>Refund Policy</ThemedText>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <ThemedText style={styles.lastUpdated}>Last Updated: February 2026</ThemedText>

                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>1. Loan Application Fee</ThemedText>
                    <ThemedText style={styles.text}>
                        The loan application processing fee, if any, is strictly non-refundable. This fee covers the administrative costs, document verification, and credit assessment performed by MAHTO and its partner financial institutions. The fee remains non-refundable regardless of whether the loan is approved, rejected, or withdrawn by the applicant.
                    </ThemedText>
                </View>

                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>2. Technical Glitches & Duplicate Payments</ThemedText>
                    <ThemedText style={styles.text}>
                        In the event of a technical glitch where multiple installments (EMIs) or the same payment is debited more than once from your account simultaneously, MAHTO will process a refund for the excess amount.
                        {"\n\n"}
                        Please report such instances with relevant transaction IDs and bank statements to our support team immediately.
                    </ThemedText>
                </View>

                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>3. Mine Service Cancellations</ThemedText>
                    <ThemedText style={styles.text}>
                        For full-stack construction or renovation services (Mine), refunds are subject to the specific stage of work completed. Any materials already procured or labor days consumed will be deducted from the eligible refund amount.
                    </ThemedText>
                </View>

                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>4. Refund Timelines</ThemedText>
                    <ThemedText style={styles.text}>
                        Approved refunds for duplicate payments or technical errors will be processed within 7-10 working days. The amount will be credited back to the original payment source (Bank Account/Card/UPI) used during the transaction.
                    </ThemedText>
                </View>

                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>5. Contact for Refunds</ThemedText>
                    <ThemedText style={styles.text}>
                        For any refund-related queries or to report a technical payment error, please contact us at:
                        {"\n"}Email: support@mahtoji.tech
                    </ThemedText>
                </View>

                <View style={{ height: 40 }} />
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
        color: '#000000',
    },
    text: {
        fontSize: 15,
        lineHeight: 22,
        opacity: 0.8,
    },
});
