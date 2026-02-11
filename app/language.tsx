import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, ThemeType } from '@/constants/theme';
import { LANGUAGES, Language } from '@/constants/translations';
import { useTranslation } from '@/context/LanguageContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function LanguageScreen() {
    const colorScheme = (useColorScheme() ?? 'light') as ThemeType;
    const router = useRouter();
    const { language: currentLanguage, setLanguage } = useTranslation();

    const handleSelect = async (lang: Language) => {
        await setLanguage(lang);
        router.back();
    };

    return (
        <ThemedView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name="close" size={24} color={Colors[colorScheme].text} />
                </TouchableOpacity>
                <ThemedText style={styles.headerTitle}>Select Language</ThemedText>
                <View style={{ width: 40 }} />
            </View>

            <FlatList
                data={LANGUAGES}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[
                            styles.langItem,
                            { borderBottomColor: Colors[colorScheme].border },
                            currentLanguage === item.id && { backgroundColor: Colors[colorScheme].tint + '10' }
                        ]}
                        onPress={() => handleSelect(item.id)}
                    >
                        <View>
                            <ThemedText style={styles.nativeName}>{item.nativeName}</ThemedText>
                            <ThemedText style={styles.langName}>{item.name}</ThemedText>
                        </View>
                        {currentLanguage === item.id && (
                            <Ionicons name="checkmark-circle" size={24} color={Colors[colorScheme].tint} />
                        )}
                    </TouchableOpacity>
                )}
            />
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
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#00000010',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
    },
    list: {
        paddingBottom: 40,
    },
    langItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        borderBottomWidth: 1,
    },
    nativeName: {
        fontSize: 18,
        fontWeight: '600',
    },
    langName: {
        fontSize: 14,
        opacity: 0.6,
        marginTop: 2,
    },
});
