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
        marginBottom: 12,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1, // List item style
        borderBottomColor: '#F6F6F6',
        // Removing shadow for a flatter, cleaner look usually found in Uber lists
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24, // Circular icon background
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
        color: '#000000',
    },
    description: {
        fontSize: 12,
        color: '#545454',
    },
});
