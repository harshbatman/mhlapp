import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Switch, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, ThemeType } from '@/constants/theme';
import { useTranslation } from '@/context/LanguageContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

const NotificationToggle = ({ icon, title, description, value, onValueChange }: { icon: any, title: string, description: string, value: boolean, onValueChange: (val: boolean) => void }) => {
    const colorScheme = (useColorScheme() ?? 'light') as ThemeType;
    return (
        <View style={[styles.toggleItem, { borderBottomColor: Colors[colorScheme].border }]}>
            <View style={styles.toggleLeft}>
                <View style={[styles.iconWrapper, { backgroundColor: Colors[colorScheme].tint + '15' }]}>
                    <Ionicons name={icon} size={22} color={Colors[colorScheme].tint} />
                </View>
                <View style={styles.textWrapper}>
                    <ThemedText style={styles.toggleTitle}>{title}</ThemedText>
                    <ThemedText style={styles.toggleDesc}>{description}</ThemedText>
                </View>
            </View>
            <Switch
                value={value}
                onValueChange={onValueChange}
                trackColor={{ false: '#767577', true: Colors[colorScheme].tint + '50' }}
                thumbColor={value ? Colors[colorScheme].tint : '#f4f3f4'}
                ios_backgroundColor="#3e3e3e"
            />
        </View>
    );
};

export default function NotificationsScreen() {
    const colorScheme = (useColorScheme() ?? 'light') as ThemeType;
    const router = useRouter();
    const { t } = useTranslation();

    const [pushEnabled, setPushEnabled] = useState(true);
    const [emailEnabled, setEmailEnabled] = useState(false);
    const [loanUpdates, setLoanUpdates] = useState(true);
    const [promoEnabled, setPromoEnabled] = useState(true);

    return (
        <ThemedView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={Colors[colorScheme].text} />
                </TouchableOpacity>
                <ThemedText style={styles.headerTitle}>Notification Settings</ThemedText>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={[styles.card, { backgroundColor: Colors[colorScheme].surface }]}>
                    <NotificationToggle
                        icon="notifications-outline"
                        title="Push Notifications"
                        description="Receive real-time alerts on your device"
                        value={pushEnabled}
                        onValueChange={setPushEnabled}
                    />
                    <NotificationToggle
                        icon="mail-outline"
                        title="Email Notifications"
                        description="Receive updates via your registered email"
                        value={emailEnabled}
                        onValueChange={setEmailEnabled}
                    />
                    <NotificationToggle
                        icon="document-text-outline"
                        title="Loan Status Updates"
                        description="Get notified about your application progress"
                        value={loanUpdates}
                        onValueChange={setLoanUpdates}
                    />
                    <NotificationToggle
                        icon="gift-outline"
                        title="Offers & Promotions"
                        description="Stay updated with latest interest rates and deals"
                        value={promoEnabled}
                        onValueChange={setPromoEnabled}
                    />
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
        padding: 20,
    },
    card: {
        borderRadius: 24,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    toggleItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        borderBottomWidth: 1,
    },
    toggleLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconWrapper: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    textWrapper: {
        flex: 1,
        marginRight: 10,
    },
    toggleTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    toggleDesc: {
        fontSize: 13,
        opacity: 0.6,
        marginTop: 2,
    },
});
