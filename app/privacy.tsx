import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, ThemeType } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function PrivacyScreen() {
    const colorScheme = (useColorScheme() ?? 'light') as ThemeType;
    const router = useRouter();

    return (
        <ThemedView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={Colors[colorScheme].text} />
                </TouchableOpacity>
                <ThemedText style={styles.headerTitle}>Privacy Policy</ThemedText>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <ThemedText style={styles.lastUpdated}>Last Updated: February 2026</ThemedText>

                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>1. Data We Collect</ThemedText>
                    <ThemedText style={styles.text}>
                        We collect information you provide directly to us when you register, apply for a loan, or use our services. This includes your name, phone number, email address, physical address, and financial documents.
                    </ThemedText>
                </View>

                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>2. How We Use Your Information</ThemedText>
                    <ThemedText style={styles.text}>
                        We use the information to:
                        {"\n"}• Process your loan applications.
                        {"\n"}• Connect you with contractors and vendors (Mine ecosystem).
                        {"\n"}• Personalize your experience on our platform.
                        {"\n"}• Comply with legal and regulatory requirements.
                    </ThemedText>
                </View>

                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>3. Data Sharing</ThemedText>
                    <ThemedText style={styles.text}>
                        We may share your information with financial institutions and registered vendors within the MAHTO ecosystem to facilitate the services you have requested. We do not sell your personal data to third-party advertisers.
                    </ThemedText>
                </View>

                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>4. Data Security</ThemedText>
                    <ThemedText style={styles.text}>
                        We implement strict security measures to protect your personal information from unauthorized access, alteration, or disclosure. However, no method of transmission over the internet is 100% secure.
                    </ThemedText>
                </View>

                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>5. Your Rights</ThemedText>
                    <ThemedText style={styles.text}>
                        You have the right to access, update, or delete your personal information stored on our platform. You can manage most of these settings directly through your profile.
                    </ThemedText>
                </View>

                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>6. Cookies & Tracking</ThemedText>
                    <ThemedText style={styles.text}>
                        We use cookies and similar tracking technologies to analyze app usage and improve our services.
                    </ThemedText>
                </View>

                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>7. Changes to This Policy</ThemedText>
                    <ThemedText style={styles.text}>
                        We may update our Privacy Policy from time to time. We will notify you of any significant changes by posting the new policy on this page.
                    </ThemedText>
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
        color: '#D4AF37',
    },
    text: {
        fontSize: 15,
        lineHeight: 22,
        opacity: 0.8,
    },
});
