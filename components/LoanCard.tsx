import { Colors, ThemeType } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

interface LoanCardProps {
    title: string;
    description: string;
    icon?: keyof typeof Ionicons.glyphMap;
    imageSource?: any;
    onPress: () => void;
    variant?: 'row' | 'grid';
}

export function LoanCard({ title, description, icon, imageSource, onPress, variant = 'row' }: LoanCardProps) {
    const colorScheme = (useColorScheme() ?? 'light') as ThemeType;

    const isGrid = variant === 'grid';

    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={[styles.container, isGrid && styles.gridContainer]}>
            <ThemedView style={[
                styles.card,
                { borderColor: Colors[colorScheme].border },
                isGrid && styles.gridCard
            ]}>
                <View style={[
                    styles.iconContainer,
                    { backgroundColor: imageSource ? '#FFFFFF' : Colors[colorScheme].tint + '15' },
                    isGrid && styles.gridIconContainer
                ]}>
                    {imageSource ? (
                        <Image source={imageSource} style={[styles.loanImage, isGrid && styles.gridLoanImage]} resizeMode="contain" />
                    ) : (
                        <Ionicons name={icon as any} size={isGrid ? 32 : 28} color={Colors[colorScheme].tint} />
                    )}
                </View>
                <View style={[styles.textContainer, isGrid && styles.gridTextContainer]}>
                    <ThemedText type="subtitle" style={[styles.title, isGrid && styles.gridTitle]} numberOfLines={isGrid ? 1 : 2}>{title}</ThemedText>
                    <ThemedText style={[styles.description, isGrid && styles.gridDescription]} numberOfLines={isGrid ? 2 : 3}>{description}</ThemedText>
                </View>
                {!isGrid && <Ionicons name="chevron-forward" size={20} color={Colors[colorScheme].icon} />}
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
        padding: 20,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#EEEEEE',
        // Shadow for iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        // Elevation for Android
        elevation: 4,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 16, // Squircle-ish
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 20,
        backgroundColor: '#F9F9F9',
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 4,
        color: '#000000',
    },
    description: {
        fontSize: 13,
        color: '#666666',
        lineHeight: 18,
    },
    loanImage: {
        width: 50,
        height: 50,
    },
    // Grid Variant Styles
    gridContainer: {
        width: '48%',
        marginBottom: 16,
    },
    gridCard: {
        flexDirection: 'column',
        alignItems: 'center',
        padding: 16,
        height: 200,
        textAlign: 'center',
    },
    gridIconContainer: {
        marginRight: 0,
        marginBottom: 12,
        width: 80,
        height: 80,
        borderRadius: 20,
    },
    gridTextContainer: {
        alignItems: 'center',
    },
    gridTitle: {
        fontSize: 15,
        textAlign: 'center',
        marginBottom: 6,
    },
    gridDescription: {
        fontSize: 11,
        textAlign: 'center',
    },
    gridLoanImage: {
        width: 60,
        height: 60,
    },
});
