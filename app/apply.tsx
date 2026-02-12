import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Image, Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, ThemeType } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthService } from '@/utils/auth';
import { auth, db, storage } from '@/utils/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const INDIAN_DEVELOPERS = [
    'Godrej Properties', 'DLF', 'Prestige Group', 'Lodha (Macrotech)', 'Sobha',
    'Brigade Group', 'Tata Housing', 'Oberoi Realty', 'Hiranandani Group',
    'Shapoorji Pallonji', 'Mahindra Lifespaces', 'ATS Homekraft', 'Gaurs Group',
    'Supertech', 'Amrapali (NBCC)', 'Kalpataru', 'Puravankara', 'Sunteck Realty',
    'Indiabulls Real Estate', 'Omaxe', 'Kolte-Patil', 'M3M India', 'Emaar India',
    'Piramal Realty', 'Runwal Group', 'K Raheja Corp', 'Radiance Realty', 'Aparna Constructions',
    'Phoenix Mills', 'Goyal & Co', 'Salarpuria Sattva', 'Casagrand', 'My Home Constructions'
].sort();
INDIAN_DEVELOPERS.push('Other');

const INDIAN_COMPANIES = [
    'Tata Consultancy Services (TCS)', 'Infosys', 'Reliance Industries', 'HDFC Bank', 'ICICI Bank',
    'Wipro', 'HCL Technologies', 'State Bank of India (SBI)', 'Bharti Airtel', 'Larsen & Toubro',
    'Mahindra & Mahindra', 'Axis Bank', 'Maruti Suzuki', 'ITC Limited', 'HUL', 'Bajaj Finance',
    'Cognizant', 'Accenture', 'Tech Mahindra', 'Google India', 'Amazon India', 'Microsoft India',
    'IBM India', 'Deloitte', 'PwC', 'KPMG', 'EY', 'Capgemini', 'Oracle India', 'Genpact India',
    'Zensar Technologies', 'Mindtree', 'LTI', 'CGI India', 'Hexaware', 'Mphasis India', 'Sutherland',
    'Teleperformance India', 'Lupin Limited', 'Dr Reddys Laboratories', 'Cipla', 'Sun Pharma',
    'Aurobindo Pharma', 'Zydus Lifesciences', 'Glenmark Pharmaceuticals', 'Asian Paints', 'Berger Paints',
    'Titan Company', 'UltraTech Cement', 'Adani Enterprises Ltd', 'Adani Green Energy', 'Adani Ports & SEZ',
    'JSW Steel', 'Tata Steel', 'Hindalco Industries', 'Bharat Petroleum (BPCL)', 'Indian Oil (IOCL)',
    'ONGC', 'GAIL India', 'NTPC', 'Power Grid Corp', 'Coal India', 'BHEL', 'BEL India', 'HAL India',
    'Vedanta Limited', 'Ambuja Cements', 'ACC Limited', 'Godrej Consumer Products', 'Godrej Properties',
    'DLF Limited', 'Oberoi Realty', 'Prestige Group', 'Sobha Limited', 'Brigade Enterprises',
    'Phoenix Mills', 'L&T Technology Services', 'Tata Elxsi', 'Cyient', 'Happiest Minds',
    'Zomato', 'Swiggy', 'Paytm', 'Ola Cabs', 'Uber India', 'Pine Labs', 'Razorpay', 'BYJUS',
    'Unacademy', 'Dream11', 'Lenskart India', 'FirstCry India'
].sort();
INDIAN_COMPANIES.push('Other');

const INDIAN_INDUSTRIES = [
    'Banking & Finance (BFSI)', 'IT & Software Services', 'Healthcare & Pharmaceuticals',
    'Manufacturing & Engineering', 'Education & EdTech', 'Retail & E-commerce',
    'Construction & Real Estate', 'Hospitality & Tourism', 'Logistics & Supply Chain',
    'Telecommunications', 'FMCG (Fast Moving Consumer Goods)', 'Automobile & Transport',
    'Agriculture & Allied', 'Energy & Power', 'Media & Entertainment', 'Insurance',
    'Consulting & Professional Services', 'Infrastructure', 'Public Sector/Government',
    'Aerospace & Defense', 'Chemicals & Mining', 'Textiles & Apparel'
].sort();
INDIAN_INDUSTRIES.push('Other');

export default function ApplyScreen() {
    const colorScheme = (useColorScheme() ?? 'light') as ThemeType;
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const params = useLocalSearchParams<{ type?: string }>();

    const [step, setStep] = useState(1);
    const totalSteps = 5;
    const [loadingLocation, setLoadingLocation] = useState(false);
    const [developerSuggestions, setDeveloperSuggestions] = useState<string[]>([]);
    const [companySuggestions, setCompanySuggestions] = useState<string[]>([]);
    const [industrySuggestions, setIndustrySuggestions] = useState<string[]>([]);
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);

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
        otherCompanyName: '',
        experience: '',
        industry: '',
        otherIndustryName: '',
        profession: '',
        businessNature: '',
        annualTurnover: '',
        gstNumber: '',
        yearsInBusiness: '',
        hasExistingLoan: false,
        existingLoanTypes: [] as string[],
        totalExistingEMI: '',
        // Step 4: Loan
        loanType: params.type || 'Construction',
        loanAmount: '',
        tenure: '',
        propertyValue: '',
        developerName: '',
        otherDeveloperName: '',
        societyName: '',
        // Step 5: Docs
        docs: {
            panFront: null as string | null,
            panBack: null as string | null,
            aadhaarFront: null as string | null,
            aadhaarBack: null as string | null,
            income: null as string | null,
            property: null as string | null
        }
    });
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [dateValue, setDateValue] = useState(new Date());

    const handleDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            setDateValue(selectedDate);
            const day = String(selectedDate.getDate()).padStart(2, '0');
            const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
            const year = selectedDate.getFullYear();
            const formattedDate = `${day}/${month}/${year}`;
            setFormData({ ...formData, dob: formattedDate });
        }
    };
    useEffect(() => {
        const loadInitialData = async () => {
            // Load draft first
            try {
                const draft = await AsyncStorage.getItem('loan_application_draft');
                if (draft) {
                    const parsedDraft = JSON.parse(draft);
                    setFormData(prev => ({
                        ...prev,
                        ...parsedDraft,
                        // Don't override docs with nulls from draft if they were just selected? 
                        // Actually better to load everything and let user edit.
                    }));
                }
            } catch (err) {
                console.error('Failed to load draft:', err);
            }

            const session = await AuthService.getSession();
            if (session) {
                setFormData(prev => ({
                    ...prev,
                    name: session.name || prev.name,
                    phone: session.phone || prev.phone,
                    address: session.address || prev.address,
                }));
            }
        };
        loadInitialData();

        if (params.type) {
            setFormData(prev => ({ ...prev, loanType: params.type as string }));
        }

        const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
        const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

        const keyboardDidShowListener = Keyboard.addListener(showEvent, () => setKeyboardVisible(true));
        const keyboardDidHideListener = Keyboard.addListener(hideEvent, () => setKeyboardVisible(false));

        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, [params.type]);

    const handleNext = async () => {
        if (step < totalSteps) {
            // Save as draft when moving to next step
            try {
                const { email, ...draftData } = formData;
                await AsyncStorage.setItem('loan_application_draft', JSON.stringify(draftData));
            } catch (err) {
                console.error('Failed to save draft:', err);
            }

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

    const uploadFile = async (uri: string, path: string) => {
        try {
            const response = await fetch(uri);
            const blob = await response.blob();
            const storageRef = ref(storage, path);
            await uploadBytes(storageRef, blob);
            return await getDownloadURL(storageRef);
        } catch (error) {
            console.error('Error uploading file:', error);
            throw error;
        }
    };

    const handleSubmit = async () => {
        const { docs } = formData;
        if (!docs.panFront || !docs.panBack || !docs.aadhaarFront || !docs.aadhaarBack) {
            Alert.alert('Missing Documents', 'Please upload both Front and Back sides of your PAN and Aadhaar cards.');
            return;
        }

        const user = auth.currentUser;
        if (!user) {
            Alert.alert('Authentication Required', 'Please log in to submit your application.');
            router.replace('/auth/login');
            return;
        }

        setLoadingLocation(true); // Using this as a general loading state for submission
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

        try {
            const uploadedUrls: any = {};
            const docKeys = Object.keys(formData.docs) as Array<keyof typeof formData.docs>;

            for (const key of docKeys) {
                const uri = formData.docs[key];
                if (uri) {
                    const fileName = `${user.uid}_${key}_${Date.now()}`;
                    const path = `applications/${user.uid}/${fileName}`;
                    uploadedUrls[key] = await uploadFile(uri, path);
                }
            }

            const applicationData = {
                ...formData,
                docs: uploadedUrls,
                userId: user.uid,
                status: 'Pending',
                submittedAt: serverTimestamp(),
            };

            await addDoc(collection(db, 'applications'), applicationData);

            // Clear draft on successful submission
            await AsyncStorage.removeItem('loan_application_draft');

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert(
                'Application Submitted!',
                'Our verification team will review your details and contact you within 24 hours.',
                [{ text: 'Great!', onPress: () => router.replace('/home') }]
            );
        } catch (error: any) {
            console.error('Submission error:', error);
            Alert.alert('Submission Failed', 'Something went wrong while saving your application. Please try again.');
        } finally {
            setLoadingLocation(false);
        }
    };

    const pickDocument = async (key: keyof typeof formData.docs) => {
        try {
            Alert.alert(
                'Upload Document',
                'Choose your upload method',
                [
                    {
                        text: 'Camera / Gallery',
                        onPress: async () => {
                            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                            if (status !== 'granted') {
                                Alert.alert('Permission Needed', 'We need access to your gallery to upload documents.');
                                return;
                            }
                            const result = await ImagePicker.launchImageLibraryAsync({
                                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                                allowsEditing: true,
                                quality: 0.8,
                            });
                            if (!result.canceled) {
                                setFormData(prev => ({
                                    ...prev,
                                    docs: { ...prev.docs, [key]: result.assets[0].uri }
                                }));
                                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                            }
                        }
                    },
                    {
                        text: 'PDF Document',
                        onPress: async () => {
                            const result = await DocumentPicker.getDocumentAsync({
                                type: 'application/pdf',
                                copyToCacheDirectory: true,
                            });
                            if (!result.canceled) {
                                setFormData(prev => ({
                                    ...prev,
                                    docs: { ...prev.docs, [key]: result.assets[0].uri }
                                }));
                                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                            }
                        }
                    },
                    { text: 'Cancel', style: 'cancel' }
                ]
            );
        } catch (error) {
            Alert.alert('Error', 'Failed to pick document. Please try again.');
        }
    };

    const getFileName = (uri: string | null) => {
        if (!uri) return null;
        const parts = uri.split('/');
        return parts[parts.length - 1];
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
                        color: ((key === 'pan' && value.length === 10 && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value)) ||
                            (key === 'aadhaar' && value.replace(/ /g, '').length === 12 && !/^\d{12}$/.test(value.replace(/ /g, ''))))
                            ? '#FF3B30'
                            : Colors[colorScheme].text,
                        borderColor: ((key === 'pan' && value.length === 10 && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value)) ||
                            (key === 'aadhaar' && value.replace(/ /g, '').length === 12 && !/^\d{12}$/.test(value.replace(/ /g, ''))))
                            ? '#FF3B30'
                            : Colors[colorScheme].border
                    }
                ]}
                value={value}
                onChangeText={(text) => {
                    let finalValue = text;
                    if (key === 'pan') {
                        finalValue = text.toUpperCase().replace(/[^A-Z0-9]/g, '');
                    } else if (key === 'aadhaar') {
                        // Keep only numbers and format as 1234 5678 9012
                        let cleaned = text.replace(/[^0-9]/g, '');
                        if (cleaned.length > 12) cleaned = cleaned.slice(0, 12);

                        let formatted = '';
                        for (let i = 0; i < cleaned.length; i++) {
                            if (i > 0 && i % 4 === 0) formatted += ' ';
                            formatted += cleaned[i];
                        }
                        finalValue = formatted;
                    }
                    setFormData({ ...formData, [key]: finalValue });
                    if (key === 'developerName') {
                        if (text.length > 0) {
                            const filtered = INDIAN_DEVELOPERS.filter(d =>
                                d.toLowerCase().includes(text.toLowerCase())
                            );
                            setDeveloperSuggestions(filtered);
                        } else {
                            setDeveloperSuggestions(INDIAN_DEVELOPERS);
                        }
                    }
                    if (key === 'company' && formData.occupation === 'Salaried') {
                        if (text.length > 0) {
                            const filtered = INDIAN_COMPANIES.filter(c =>
                                c.toLowerCase().includes(text.toLowerCase())
                            );
                            setCompanySuggestions(filtered);
                        } else {
                            setCompanySuggestions(INDIAN_COMPANIES);
                        }
                    }
                    if (key === 'industry' && formData.occupation === 'Salaried') {
                        if (text.length > 0) {
                            const filtered = INDIAN_INDUSTRIES.filter(i =>
                                i.toLowerCase().includes(text.toLowerCase())
                            );
                            setIndustrySuggestions(filtered);
                        } else {
                            setIndustrySuggestions(INDIAN_INDUSTRIES);
                        }
                    }
                }}
                onFocus={() => {
                    if (key === 'developerName') {
                        setDeveloperSuggestions(INDIAN_DEVELOPERS);
                    }
                    if (key === 'company' && formData.occupation === 'Salaried') {
                        setCompanySuggestions(INDIAN_COMPANIES);
                    }
                    if (key === 'industry' && formData.occupation === 'Salaried') {
                        setIndustrySuggestions(INDIAN_INDUSTRIES);
                    }
                }}
                placeholder={placeholder}
                placeholderTextColor="#999"
                keyboardType={keyboardType}
                maxLength={maxLength}
                autoCapitalize={key === 'pan' ? 'characters' : 'none'}
            />
            {key === 'pan' && value.length === 10 && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value) && (
                <ThemedText style={{ color: '#FF3B30', fontSize: 12, marginTop: 4, fontWeight: '600' }}>
                    Invalid PAN format (e.g. ABCDE1234F)
                </ThemedText>
            )}
            {key === 'aadhaar' && value.replace(/ /g, '').length === 12 && !/^\d{12}$/.test(value.replace(/ /g, '')) && (
                <ThemedText style={{ color: '#FF3B30', fontSize: 12, marginTop: 4, fontWeight: '600' }}>
                    Invalid Aadhaar format (12 digits required)
                </ThemedText>
            )}
            {key === 'developerName' && developerSuggestions.length > 0 && (
                <View style={[styles.suggestionsContainer, { borderColor: Colors[colorScheme].border, backgroundColor: Colors[colorScheme].surface, maxHeight: 200, zIndex: 9999 }]}>
                    <ScrollView keyboardShouldPersistTaps="always" nestedScrollEnabled={true} contentContainerStyle={{ paddingBottom: 10 }}>
                        {developerSuggestions.map((dev) => (
                            <TouchableOpacity
                                key={dev}
                                style={[styles.suggestionItem, { borderBottomColor: Colors[colorScheme].border + '20', borderBottomWidth: 1 }]}
                                onPress={() => {
                                    setFormData({ ...formData, developerName: dev });
                                    setDeveloperSuggestions([]);
                                }}
                            >
                                <ThemedText style={{ color: dev === 'Other' ? '#D4AF37' : Colors[colorScheme].text, fontWeight: dev === 'Other' ? '700' : '400' }}>
                                    {dev}
                                </ThemedText>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}
            {key === 'company' && companySuggestions.length > 0 && formData.occupation === 'Salaried' && (
                <View style={[styles.suggestionsContainer, { borderColor: Colors[colorScheme].border, backgroundColor: Colors[colorScheme].surface, maxHeight: 200, zIndex: 9999 }]}>
                    <ScrollView keyboardShouldPersistTaps="always" nestedScrollEnabled={true} contentContainerStyle={{ paddingBottom: 10 }}>
                        {companySuggestions.map((comp) => (
                            <TouchableOpacity
                                key={comp}
                                style={[styles.suggestionItem, { borderBottomColor: Colors[colorScheme].border + '20', borderBottomWidth: 1 }]}
                                onPress={() => {
                                    setFormData({ ...formData, company: comp });
                                    setCompanySuggestions([]);
                                }}
                            >
                                <ThemedText style={{ color: comp === 'Other' ? '#D4AF37' : Colors[colorScheme].text, fontWeight: comp === 'Other' ? '700' : '400' }}>
                                    {comp}
                                </ThemedText>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}
            {key === 'industry' && industrySuggestions.length > 0 && formData.occupation === 'Salaried' && (
                <View style={[styles.suggestionsContainer, { borderColor: Colors[colorScheme].border, backgroundColor: Colors[colorScheme].surface, maxHeight: 200, zIndex: 9999 }]}>
                    <ScrollView keyboardShouldPersistTaps="always" nestedScrollEnabled={true} contentContainerStyle={{ paddingBottom: 10 }}>
                        {industrySuggestions.map((ind) => (
                            <TouchableOpacity
                                key={ind}
                                style={[styles.suggestionItem, { borderBottomColor: Colors[colorScheme].border + '20', borderBottomWidth: 1 }]}
                                onPress={() => {
                                    setFormData({ ...formData, industry: ind });
                                    setIndustrySuggestions([]);
                                }}
                            >
                                <ThemedText style={{ color: ind === 'Other' ? '#D4AF37' : Colors[colorScheme].text, fontWeight: ind === 'Other' ? '700' : '400' }}>
                                    {ind}
                                </ThemedText>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}
        </View>
    );

    const renderStep1 = () => (
        <Animated.View entering={FadeInRight} exiting={FadeOutLeft} style={styles.stepContainer}>
            <ThemedText style={styles.sectionTitle}>Personal Details</ThemedText>
            {renderInput('Full Name (as per PAN)', formData.name, 'name', 'Enter your name')}

            <View style={styles.inputContainer}>
                <ThemedText style={styles.label}>Date of Birth</ThemedText>
                <View style={[styles.inputWrapper, { borderColor: Colors[colorScheme].border, backgroundColor: Colors[colorScheme].surface, flexDirection: 'row', alignItems: 'center' }]}>
                    <TextInput
                        style={[styles.input, { color: Colors[colorScheme].text, flex: 1, height: '100%' }]}
                        placeholder="DD/MM/YYYY"
                        placeholderTextColor="#999"
                        keyboardType="numeric"
                        value={formData.dob}
                        onChangeText={(text) => {
                            // Basic auto-formatting for DD/MM/YYYY
                            let cleaned = text.replace(/[^0-9]/g, '');
                            if (cleaned.length > 8) cleaned = cleaned.slice(0, 8);

                            let formatted = cleaned;
                            if (cleaned.length > 4) {
                                formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4)}`;
                            } else if (cleaned.length > 2) {
                                formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
                            }
                            setFormData({ ...formData, dob: formatted });
                        }}
                        maxLength={10}
                    />
                    <TouchableOpacity
                        onPress={() => setShowDatePicker(true)}
                        style={{ padding: 10 }}
                    >
                        <Ionicons name="calendar-outline" size={20} color={Colors[colorScheme].tint} />
                    </TouchableOpacity>
                </View>
                {showDatePicker && (
                    <View style={Platform.OS === 'ios' && { backgroundColor: Colors[colorScheme].surface, borderRadius: 16, marginTop: 10, overflow: 'hidden', borderWidth: 1, borderColor: Colors[colorScheme].border }}>
                        {Platform.OS === 'ios' && (
                            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', padding: 10, borderBottomWidth: 1, borderBottomColor: Colors[colorScheme].border }}>
                                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                                    <ThemedText style={{ color: Colors[colorScheme].tint, fontWeight: '700' }}>Done</ThemedText>
                                </TouchableOpacity>
                            </View>
                        )}
                        <DateTimePicker
                            value={dateValue}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={handleDateChange}
                            maximumDate={new Date()} // DOB cannot be in future
                        />
                    </View>
                )}
            </View>

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
            {renderInput('Aadhaar Number', formData.aadhaar, 'aadhaar', '1234 5678 9012', 'numeric', 14)}
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
                    {renderInput('Employer / Company Name', formData.company, 'company', 'Search or select company')}
                    {formData.company === 'Other' && (
                        <Animated.View entering={FadeInRight}>
                            {renderInput('Specify Company Name', formData.otherCompanyName, 'otherCompanyName', 'Type your company name')}
                        </Animated.View>
                    )}
                    {renderInput('Industry', formData.industry, 'industry', 'Search or select industry')}
                    {formData.industry === 'Other' && (
                        <Animated.View entering={FadeInRight}>
                            {renderInput('Specify Industry', formData.otherIndustryName, 'otherIndustryName', 'Type your industry')}
                        </Animated.View>
                    )}
                    {renderInput('Monthly Net Salary (₹)', formData.monthlyIncome, 'monthlyIncome', 'Enter net take-home salary', 'numeric')}
                    <View style={[styles.rowWrap, { marginTop: -12, marginBottom: 20 }]}>
                        {[
                            { label: '< 25k', value: '< 25k' },
                            { label: '25k+', value: '25k+' },
                            { label: '50k+', value: '50k+' },
                            { label: '1L+', value: '1 Lakh+' },
                            { label: '5L+', value: '5 Lakh+' }
                        ].map((s) => (
                            <TouchableOpacity
                                key={s.label}
                                style={[styles.chip, { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 10, backgroundColor: Colors[colorScheme].surface, borderColor: Colors[colorScheme].border }]}
                                onPress={() => setFormData({ ...formData, monthlyIncome: s.value })}
                            >
                                <ThemedText style={{ fontSize: 11, fontWeight: '700', color: Colors[colorScheme].tint }}>{s.label}</ThemedText>
                            </TouchableOpacity>
                        ))}
                    </View>
                    {renderInput('Total Work Experience (Years)', formData.experience, 'experience', 'e.g. 5', 'numeric')}
                    <View style={[styles.rowWrap, { marginTop: -12, marginBottom: 10 }]}>
                        {[
                            { label: '< 1 Year', value: '0' },
                            { label: '2+ Year', value: '2' },
                            { label: '5 Year', value: '5' },
                            { label: '5-10 Year', value: '8' },
                            { label: '10+ Year', value: '11' }
                        ].map((exp) => (
                            <TouchableOpacity
                                key={exp.label}
                                style={[styles.chip, { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 10, backgroundColor: Colors[colorScheme].surface, borderColor: Colors[colorScheme].border }]}
                                onPress={() => setFormData({ ...formData, experience: exp.value })}
                            >
                                <ThemedText style={{ fontSize: 10, fontWeight: '700', color: Colors[colorScheme].tint }}>{exp.label}</ThemedText>
                            </TouchableOpacity>
                        ))}
                    </View>
                </Animated.View>
            )}

            {formData.occupation === 'Self-Employed' && (
                <Animated.View entering={FadeInRight}>
                    {renderInput('Profession', formData.profession, 'profession', 'e.g. Doctor, CA, Architect')}
                    {renderInput('Monthly Average Income (₹)', formData.monthlyIncome, 'monthlyIncome', 'Enter average monthly income', 'numeric')}
                    <View style={[styles.rowWrap, { marginTop: -12, marginBottom: 20 }]}>
                        {[
                            { label: '< 25k', value: '< 25k' },
                            { label: '25k+', value: '25k+' },
                            { label: '50k+', value: '50k+' },
                            { label: '1L+', value: '1 Lakh+' },
                            { label: '5L+', value: '5 Lakh+' }
                        ].map((s) => (
                            <TouchableOpacity
                                key={s.label}
                                style={[styles.chip, { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 10, backgroundColor: Colors[colorScheme].surface, borderColor: Colors[colorScheme].border }]}
                                onPress={() => setFormData({ ...formData, monthlyIncome: s.value })}
                            >
                                <ThemedText style={{ fontSize: 11, fontWeight: '700', color: Colors[colorScheme].tint }}>{s.label}</ThemedText>
                            </TouchableOpacity>
                        ))}
                    </View>
                    {renderInput('Years in Profession', formData.experience, 'experience', 'e.g. 10', 'numeric')}
                    <View style={[styles.rowWrap, { marginTop: -12, marginBottom: 10 }]}>
                        {[
                            { label: '< 1 Year', value: '0' },
                            { label: '2+ Year', value: '2' },
                            { label: '5 Year', value: '5' },
                            { label: '5-10 Year', value: '8' },
                            { label: '10+ Year', value: '11' }
                        ].map((exp) => (
                            <TouchableOpacity
                                key={exp.label}
                                style={[styles.chip, { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 10, backgroundColor: Colors[colorScheme].surface, borderColor: Colors[colorScheme].border }]}
                                onPress={() => setFormData({ ...formData, experience: exp.value })}
                            >
                                <ThemedText style={{ fontSize: 10, fontWeight: '700', color: Colors[colorScheme].tint }}>{exp.label}</ThemedText>
                            </TouchableOpacity>
                        ))}
                    </View>
                </Animated.View>
            )}

            {formData.occupation === 'Business' && (
                <Animated.View entering={FadeInRight}>
                    {renderInput('Business Name', formData.company, 'company', 'Enter registered business name')}
                    {renderInput('Nature of Business', formData.businessNature, 'businessNature', 'e.g. Trading, Manufacturing')}
                    {renderInput('Annual Turnover (₹)', formData.annualTurnover, 'annualTurnover', 'Enter yearly turnover', 'numeric')}
                    {renderInput('Years in Business', formData.yearsInBusiness, 'yearsInBusiness', 'e.g. 3', 'numeric')}
                    <View style={[styles.rowWrap, { marginTop: -12, marginBottom: 10 }]}>
                        {[
                            { label: '< 1 Year', value: '0' },
                            { label: '2+ Year', value: '2' },
                            { label: '5 Year', value: '5' },
                            { label: '5-10 Year', value: '8' },
                            { label: '10+ Year', value: '11' }
                        ].map((exp) => (
                            <TouchableOpacity
                                key={exp.label}
                                style={[styles.chip, { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 10, backgroundColor: Colors[colorScheme].surface, borderColor: Colors[colorScheme].border }]}
                                onPress={() => setFormData({ ...formData, yearsInBusiness: exp.value })}
                            >
                                <ThemedText style={{ fontSize: 10, fontWeight: '700', color: Colors[colorScheme].tint }}>{exp.label}</ThemedText>
                            </TouchableOpacity>
                        ))}
                    </View>
                    {renderInput('GST Number (Optional)', formData.gstNumber, 'gstNumber', 'Enter GSTIN if applicable')}
                </Animated.View>
            )}

            <View style={[styles.inputContainer, { marginTop: 24, paddingTop: 24, borderTopWidth: 1, borderTopColor: Colors[colorScheme].border + '40' }]}>
                <ThemedText style={{ fontSize: 18, fontWeight: '700', marginBottom: 16 }}>Financial Obligations</ThemedText>

                <TouchableOpacity
                    style={styles.checkboxRow}
                    onPress={() => setFormData({ ...formData, hasExistingLoan: !formData.hasExistingLoan })}
                >
                    <Ionicons
                        name={formData.hasExistingLoan ? "checkbox" : "square-outline"}
                        size={24}
                        color={formData.hasExistingLoan ? "#D4AF37" : "#999"}
                    />
                    <ThemedText style={styles.checkboxLabel}>Do you have any existing loans?</ThemedText>
                </TouchableOpacity>

                {formData.hasExistingLoan && (
                    <Animated.View entering={FadeInRight}>
                        <ThemedText style={[styles.label, { marginBottom: 12 }]}>Select Loan Types</ThemedText>
                        <View style={styles.rowWrap}>
                            {['Car Loan', 'Personal Loan', 'Gold Loan', 'Home Loan', 'Other'].map((type) => {
                                const isSelected = formData.existingLoanTypes.includes(type);
                                return (
                                    <TouchableOpacity
                                        key={type}
                                        style={[styles.chip, isSelected && styles.chipSelected, { borderColor: Colors[colorScheme].border }]}
                                        onPress={() => {
                                            const newTypes = isSelected
                                                ? formData.existingLoanTypes.filter(t => t !== type)
                                                : [...formData.existingLoanTypes, type];
                                            setFormData({ ...formData, existingLoanTypes: newTypes });
                                        }}
                                    >
                                        <ThemedText style={[styles.chipText, isSelected && styles.chipTextSelected]}>{type}</ThemedText>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                        <View style={{ marginTop: 20 }}>
                            {renderInput('Total Monthly EMI (₹)', formData.totalExistingEMI, 'totalExistingEMI', 'Enter combined EMI amount', 'numeric')}
                        </View>
                    </Animated.View>
                )}
            </View>
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
                                (formData.loanType === type || (type === 'Flat Buying' && formData.loanType === 'flat-buying')) && styles.chipSelected,
                                { borderColor: Colors[colorScheme].border }
                            ]}
                            onPress={() => setFormData({ ...formData, loanType: type })}
                        >
                            <ThemedText style={[
                                styles.chipText,
                                (formData.loanType === type || (type === 'Flat Buying' && formData.loanType === 'flat-buying')) && styles.chipTextSelected
                            ]}>{type}</ThemedText>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {renderInput('Requested Amount (₹)', formData.loanAmount, 'loanAmount', 'e.g. 25L or 2500000', 'default')}
            <View style={[styles.rowWrap, { marginTop: -12, marginBottom: 20 }]}>
                {['10L', '25L', '50L', '1 Cr', '2 Cr+'].map((val) => (
                    <TouchableOpacity
                        key={val}
                        style={[styles.chip, { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 10, backgroundColor: Colors[colorScheme].surface, borderColor: Colors[colorScheme].border }]}
                        onPress={() => setFormData({ ...formData, loanAmount: val })}
                    >
                        <ThemedText style={{ fontSize: 11, fontWeight: '700', color: Colors[colorScheme].tint }}>{val}</ThemedText>
                    </TouchableOpacity>
                ))}
            </View>
            {renderInput('Desired Tenure (Years)', formData.tenure, 'tenure', 'Max 30 years', 'numeric')}
            {renderInput('Market Value of Property (₹)', formData.propertyValue, 'propertyValue', 'e.g. 50L or 5000000', 'default')}
            <View style={[styles.rowWrap, { marginTop: -12, marginBottom: 20 }]}>
                {['25L', '50L', '80L', '1.5 Cr', '3 Cr+'].map((val) => (
                    <TouchableOpacity
                        key={val}
                        style={[styles.chip, { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 10, backgroundColor: Colors[colorScheme].surface, borderColor: Colors[colorScheme].border }]}
                        onPress={() => setFormData({ ...formData, propertyValue: val })}
                    >
                        <ThemedText style={{ fontSize: 11, fontWeight: '700', color: Colors[colorScheme].tint }}>{val}</ThemedText>
                    </TouchableOpacity>
                ))}
            </View>

            {(formData.loanType === 'Flat Buying' || formData.loanType === 'flat-buying') && (
                <Animated.View entering={FadeInRight}>
                    {renderInput('Developer Name', formData.developerName, 'developerName', 'Select developer')}
                    {formData.developerName === 'Other' && (
                        <Animated.View entering={FadeInRight}>
                            {renderInput('Specify Developer Name', formData.otherDeveloperName, 'otherDeveloperName', 'Enter developer name')}
                        </Animated.View>
                    )}
                    {renderInput('Society Name', formData.societyName, 'societyName', 'e.g. Godrej Woods')}
                </Animated.View>
            )}
        </Animated.View>
    );

    const renderStep5 = () => {
        const renderUploadButton = (key: keyof typeof formData.docs, title: string, subtitle: string, isFullWidth = true) => {
            const uri = formData.docs[key];
            const isPdf = uri?.toLowerCase().endsWith('.pdf');

            return (
                <TouchableOpacity
                    style={[
                        styles.uploadBox,
                        uri && styles.uploadBoxActive,
                        { borderColor: Colors[colorScheme].border, flex: isFullWidth ? 0 : 1 }
                    ]}
                    onPress={() => pickDocument(key)}
                >
                    {uri ? (
                        isPdf ? (
                            <View style={[styles.docPreview, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#FEE2E2' }]}>
                                <Ionicons name="document-text" size={30} color="#DC2626" />
                            </View>
                        ) : (
                            <Image source={{ uri }} style={styles.docPreview} />
                        )
                    ) : (
                        <Ionicons name="cloud-upload-outline" size={32} color="#999" />
                    )}
                    <View style={styles.uploadTextWrapper}>
                        <ThemedText style={styles.uploadTitle}>{title}</ThemedText>
                        <ThemedText style={styles.uploadDesc} numberOfLines={1}>
                            {uri ? getFileName(uri) : subtitle}
                        </ThemedText>
                    </View>
                    {uri && <Ionicons name="checkmark-circle" size={20} color="#D4AF37" />}
                </TouchableOpacity>
            );
        };

        return (
            <Animated.View entering={FadeInRight} exiting={FadeOutLeft} style={styles.stepContainer}>
                <ThemedText style={styles.sectionTitle}>Required Documents</ThemedText>
                <ThemedText style={styles.stepSubTitle}>Upload clear copies of your documents (Images or PDF)</ThemedText>

                <View style={styles.docGroup}>
                    <ThemedText style={styles.groupLabel}>PAN Card</ThemedText>
                    <View style={styles.dualUploadRow}>
                        {renderUploadButton('panFront', 'Front Side', 'Identity front', false)}
                        {renderUploadButton('panBack', 'Back Side', 'Identity back', false)}
                    </View>
                </View>

                <View style={styles.docGroup}>
                    <ThemedText style={styles.groupLabel}>Aadhaar Card</ThemedText>
                    <View style={styles.dualUploadRow}>
                        {renderUploadButton('aadhaarFront', 'Front Side', 'Address front', false)}
                        {renderUploadButton('aadhaarBack', 'Back Side', 'Address back', false)}
                    </View>
                </View>

                <View style={styles.docGroup}>
                    <ThemedText style={styles.groupLabel}>Financial & Property</ThemedText>
                    {renderUploadButton('income', 'Income Proof', 'Last 3 months salary slips')}
                    {renderUploadButton('property', 'Property Documents', 'Registry/Sale Deed copy')}
                </View>
            </Animated.View>
        );
    };

    return (
        <ThemedView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ flexGrow: 1 }}
                    keyboardShouldPersistTaps="handled"
                >
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
                        <View style={{ flex: 1 }}>
                            {step === 1 && renderStep1()}
                            {step === 2 && renderStep2()}
                            {step === 3 && renderStep3()}
                            {step === 4 && renderStep4()}
                            {step === 5 && renderStep5()}

                            {step === totalSteps && (
                                <ThemedText style={styles.disclaimer}>
                                    By submitting, you authorize MAHTO Home Loans to access your credit report and contact you for verification.
                                </ThemedText>
                            )}
                        </View>

                        <View style={[styles.buttonContainer, { paddingBottom: Math.max(insets.bottom, 24) }]}>
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
                                        {loadingLocation && step === totalSteps ? 'Submitting...' : step === totalSteps ? 'Submit Application' : 'Save & Continue'}
                                    </ThemedText>
                                    {loadingLocation && step === totalSteps ? (
                                        <ActivityIndicator size="small" color="#002D62" />
                                    ) : (
                                        <Ionicons name={step === totalSteps ? "checkmark-circle" : "arrow-forward"} size={20} color="#002D62" />
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
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
        flex: 1,
    },
    stepContainer: {
        width: '100%',
        zIndex: 10, // Ensure dropdowns inside steps are above buttons
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
    inputWrapper: {
        borderRadius: 16,
        borderWidth: 1.5,
        overflow: 'hidden',
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
    buttonContainer: {
        marginTop: 32,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
        zIndex: 1, // Stay below dropdowns
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 16,
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
    docPreview: {
        width: 50,
        height: 50,
        borderRadius: 8,
        backgroundColor: '#F0F0F0',
    },
    uploadTextWrapper: {
        flex: 1,
        gap: 2,
    },
    docGroup: {
        marginBottom: 24,
    },
    groupLabel: {
        fontSize: 14,
        fontWeight: '700',
        opacity: 0.6,
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    dualUploadRow: {
        flexDirection: 'row',
        gap: 12,
    },
    suggestionsContainer: {
        borderWidth: 1,
        borderRadius: 12,
        marginTop: 4,
        overflow: 'hidden',
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        zIndex: 1000,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    suggestionItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
});
