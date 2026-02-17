import { CustomAlert } from '@/components/CustomAlert';
import { AuthService } from '@/utils/auth';
import { auth, db } from '@/utils/firebase';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { deleteDoc, doc } from 'firebase/firestore';
import React, { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ThemeType } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function DeleteAccountScreen() {
    const colorScheme = (useColorScheme() ?? 'light') as ThemeType;
    const router = useRouter();

    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const [alertConfig, setAlertConfig] = useState({
        visible: false,
        title: '',
        message: '',
        type: 'info' as 'info' | 'error' | 'success' | 'warning',
        primaryText: 'OK',
        secondaryText: undefined as string | undefined,
        onPrimary: () => { },
        onSecondary: () => { }
    });

    const showAlert = (
        title: string,
        message: string,
        type: 'info' | 'error' | 'success' | 'warning' = 'info',
        primaryText: string = 'OK',
        onPrimary: () => void = () => { },
        secondaryText?: string,
        onSecondary?: () => void
    ) => {
        setAlertConfig({
            visible: true,
            title,
            message,
            type,
            primaryText,
            secondaryText,
            onPrimary,
            onSecondary: onSecondary || (() => { })
        });
    };

    const phoneToEmail = (p: string) => `${p}@mahto.app`;

    const handleDelete = async () => {
        if (!phone.trim() || !password.trim()) {
            showAlert('Required Fields', 'Please enter your phone number and password to confirm deletion.', 'warning');
            return;
        }

        const user = auth.currentUser;
        if (!user) {
            showAlert('Not Logged In', 'You must be logged in to delete your account.', 'error');
            return;
        }

        showAlert(
            'Final Confirmation',
            'This action is PERMANENT. All your loan data, profiles, and documents will be erased forever. Are you absolutely sure?',
            'warning',
            'Cancel',
            () => { },
            'Delete Forever',
            async () => {
                try {
                    setLoading(true);
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

                    // 1. Re-authenticate
                    const email = phoneToEmail(phone);
                    const credential = EmailAuthProvider.credential(email, password);
                    await reauthenticateWithCredential(user, credential);

                    // 2. Delete Firestore data
                    await deleteDoc(doc(db, 'users', user.uid));

                    // 3. Delete Firebase Auth user
                    await user.delete();

                    // 4. Clear local session
                    await AuthService.logout();

                    setLoading(false);
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

                    showAlert(
                        'Account Deleted',
                        'Your account and all associated data have been permanently removed.',
                        'success',
                        'OK',
                        () => router.replace('/auth/login')
                    );
                } catch (error: any) {
                    setLoading(false);
                    console.error('Delete error:', error);
                    let errMsg = 'Failed to delete account. Please check your password and try again.';
                    if (error.code === 'auth/wrong-password') {
                        errMsg = 'Incorrect password. Please try again.';
                    } else if (error.code === 'auth/user-mismatch') {
                        errMsg = 'Phone number does not match current account.';
                    }
                    showAlert('Deletion Failed', errMsg, 'error');
                }
            }
        );
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
                        <ThemedText style={styles.headerSubtitle}>Proceed with extreme caution. This action cannot be undone.</ThemedText>
                    </LinearGradient>

                    <View style={styles.formSection}>
                        <View style={styles.warningCard}>
                            <View style={styles.warningIconWrapper}>
                                <Ionicons name="alert-circle" size={28} color="#000000" />
                            </View>
                            <ThemedText style={styles.warningText}>
                                Deleting your account will remove all your loan applications, uploaded documents, and personal history from our servers permanently.
                            </ThemedText>
                        </View>

                        <View style={styles.inputContainer}>
                            <ThemedText style={styles.label}>Confirm Phone Number</ThemedText>
                            <TextInput
                                style={[styles.input, { backgroundColor: '#F9F9F9', color: '#000000', borderColor: '#EEEEEE' }]}
                                placeholder="Registered 10 digit number"
                                placeholderTextColor="#999"
                                keyboardType="numeric"
                                value={phone}
                                onChangeText={setPhone}
                                maxLength={10}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <ThemedText style={styles.label}>Password</ThemedText>
                            <View style={[styles.passwordWrapper, { backgroundColor: '#F9F9F9', borderColor: '#EEEEEE' }]}>
                                <TextInput
                                    style={[styles.passwordInput, { color: '#000000' }]}
                                    placeholder="Enter your password"
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
                                        color="#000000"
                                        style={{ opacity: 0.5 }}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[styles.deleteBtn, (loading || !phone || !password) && { opacity: 0.5 }]}
                            onPress={handleDelete}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <ThemedText style={styles.deleteBtnText}>Confirm Permanent Deletion</ThemedText>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
                            <ThemedText style={styles.cancelBtnText}>Changed my mind, take me back</ThemedText>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            <CustomAlert
                visible={alertConfig.visible}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
                primaryButtonText={alertConfig.primaryText}
                secondaryButtonText={alertConfig.secondaryText}
                onSecondaryAction={alertConfig.onSecondary}
                onClose={() => {
                    alertConfig.onPrimary();
                    setAlertConfig({ ...alertConfig, visible: false });
                }}
            />
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
    headerTitle: {
        color: '#FFFFFF',
        fontSize: 32,
        fontWeight: '800',
    },
    headerSubtitle: {
        color: '#FFFFFF',
        fontSize: 16,
        marginTop: 10,
        opacity: 0.8,
        lineHeight: 22,
    },
    formSection: {
        padding: 24,
    },
    warningCard: {
        flexDirection: 'row',
        backgroundColor: '#FFF5F5',
        padding: 20,
        borderRadius: 24,
        marginBottom: 30,
        alignItems: 'center',
        gap: 16,
        borderWidth: 1,
        borderColor: '#FFEBEB',
    },
    warningIconWrapper: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    warningText: {
        flex: 1,
        color: '#000000',
        fontSize: 14,
        lineHeight: 20,
        fontWeight: '600',
    },
    inputContainer: {
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: '700',
        color: '#444444',
        marginBottom: 10,
        marginLeft: 4,
    },
    input: {
        height: 60,
        borderRadius: 20,
        paddingHorizontal: 20,
        borderWidth: 1,
        fontSize: 16,
        fontWeight: '500',
    },
    passwordWrapper: {
        height: 60,
        borderRadius: 20,
        paddingHorizontal: 20,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    passwordInput: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
    },
    deleteBtn: {
        backgroundColor: '#000000',
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 6,
    },
    deleteBtnText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
    },
    cancelBtn: {
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    cancelBtnText: {
        color: '#666666',
        fontSize: 15,
        fontWeight: '600',
    },
});
