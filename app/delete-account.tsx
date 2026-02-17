import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, ThemeType } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function DeleteAccountScreen() {
    const colorScheme = (useColorScheme() ?? 'light') as ThemeType;
    const router = useRouter();

    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleDelete = () => {
        // Demo validation
        if (phone === '9876543210' && password === 'password123') {
            Alert.alert(
                'Final Confirmation',
                'Are you sure you want to permanently delete your account? This action cannot be undone.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Delete',
                        style: 'destructive',
                        onPress: () => {
                            Alert.alert('Account Deleted', 'Your account has been successfully removed.');
                            router.replace('/');
                        }
                    }
                ]
            );
        } else {
            Alert.alert('Invalid Credentials', 'Please enter correct phone and password to proceed.');
        }
    };

    return (
        <ThemedView style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <LinearGradient
                        colors={['#000000', '#1c1c1e']}
                        style={styles.header}
                    >
                        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                        <ThemedText style={styles.headerTitle}>Delete Account</ThemedText>
                        <ThemedText style={styles.headerSubtitle}>We&apos;re sorry to see you go. Please verify your credentials to continue.</ThemedText>
                    </LinearGradient>

                    <View style={styles.formSection}>
                        <View style={styles.warningCard}>
                            <Ionicons name="warning" size={24} color="#000000" />
                            <ThemedText style={styles.warningText}>
                                Deleting your account will remove all your loan applications and personal data permanently.
                            </ThemedText>
                        </View>

                        <View style={styles.inputContainer}>
                            <ThemedText style={styles.label}>Confirm Phone Number</ThemedText>
                            <TextInput
                                style={[styles.input, { backgroundColor: Colors[colorScheme].surface, color: Colors[colorScheme].text, borderColor: Colors[colorScheme].border }]}
                                placeholder="Enter 10 digit number"
                                placeholderTextColor="#999"
                                keyboardType="numeric"
                                value={phone}
                                onChangeText={setPhone}
                                maxLength={10}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <ThemedText style={styles.label}>Password</ThemedText>
                            <View style={[styles.passwordWrapper, { backgroundColor: Colors[colorScheme].surface, borderColor: Colors[colorScheme].border }]}>
                                <TextInput
                                    style={[styles.passwordInput, { color: Colors[colorScheme].text }]}
                                    placeholder="Enter password"
                                    placeholderTextColor="#999"
                                    secureTextEntry={!showPassword}
                                    value={password}
                                    onChangeText={setPassword}
                                />
                                <TouchableOpacity
                                    onPress={() => setShowPassword(!showPassword)}
                                    style={{ padding: 4 }}
                                >
                                    <Ionicons
                                        name={showPassword ? "eye-off-outline" : "eye-outline"}
                                        size={22}
                                        color={Colors[colorScheme].text}
                                        style={{ opacity: 0.5 }}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
                            <ThemedText style={styles.deleteBtnText}>Permanently Delete Account</ThemedText>
                        </TouchableOpacity>
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
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    headerTitle: {
        color: '#FFFFFF',
        fontSize: 28,
        fontWeight: '800',
    },
    headerSubtitle: {
        color: '#FFFFFF',
        fontSize: 16,
        marginTop: 8,
        opacity: 0.9,
    },
    formSection: {
        padding: 24,
    },
    warningCard: {
        flexDirection: 'row',
        backgroundColor: '#F5F5F5',
        padding: 16,
        borderRadius: 16,
        marginBottom: 24,
        alignItems: 'center',
        gap: 12,
    },
    warningText: {
        flex: 1,
        color: '#000000',
        fontSize: 14,
        lineHeight: 20,
        fontWeight: '500',
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
        borderRadius: 16,
        paddingHorizontal: 16,
        borderWidth: 1,
        fontSize: 16,
    },
    passwordWrapper: {
        height: 56,
        borderRadius: 16,
        paddingHorizontal: 16,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    passwordInput: {
        flex: 1,
        fontSize: 16,
    },
    deleteBtn: {
        backgroundColor: '#000000',
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    deleteBtnText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
});
