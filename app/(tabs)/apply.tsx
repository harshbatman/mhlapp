import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, ThemeType } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const { width } = Dimensions.get('window');

export default function ApplyScreen() {
    const colorScheme = (useColorScheme() ?? 'light') as ThemeType;
    const router = useRouter();
    const params = useLocalSearchParams<{ type?: string }>();

    const [step, setStep] = useState(1);
    const totalSteps = 5;
    const [loadingLocation, setLoadingLocation] = useState(false);

    const [formData, setFormData] = useState({
        // Step 1: Personal
        name: '',
        dob: '',
        gender: '',
        pan: '',
        aadhaar: '',
        // Step 2: Contact
        email: '',
        phone: '',
        address: '',
        permanentAddress: '',
        isSameAddress: true,
        altPhone: '',
        // Step 3: Income
        occupation: 'Salaried',
        monthlyIncome: '',
        company: '',
        experience: '',
        industry: '',
        profession: '',
        businessNature: '',
        annualTurnover: '',
        gstNumber: '',
        yearsInBusiness: '',
        // Step 4: Loan
        loanType: params.type || 'Construction',
        loanAmount: '',
        tenure: '',
        propertyValue: '',
        // Step 5: Docs
        docs: {
            pan: false,
            aadhaar: false,
            income: false,
            property: false
        }
    });

    useEffect(() => {
        if (params.type) {
            setFormData(prev => ({ ...prev, loanType: params.type as string }));
        }
    }, [params.type]);

    const handleNext = () => {
        if (step < totalSteps) {
            setStep(step + 1);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } else {
            handleSubmit();
        }
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } else {
            router.back();
        }
    };

    const handleSubmit = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        if (!formData.docs.pan || !formData.docs.aadhaar) {
            Alert.alert('Missing Documents', 'Please select PAN and Aadhaar cards to simulate upload.');
            return;
        }

        Alert.alert(
            'Application Submitted!',
            'Our verification team will review your details and contact you within 24 hours.',
            [{ text: 'Great!', onPress: () => router.replace('/') }]
        );
    };

    const toggleDoc = (key: keyof typeof formData.docs) => {
        setFormData({
            ...formData,
            docs: { ...formData.docs, [key]: !formData.docs[key] }
        });
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    const fetchLocation = async (field: 'address' | 'permanentAddress' = 'address') => {
        try {
            setLoadingLocation(true);
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Please allow location access to use this feature.');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            let [addressResponse] = await Location.reverseGeocodeAsync({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
            });

            if (addressResponse) {
                const formattedAddress = [
                    addressResponse.name,
                    addressResponse.street,
                    addressResponse.district,
                    addressResponse.city,
                    addressResponse.region,
                    addressResponse.postalCode
                ].filter(Boolean).join(', ');

                setFormData(prev => ({ ...prev, [field]: formattedAddress }));
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
        } catch (error) {
            Alert.alert('Error', 'Could not fetch your location. Please type manually.');
        } finally {
            setLoadingLocation(false);
        }
    };

    const renderInput = (label: string, value: string, key: string, placeholder: string, keyboardType: any = 'default', maxLength?: number) => (
        <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>{label}</ThemedText>
            <TextInput
                style={[
                    styles.input,
                    {
                        backgroundColor: Colors[colorScheme].surface,
                        color: Colors[colorScheme].text,
                        borderColor: Colors[colorScheme].border
                    }
                ]}
                value={value}
                onChangeText={(text) => setFormData({ ...formData, [key]: text })}
                placeholder={placeholder}
                placeholderTextColor="#999"
                keyboardType={keyboardType}
                maxLength={maxLength}
            />
        </View>
    );

    const renderStep1 = () => (
        <Animated.View entering={FadeInRight} exiting={FadeOutLeft} style={styles.stepContainer}>
            <ThemedText style={styles.sectionTitle}>Personal Details</ThemedText>
            {renderInput('Full Name (as per PAN)', formData.name, 'name', 'Enter your name')}
            {renderInput('Date of Birth', formData.dob, 'dob', 'DD/MM/YYYY')}

            <View style={styles.inputContainer}>
                <ThemedText style={styles.label}>Gender</ThemedText>
                <View style={styles.row}>
                    {['Male', 'Female', 'Other'].map((g) => (
                        <TouchableOpacity
                            key={g}
                            style={[styles.chip, formData.gender === g && styles.chipSelected, { borderColor: Colors[colorScheme].border }]}
                            onPress={() => setFormData({ ...formData, gender: g })}
                        >
                            <ThemedText style={[styles.chipText, formData.gender === g && styles.chipTextSelected]}>{g}</ThemedText>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {renderInput('PAN Card Number', formData.pan, 'pan', 'ABCDE1234F', 'default', 10)}
            {renderInput('Aadhaar Number', formData.aadhaar, 'aadhaar', '1234 5678 9012', 'numeric', 12)}
        </Animated.View>
    );

    const renderStep2 = () => (
        <Animated.View entering={FadeInRight} exiting={FadeOutLeft} style={styles.stepContainer}>
            <ThemedText style={styles.sectionTitle}>Contact Information</ThemedText>
            {renderInput('Email Address', formData.email, 'email', 'example@mahto.in', 'email-address')}
            {renderInput('Phone Number', formData.phone, 'phone', '10-digit number', 'phone-pad', 10)}
            {renderInput('Alternate Phone', formData.altPhone, 'altPhone', 'Optional', 'phone-pad', 10)}

            <View style={styles.inputContainer}>
                <View style={styles.labelRow}>
                    <ThemedText style={styles.label}>Current Residential Address</ThemedText>
                    <TouchableOpacity
                        style={styles.locationBtn}
                        onPress={() => fetchLocation('address')}
                        disabled={loadingLocation}
                    >
                        {loadingLocation ? (
                            <ActivityIndicator size="small" color="#D4AF37" />
                        ) : (
                            <>
                                <Ionicons name="location" size={14} color="#D4AF37" />
                                <ThemedText style={styles.locationBtnText}>Use Current</ThemedText>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
                <TextInput
                    style={[
                        styles.input,
                        {
                            backgroundColor: Colors[colorScheme].surface,
                            color: Colors[colorScheme].text,
                            borderColor: Colors[colorScheme].border,
                            height: 100,
                            paddingTop: 15,
                        }
                    ]}
                    value={formData.address}
                    onChangeText={(text) => setFormData({ ...formData, address: text })}
                    placeholder="House No, Street, Landmark, Pincode"
                    placeholderTextColor="#999"
                    multiline
                />
            </View>

            <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setFormData({ ...formData, isSameAddress: !formData.isSameAddress })}
            >
                <Ionicons
                    name={formData.isSameAddress ? "checkbox" : "square-outline"}
                    size={24}
                    color={formData.isSameAddress ? "#D4AF37" : "#999"}
                />
                <ThemedText style={styles.checkboxLabel}>Permanent address is same as current</ThemedText>
            </TouchableOpacity>

            {!formData.isSameAddress && (
                <Animated.View entering={FadeInRight} style={[styles.inputContainer, { marginTop: 10 }]}>
                    <View style={styles.labelRow}>
                        <ThemedText style={styles.label}>Permanent Address</ThemedText>
                        <TouchableOpacity
                            style={styles.locationBtn}
                            onPress={() => fetchLocation('permanentAddress')}
                            disabled={loadingLocation}
                        >
                            {loadingLocation ? (
                                <ActivityIndicator size="small" color="#D4AF37" />
                            ) : (
                                <>
                                    <Ionicons name="location" size={14} color="#D4AF37" />
                                    <ThemedText style={styles.locationBtnText}>Use Current</ThemedText>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                    <TextInput
                        style={[
                            styles.input,
                            {
                                backgroundColor: Colors[colorScheme].surface,
                                color: Colors[colorScheme].text,
                                borderColor: Colors[colorScheme].border,
                                height: 100,
                                paddingTop: 15,
                            }
                        ]}
                        value={formData.permanentAddress}
                        onChangeText={(text) => setFormData({ ...formData, permanentAddress: text })}
                        placeholder="House No, Street, Landmark, Pincode"
                        placeholderTextColor="#999"
                        multiline
                    />
                </Animated.View>
            )}
        </Animated.View>
    );

    const renderStep3 = () => (
        <Animated.View entering={FadeInRight} exiting={FadeOutLeft} style={styles.stepContainer}>
            <ThemedText style={styles.sectionTitle}>Employment & Income</ThemedText>

            <View style={styles.inputContainer}>
                <ThemedText style={styles.label}>Occupation Type</ThemedText>
                <View style={styles.row}>
                    {['Salaried', 'Self-Employed', 'Business'].map((o) => (
                        <TouchableOpacity
                            key={o}
                            style={[styles.chip, formData.occupation === o && styles.chipSelected, { borderColor: Colors[colorScheme].border }]}
                            onPress={() => setFormData({ ...formData, occupation: o })}
                        >
                            <ThemedText style={[styles.chipText, formData.occupation === o && styles.chipTextSelected]}>{o}</ThemedText>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {formData.occupation === 'Salaried' && (
                <Animated.View entering={FadeInRight}>
                    {renderInput('Employer / Company Name', formData.company, 'company', 'e.g. Tata Motors')}
                    {renderInput('Industry', formData.industry, 'industry', 'e.g. IT, Healthcare, Banking')}
                    {renderInput('Monthly Net Salary (₹)', formData.monthlyIncome, 'monthlyIncome', 'Enter net take-home salary', 'numeric')}
                    {renderInput('Total Work Experience (Years)', formData.experience, 'experience', 'e.g. 5', 'numeric')}
                </Animated.View>
            )}

            {formData.occupation === 'Self-Employed' && (
                <Animated.View entering={FadeInRight}>
                    {renderInput('Profession', formData.profession, 'profession', 'e.g. Doctor, CA, Architect')}
                    {renderInput('Monthly Average Income (₹)', formData.monthlyIncome, 'monthlyIncome', 'Enter average monthly income', 'numeric')}
                    {renderInput('Years in Profession', formData.experience, 'experience', 'e.g. 10', 'numeric')}
                </Animated.View>
            )}

            {formData.occupation === 'Business' && (
                <Animated.View entering={FadeInRight}>
                    {renderInput('Business Name', formData.company, 'company', 'Enter registered business name')}
                    {renderInput('Nature of Business', formData.businessNature, 'businessNature', 'e.g. Trading, Manufacturing')}
                    {renderInput('Annual Turnover (₹)', formData.annualTurnover, 'annualTurnover', 'Enter yearly turnover', 'numeric')}
                    {renderInput('Years in Business', formData.yearsInBusiness, 'yearsInBusiness', 'e.g. 3', 'numeric')}
                    {renderInput('GST Number (Optional)', formData.gstNumber, 'gstNumber', 'Enter GSTIN if applicable')}
                </Animated.View>
            )}
        </Animated.View>
    );

    const renderStep4 = () => (
        <Animated.View entering={FadeInRight} exiting={FadeOutLeft} style={styles.stepContainer}>
            <ThemedText style={styles.sectionTitle}>Loan Details</ThemedText>

            <View style={styles.inputContainer}>
                <ThemedText style={styles.label}>Selected Loan Type</ThemedText>
                <View style={styles.rowWrap}>
                    {['Construction', 'Renovation', 'Flat Buying', 'LAP'].map((type) => (
                        <TouchableOpacity
                            key={type}
                            style={[
                                styles.chip,
                                formData.loanType.includes(type) && styles.chipSelected,
                                { borderColor: Colors[colorScheme].border }
                            ]}
                            onPress={() => setFormData({ ...formData, loanType: type })}
                        >
                            <ThemedText style={[
                                styles.chipText,
                                formData.loanType.includes(type) && styles.chipTextSelected
                            ]}>{type}</ThemedText>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {renderInput('Requested Amount (₹)', formData.loanAmount, 'loanAmount', 'e.g. 2500000', 'numeric')}
            {renderInput('Desired Tenure (Years)', formData.tenure, 'tenure', 'Max 30 years', 'numeric')}
            {renderInput('Market Value of Property (₹)', formData.propertyValue, 'propertyValue', 'Approx value', 'numeric')}
        </Animated.View>
    );

    const renderStep5 = () => (
        <Animated.View entering={FadeInRight} exiting={FadeOutLeft} style={styles.stepContainer}>
            <ThemedText style={styles.sectionTitle}>Required Documents</ThemedText>
            <ThemedText style={styles.stepSubTitle}>Select documents to simulate attachment</ThemedText>

            <TouchableOpacity
                style={[styles.uploadBox, formData.docs.pan && styles.uploadBoxActive, { borderColor: Colors[colorScheme].border }]}
                onPress={() => toggleDoc('pan')}
            >
                <Ionicons name={formData.docs.pan ? "checkmark-circle" : "cloud-upload-outline"} size={32} color={formData.docs.pan ? "#D4AF37" : "#999"} />
                <View>
                    <ThemedText style={styles.uploadTitle}>PAN Card</ThemedText>
                    <ThemedText style={styles.uploadDesc}>{formData.docs.pan ? 'pancard_front.jpg' : 'Identity proof (Mandatory)'}</ThemedText>
                </View>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.uploadBox, formData.docs.aadhaar && styles.uploadBoxActive, { borderColor: Colors[colorScheme].border }]}
                onPress={() => toggleDoc('aadhaar')}
            >
                <Ionicons name={formData.docs.aadhaar ? "checkmark-circle" : "cloud-upload-outline"} size={32} color={formData.docs.aadhaar ? "#D4AF37" : "#999"} />
                <View>
                    <ThemedText style={styles.uploadTitle}>Aadhaar Card</ThemedText>
                    <ThemedText style={styles.uploadDesc}>{formData.docs.aadhaar ? 'aadhaar_v2.pdf' : 'Address proof (Mandatory)'}</ThemedText>
                </View>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.uploadBox, formData.docs.income && styles.uploadBoxActive, { borderColor: Colors[colorScheme].border }]}
                onPress={() => toggleDoc('income')}
            >
                <Ionicons name={formData.docs.income ? "checkmark-circle" : "cloud-upload-outline"} size={32} color={formData.docs.income ? "#D4AF37" : "#999"} />
                <View>
                    <ThemedText style={styles.uploadTitle}>Income Proof</ThemedText>
                    <ThemedText style={styles.uploadDesc}>{formData.docs.income ? 'salary_slips.zip' : 'Last 3 months salary slips'}</ThemedText>
                </View>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.uploadBox, formData.docs.property && styles.uploadBoxActive, { borderColor: Colors[colorScheme].border }]}
                onPress={() => toggleDoc('property')}
            >
                <Ionicons name={formData.docs.property ? "checkmark-circle" : "cloud-upload-outline"} size={32} color={formData.docs.property ? "#D4AF37" : "#999"} />
                <View>
                    <ThemedText style={styles.uploadTitle}>Property Documents</ThemedText>
                    <ThemedText style={styles.uploadDesc}>{formData.docs.property ? 'property_papers.pdf' : 'Registry/Sale Deed copy'}</ThemedText>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );

    return (
        <ThemedView style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                    <LinearGradient
                        colors={colorScheme === 'light' ? ['#002D62', '#0056b3'] : ['#0F172A', '#1E293B']}
                        style={styles.header}
                    >
                        <View style={styles.headerTopRow}>
                            <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
                                <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                            </TouchableOpacity>
                            <ThemedText style={styles.headerTitle}>Apply for Loan</ThemedText>
                        </View>

                        <View style={styles.progressContainer}>
                            <View style={styles.progressBar}>
                                <Animated.View
                                    style={[
                                        styles.progressFill,
                                        { width: `${(step / totalSteps) * 100}%` }
                                    ]}
                                />
                            </View>
                            <ThemedText style={styles.progressText}>Step {step} of {totalSteps}</ThemedText>
                        </View>
                    </LinearGradient>

                    <View style={styles.formContent}>
                        {step === 1 && renderStep1()}
                        {step === 2 && renderStep2()}
                        {step === 3 && renderStep3()}
                        {step === 4 && renderStep4()}
                        {step === 5 && renderStep5()}

                        <View style={styles.buttonRow}>
                            {step > 1 && (
                                <TouchableOpacity style={[styles.navBtn, styles.secondaryBtn]} onPress={handleBack}>
                                    <ThemedText style={styles.secondaryBtnText}>Back</ThemedText>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity
                                style={[styles.navBtn, styles.primaryBtn, step === 1 && { width: '100%' }]}
                                onPress={handleNext}
                            >
                                <ThemedText style={styles.primaryBtnText}>
                                    {step === totalSteps ? 'Submit Application' : 'Next Step'}
                                </ThemedText>
                                <Ionicons name={step === totalSteps ? "checkmark-circle" : "arrow-forward"} size={20} color="#002D62" />
                            </TouchableOpacity>
                        </View>

                        {step === totalSteps && (
                            <ThemedText style={styles.disclaimer}>
                                By submitting, you authorize MAHTO Home Loans to access your credit report and contact you for verification.
                            </ThemedText>
                        )}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
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
        paddingBottom: 30,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    headerTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginBottom: 24,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: '900',
    },
    progressContainer: {
        gap: 10,
    },
    progressBar: {
        height: 6,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#D4AF37',
    },
    progressText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '700',
        opacity: 0.8,
    },
    formContent: {
        padding: 24,
    },
    stepContainer: {
        width: '100%',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '800',
        marginBottom: 24,
        color: '#D4AF37',
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 8,
        opacity: 0.6,
    },
    input: {
        height: 60,
        borderRadius: 16,
        paddingHorizontal: 20,
        borderWidth: 1.5,
        fontSize: 16,
        fontWeight: '600',
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    rowWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    chip: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        borderWidth: 1.5,
    },
    chipSelected: {
        backgroundColor: '#D4AF37',
        borderColor: '#D4AF37',
    },
    chipText: {
        fontSize: 14,
        fontWeight: '600',
    },
    chipTextSelected: {
        color: '#002D62',
        fontWeight: '800',
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginTop: 10,
        marginBottom: 20,
    },
    checkboxLabel: {
        fontSize: 14,
        fontWeight: '600',
        opacity: 0.7,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 16,
        marginTop: 20,
    },
    navBtn: {
        height: 64,
        borderRadius: 20,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },
    primaryBtn: {
        flex: 2,
        backgroundColor: '#D4AF37',
        shadowColor: '#D4AF37',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    secondaryBtn: {
        flex: 1,
        backgroundColor: '#F0F0F0',
        borderWidth: 1,
        borderColor: '#DDD',
    },
    primaryBtnText: {
        color: '#002D62',
        fontSize: 18,
        fontWeight: '800',
    },
    secondaryBtnText: {
        color: '#666',
        fontSize: 18,
        fontWeight: '700',
    },
    disclaimer: {
        marginTop: 30,
        fontSize: 12,
        textAlign: 'center',
        opacity: 0.4,
        lineHeight: 18,
    },
    stepSubTitle: {
        fontSize: 14,
        opacity: 0.6,
        marginTop: -16,
        marginBottom: 24,
    },
    uploadBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
        padding: 20,
        borderRadius: 20,
        borderWidth: 1.5,
        borderStyle: 'dashed',
        marginBottom: 16,
    },
    uploadBoxActive: {
        backgroundColor: 'rgba(212, 175, 55, 0.1)',
        borderColor: '#D4AF37',
        borderStyle: 'solid',
    },
    uploadTitle: {
        fontSize: 16,
        fontWeight: '700',
    },
    uploadDesc: {
        fontSize: 13,
        opacity: 0.5,
        marginTop: 4,
    },
    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    locationBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 4,
        paddingHorizontal: 10,
        backgroundColor: 'rgba(212, 175, 55, 0.1)',
        borderRadius: 8,
    },
    locationBtnText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#D4AF37',
    },
});
