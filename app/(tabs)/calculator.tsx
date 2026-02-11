import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
    runOnJS,
    useAnimatedGestureHandler,
    useAnimatedStyle,
    useSharedValue,
    withSpring
} from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, ThemeType } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const { width } = Dimensions.get('window');
const SLIDER_WIDTH = width - 80;

interface AnimatedSliderProps {
    label: string;
    value: number;
    min: number;
    max: number;
    step: number;
    onChange: (val: number) => void;
    formatValue: (val: number) => string;
    suffix: string;
}

const AnimatedSlider = ({ label, value, min, max, step, onChange, formatValue, suffix }: AnimatedSliderProps) => {
    const colorScheme = (useColorScheme() ?? 'light') as ThemeType;
    const translateX = useSharedValue(0);
    const isPressed = useSharedValue(false);

    // Initialize position based on current value
    useEffect(() => {
        const initialPos = ((value - min) / (max - min)) * SLIDER_WIDTH;
        translateX.value = initialPos;
    }, []);

    const gestureHandler = useAnimatedGestureHandler({
        onStart: (_, ctx: any) => {
            ctx.startX = translateX.value;
            isPressed.value = true;
        },
        onActive: (event, ctx: any) => {
            let nextX = ctx.startX + event.translationX;
            nextX = Math.max(0, Math.min(nextX, SLIDER_WIDTH));
            translateX.value = nextX;

            const percentage = nextX / SLIDER_WIDTH;
            const rawValue = min + percentage * (max - min);
            const steppedValue = Math.round(rawValue / step) * step;
            runOnJS(onChange)(steppedValue);
        },
        onEnd: () => {
            isPressed.value = false;
            runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
        },
    });

    const thumbStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateX: translateX.value - 12 },
                { scale: withSpring(isPressed.value ? 1.4 : 1) }
            ],
            backgroundColor: withSpring(isPressed.value ? '#D4AF37' : '#FFFFFF'),
        };
    });

    const progressStyle = useAnimatedStyle(() => {
        return {
            width: translateX.value,
            backgroundColor: '#D4AF37',
        };
    });

    const valueTextStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { scale: withSpring(isPressed.value ? 1.2 : 1) }
            ],
            color: withSpring(isPressed.value ? '#D4AF37' : Colors[colorScheme].text),
        };
    });

    return (
        <View style={styles.sliderContainer}>
            <View style={styles.sliderHeader}>
                <ThemedText style={styles.label}>{label}</ThemedText>
                <Animated.View style={valueTextStyle}>
                    <ThemedText style={styles.valueText}>
                        {formatValue(value)} <ThemedText style={styles.suffixSmall}>{suffix}</ThemedText>
                    </ThemedText>
                </Animated.View>
            </View>

            <View style={[styles.track, { backgroundColor: Colors[colorScheme].border }]}>
                <Animated.View style={[styles.progress, progressStyle]} />
                <PanGestureHandler onGestureEvent={gestureHandler}>
                    <Animated.View style={[styles.thumb, thumbStyle]} />
                </PanGestureHandler>
            </View>

            <View style={styles.rangeLabels}>
                <ThemedText style={styles.rangeText}>{formatValue(min)}</ThemedText>
                <ThemedText style={styles.rangeText}>{formatValue(max)}</ThemedText>
            </View>
        </View>
    );
};

export default function CalculatorScreen() {
    const colorScheme = (useColorScheme() ?? 'light') as ThemeType;
    const router = useRouter();

    const [loanAmount, setLoanAmount] = useState(5000000);
    const [interestRate, setInterestRate] = useState(8.4);
    const [tenureMonths, setTenureMonths] = useState(240); // 20 years

    const [emi, setEmi] = useState(0);
    const [totalInterest, setTotalInterest] = useState(0);
    const [totalPayment, setTotalPayment] = useState(0);

    const calculateEMI = useCallback(() => {
        const P = loanAmount;
        const R = interestRate / 12 / 100;
        const N = tenureMonths;

        if (P && R && N) {
            const emiValue = (P * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1);
            const totalPay = emiValue * N;
            const totalInt = totalPay - P;

            setEmi(Math.round(emiValue));
            setTotalPayment(Math.round(totalPay));
            setTotalInterest(Math.round(totalInt));
        }
    }, [loanAmount, interestRate, tenureMonths]);

    useEffect(() => {
        calculateEMI();
    }, [calculateEMI]);

    const formatCurrency = (val: number) => {
        if (val >= 10000000) return `₹ ${(val / 10000000).toFixed(1)} Cr`;
        if (val >= 100000) return `₹ ${(val / 100000).toFixed(1)} L`;
        return `₹ ${val.toLocaleString('en-IN')}`;
    };

    const formatMonths = (months: number) => {
        const yrs = Math.floor(months / 12);
        const mths = months % 12;
        if (yrs === 0) return `${mths} Mo`;
        if (mths === 0) return `${yrs} Yr`;
        return `${yrs}y ${mths}m`;
    };

    return (
        <ThemedView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <LinearGradient
                    colors={colorScheme === 'light' ? ['#002D62', '#0056b3'] : ['#0F172A', '#1E293B']}
                    style={styles.header}
                >
                    <View style={styles.headerTopRow}>
                        {router.canGoBack() && (
                            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                                <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                            </TouchableOpacity>
                        )}
                        <ThemedText style={styles.headerTitle}>EMI Calculator</ThemedText>
                    </View>
                    <ThemedText style={styles.headerSubtitle}>Visualize your monthly commitment</ThemedText>
                </LinearGradient>

                <View style={styles.content}>
                    <View style={[styles.resultCard, { backgroundColor: Colors[colorScheme].surface }]}>
                        <View style={styles.emiHighlight}>
                            <ThemedText style={styles.resultLabel}>Monthly EMI</ThemedText>
                            <Animated.Text style={[styles.emiValue, { color: '#D4AF37' }]}>
                                ₹ {emi.toLocaleString('en-IN')}
                            </Animated.Text>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.statsRow}>
                            <View>
                                <ThemedText style={styles.statLabel}>Total Interest</ThemedText>
                                <ThemedText style={styles.statValue}>₹ {totalInterest.toLocaleString('en-IN')}</ThemedText>
                            </View>
                            <View style={styles.statDivider} />
                            <View>
                                <ThemedText style={styles.statLabel}>Total Payment</ThemedText>
                                <ThemedText style={styles.statValue}>₹ {totalPayment.toLocaleString('en-IN')}</ThemedText>
                            </View>
                        </View>
                    </View>

                    <View style={styles.form}>
                        <AnimatedSlider
                            label="Loan Amount"
                            value={loanAmount}
                            min={100000}
                            max={100000000}
                            step={100000}
                            onChange={setLoanAmount}
                            formatValue={(v) => formatCurrency(v).replace('₹ ', '')}
                            suffix="INR"
                        />

                        <AnimatedSlider
                            label="Interest Rate"
                            value={interestRate}
                            min={5}
                            max={20}
                            step={0.1}
                            onChange={setInterestRate}
                            formatValue={(v) => v.toFixed(1)}
                            suffix="% p.a."
                        />

                        <AnimatedSlider
                            label="Tenure"
                            value={tenureMonths}
                            min={12}
                            max={360}
                            step={1}
                            onChange={setTenureMonths}
                            formatValue={formatMonths}
                            suffix=""
                        />
                    </View>

                    <TouchableOpacity
                        style={styles.applyBtn}
                        onPress={() => router.push({
                            pathname: '/(tabs)/apply',
                            params: { type: 'Loan' }
                        })}
                    >
                        <ThemedText style={styles.applyBtnText}>Apply Now</ThemedText>
                        <Ionicons name="arrow-forward" size={18} color="#002D62" />
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: 24,
        paddingBottom: 50,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
    },
    headerTitle: {
        color: '#FFFFFF',
        fontSize: 28,
        fontWeight: '900',
    },
    headerTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerSubtitle: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 16,
        marginTop: 8,
        fontWeight: '500',
    },
    content: {
        padding: 24,
        marginTop: -40,
    },
    resultCard: {
        padding: 30,
        borderRadius: 32,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 5,
        marginBottom: 32,
    },
    emiHighlight: {
        alignItems: 'center',
    },
    resultLabel: {
        fontSize: 14,
        fontWeight: '700',
        opacity: 0.5,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        marginBottom: 10,
    },
    emiValue: {
        fontSize: 42,
        fontWeight: '900',
    },
    divider: {
        height: 1,
        width: '100%',
        backgroundColor: 'rgba(0,0,0,0.05)',
        marginVertical: 24,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 10,
    },
    statDivider: {
        width: 1,
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    statLabel: {
        fontSize: 12,
        opacity: 0.5,
        fontWeight: '600',
        marginBottom: 6,
        textAlign: 'center',
    },
    statValue: {
        fontSize: 16,
        fontWeight: '800',
        textAlign: 'center',
    },
    form: {
        gap: 32,
    },
    sliderContainer: {
        gap: 16,
    },
    sliderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    label: {
        fontSize: 16,
        fontWeight: '700',
    },
    valueText: {
        fontSize: 22,
        fontWeight: '900',
    },
    suffixSmall: {
        fontSize: 12,
        fontWeight: '600',
        opacity: 0.4,
    },
    track: {
        height: 8,
        borderRadius: 4,
        width: SLIDER_WIDTH,
        position: 'relative',
        justifyContent: 'center',
    },
    progress: {
        height: 8,
        borderRadius: 4,
        position: 'absolute',
        left: 0,
    },
    thumb: {
        width: 24,
        height: 24,
        borderRadius: 12,
        position: 'absolute',
        left: 0,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    rangeLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: -8,
    },
    rangeText: {
        fontSize: 12,
        opacity: 0.3,
        fontWeight: '600',
    },
    applyBtn: {
        backgroundColor: '#D4AF37',
        height: 64,
        borderRadius: 24,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 40,
        marginBottom: 40,
        gap: 12,
        shadowColor: '#D4AF37',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 8,
    },
    applyBtnText: {
        color: '#002D62',
        fontSize: 18,
        fontWeight: '800',
    },
});
