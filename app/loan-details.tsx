import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ThemeType } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const { width } = Dimensions.get('window');

const LOAN_DETAILS: Record<string, any> = {
    'construction': {
        title: 'Construction Loan',
        description: 'Building your own home is a milestone. We provide the financial support to make it happen step-by-step.',
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
        description: 'Unlock the hidden value of your property to fuel your business dreams or personal needs.',
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
        description: 'Give your existing home a modern makeover without worrying about the costs.',
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
        description: 'Step into your new apartment with our hassle-free financing and competitive market rates.',
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
    const params = useLocalSearchParams<{ id: string, title: string }>();
    const colorScheme = (useColorScheme() ?? 'light') as ThemeType;
    const router = useRouter();

    const id = params.id as string;
    const details = LOAN_DETAILS[id] || LOAN_DETAILS['construction'];

    return (
        <ThemedView style={styles.container}>
            <Stack.Screen options={{ title: details.title, headerShown: false }} />

            <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
                <LinearGradient
                    colors={['#000000', '#1c1c1e']}
                    style={styles.header}
                >
                    <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                    </TouchableOpacity>

                    <View style={styles.headerContent}>
                        <ThemedText style={styles.headerTitle}>{details.title}</ThemedText>
                        <ThemedText style={styles.headerDescription}>{details.description}</ThemedText>
                    </View>
                </LinearGradient>

                <View style={styles.content}>
                    <View style={[styles.section, { backgroundColor: '#FFFFFF' }]}>
                        <View style={styles.sectionHeader}>
                            <View style={styles.iconCircle}>
                                <Ionicons name="star" size={20} color="#000000" />
                            </View>
                            <ThemedText style={styles.sectionTitle}>Key Features</ThemedText>
                        </View>
                        {details.features.map((feature: string, idx: number) => (
                            <View key={idx} style={styles.listItem}>
                                <View style={styles.bullet} />
                                <ThemedText style={styles.listText}>{feature}</ThemedText>
                            </View>
                        ))}
                    </View>

                    <View style={[styles.section, { backgroundColor: '#FFFFFF' }]}>
                        <View style={styles.sectionHeader}>
                            <View style={[styles.iconCircle, { backgroundColor: '#F5F5F5' }]}>
                                <Ionicons name="people" size={20} color="#000000" />
                            </View>
                            <ThemedText style={styles.sectionTitle}>Eligibility</ThemedText>
                        </View>
                        <ThemedText style={styles.text}>{details.eligibility}</ThemedText>
                    </View>

                    <View style={[styles.section, { backgroundColor: '#FFFFFF' }]}>
                        <View style={styles.sectionHeader}>
                            <View style={[styles.iconCircle, { backgroundColor: '#F5F5F5' }]}>
                                <Ionicons name="document-text" size={20} color="#000000" />
                            </View>
                            <ThemedText style={styles.sectionTitle}>Required Documents</ThemedText>
                        </View>
                        {details.documents.map((doc: string, idx: number) => (
                            <View key={idx} style={styles.listItem}>
                                <Ionicons name="attach-outline" size={18} color="#666666" />
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
                        activeOpacity={0.8}
                    >
                        <ThemedText style={styles.applyBtnText}>Apply Now</ThemedText>
                        <Ionicons name="arrow-forward" size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    header: {
        paddingTop: Platform.OS === 'ios' ? 60 : 50,
        paddingHorizontal: 24,
        paddingBottom: 40,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    headerContent: {
        marginTop: 10,
    },
    headerTitle: {
        color: '#FFFFFF',
        fontSize: 32,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    headerDescription: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 16,
        marginTop: 12,
        lineHeight: 24,
    },
    content: {
        padding: 20,
        marginTop: -20,
    },
    section: {
        padding: 24,
        borderRadius: 30,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
        elevation: 5,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 18,
        gap: 12,
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F0F0F0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000000',
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 12,
    },
    bullet: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#000000',
    },
    listText: {
        fontSize: 15,
        color: '#444444',
        flex: 1,
        lineHeight: 20,
    },
    text: {
        fontSize: 15,
        color: '#444444',
        lineHeight: 22,
    },
    applyBtn: {
        backgroundColor: '#000000',
        height: 64,
        borderRadius: 32,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 40,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 6,
    },
    applyBtnText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
    },
});
