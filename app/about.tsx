import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, ThemeType } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const { width } = Dimensions.get('window');

const EcosystemItem = ({ number, title, description }: { number: string, title: string, description: string }) => {
    const colorScheme = (useColorScheme() ?? 'light') as ThemeType;
    return (
        <View style={[styles.ecoItem, { backgroundColor: Colors[colorScheme].surface, borderColor: Colors[colorScheme].border }]}>
            <View style={styles.ecoHeader}>
                <View style={styles.ecoNumber}>
                    <ThemedText style={styles.ecoNumberText}>{number}</ThemedText>
                </View>
                <ThemedText style={styles.ecoTitle}>{title}</ThemedText>
            </View>
            <ThemedText style={styles.ecoDesc}>{description}</ThemedText>
        </View>
    );
};

export default function AboutScreen() {
    const colorScheme = (useColorScheme() ?? 'light') as ThemeType;
    const router = useRouter();
    const insets = useSafeAreaInsets();

    return (
        <ThemedView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color="#000000" />
                    </TouchableOpacity>
                    <ThemedText style={styles.headerTitle}>About MAHTO</ThemedText>
                    <ThemedText style={styles.headerSubtitle}>Home Building OS</ThemedText>
                </View>

                <View style={styles.content}>
                    <View style={styles.introSection}>
                        <ThemedText style={styles.mainHeading}>MAHTO is the operating system for home building.</ThemedText>
                        <ThemedText style={styles.paragraph}>
                            We are building one unified system that brings together everything required to build a home — from land and labor to construction materials, financing, and delivery.
                        </ThemedText>
                        <ThemedText style={styles.paragraph}>
                            Today, building a home means dealing with fragmented vendors, contractors, workers, and middlemen. MAHTO simplifies this entire journey into a single, integrated platform — end to end.
                        </ThemedText>
                    </View>

                    <View style={styles.section}>
                        <ThemedText type="subtitle" style={styles.sectionTitle}>MAHTO Ecosystem</ThemedText>
                        <EcosystemItem
                            number="1"
                            title="MAHTO Marketplace"
                            description="Worker, Contractor & Shops Marketplace"
                        />
                        <EcosystemItem
                            number="2"
                            title="Mine (by MAHTO)"
                            description="Full-stack Construction & Renovation Services"
                        />
                        <EcosystemItem
                            number="3"
                            title="MAHTO Home Loans"
                            description="Home Loans Marketplace"
                        />
                        <EcosystemItem
                            number="4"
                            title="MAHTO Land & Properties"
                            description="Land & Property Listings"
                        />

                        <View style={styles.fullStackBox}>
                            <Ionicons name="layers-outline" size={24} color="#D32F2F" />
                            <ThemedText style={styles.fullStackText}>
                                “Full-stack” at MAHTO means from land to lending — not just design to construction.
                            </ThemedText>
                        </View>
                    </View>

                    <View style={styles.visionMission}>
                        <View style={[styles.vmCard, { backgroundColor: '#000000' }]}>
                            <ThemedText style={styles.vmLabel}>OUR MISSION</ThemedText>
                            <ThemedText style={styles.vmTitle}>A roof over every head — not just a roof, but own roof.</ThemedText>
                            <ThemedText style={styles.vmQuote}>“Sabka sar apni chhaat.”</ThemedText>
                        </View>

                        <View style={[styles.vmCard, { backgroundColor: '#D32F2F' }]}>
                            <ThemedText style={[styles.vmLabel, { color: '#FFFFFF' }]}>OUR VISION</ThemedText>
                            <ThemedText style={[styles.vmTitle, { color: '#FFFFFF' }]}>To raise living standards by becoming the global operating system for home building.</ThemedText>
                        </View>
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
        paddingTop: 16,
        paddingHorizontal: 24,
        paddingBottom: 40,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F6F6F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    headerTitle: {
        color: '#FFFFFF',
        fontSize: 32,
        fontWeight: '900',
    },
    headerSubtitle: {
        color: '#000000',
        fontSize: 18,
        fontWeight: '700',
        letterSpacing: 1,
        marginTop: 4,
    },
    content: {
        padding: 24,
    },
    introSection: {
        marginBottom: 32,
    },
    mainHeading: {
        fontSize: 22,
        fontWeight: '700',
        lineHeight: 30,
        marginBottom: 16,
    },
    paragraph: {
        fontSize: 16,
        lineHeight: 24,
        opacity: 0.8,
        marginBottom: 16,
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '800',
        marginBottom: 20,
    },
    ecoItem: {
        padding: 20,
        borderRadius: 20,
        borderWidth: 1,
        marginBottom: 16,
    },
    ecoHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    ecoNumber: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#D32F2F',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    ecoNumberText: {
        color: '#FFFFFF',
        fontWeight: '800',
        fontSize: 14,
    },
    ecoTitle: {
        fontSize: 17,
        fontWeight: '700',
    },
    ecoDesc: {
        fontSize: 14,
        opacity: 0.7,
        marginLeft: 40,
    },
    fullStackBox: {
        flexDirection: 'row',
        padding: 20,
        backgroundColor: '#F9F9F9',
        borderRadius: 20,
        alignItems: 'center',
        marginTop: 10,
        gap: 16,
    },
    fullStackText: {
        flex: 1,
        fontSize: 14,
        fontWeight: '600',
        fontStyle: 'italic',
        lineHeight: 20,
    },
    visionMission: {
        gap: 20,
    },
    vmCard: {
        padding: 24,
        borderRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 5,
    },
    vmLabel: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 2,
        marginBottom: 12,
        opacity: 0.8,
    },
    vmTitle: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
        lineHeight: 26,
    },
    vmQuote: {
        color: '#D32F2F',
        fontSize: 18,
        fontWeight: '800',
        marginTop: 12,
    },
});
