import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import CountryPicker, { Country, CountryCode } from 'react-native-country-picker-modal';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, ThemeType } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthService } from '@/utils/auth';

export default function RegisterScreen() {
    const colorScheme = (useColorScheme() ?? 'light') as ThemeType;
    const router = useRouter();

    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [countryCode, setCountryCode] = useState<CountryCode>('IN');
    const [callingCode, setCallingCode] = useState('91');

    const handleRegister = async () => {
        if (!name || phone.length !== 10) {
            alert('Please enter your name and a valid 10-digit phone number');
            return;
        }

        // Save session
        await AuthService.setSession({ phone, name, email });
        router.replace('/(tabs)');
    };

    return (
        <ThemedView style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    <LinearGradient
                        colors={colorScheme === 'light' ? ['#002D62', '#0056b3'] : ['#0F172A', '#1E293B']}
                        style={styles.header}
                    >
                        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                        <ThemedText style={styles.headerTitle}>Create Account</ThemedText>
                        <ThemedText style={styles.headerSubtitle}>Start your home loan journey today</ThemedText>
                    </LinearGradient>

                    <View style={styles.formSection}>
                        <View style={styles.inputContainer}>
                            <ThemedText style={styles.label}>Full Name</ThemedText>
                            <View style={[styles.inputWrapper, { borderColor: Colors[colorScheme].border, backgroundColor: Colors[colorScheme].surface }]}>
                                <TextInput
                                    style={[styles.input, { color: Colors[colorScheme].text }]}
                                    placeholder="Enter your name"
                                    placeholderTextColor="#999"
                                    value={name}
                                    onChangeText={setName}
                                />
                            </View>
                        </View>

                        <View style={styles.inputContainer}>
                            <ThemedText style={styles.label}>Phone Number</ThemedText>
                            <View style={[styles.phoneInputWrapper, { borderColor: Colors[colorScheme].border, backgroundColor: Colors[colorScheme].surface }]}>
                                <View style={styles.countryPickerBtn}>
                                    <CountryPicker
                                        countryCode={countryCode}
                                        withFilter
                                        withFlag
                                        withCallingCode
                                        onSelect={(country: Country) => {
                                            setCountryCode(country.cca2);
                                            setCallingCode(country.callingCode[0]);
                                        }}
                                    />
                                    <ThemedText style={styles.callingCodeText}>+{callingCode}</ThemedText>
                                    <Ionicons name="chevron-down" size={14} color={Colors[colorScheme].text} style={{ marginLeft: 4, opacity: 0.5 }} />
                                </View>
                                <TextInput
                                    style={[styles.phoneInput, { color: Colors[colorScheme].text }]}
                                    placeholder="Enter 10 digits"
                                    placeholderTextColor="#999"
                                    keyboardType="numeric"
                                    value={phone}
                                    onChangeText={(text) => setPhone(text.replace(/[^0-9]/g, '').slice(0, 10))}
                                    maxLength={10}
                                />
                            </View>
                        </View>

                        <View style={styles.inputContainer}>
                            <ThemedText style={styles.label}>Email Address (Optional)</ThemedText>
                            <View style={[styles.inputWrapper, { borderColor: Colors[colorScheme].border, backgroundColor: Colors[colorScheme].surface }]}>
                                <TextInput
                                    style={[styles.input, { color: Colors[colorScheme].text }]}
                                    placeholder="Enter your email"
                                    placeholderTextColor="#999"
                                    keyboardType="email-address"
                                    value={email}
                                    onChangeText={setEmail}
                                />
                            </View>
                        </View>

                        <View style={styles.inputContainer}>
                            <ThemedText style={styles.label}>Create Password</ThemedText>
                            <View style={[styles.inputWrapper, { borderColor: Colors[colorScheme].border, backgroundColor: Colors[colorScheme].surface }]}>
                                <TextInput
                                    style={[styles.input, { color: Colors[colorScheme].text }]}
                                    placeholder="Enter password"
                                    placeholderTextColor="#999"
                                    secureTextEntry
                                    value={password}
                                    onChangeText={setPassword}
                                />
                            </View>
                        </View>

                        <TouchableOpacity style={styles.registerBtn} onPress={handleRegister}>
                            <ThemedText style={styles.registerBtnText}>Create Account</ThemedText>
                        </TouchableOpacity>

                        <View style={styles.footer}>
                            <ThemedText style={styles.footerText}>Already have an account? </ThemedText>
                            <TouchableOpacity onPress={() => router.push('/auth/login')}>
                                <ThemedText style={styles.linkText}>Login</ThemedText>
                            </TouchableOpacity>
                        </View>
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
    scrollContent: {
        flexGrow: 1,
    },
    header: {
        paddingTop: 80,
        paddingHorizontal: 30,
        paddingBottom: 50,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
    },
    backBtn: {
        marginBottom: 20,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        color: '#FFFFFF',
        fontSize: 32,
        fontWeight: '800',
    },
    headerSubtitle: {
        color: '#E0E0E0',
        fontSize: 16,
        marginTop: 10,
        opacity: 0.9,
    },
    formSection: {
        padding: 30,
        marginTop: -20,
    },
    inputContainer: {
        marginBottom: 18,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        opacity: 0.8,
    },
    inputWrapper: {
        borderWidth: 1,
        borderRadius: 16,
        height: 56,
        paddingHorizontal: 16,
        justifyContent: 'center',
    },
    input: {
        fontSize: 16,
        fontWeight: '500',
    },
    phoneInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 16,
        height: 56,
        paddingHorizontal: 12,
    },
    countryPickerBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRightWidth: 1,
        borderRightColor: 'rgba(150,150,150,0.2)',
        paddingRight: 10,
        marginRight: 12,
    },
    callingCodeText: {
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 4,
    },
    phoneInput: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
    },
    registerBtn: {
        backgroundColor: '#002D62',
        height: 60,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        shadowColor: '#002D62',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    registerBtnText: {
        color: '#D4AF37',
        fontSize: 18,
        fontWeight: '700',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 30,
        marginBottom: 40,
    },
    footerText: {
        fontSize: 14,
        opacity: 0.7,
    },
    linkText: {
        fontSize: 14,
        color: '#002D62',
        fontWeight: '700',
    },
});
