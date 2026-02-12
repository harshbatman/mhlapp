import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, Dimensions, Image, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, ThemeType } from '@/constants/theme';
import { useTranslation } from '@/context/LanguageContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthService } from '@/utils/auth';
import { auth } from '@/utils/firebase';

const { width } = Dimensions.get('window');

const ProfileOption = ({ icon, title, onPress, color, showArrow = true }: { icon: any, title: string, onPress: () => void, color?: string, showArrow?: boolean }) => {
    const colorScheme = (useColorScheme() ?? 'light') as ThemeType;
    return (
        <TouchableOpacity style={[styles.optionItem, { borderBottomColor: Colors[colorScheme].border }]} onPress={onPress}>
            <View style={styles.optionLeft}>
                <View style={[styles.iconWrapper, { backgroundColor: color ? `${color}15` : '#002D6215' }]}>
                    <Ionicons name={icon} size={22} color={color || '#002D62'} />
                </View>
                <ThemedText style={styles.optionTitle}>{title}</ThemedText>
            </View>
            {showArrow && <Ionicons name="chevron-forward" size={18} color="#999" />}
        </TouchableOpacity>
    );
};

export default function ProfileScreen() {
    const colorScheme = (useColorScheme() ?? 'light') as ThemeType;
    const router = useRouter();
    const { t } = useTranslation();
    const [userData, setUserData] = useState<any>(null);

    useFocusEffect(
        useCallback(() => {
            const loadProfile = async () => {
                const user = auth.currentUser;
                if (user) {
                    const synced = await AuthService.syncProfile(user.uid);
                    if (synced) {
                        setUserData(synced);
                        return;
                    }
                }
                const session = await AuthService.getSession();
                setUserData(session);
            };
            loadProfile();
        }, [])
    );

    const handleLogout = () => {
        Alert.alert(
            t('logout'),
            'Are you sure you want to logout?',
            [
                { text: 'No', style: 'cancel' },
                {
                    text: 'Yes',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await AuthService.logout();
                            router.replace('/');
                        } catch (error: any) {
                            alert('We encountered an issue during logout. Please try again.');
                        }
                    }
                }
            ]
        );
    };

    return (
        <ThemedView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <LinearGradient
                    colors={colorScheme === 'light' ? ['#002D62', '#0056b3'] : ['#0F172A', '#1E293B']}
                    style={styles.header}
                >
                    <View style={styles.headerTop}>
                        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                        <ThemedText style={styles.headerTitle}>{t('profile')}</ThemedText>
                        <View style={{ width: 40 }} />
                    </View>

                    <View style={styles.profileInfo}>
                        <View style={styles.avatarWrapper}>
                            {userData?.profileImage ? (
                                <Image source={{ uri: userData.profileImage }} style={styles.profileImageLarge} />
                            ) : (
                                <Ionicons name="person" size={50} color="#002D62" />
                            )}
                        </View>
                        <ThemedText style={styles.userName}>{userData?.name || 'Harsh Mahto'}</ThemedText>
                        <ThemedText style={styles.userPhone}>{userData?.phone || '+91 9876543210'}</ThemedText>
                    </View>
                </LinearGradient>

                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>Account Settings</ThemedText>
                    <View style={[styles.card, { backgroundColor: Colors[colorScheme].surface }]}>
                        <ProfileOption icon="person-outline" title={t('editProfile')} onPress={() => router.push('/edit-profile')} />
                        <ProfileOption icon="language-outline" title={t('language')} onPress={() => router.push('/language')} />
                        <ProfileOption icon="notifications-outline" title="Notification Settings" onPress={() => router.push('/notifications')} />
                    </View>
                </View>

                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>Information</ThemedText>
                    <View style={[styles.card, { backgroundColor: Colors[colorScheme].surface }]}>
                        <ProfileOption icon="information-circle-outline" title="About Us" onPress={() => router.push('/about')} />
                        <ProfileOption icon="document-text-outline" title="Terms & Conditions" onPress={() => router.push('/terms')} />
                        <ProfileOption icon="shield-checkmark-outline" title="Privacy Policy" onPress={() => router.push('/privacy')} />
                        <ProfileOption icon="refresh-circle-outline" title="Refund Policy" onPress={() => router.push('/refund')} />
                    </View>
                </View>

                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>Help & Support</ThemedText>
                    <View style={[styles.card, { backgroundColor: Colors[colorScheme].surface }]}>
                        <ProfileOption icon="headset-outline" title="Help Center / FAQ" onPress={() => router.push('/help')} />
                        <ProfileOption icon="mail-outline" title="Contact Us" onPress={() => router.push('/contact')} />
                        <ProfileOption icon="star-outline" title="Rate Us" onPress={() => { }} />
                    </View>
                </View>

                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>Actions</ThemedText>
                    <View style={[styles.card, { backgroundColor: Colors[colorScheme].surface }]}>
                        <ProfileOption icon="log-out-outline" title="Logout" color="#FF3B30" onPress={handleLogout} />
                        <ProfileOption icon="trash-outline" title="Delete Account" color="#FF3B30" onPress={() => router.push('/delete-account')} />
                    </View>
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
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingHorizontal: 20,
        paddingBottom: 40,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: '700',
    },
    profileInfo: {
        alignItems: 'center',
    },
    avatarWrapper: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
        borderWidth: 4,
        borderColor: '#D4AF37',
        overflow: 'hidden',
    },
    profileImageLarge: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    userName: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: '800',
    },
    userPhone: {
        color: '#E0E0E0',
        fontSize: 16,
        marginTop: 4,
        opacity: 0.9,
    },
    section: {
        paddingHorizontal: 20,
        marginTop: 25,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 10,
        marginLeft: 5,
        opacity: 0.6,
        textTransform: 'uppercase',
    },
    card: {
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    optionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
    },
    optionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconWrapper: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    optionTitle: {
        fontSize: 16,
        fontWeight: '500',
    },
});
