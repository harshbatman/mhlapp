import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, ThemeType } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const { width } = Dimensions.get('window');

export default function TrackStatusScreen() {
    const colorScheme = (useColorScheme() ?? 'light') as ThemeType;
    const router = useRouter();

    return (
        <ThemedView style={styles.container}>
            <LinearGradient
                colors={colorScheme === 'light' ? ['#002D62', '#0056b3'] : ['#0F172A', '#1E293B']}
                style={styles.header}
            >
                <View style={styles.headerTop}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <ThemedText style={styles.headerTitle}>Track Status</ThemedText>
                    <View style={{ width: 40 }} />
                </View>
            </LinearGradient>

            <View style={styles.emptyContainer}>
                <View style={styles.iconCircle}>
                    <Ionicons name="document-text-outline" size={80} color={Colors[colorScheme].tint} style={{ opacity: 0.2 }} />
                    <View style={styles.badge}>
                        <Ionicons name="search" size={20} color="#FFFFFF" />
                    </View>
                </View>

                <ThemedText style={styles.emptyTitle}>No Applications Found</ThemedText>
                <ThemedText style={styles.emptySubtitle}>
                    You haven't applied for any loans yet. Start your journey today!
                </ThemedText>

                <TouchableOpacity
                    style={styles.applyBtn}
                    onPress={() => router.push('/(tabs)/apply')}
                >
                    <ThemedText style={styles.applyBtnText}>Apply Now</ThemedText>
                </TouchableOpacity>
            </View>
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
        paddingBottom: 30,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    iconCircle: {
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: '#002D6208',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    badge: {
        position: 'absolute',
        bottom: 35,
        right: 35,
        backgroundColor: '#D4AF37',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: '#FFFFFF',
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 12,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: 16,
        opacity: 0.6,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 32,
    },
    applyBtn: {
        backgroundColor: '#002D62',
        paddingVertical: 16,
        paddingHorizontal: 40,
        borderRadius: 16,
        shadowColor: '#002D62',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    applyBtnText: {
        color: '#D4AF37',
        fontSize: 16,
        fontWeight: '700',
    },
});
