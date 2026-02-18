import { ThemeType } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './themed-text';

interface CustomAlertProps {
    visible: boolean;
    title: string;
    message: string;
    onClose: () => void;
    type?: 'info' | 'error' | 'success' | 'warning';
    primaryButtonText?: string;
    secondaryButtonText?: string;
    secondaryButtonDetail?: string;
    ternaryButtonText?: string;
    ternaryButtonDetail?: string;
    onSecondaryAction?: () => void;
    onTernaryAction?: () => void;
}

const { width } = Dimensions.get('window');

export function CustomAlert({
    visible,
    title,
    message,
    onClose,
    type = 'info',
    primaryButtonText = 'OK',
    secondaryButtonText,
    secondaryButtonDetail,
    ternaryButtonText,
    ternaryButtonDetail,
    onSecondaryAction,
    onTernaryAction
}: CustomAlertProps) {
    const colorScheme = (useColorScheme() ?? 'light') as ThemeType;

    const getIcon = () => {
        switch (type) {
            case 'error': return 'close-circle-outline';
            case 'success': return 'checkmark-circle-outline';
            case 'warning': return 'warning-outline';
            default: return 'information-circle-outline';
        }
    };

    const isStacked = !!ternaryButtonText;

    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={[styles.card, { backgroundColor: '#FFFFFF' }]}>
                    <View style={styles.header}>
                        <View style={styles.iconContainer}>
                            <Ionicons name={getIcon()} size={32} color="#000000" />
                        </View>
                        <ThemedText style={styles.title}>{title}</ThemedText>
                    </View>

                    <ThemedText style={styles.message}>{message}</ThemedText>

                    <View style={[styles.buttonContainer, isStacked && styles.stackedButtons]}>
                        {ternaryButtonText && (
                            <TouchableOpacity
                                style={[styles.secondaryButton, isStacked && styles.fullWidthButton]}
                                onPress={() => {
                                    onTernaryAction?.();
                                    onClose();
                                }}
                                activeOpacity={0.8}
                            >
                                <View style={{ alignItems: 'center' }}>
                                    <Text style={styles.secondaryButtonText}>{ternaryButtonText}</Text>
                                    {ternaryButtonDetail && <Text style={styles.buttonDetailText}>{ternaryButtonDetail}</Text>}
                                </View>
                            </TouchableOpacity>
                        )}
                        {secondaryButtonText && (
                            <TouchableOpacity
                                style={[styles.secondaryButton, isStacked && styles.fullWidthButton]}
                                onPress={() => {
                                    onSecondaryAction?.();
                                    onClose();
                                }}
                                activeOpacity={0.8}
                            >
                                <View style={{ alignItems: 'center' }}>
                                    <Text style={styles.secondaryButtonText}>{secondaryButtonText}</Text>
                                    {secondaryButtonDetail && <Text style={styles.buttonDetailText}>{secondaryButtonDetail}</Text>}
                                </View>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity
                            style={[
                                styles.button,
                                { flex: (secondaryButtonText && !isStacked) ? 1 : 0, width: (secondaryButtonText && !isStacked) ? 'auto' : '100%' }
                            ]}
                            onPress={onClose}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.buttonText}>{primaryButtonText}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    card: {
        width: width * 0.85,
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
        backgroundColor: '#FFFFFF',
    },
    header: {
        alignItems: 'center',
        marginBottom: 16,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#000000',
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        color: '#666666',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
    },
    buttonContainer: {
        flexDirection: 'row',
        width: '100%',
        gap: 12,
    },
    stackedButtons: {
        flexDirection: 'column',
    },
    button: {
        backgroundColor: '#000000',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    secondaryButton: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    fullWidthButton: {
        width: '100%',
        flex: 0,
        height: 'auto',
        marginBottom: 12,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    secondaryButtonText: {
        color: '#000000',
        fontSize: 16,
        fontWeight: '700',
    },
    buttonDetailText: {
        color: '#666666',
        fontSize: 12,
        fontWeight: '500',
        marginTop: 2,
    },
});
