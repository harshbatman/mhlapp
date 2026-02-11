import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Linking, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, ThemeType } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const HelpCard = ({ icon, title, description, email, buttonText }: { icon: any, title: string, description: string, email: string, buttonText: string }) => {
    const colorScheme = (useColorScheme() ?? 'light') as ThemeType;
    return (
        <View style={[styles.helpCard, { backgroundColor: Colors[colorScheme].surface, borderColor: Colors[colorScheme].border }]}>
            <View style={styles.helpIconWrapper}>
                <Ionicons name={icon} size={24} color="#D4AF37" />
            </View>
            <ThemedText style={styles.helpCardTitle}>{title}</ThemedText>
            <ThemedText style={styles.helpCardDesc}>{description}</ThemedText>
            <TouchableOpacity
                style={styles.helpBtn}
                onPress={() => Linking.openURL(`mailto:${email}`)}
            >
                <ThemedText style={styles.helpBtnText}>{buttonText}</ThemedText>
                <Ionicons name="mail-outline" size={18} color="#002D62" />
            </TouchableOpacity>
        </View>
    );
};

export default function HelpScreen() {
    const colorScheme = (useColorScheme() ?? 'light') as ThemeType;
    const router = useRouter();

    return (
        <ThemedView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={Colors[colorScheme].text} />
                </TouchableOpacity>
                <ThemedText style={styles.headerTitle}>Help Center / FAQ</ThemedText>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.banner}>
                    <Ionicons name="help-buoy-outline" size={48} color="#D4AF37" />
                    <ThemedText style={styles.bannerTitle}>Facing any issue while using MAHTO Home Loans?</ThemedText>
                    <ThemedText style={styles.bannerSubtitle}>We're here to help you bridge the gap between your problems and solutions.</ThemedText>
                </View>

                <View style={styles.instructionBox}>
                    <Ionicons name="camera-outline" size={24} color={Colors[colorScheme].tint} />
                    <ThemedText style={styles.instructionText}>
                        <ThemedText style={{ fontWeight: '700' }}>Pro Tip: </ThemedText>
                        Please attach a screenshot or image of the issue in your email to help us clarify and resolve the problem faster.
                    </ThemedText>
                </View>

                <View style={styles.grid}>
                    <HelpCard
                        icon="bug-outline"
                        title="Report a Bug"
                        description="Found a technical glitch or an error? Let our tech team know immediately."
                        email="support@mahtoji.tech"
                        buttonText="Contact Support"
                    />
                    <HelpCard
                        icon="bulb-outline"
                        title="Feature Request"
                        description="Have an idea to make MAHTO better? We'd love to hear your suggestions."
                        email="support@mahtoji.tech"
                        buttonText="Send Suggestion"
                    />
                </View>

                <View style={[styles.ceoSection, { backgroundColor: '#002D62' }]}>
                    <Ionicons name="ribbon-outline" size={32} color="#D4AF37" />
                    <View style={styles.ceoTextWrapper}>
                        <ThemedText style={styles.ceoTitle}>CEO's Office</ThemedText>
                        <ThemedText style={styles.ceoDesc}>For critical escalations or partnership inquiries directly to the leadership.</ThemedText>
                        <TouchableOpacity
                            style={[styles.helpBtn, { backgroundColor: '#D4AF37', marginTop: 8 }]}
                            onPress={() => Linking.openURL('mailto:harshkumarceo@mahtoji.tech')}
                        >
                            <ThemedText style={styles.helpBtnText}>Contact CEO Office</ThemedText>
                            <Ionicons name="mail-outline" size={18} color="#002D62" />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.footerInfo}>
                    <Ionicons name="time-outline" size={16} color="#666" />
                    <ThemedText style={styles.footerText}>Standard Response Time: 24 - 48 Hours</ThemedText>
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
    banner: {
        alignItems: 'center',
        marginBottom: 32,
    },
    bannerTitle: {
        fontSize: 22,
        fontWeight: '800',
        textAlign: 'center',
        marginTop: 16,
        lineHeight: 28,
    },
    bannerSubtitle: {
        fontSize: 14,
        textAlign: 'center',
        opacity: 0.6,
        marginTop: 8,
        lineHeight: 20,
    },
    instructionBox: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: 'rgba(212, 175, 55, 0.1)',
        borderRadius: 16,
        alignItems: 'center',
        gap: 12,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.2)',
    },
    instructionText: {
        flex: 1,
        fontSize: 13,
        lineHeight: 18,
    },
    grid: {
        gap: 20,
        marginBottom: 32,
    },
    helpCard: {
        padding: 24,
        borderRadius: 24,
        borderWidth: 1,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    helpIconWrapper: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: '#FDFCF0',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    helpCardTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 8,
    },
    helpCardDesc: {
        fontSize: 14,
        opacity: 0.7,
        lineHeight: 20,
        marginBottom: 20,
    },
    helpBtn: {
        backgroundColor: '#D4AF37',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        alignSelf: 'flex-start',
    },
    helpBtnText: {
        color: '#002D62',
        fontWeight: '700',
        fontSize: 14,
    },
    ceoSection: {
        padding: 24,
        borderRadius: 24,
        flexDirection: 'row',
        gap: 20,
        alignItems: 'flex-start',
    },
    ceoTextWrapper: {
        flex: 1,
    },
    ceoTitle: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 4,
    },
    ceoDesc: {
        color: '#E0E0E0',
        fontSize: 13,
        lineHeight: 18,
        marginBottom: 12,
        opacity: 0.8,
    },
    ceoEmail: {
        color: '#D4AF37',
        fontSize: 14,
        fontWeight: '700',
        textDecorationLine: 'underline',
    },
    footerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        marginTop: 24,
    },
    footerText: {
        fontSize: 12,
        color: '#666',
        fontWeight: '600',
    },
});
