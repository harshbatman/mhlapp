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
                    ) : icon ? (
                        <Ionicons name={icon as any} size={isGrid ? 32 : 28} color={Colors[colorScheme].tint} />
                    ) : null}
                </View>
                <View style={[styles.textContainer, isGrid && styles.gridTextContainer]}>
                    <View style={[styles.titleRow, isGrid && styles.gridTitleRow]}>
                        <ThemedText type="subtitle" style={[styles.title, isGrid && styles.gridTitle]} numberOfLines={1}>{title}</ThemedText>
                        <Ionicons name="chevron-forward" size={14} color={Colors[colorScheme].icon} style={styles.inlineChevron} />
                    </View>
                    <ThemedText style={[styles.description, isGrid && styles.gridDescription]} numberOfLines={isGrid ? 2 : 3}>{description}</ThemedText>
                </View>
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
        padding: 24,
        borderRadius: 24,
        backgroundColor: '#F9F9F9', // Slightly off-white for the outer card
        borderWidth: 1,
        borderColor: '#EEEEEE',
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 20,
        backgroundColor: '#FFFFFF', // Pure white for the inner card
        // Inner card shadow/border
        borderWidth: 1,
        borderColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
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
        paddingTop: 24,
        height: 230,
        textAlign: 'center',
    },
    gridIconContainer: {
        marginRight: 0,
        marginBottom: 16,
        width: 110, // Larger inner card
        height: 110,
        borderRadius: 30, // More rounded/circular
    },
    gridTextContainer: {
        alignItems: 'center',
    },
    gridTitle: {
        fontSize: 15,
        textAlign: 'center',
        marginBottom: 8,
    },
    gridDescription: {
        fontSize: 11,
        textAlign: 'center',
        opacity: 0.7,
    },
    gridLoanImage: {
        width: 70,
        height: 70,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    gridTitleRow: {
        justifyContent: 'center',
        marginBottom: 8,
    },
    inlineChevron: {
        marginLeft: 4,
        opacity: 0.4,
    },
});
