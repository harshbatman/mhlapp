import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import CountryPicker, { Country, CountryCode } from 'react-native-country-picker-modal';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, ThemeType } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthService } from '@/utils/auth';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
    const colorScheme = (useColorScheme() ?? 'light') as ThemeType;
    const router = useRouter();

    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [countryCode, setCountryCode] = useState<CountryCode>('IN');
    const [callingCode, setCallingCode] = useState('91');

    const handleLogin = async () => {
        // Basic validation
        if (phone.length !== 10) {
            alert('Please enter a valid 10-digit phone number');
            return;
        }

        // Demo credentials check
        if (phone === '9876543210' && password === 'password123') {
            await AuthService.setSession({ phone, name: 'Harsh Mahto' });
            router.replace('/home');
        } else {
            alert('Invalid credentials. Use demo: 9876543210 / password123');
        }
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
                        <ThemedText style={styles.headerTitle}>Welcome Back</ThemedText>
                        <ThemedText style={styles.headerSubtitle}>Login to manage your home loans</ThemedText>
                    </LinearGradient>

                    <View style={styles.formSection}>
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
                            <ThemedText style={styles.label}>Password</ThemedText>
                            <View style={[styles.passwordWrapper, { borderColor: Colors[colorScheme].border, backgroundColor: Colors[colorScheme].surface }]}>
                                <TextInput
                                    style={[styles.passwordInput, { color: Colors[colorScheme].text }]}
                                    placeholder="Enter password"
                                    placeholderTextColor="#999"
                                    secureTextEntry
                                    value={password}
                                    onChangeText={setPassword}
                                />
                            </View>
                        </View>

                        <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
                            <ThemedText style={styles.loginBtnText}>Login</ThemedText>
                        </TouchableOpacity>

                        <View style={styles.footer}>
                            <ThemedText style={styles.footerText}>Don't have an account? </ThemedText>
                            <TouchableOpacity onPress={() => router.push('/auth/register')}>
                                <ThemedText style={styles.linkText}>Create an account</ThemedText>
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
        paddingBottom: 60,
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
        marginTop: -30,
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
    phoneInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 16,
        height: 60,
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
    passwordWrapper: {
        borderWidth: 1,
        borderRadius: 16,
        height: 60,
        paddingHorizontal: 16,
        justifyContent: 'center',
    },
    passwordInput: {
        fontSize: 16,
        fontWeight: '500',
    },
    loginBtn: {
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
    loginBtnText: {
        color: '#D4AF37',
        fontSize: 18,
        fontWeight: '700',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 30,
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
