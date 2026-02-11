import { Colors, ThemeType } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

interface LoanCardProps {
    title: string;
    description: string;
    icon: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
}

export function LoanCard({ title, description, icon, onPress }: LoanCardProps) {
    const colorScheme = (useColorScheme() ?? 'light') as ThemeType;

    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.container}>
            <ThemedView style={[styles.card, { borderColor: Colors[colorScheme].border }]}>
                <View style={[styles.iconContainer, { backgroundColor: Colors[colorScheme].tint + '15' }]}>
                    <Ionicons name={icon} size={28} color={Colors[colorScheme].tint} />
                </View>
                <View style={styles.textContainer}>
                    <ThemedText type="subtitle" style={styles.title}>{title}</ThemedText>
                    <ThemedText style={styles.description}>{description}</ThemedText>
                </View>
                <Ionicons name="chevron-forward" size={20} color={Colors[colorScheme].icon} />
            </ThemedView>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 4,
    },
    description: {
        fontSize: 14,
        opacity: 0.7,
    },
});
