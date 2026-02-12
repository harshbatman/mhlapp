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
            <StatusBar style="light" />

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
        backgroundColor: '#002D62',
    },
    imageContainer: {
        flex: 1.2,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderBottomLeftRadius: 50,
        borderBottomRightRadius: 50,
        overflow: 'hidden',
    },
    heroImage: {
        width: width * 0.9,
        height: width * 0.9,
    },
    content: {
        flex: 1,
        paddingHorizontal: 30,
        paddingTop: 50,
        alignItems: 'center',
    },
    brandName: {
        color: '#D4AF37',
        fontSize: 20,
        fontWeight: '700',
        letterSpacing: 4,
        marginBottom: 5,
    },
    title: {
        color: '#FFFFFF',
        fontSize: 32,
        fontWeight: '800',
        textAlign: 'center',
        marginBottom: 15,
        marginTop: 10,
        lineHeight: 40,
        paddingTop: 5,
    },
    subtitle: {
        color: '#E0E0E0',
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
        opacity: 0.8,
        marginBottom: 10,
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
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
        fontStyle: 'italic',
        opacity: 0.9,
    },
    buttonContainer: {
        width: '100%',
        gap: 15,
    },
    primaryBtn: {
        backgroundColor: '#D4AF37',
        height: 60,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#D4AF37',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    primaryBtnText: {
        color: '#002D62',
        fontSize: 18,
        fontWeight: '700',
    },
    secondaryBtn: {
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    secondaryBtnText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
        opacity: 0.9,
    },
});
