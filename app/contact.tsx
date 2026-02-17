import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Linking, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, ThemeType } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function ContactScreen() {
    const colorScheme = (useColorScheme() ?? 'light') as ThemeType;
    const router = useRouter();

    const handleEmail = () => {
        Linking.openURL('mailto:support@mahtoji.tech');
    };

    return (
        <ThemedView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={Colors[colorScheme].text} />
                </TouchableOpacity>
                <ThemedText style={styles.headerTitle}>Contact Us</ThemedText>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.content}>
                <View style={styles.infoCard}>
                    <Ionicons name="mail" size={40} color="#FFFFFF" />
                    <ThemedText style={styles.infoTitle}>General Support</ThemedText>
                    <ThemedText style={styles.infoSubtitle}>For bugs, feature requests, or general queries.</ThemedText>

                    <TouchableOpacity style={styles.emailBtn} onPress={handleEmail}>
                        <ThemedText style={styles.emailText}>Contact Support</ThemedText>
                    </TouchableOpacity>
                </View>

                <View style={[styles.infoCard, { backgroundColor: '#000000', marginTop: 20 }]}>
                    <Ionicons name="ribbon" size={40} color="#FFFFFF" />
                    <ThemedText style={styles.infoTitle}>CEO&apos;s Office</ThemedText>
                    <ThemedText style={styles.infoSubtitle}>For critical escalations or leadership inquiries.</ThemedText>

                    <TouchableOpacity
                        style={[styles.emailBtn, { borderColor: '#FFFFFF' }]}
                        onPress={() => Linking.openURL('mailto:harshkumarceo@mahtoji.tech')}
                    >
                        <ThemedText style={[styles.emailText, { color: '#FFFFFF' }]}>Contact CEO Office</ThemedText>
                    </TouchableOpacity>
                </View>

                <View style={styles.noteBox}>
                    <Ionicons name="information-circle-outline" size={20} color={Colors[colorScheme].tint} />
                    <ThemedText style={styles.noteText}>
                        Response Time: 24-48 Hours. Please attach images to clarify problems.
                    </ThemedText>
                </View>
            </View>
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
        alignItems: 'center',
    },
    infoCard: {
        width: '100%',
        padding: 30,
        borderRadius: 24,
        backgroundColor: '#000000',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 5,
    },
    infoTitle: {
        color: '#FFFFFF',
        fontSize: 22,
        fontWeight: '700',
        marginTop: 16,
    },
    infoSubtitle: {
        color: '#E0E0E0',
        fontSize: 14,
        textAlign: 'center',
        marginTop: 8,
        opacity: 0.8,
    },
    emailBtn: {
        marginTop: 24,
        paddingVertical: 12,
        paddingHorizontal: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    emailText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    noteBox: {
        flexDirection: 'row',
        marginTop: 30,
        padding: 20,
        backgroundColor: '#f0f0f0',
        borderRadius: 16,
        alignItems: 'center',
        gap: 12,
    },
    noteText: {
        flex: 1,
        fontSize: 13,
        color: '#666',
        lineHeight: 18,
    },
});
