import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Dimensions, Image, StyleSheet, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

const TypewriterMarquee = ({ text }: { text: string }) => {
    const [displayedText, setDisplayedText] = React.useState('');
    const typingSpeed = 100;

    React.useEffect(() => {
        let index = displayedText.length;
        if (index < text.length) {
            const timer = setTimeout(() => {
                setDisplayedText(text.slice(0, index + 1));
            }, typingSpeed);
            return () => clearTimeout(timer);
        } else {
            const resetTimer = setTimeout(() => {
                setDisplayedText('');
            }, 3000); // Stay for 3 seconds once completed
            return () => clearTimeout(resetTimer);
        }
    }, [displayedText, text]);

    return (
        <View style={styles.marqueeWrapper}>
            <ThemedText style={styles.marqueeText}>{displayedText}</ThemedText>
        </View>
    );
};

const TypewriterText = ({ text, style }: { text: string; style: any }) => {
    const [displayedText, setDisplayedText] = React.useState('');

    React.useEffect(() => {
        let index = 0;
        const timer = setInterval(() => {
            setDisplayedText(text.slice(0, index + 1));
            index++;
            if (index >= text.length) {
                clearInterval(timer);
            }
        }, 150);
        return () => clearInterval(timer);
    }, [text]);

    return <ThemedText style={style}>{displayedText}</ThemedText>;
};

export default function WelcomeScreen() {
    const router = useRouter();

    return (
        <ThemedView style={styles.container}>
            <StatusBar style="dark" />

            <View style={styles.imageContainer}>
                <Image
                    source={require('@/assets/images/welcome-hero.png')}
                    style={styles.heroImage}
                    resizeMode="contain"
                />
            </View>

            <View style={styles.content}>
                <TypewriterText text="MAHTO Home Loans" style={styles.title} />
                <ThemedText style={styles.subtitle}>
                    Making your dream of owning a home a reality with flexible and easy loan options.
                </ThemedText>

                <View style={styles.marqueeContainer}>
                    <TypewriterMarquee text="Your dream home is just a click away" />
                </View>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={styles.primaryBtn}
                        onPress={() => router.push('/auth/register')}
                    >
                        <ThemedText style={styles.primaryBtnText}>Get Started</ThemedText>
                    </TouchableOpacity>
                </View>
            </View>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    imageContainer: {
        flex: 1.2,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F6F6F6',
    },
    heroImage: {
        width: width * 0.9,
        height: width * 0.9,
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 40,
        alignItems: 'center',
    },
    brandName: {
        color: '#000000',
        fontSize: 24,
        fontWeight: 'bold',
        letterSpacing: -0.5,
        marginBottom: 8,
    },
    title: {
        color: '#000000',
        fontSize: 36,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 12,
        marginTop: 10,
        lineHeight: 44,
        letterSpacing: -1,
    },
    subtitle: {
        color: '#545454',
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 24,
    },
    marqueeContainer: {
        width: '100%',
        height: 40,
        overflow: 'hidden',
        justifyContent: 'center',
        marginBottom: 30,
    },
    marqueeWrapper: {
        flexDirection: 'row',
        justifyContent: 'center',
        width: '100%',
    },
    marqueeText: {
        color: '#000000',
        fontSize: 14,
        fontWeight: '500',
    },
    buttonContainer: {
        width: '100%',
        gap: 16,
    },
    primaryBtn: {
        backgroundColor: '#000000',
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
    },
    primaryBtnText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
    },
    secondaryBtn: {
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
    },
    secondaryBtnText: {
        color: '#000000',
        fontSize: 16,
        fontWeight: '500',
    },
});
