import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, ThemeType } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function CalculatorScreen() {
    const colorScheme = (useColorScheme() ?? 'light') as ThemeType;
    const router = useRouter();

    const [loanAmount, setLoanAmount] = useState('5000000');
    const [interestRate, setInterestRate] = useState('8.4');
    const [tenure, setTenure] = useState('20'); // in years
    const [emi, setEmi] = useState(0);
    const [totalInterest, setTotalInterest] = useState(0);
    const [totalPayment, setTotalPayment] = useState(0);

    useEffect(() => {
        calculateEMI();
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }, [loanAmount, interestRate, tenure]);

    const calculateEMI = () => {
        const P = parseFloat(loanAmount);
        const R = parseFloat(interestRate) / 12 / 100;
        const N = parseFloat(tenure) * 12;

        if (P && R && N) {
            const emiValue = (P * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1);
            const totalPay = emiValue * N;
            const totalInt = totalPay - P;

            setEmi(Math.round(emiValue));
            setTotalPayment(Math.round(totalPay));
            setTotalInterest(Math.round(totalInt));
        } else {
            setEmi(0);
            setTotalPayment(0);
            setTotalInterest(0);
        }
    };

    const renderInput = (label: string, value: string, onChangeText: (text: string) => void, suffix: string) => (
        <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>{label}</ThemedText>
            <View style={[
                styles.inputWrapper,
                { backgroundColor: Colors[colorScheme].surface, borderColor: Colors[colorScheme].border }
            ]}>
                <TextInput
                    style={[styles.input, { color: Colors[colorScheme].text }]}
                    value={value}
                    onChangeText={onChangeText}
                    keyboardType="numeric"
                />
                <ThemedText style={styles.suffix}>{suffix}</ThemedText>
            </View>
        </View>
    );

    return (
        <ThemedView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <LinearGradient
                    colors={colorScheme === 'light' ? ['#002D62', '#0056b3'] : ['#0F172A', '#1E293B']}
                    style={styles.header}
                >
                    <View style={styles.headerTopRow}>
                        {router.canGoBack() && (
                            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                                <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                            </TouchableOpacity>
                        )}
                        <ThemedText style={styles.headerTitle}>EMI Calculator</ThemedText>
                    </View>
                    <ThemedText style={styles.headerSubtitle}>Plan your finances better</ThemedText>
                </LinearGradient>

                <View style={styles.content}>
                    <View style={[styles.resultCard, { backgroundColor: Colors[colorScheme].surface }]}>
                        <ThemedText style={styles.resultLabel}>Monthly EMI</ThemedText>
                        <ThemedText style={styles.emiValue}>₹ {emi.toLocaleString('en-IN')}</ThemedText>

                        <View style={styles.divider} />

                        <View style={styles.statsRow}>
                            <View>
                                <ThemedText style={styles.statLabel}>Total Interest</ThemedText>
                                <ThemedText style={styles.statValue}>₹ {totalInterest.toLocaleString('en-IN')}</ThemedText>
                            </View>
                            <View>
                                <ThemedText style={styles.statLabel}>Total Payment</ThemedText>
                                <ThemedText style={styles.statValue}>₹ {totalPayment.toLocaleString('en-IN')}</ThemedText>
                            </View>
                        </View>
                    </View>

                    <View style={styles.form}>
                        {renderInput('Loan Amount', loanAmount, setLoanAmount, '₹')}
                        {renderInput('Interest Rate', interestRate, setInterestRate, '% p.a.')}
                        {renderInput('Loan Tenure', tenure, setTenure, 'Years')}
                    </View>

                    <TouchableOpacity
                        style={styles.applyBtn}
                        onPress={() => { }}
                    >
                        <ThemedText style={styles.applyBtnText}>Get Detailed Quote</ThemedText>
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
    headerTitle: {
        color: '#FFFFFF',
        fontSize: 28,
        fontWeight: '800',
    },
    headerTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerSubtitle: {
        color: '#E0E0E0',
        fontSize: 16,
        marginTop: 8,
    },
    content: {
        padding: 20,
        marginTop: -30,
    },
    resultCard: {
        padding: 24,
        borderRadius: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
        marginBottom: 24,
    },
    resultLabel: {
        fontSize: 16,
        opacity: 0.7,
        marginBottom: 8,
    },
    emiValue: {
        fontSize: 36,
        fontWeight: '800',
        color: '#D4AF37',
    },
    divider: {
        height: 1,
        width: '100%',
        backgroundColor: 'rgba(150,150,150,0.1)',
        marginVertical: 20,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    statLabel: {
        fontSize: 12,
        opacity: 0.6,
        marginBottom: 4,
    },
    statValue: {
        fontSize: 16,
        fontWeight: '700',
    },
    form: {
        gap: 16,
    },
    inputContainer: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        opacity: 0.8,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 56,
    },
    input: {
        flex: 1,
        fontSize: 18,
        fontWeight: '600',
    },
    suffix: {
        fontSize: 14,
        opacity: 0.5,
        fontWeight: '600',
    },
    applyBtn: {
        backgroundColor: '#002D62',
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 32,
        marginBottom: 40,
    },
    applyBtnText: {
        color: '#D4AF37',
        fontSize: 16,
        fontWeight: '700',
    },
});
