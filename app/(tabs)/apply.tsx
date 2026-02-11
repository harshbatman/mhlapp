import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, ThemeType } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function ApplyScreen() {
    const colorScheme = (useColorScheme() ?? 'light') as ThemeType;
    const router = useRouter();
    const params = useLocalSearchParams<{ type?: string }>();

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        loanAmount: '',
        loanType: params.type || 'Construction',
    });

    useEffect(() => {
        if (params.type) {
            setFormData(prev => ({ ...prev, loanType: params.type as string }));
        }
    }, [params.type]);

    const handleSubmit = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        if (!formData.name || !formData.phone || !formData.loanAmount) {
            Alert.alert('Missing Fields', 'Please fill in all required fields.');
            return;
        }
        Alert.alert('Success', 'Your application has been submitted. Our agent will contact you shortly.', [
            { text: 'OK', onPress: () => router.push('/') }
        ]);
    };

    const renderInput = (label: string, value: string, onChangeText: (text: string) => void, placeholder: string, keyboardType: any = 'default', maxLength?: number) => (
        <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>{label}</ThemedText>
            <TextInput
                style={[
                    styles.input,
                    {
                        backgroundColor: Colors[colorScheme].surface,
                        color: Colors[colorScheme].text,
                        borderColor: Colors[colorScheme].border
                    }
                ]}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor="#999"
                keyboardType={keyboardType}
                maxLength={maxLength}
            />
        </View>
    );

    return (
        <ThemedView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
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
                            <ThemedText style={styles.headerTitle}>
                                {formData.loanType ? `${formData.loanType} Application` : 'Loan Application'}
                            </ThemedText>
                        </View>
                        <ThemedText style={styles.headerSubtitle}>Enter your details to get started</ThemedText>
                    </LinearGradient>

                    <View style={styles.formCard}>
                        {renderInput('Full Name', formData.name, (text) => setFormData({ ...formData, name: text }), 'Enter your full name')}
                        {renderInput('Phone Number', formData.phone, (text) => setFormData({ ...formData, phone: text.replace(/[^0-9]/g, '') }), 'Enter your 10 digit number', 'phone-pad', 10)}
                        {renderInput('Email Address', formData.email, (text) => setFormData({ ...formData, email: text }), 'Enter your email', 'email-address')}
                        {renderInput('Requested Loan Amount (₹)', formData.loanAmount, (text) => setFormData({ ...formData, loanAmount: text }), 'e.g. 50 Lakh or 1.5 Cr', 'default')}

                        <View style={styles.inputContainer}>
                            <ThemedText style={styles.label}>Loan Type</ThemedText>
                            <View style={styles.loanTypeGrid}>
                                {['Construction', 'LAP', 'Renovation', 'Flat Buying'].map((type) => (
                                    <TouchableOpacity
                                        key={type}
                                        style={[
                                            styles.typeOption,
                                            formData.loanType.includes(type) && styles.typeOptionSelected,
                                            { borderColor: Colors[colorScheme].border }
                                        ]}
                                        onPress={() => setFormData({ ...formData, loanType: type })}
                                    >
                                        <ThemedText style={[
                                            styles.typeOptionText,
                                            formData.loanType.includes(type) && styles.typeOptionTextSelected
                                        ]}>{type}</ThemedText>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
                            <ThemedText style={styles.submitBtnText}>Submit Application</ThemedText>
                            <Ionicons name="arrow-forward" size={20} color="#002D62" />
                        </TouchableOpacity>

                        <ThemedText style={styles.disclaimer}>
                            By submitting, you agree to our Terms & Conditions and Privacy Policy. Our representative will call you for verification.
                        </ThemedText>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
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
        fontSize: 24,
        fontWeight: '800',
        flex: 1,
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
    formCard: {
        marginTop: -20,
        marginHorizontal: 20,
        padding: 24,
        backgroundColor: 'transparent',
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        opacity: 0.8,
    },
    input: {
        height: 56,
        borderRadius: 12,
        paddingHorizontal: 16,
        borderWidth: 1,
        fontSize: 16,
    },
    loanTypeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    typeOption: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 10,
        borderWidth: 1,
    },
    typeOptionSelected: {
        backgroundColor: '#D4AF37',
        borderColor: '#D4AF37',
    },
    typeOptionText: {
        fontSize: 14,
        fontWeight: '500',
    },
    typeOptionTextSelected: {
        color: '#002D62',
        fontWeight: '700',
    },
    submitBtn: {
        backgroundColor: '#D4AF37',
        height: 56,
        borderRadius: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        gap: 8,
        shadowColor: '#D4AF37',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    submitBtnText: {
        color: '#002D62',
        fontSize: 18,
        fontWeight: '700',
    },
    disclaimer: {
        marginTop: 20,
        fontSize: 12,
        textAlign: 'center',
        opacity: 0.5,
        lineHeight: 18,
    },
});
