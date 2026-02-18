import { CustomAlert } from '@/components/CustomAlert';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Image, Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
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

const INDIAN_PROFESSIONS = [
    'Doctor (General Physician)', 'Surgeon', 'Dentist', 'Psychologist', 'Physiotherapist',
    'Chartered Accountant (CA)', 'Company Secretary (CS)', 'Cost Accountant (CMA)',
    'Lawyer / Advocate', 'Civil Lawyer', 'Criminal Lawyer', 'Corporate Lawyer',
    'Architect', 'Interior Designer', 'Civil Engineer', 'Mechanical Engineer',
    'Electrical Engineer', 'Software Engineer', 'Data Scientist', 'AI/ML Engineer',
    'Consultant (Management)', 'Consultant (IT)', 'Consultant (Finance)', 'Consultant (HR)',
    'Financial Advisor', 'Tax Consultant', 'Auditor', 'Actuary',
    'Photographer', 'Videographer', 'Graphic Designer', 'UI/UX Designer',
    'Content Writer', 'Copywriter', 'Journalist', 'Editor',
    'Real Estate Agent', 'Insurance Agent', 'Stock Broker', 'Investment Advisor',
    'Tutor / Teacher', 'Professor', 'Training Consultant', 'Career Counselor',
    'Yoga Instructor', 'Fitness Trainer', 'Nutritionist / Dietitian', 'Life Coach',
    'Chef', 'Caterer', 'Event Planner', 'Wedding Planner',
    'Freelance Developer', 'Freelance Designer', 'Social Media Manager', 'Digital Marketer'
].sort();
INDIAN_PROFESSIONS.push('Other');

const BUSINESS_NATURE_TYPES = [
    'Trading', 'Manufacturing', 'Wholesale Trading', 'Retail Trading',
    'Import & Export', 'E-commerce', 'Distribution & Supply',
    'Food & Beverage', 'Restaurant & Catering', 'FMCG Distribution',
    'Textile & Garment Manufacturing', 'Textile Trading', 'Garment Export',
    'Electronics Manufacturing', 'Electronics Trading', 'Mobile & Accessories',
    'Construction & Contracting', 'Real Estate Development', 'Interior Design & Fit-outs',
    'IT Services & Consulting', 'Software Development', 'Web Development',
    'Digital Marketing Agency', 'Advertising & Branding', 'Event Management',
    'Logistics & Transportation', 'Courier & Cargo Services', 'Warehousing',
    'Healthcare Services', 'Pharmacy', 'Medical Equipment Supply',
    'Education & Training', 'Coaching Centre', 'Skill Development',
    'Hospitality & Hotels', 'Travel & Tourism', 'Tour Operator',
    'Automobile Sales & Service', 'Spare Parts Trading', 'Two-Wheeler Dealership',
    'Printing & Publishing', 'Packaging Solutions', 'Paper Products',
    'Jewellery Manufacturing', 'Jewellery Retail', 'Gold & Silver Trading',
    'Agriculture & Farming', 'Agri Products Trading', 'Fertilizers & Seeds',
    'Chemical Manufacturing', 'Pharmaceutical Manufacturing', 'Cosmetics & Beauty Products',
    'Furniture Manufacturing', 'Home Décor & Furnishings', 'Hardware & Sanitary',
    'Beauty & Salon Services', 'Spa & Wellness', 'Gym & Fitness Centre',
    'Security Services', 'Manpower & Staffing', 'Consultancy Services'
].sort();
BUSINESS_NATURE_TYPES.push('Other');

const INDIAN_SOCIETIES = [
    'Godrej Woods', 'ATS Village', 'Mahagun Modern', 'Cleo County', 'Prateek Edifice',
    'Supertech Capetown', 'Amrapali Zodiac', 'Jaypee Wish Town', 'Gaur City', 'Cherry County',
    'Ace City', 'Paramount Floraville', 'Exotica Fresco', 'Gulshan Vivante', 'Paras Tierea',
    'Logix Blossom County', 'Sikka Karnam Greens', 'Eldeco Utopia', 'Omaxe Forest', 'Assotech Windsor Court',
    'DLF Capital Greens', 'Prestige Shantiniketan', 'Lodha World Towers', 'Hiranandani Gardens'
].sort();
INDIAN_SOCIETIES.push('Other');

export default function ApplyScreen() {
    const colorScheme = (useColorScheme() ?? 'light') as ThemeType;
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const params = useLocalSearchParams<{ type?: string }>();

    // Helper function to normalize loan type display
    const getLoanTypeDisplay = (loanType: string): string => {
        const loanTypeMap: Record<string, string> = {
            'construction': 'Construction Loan',
            'renovation': 'Renovation Loan',
            'flat-buying': 'Flat Buying Loan',
            'lap': 'Loan Against Property'
        };
        return loanTypeMap[loanType.toLowerCase()] || loanType;
    };

    // Normalize the loan type from params
    const normalizedLoanType = params.type ? getLoanTypeDisplay(params.type) : 'Construction Loan';

    const [step, setStep] = useState(1);
    const totalSteps = 6;
    const [loadingLocation, setLoadingLocation] = useState(false);
    const [developerSuggestions, setDeveloperSuggestions] = useState<string[]>([]);
    const [companySuggestions, setCompanySuggestions] = useState<string[]>([]);
    const [industrySuggestions, setIndustrySuggestions] = useState<string[]>([]);
    const [professionSuggestions, setProfessionSuggestions] = useState<string[]>([]);
    const [businessNatureSuggestions, setBusinessNatureSuggestions] = useState<string[]>([]);
    const [societySuggestions, setSocietySuggestions] = useState<string[]>([]);
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);
    const [customAlert, setCustomAlert] = useState({
        visible: false,
        title: '',
        message: '',
        type: 'info' as 'info' | 'error' | 'success' | 'warning',
        primaryText: 'OK',
        secondaryText: undefined as string | undefined,
        secondaryDetail: undefined as string | undefined,
        ternaryText: undefined as string | undefined,
        ternaryDetail: undefined as string | undefined,
        onPrimary: () => { },
        onSecondary: () => { },
        onTernary: () => { }
    });

    const showAlert = (
        title: string,
        message: string,
        type: 'info' | 'error' | 'success' | 'warning' = 'info',
        primaryText: string = 'OK',
        onPrimary: () => void = () => { },
        secondaryText?: string,
        secondaryDetail?: string,
        onSecondary?: () => void,
        ternaryText?: string,
        ternaryDetail?: string,
        onTernary?: () => void
    ) => {
        setCustomAlert({
            visible: true,
            title,
            message,
            type,
            primaryText,
            secondaryText,
            secondaryDetail,
            ternaryText,
            ternaryDetail,
            onPrimary,
            onSecondary: onSecondary || (() => { }),
            onTernary: onTernary || (() => { })
        });
    };

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
        otherProfessionName: '',
        businessNature: '',
        otherBusinessNature: '',
        annualTurnover: '',
        gstNumber: '',
        yearsInBusiness: '',
        hasExistingLoan: false,
        existingLoanTypes: [] as string[],
        totalExistingEMI: '',
        // Step 4: Loan
        loanType: normalizedLoanType,
        loanAmount: '',
        tenure: '',
        propertyValue: '',
        developerName: '',
        otherDeveloperName: '',
        societyName: '',
        otherSocietyName: '',
        // Step 5: Docs
        docs: {
            panFront: null as { uri: string, type: 'image' | 'pdf', name: string } | null,
            panBack: null as { uri: string, type: 'image' | 'pdf', name: string } | null,
            aadhaarFront: null as { uri: string, type: 'image' | 'pdf', name: string } | null,
            aadhaarBack: null as { uri: string, type: 'image' | 'pdf', name: string } | null,
            income: null as { uri: string, type: 'image' | 'pdf', name: string } | null,
            property: null as { uri: string, type: 'image' | 'pdf', name: string } | null
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
                    if (parsedDraft.step) {
                        setStep(parsedDraft.step);
                    }
                    if (parsedDraft.formData) {
                        setFormData(prev => ({
                            ...prev,
                            ...parsedDraft.formData,
                            ...(params.type ? { loanType: getLoanTypeDisplay(params.type as string) } : {})
                        }));
                    } else {
                        // Fallback for old draft format
                        setFormData(prev => ({
                            ...prev,
                            ...parsedDraft,
                            ...(params.type ? { loanType: getLoanTypeDisplay(params.type as string) } : {})
                        }));
                    }
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
            setFormData(prev => ({ ...prev, loanType: getLoanTypeDisplay(params.type as string) }));
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

    // Auto-save draft whenever formData or step changes
    useEffect(() => {
        const saveDraft = async () => {
            try {
                const draftData = {
                    formData,
                    step
                };
                await AsyncStorage.setItem('loan_application_draft', JSON.stringify(draftData));
            } catch (err) {
                console.error('Failed to save draft:', err);
            }
        };
        const timeoutId = setTimeout(saveDraft, 1000);
        return () => clearTimeout(timeoutId);
    }, [formData, step]);

    const handleNext = async () => {
        let currentErrors: string[] = [];
        let missingFields: string[] = [];

        // Step-specific validation
        if (step === 1) {
            if (!formData.name.trim()) {
                currentErrors.push('name');
                missingFields.push('Full Name');
            }
            if (!formData.dob.trim() || formData.dob.length < 10) {
                currentErrors.push('dob');
                missingFields.push('Date of Birth');
            }
            if (!formData.gender) {
                currentErrors.push('gender');
                missingFields.push('Gender');
            }
            if (!formData.pan.trim() || formData.pan.length < 10) {
                currentErrors.push('pan');
                missingFields.push('PAN Card Number');
            }
            if (!formData.aadhaar.trim() || formData.aadhaar.replace(/ /g, '').length < 12) {
                currentErrors.push('aadhaar');
                missingFields.push('Aadhaar Number');
            }
        } else if (step === 2) {
            if (!formData.email.trim()) {
                currentErrors.push('email');
                missingFields.push('Email Address');
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                currentErrors.push('email');
                missingFields.push('Valid Email Address');
            }
            if (!formData.phone.trim() || formData.phone.length < 10) {
                currentErrors.push('phone');
                missingFields.push('Phone Number');
            }
            if (!formData.address.trim()) {
                currentErrors.push('address');
                missingFields.push('Current Address');
            }
            if (!formData.isSameAddress && !formData.permanentAddress.trim()) {
                currentErrors.push('permanentAddress');
                missingFields.push('Permanent Address');
            }
        } else if (step === 3) {
            // Validation for Salaried occupation
            if (formData.occupation === 'Salaried') {
                if (!formData.company.trim()) {
                    currentErrors.push('company');
                    missingFields.push('Company Name');
                }
                if (formData.company === 'Other' && !formData.otherCompanyName.trim()) {
                    currentErrors.push('otherCompanyName');
                    missingFields.push('Other Company Name');
                }
                if (!formData.industry.trim()) {
                    currentErrors.push('industry');
                    missingFields.push('Industry');
                }
                if (formData.industry === 'Other' && !formData.otherIndustryName.trim()) {
                    currentErrors.push('otherIndustryName');
                    missingFields.push('Other Industry Name');
                }
                if (!formData.experience.trim()) {
                    currentErrors.push('experience');
                    missingFields.push('Work Experience');
                }
            }
            // Validation for Self-Employed
            else if (formData.occupation === 'Self-Employed') {
                if (!formData.profession.trim()) {
                    currentErrors.push('profession');
                    missingFields.push('Profession');
                }
                if (formData.profession === 'Other' && !formData.otherProfessionName.trim()) {
                    currentErrors.push('otherProfessionName');
                    missingFields.push('Other Profession Name');
                }
                if (!formData.experience.trim()) {
                    currentErrors.push('experience');
                    missingFields.push('Years in Profession');
                }
            }
            // Validation for Business
            else if (formData.occupation === 'Business') {
                if (!formData.company.trim()) {
                    currentErrors.push('company');
                    missingFields.push('Business Name');
                }
                if (!formData.businessNature.trim()) {
                    currentErrors.push('businessNature');
                    missingFields.push('Nature of Business');
                }
                if (formData.businessNature === 'Other' && !formData.otherBusinessNature.trim()) {
                    currentErrors.push('otherBusinessNature');
                    missingFields.push('Other Business Nature');
                }
                if (!formData.annualTurnover.trim()) {
                    currentErrors.push('annualTurnover');
                    missingFields.push('Annual Turnover');
                }
                if (!formData.yearsInBusiness.trim()) {
                    currentErrors.push('yearsInBusiness');
                    missingFields.push('Years in Business');
                }
            }
            // Common validation for all occupation types
            if (!formData.monthlyIncome.trim()) {
                currentErrors.push('monthlyIncome');
                missingFields.push('Monthly Income');
            }
        } else if (step === 4) {
            if (!formData.loanAmount.trim()) {
                currentErrors.push('loanAmount');
                missingFields.push('Loan Amount');
            }
            if (!formData.tenure.trim()) {
                currentErrors.push('tenure');
                missingFields.push('Loan Tenure');
            }
            if (!formData.propertyValue.trim()) {
                currentErrors.push('propertyValue');
                missingFields.push('Property Value');
            }
            if (formData.loanType === 'Flat Buying Loan') {
                if (!formData.developerName.trim()) {
                    currentErrors.push('developerName');
                    missingFields.push('Developer Name');
                }
                if (formData.developerName === 'Other' && !formData.otherDeveloperName.trim()) {
                    currentErrors.push('otherDeveloperName');
                    missingFields.push('Other Developer Name');
                }
                if (!formData.societyName.trim()) {
                    currentErrors.push('societyName');
                    missingFields.push('Society Name');
                }
                if (formData.societyName === 'Other' && !formData.otherSocietyName.trim()) {
                    currentErrors.push('otherSocietyName');
                    missingFields.push('Other Society Name');
                }
            }
        }

        if (currentErrors.length > 0) {
            setErrors(currentErrors);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            const fieldsList = missingFields.join(', ');
            return showAlert('Missing Information', `Please fill the following required field${missingFields.length > 1 ? 's' : ''}:\n\n${fieldsList}`, 'warning');
        }

        setErrors([]);
        if (step < totalSteps) {
            setStep(step + 1);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } else {
            handleSubmit();
        }
    };

    const handleClearForm = () => {
        showAlert(
            'Clear Application',
            'Are you sure you want to clear all details and start fresh? This action cannot be undone.',
            'warning',
            'Clear All',
            async () => {
                try {
                    await AsyncStorage.removeItem('loan_application_draft');
                } catch (err) {
                    console.error('Failed to clear draft:', err);
                }

                setFormData({
                    name: '',
                    dob: '',
                    gender: '',
                    pan: '',
                    aadhaar: '',
                    email: '',
                    phone: '',
                    address: '',
                    permanentAddress: '',
                    isSameAddress: true,
                    altPhone: '',
                    occupation: 'Salaried',
                    monthlyIncome: '',
                    company: '',
                    otherCompanyName: '',
                    experience: '',
                    industry: '',
                    otherIndustryName: '',
                    profession: '',
                    otherProfessionName: '',
                    businessNature: '',
                    otherBusinessNature: '',
                    annualTurnover: '',
                    gstNumber: '',
                    yearsInBusiness: '',
                    hasExistingLoan: false,
                    existingLoanTypes: [],
                    totalExistingEMI: '',
                    loanType: normalizedLoanType,
                    loanAmount: '',
                    tenure: '',
                    propertyValue: '',
                    developerName: '',
                    otherDeveloperName: '',
                    societyName: '',
                    otherSocietyName: '',
                    docs: {
                        panFront: null,
                        panBack: null,
                        aadhaarFront: null,
                        aadhaarBack: null,
                        income: null,
                        property: null
                    }
                });
                setStep(1);
                setErrors([]);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            },
            'Cancel'
        );
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
            showAlert('Missing Documents', 'Please upload both Front and Back sides of your PAN and Aadhaar cards.', 'warning');
            return;
        }

        const user = auth.currentUser;
        if (!user) {
            showAlert('Authentication Required', 'Please log in to submit your application.', 'error');
            router.replace('/auth/login');
            return;
        }

        setLoadingLocation(true); // Using this as a general loading state for submission
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

        try {
            const docKeys = Object.keys(formData.docs) as Array<keyof typeof formData.docs>;

            const uploadPromises = docKeys.map(async (key) => {
                const file = formData.docs[key];
                if (!file) return null;

                let uri: string | undefined;
                if (typeof file === 'string') {
                    uri = file;
                } else {
                    uri = file.uri;
                }

                if (!uri) return null;

                const fileName = `${user.uid}_${key}_${Date.now()}`;
                const path = `applications/${user.uid}/${fileName}`;
                const url = await uploadFile(uri, path);
                return { key, url };
            });

            const results = await Promise.all(uploadPromises);

            const uploadedUrls = results.reduce((acc, result) => {
                if (result) {
                    acc[result.key] = result.url;
                }
                return acc;
            }, {} as any);

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
            showAlert(
                'Application Submitted!',
                'Our verification team will review your details and contact you within 24 hours.',
                'success',
                'Great!',
                () => router.replace('/home')
            );
        } catch (error: any) {
            console.error('Submission error:', error);
            showAlert('Submission Failed', 'Something went wrong while saving your application. Please try again.', 'error');
        } finally {
            setLoadingLocation(false);
        }
    };

    const pickDocument = async (key: keyof typeof formData.docs) => {
        showAlert(
            'Upload Document',
            'Choose your upload method',
            'info',
            'Cancel',
            () => { },
            'Upload Image',
            'Camera / Gallery',
            async () => {
                const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (status !== 'granted') {
                    showAlert('Permission Needed', 'We need access to your gallery to upload documents.', 'warning');
                    return;
                }
                const result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    allowsEditing: true,
                    quality: 0.5,
                });
                if (!result.canceled) {
                    const asset = result.assets[0];
                    setFormData(prev => ({
                        ...prev,
                        docs: {
                            ...prev.docs,
                            [key]: {
                                uri: asset.uri,
                                type: 'image',
                                name: asset.fileName || 'image.jpg'
                            }
                        }
                    }));
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                }
            },
            'Upload PDF',
            'Select Document',
            async () => {
                const result = await DocumentPicker.getDocumentAsync({
                    type: 'application/pdf',
                    copyToCacheDirectory: true,
                });
                if (!result.canceled) {
                    const asset = result.assets[0];
                    setFormData(prev => ({
                        ...prev,
                        docs: {
                            ...prev.docs,
                            [key]: {
                                uri: asset.uri,
                                type: 'pdf',
                                name: asset.name
                            }
                        }
                    }));
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                }
            }
        );
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
                showAlert('Permission Denied', 'Please allow location access to use this feature.', 'warning');
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
            showAlert('Error', 'Could not fetch your location. Please type manually.', 'error');
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
                        color: errors.includes(key) ||
                            ((key === 'pan' && value.length === 10 && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value)) ||
                                (key === 'aadhaar' && value.replace(/ /g, '').length === 12 && !/^\d{12}$/.test(value.replace(/ /g, ''))))
                            ? '#000000'
                            : Colors[colorScheme].text,
                        borderColor: errors.includes(key) ||
                            ((key === 'pan' && value.length === 10 && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value)) ||
                                (key === 'aadhaar' && value.replace(/ /g, '').length === 12 && !/^\d{12}$/.test(value.replace(/ /g, ''))))
                            ? '#000000'
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

                    if (errors.includes(key)) {
                        setErrors(errors.filter(e => e !== key));
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
                    if (key === 'profession' && formData.occupation === 'Self-Employed') {
                        if (text.length > 0) {
                            const filtered = INDIAN_PROFESSIONS.filter(p =>
                                p.toLowerCase().includes(text.toLowerCase())
                            );
                            setProfessionSuggestions(filtered);
                        } else {
                            setProfessionSuggestions(INDIAN_PROFESSIONS);
                        }
                    }
                    if (key === 'businessNature' && formData.occupation === 'Business') {
                        if (text.length > 0) {
                            const filtered = BUSINESS_NATURE_TYPES.filter(b =>
                                b.toLowerCase().includes(text.toLowerCase())
                            );
                            setBusinessNatureSuggestions(filtered);
                        } else {
                            setBusinessNatureSuggestions(BUSINESS_NATURE_TYPES);
                        }
                    }
                    if (key === 'societyName') {
                        if (text.length > 0) {
                            const filtered = INDIAN_SOCIETIES.filter(s =>
                                s.toLowerCase().includes(text.toLowerCase())
                            );
                            setSocietySuggestions(filtered);
                        } else {
                            setSocietySuggestions(INDIAN_SOCIETIES);
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
                    if (key === 'profession' && formData.occupation === 'Self-Employed') {
                        setProfessionSuggestions(INDIAN_PROFESSIONS);
                    }
                    if (key === 'businessNature' && formData.occupation === 'Business') {
                        setBusinessNatureSuggestions(BUSINESS_NATURE_TYPES);
                    }
                    if (key === 'societyName') {
                        setSocietySuggestions(INDIAN_SOCIETIES);
                    }
                }}
                placeholder={placeholder}
                placeholderTextColor="#999"
                keyboardType={keyboardType}
                maxLength={maxLength}
                autoCapitalize={key === 'pan' ? 'characters' : 'none'}
            />
            {key === 'pan' && value.length === 10 && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value) && (
                <ThemedText style={{ color: '#000000', fontSize: 12, marginTop: 4, fontWeight: '600' }}>
                    Invalid PAN format (e.g. ABCDE1234F)
                </ThemedText>
            )}
            {key === 'aadhaar' && value.replace(/ /g, '').length === 12 && !/^\d{12}$/.test(value.replace(/ /g, '')) && (
                <ThemedText style={{ color: '#000000', fontSize: 12, marginTop: 4, fontWeight: '600' }}>
                    Invalid Aadhaar format (12 digits required)
                </ThemedText>
            )}
            {key === 'developerName' && developerSuggestions.length > 0 && (
                <View style={[styles.suggestionsContainer, { borderColor: Colors[colorScheme].border, backgroundColor: Colors[colorScheme].surface, maxHeight: 200, zIndex: 9999 }]}>
                    <ScrollView keyboardShouldPersistTaps="always" nestedScrollEnabled={true}>
                        {developerSuggestions.map((item) => (
                            <TouchableOpacity
                                key={item}
                                style={[styles.suggestionItem, { borderBottomColor: Colors[colorScheme].border + '20', borderBottomWidth: 1 }]}
                                onPress={() => {
                                    setFormData({ ...formData, developerName: item });
                                    setDeveloperSuggestions([]);
                                }}
                            >
                                <ThemedText style={{ color: item === 'Other' ? '#000000' : Colors[colorScheme].text, fontWeight: item === 'Other' ? '700' : '400' }}>
                                    {item}
                                </ThemedText>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}
            {key === 'company' && companySuggestions.length > 0 && formData.occupation === 'Salaried' && (
                <View style={[styles.suggestionsContainer, { borderColor: Colors[colorScheme].border, backgroundColor: Colors[colorScheme].surface, maxHeight: 200, zIndex: 9999 }]}>
                    <ScrollView keyboardShouldPersistTaps="always" nestedScrollEnabled={true}>
                        {companySuggestions.map((item) => (
                            <TouchableOpacity
                                key={item}
                                style={[styles.suggestionItem, { borderBottomColor: Colors[colorScheme].border + '20', borderBottomWidth: 1 }]}
                                onPress={() => {
                                    setFormData({ ...formData, company: item });
                                    setCompanySuggestions([]);
                                }}
                            >
                                <ThemedText style={{ color: item === 'Other' ? '#000000' : Colors[colorScheme].text, fontWeight: item === 'Other' ? '700' : '400' }}>
                                    {item}
                                </ThemedText>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}
            {key === 'industry' && industrySuggestions.length > 0 && formData.occupation === 'Salaried' && (
                <View style={[styles.suggestionsContainer, { borderColor: Colors[colorScheme].border, backgroundColor: Colors[colorScheme].surface, maxHeight: 200, zIndex: 9999 }]}>
                    <ScrollView keyboardShouldPersistTaps="always" nestedScrollEnabled={true}>
                        {industrySuggestions.map((item) => (
                            <TouchableOpacity
                                key={item}
                                style={[styles.suggestionItem, { borderBottomColor: Colors[colorScheme].border + '20', borderBottomWidth: 1 }]}
                                onPress={() => {
                                    setFormData({ ...formData, industry: item });
                                    setIndustrySuggestions([]);
                                }}
                            >
                                <ThemedText style={{ color: item === 'Other' ? '#000000' : Colors[colorScheme].text, fontWeight: item === 'Other' ? '700' : '400' }}>
                                    {item}
                                </ThemedText>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}
            {key === 'profession' && professionSuggestions.length > 0 && formData.occupation === 'Self-Employed' && (
                <View style={[styles.suggestionsContainer, { borderColor: Colors[colorScheme].border, backgroundColor: Colors[colorScheme].surface, maxHeight: 200, zIndex: 9999 }]}>
                    <ScrollView keyboardShouldPersistTaps="always" nestedScrollEnabled={true}>
                        {professionSuggestions.map((item) => (
                            <TouchableOpacity
                                key={item}
                                style={[styles.suggestionItem, { borderBottomColor: Colors[colorScheme].border + '20', borderBottomWidth: 1 }]}
                                onPress={() => {
                                    setFormData({ ...formData, profession: item });
                                    setProfessionSuggestions([]);
                                }}
                            >
                                <ThemedText style={{ color: item === 'Other' ? '#000000' : Colors[colorScheme].text, fontWeight: item === 'Other' ? '700' : '400' }}>
                                    {item}
                                </ThemedText>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}
            {key === 'businessNature' && businessNatureSuggestions.length > 0 && formData.occupation === 'Business' && (
                <View style={[styles.suggestionsContainer, { borderColor: Colors[colorScheme].border, backgroundColor: Colors[colorScheme].surface, maxHeight: 200, zIndex: 9999 }]}>
                    <ScrollView keyboardShouldPersistTaps="always" nestedScrollEnabled={true}>
                        {businessNatureSuggestions.map((item) => (
                            <TouchableOpacity
                                key={item}
                                style={[styles.suggestionItem, { borderBottomColor: Colors[colorScheme].border + '20', borderBottomWidth: 1 }]}
                                onPress={() => {
                                    setFormData({ ...formData, businessNature: item });
                                    setBusinessNatureSuggestions([]);
                                }}
                            >
                                <ThemedText style={{ color: item === 'Other' ? '#000000' : Colors[colorScheme].text, fontWeight: item === 'Other' ? '700' : '400' }}>
                                    {item}
                                </ThemedText>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}
            {key === 'societyName' && societySuggestions.length > 0 && (
                <View style={[styles.suggestionsContainer, { borderColor: Colors[colorScheme].border, backgroundColor: Colors[colorScheme].surface, maxHeight: 200, zIndex: 9999 }]}>
                    <ScrollView keyboardShouldPersistTaps="always" nestedScrollEnabled={true}>
                        {societySuggestions.map((item) => (
                            <TouchableOpacity
                                key={item}
                                style={[styles.suggestionItem, { borderBottomColor: Colors[colorScheme].border + '20', borderBottomWidth: 1 }]}
                                onPress={() => {
                                    setFormData({ ...formData, societyName: item });
                                    setSocietySuggestions([]);
                                }}
                            >
                                <ThemedText style={{ color: item === 'Other' ? '#000000' : Colors[colorScheme].text, fontWeight: item === 'Other' ? '700' : '400' }}>
                                    {item}
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
                <View style={[styles.inputWrapper, { borderColor: errors.includes('dob') ? '#000000' : Colors[colorScheme].border, backgroundColor: Colors[colorScheme].surface, flexDirection: 'row', alignItems: 'center' }]}>
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
                            style={[styles.chip, formData.gender === g && styles.chipSelected, { borderColor: errors.includes('gender') && !formData.gender ? '#000000' : Colors[colorScheme].border }]}
                            onPress={() => {
                                setFormData({ ...formData, gender: g });
                                setErrors(errors.filter(e => e !== 'gender'));
                            }}
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
                            <ActivityIndicator size="small" color="#000000" />
                        ) : (
                            <>
                                <Ionicons name="location" size={14} color="#000000" />
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
                            color: errors.includes('address') ? '#000000' : Colors[colorScheme].text,
                            borderColor: errors.includes('address') ? '#000000' : Colors[colorScheme].border,
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
                    color={formData.isSameAddress ? "#000000" : "#999"}
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
                                <ActivityIndicator size="small" color="#000000" />
                            ) : (
                                <>
                                    <Ionicons name="location" size={14} color="#000000" />
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
                                color: errors.includes('permanentAddress') ? '#000000' : Colors[colorScheme].text,
                                borderColor: errors.includes('permanentAddress') ? '#000000' : Colors[colorScheme].border,
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
                    {renderInput('Profession', formData.profession, 'profession', 'Search or select profession')}
                    {formData.profession === 'Other' && (
                        <Animated.View entering={FadeInRight}>
                            {renderInput('Specify Profession', formData.otherProfessionName, 'otherProfessionName', 'Type your profession')}
                        </Animated.View>
                    )}
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
                    {renderInput('Nature of Business', formData.businessNature, 'businessNature', 'Search or select business type')}
                    {formData.businessNature === 'Other' && (
                        <Animated.View entering={FadeInRight}>
                            {renderInput('Specify Business Nature', formData.otherBusinessNature, 'otherBusinessNature', 'Type your business nature')}
                        </Animated.View>
                    )}
                    {renderInput('Annual Turnover (₹)', formData.annualTurnover, 'annualTurnover', 'Enter yearly turnover', 'numeric')}
                    <View style={[styles.rowWrap, { marginTop: -12, marginBottom: 20 }]}>
                        {[
                            { label: '< 10L', value: '< 10 Lakh' },
                            { label: '10L+', value: '10 Lakh+' },
                            { label: '50L+', value: '50 Lakh+' },
                            { label: '1Cr+', value: '1 Crore+' },
                            { label: '5Cr+', value: '5 Crore+' },
                            { label: '10Cr+', value: '10 Crore+' },
                            { label: '50Cr+', value: '50 Crore+' }
                        ].map((t) => (
                            <TouchableOpacity
                                key={t.label}
                                style={[styles.chip, { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 10, backgroundColor: Colors[colorScheme].surface, borderColor: Colors[colorScheme].border, marginBottom: 8 }]}
                                onPress={() => setFormData({ ...formData, annualTurnover: t.value })}
                            >
                                <ThemedText style={{ fontSize: 11, fontWeight: '700', color: Colors[colorScheme].tint }}>{t.label}</ThemedText>
                            </TouchableOpacity>
                        ))}
                    </View>
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
                        color={formData.hasExistingLoan ? "#000000" : "#999"}
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
                <ThemedText style={styles.label}>
                    {params.type ? 'Loan Type (Pre-selected)' : 'Select Loan Type'}
                </ThemedText>
                {params.type ? (
                    // Show read-only selected loan type with info
                    <View style={[
                        styles.input,
                        {
                            backgroundColor: Colors[colorScheme].surface,
                            borderColor: Colors[colorScheme].tint,
                            borderWidth: 1.5,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            paddingVertical: 16
                        }
                    ]}>
                        <ThemedText style={{ fontSize: 16, fontWeight: '600', color: Colors[colorScheme].tint }}>
                            {getLoanTypeDisplay(formData.loanType)}
                        </ThemedText>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Ionicons name="checkmark-circle" size={20} color={Colors[colorScheme].tint} />
                            <ThemedText style={{ fontSize: 12, color: '#999', fontStyle: 'italic' }}>Selected from home</ThemedText>
                        </View>
                    </View>
                ) : (
                    // Show selectable loan type options
                    <View style={styles.rowWrap}>
                        {['Construction', 'Renovation', 'Flat Buying', 'LAP'].map((type) => (
                            <TouchableOpacity
                                key={type}
                                style={[
                                    styles.chip,
                                    formData.loanType === type && styles.chipSelected,
                                    { borderColor: Colors[colorScheme].border }
                                ]}
                                onPress={() => setFormData({ ...formData, loanType: type })}
                            >
                                <ThemedText style={[
                                    styles.chipText,
                                    formData.loanType === type && styles.chipTextSelected
                                ]}>{type}</ThemedText>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
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
            <View style={[styles.rowWrap, { marginTop: -12, marginBottom: 20 }]}>
                {['5 Yr', '10 Yr', '15 Yr', '20 Yr', '25 Yr', '30 Yr'].map((val) => (
                    <TouchableOpacity
                        key={val}
                        style={[styles.chip, { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 10, backgroundColor: Colors[colorScheme].surface, borderColor: Colors[colorScheme].border }]}
                        onPress={() => setFormData({ ...formData, tenure: val.split(' ')[0] })}
                    >
                        <ThemedText style={{ fontSize: 11, fontWeight: '700', color: Colors[colorScheme].tint }}>{val}</ThemedText>
                    </TouchableOpacity>
                ))}
            </View>
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

            {formData.loanType === 'Flat Buying' && (
                <Animated.View entering={FadeInRight}>
                    {renderInput('Developer Name', formData.developerName, 'developerName', 'Select developer')}
                    {formData.developerName === 'Other' && (
                        <Animated.View entering={FadeInRight}>
                            {renderInput('Specify Developer Name', formData.otherDeveloperName, 'otherDeveloperName', 'Enter developer name')}
                        </Animated.View>
                    )}
                    {renderInput('Society Name', formData.societyName, 'societyName', 'Select or search society')}
                    {formData.societyName === 'Other' && (
                        <Animated.View entering={FadeInRight}>
                            {renderInput('Specify Society Name', formData.otherSocietyName, 'otherSocietyName', 'Enter society name')}
                        </Animated.View>
                    )}
                </Animated.View>
            )}
        </Animated.View>
    );

    const renderStep5 = () => {
        const renderUploadButton = (key: keyof typeof formData.docs, title: string, subtitle: string, isFullWidth = true) => {
            const file = formData.docs[key];
            // Backward compatibility check for old string format if any exist in storage
            const isLegacyString = typeof file === 'string';
            const uri = isLegacyString ? file : file?.uri;
            const isPdf = isLegacyString ? (file as string).toLowerCase().endsWith('.pdf') : file?.type === 'pdf';
            const fileName = isLegacyString ? getFileName(file as string) : file?.name;

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
                            <View style={[styles.docPreview, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5' }]}>
                                <Ionicons name="document-text" size={30} color="#000000" />
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
                            {uri ? fileName : subtitle}
                        </ThemedText>
                    </View>
                    {uri && <Ionicons name="checkmark-circle" size={20} color="#000000" />}
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

    const renderStep6 = () => (
        <Animated.View entering={FadeInRight} exiting={FadeOutLeft} style={styles.stepContainer}>
            <ThemedText style={styles.sectionTitle}>Review Your Application</ThemedText>
            <ThemedText style={[styles.label, { marginBottom: 20, color: '#999' }]}>Please review all details before submitting</ThemedText>

            <ScrollView style={{ maxHeight: 500 }} showsVerticalScrollIndicator={false} nestedScrollEnabled={true}>
                {/* Personal Details */}
                <View style={[styles.reviewSection, { borderColor: Colors[colorScheme].border, backgroundColor: Colors[colorScheme].surface }]}>
                    <View style={styles.reviewSectionHeader}>
                        <ThemedText style={styles.reviewSectionTitle}>Personal Details</ThemedText>
                        <TouchableOpacity onPress={() => setStep(1)}>
                            <ThemedText style={[styles.editBtn, { color: Colors[colorScheme].tint }]}>Edit</ThemedText>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.reviewItem}>
                        <ThemedText style={styles.reviewLabel}>Name:</ThemedText>
                        <ThemedText style={styles.reviewValue}>{formData.name}</ThemedText>
                    </View>
                    <View style={styles.reviewItem}>
                        <ThemedText style={styles.reviewLabel}>Date of Birth:</ThemedText>
                        <ThemedText style={styles.reviewValue}>{formData.dob}</ThemedText>
                    </View>
                    <View style={styles.reviewItem}>
                        <ThemedText style={styles.reviewLabel}>Gender:</ThemedText>
                        <ThemedText style={styles.reviewValue}>{formData.gender}</ThemedText>
                    </View>
                    <View style={styles.reviewItem}>
                        <ThemedText style={styles.reviewLabel}>PAN:</ThemedText>
                        <ThemedText style={styles.reviewValue}>{formData.pan}</ThemedText>
                    </View>
                    <View style={styles.reviewItem}>
                        <ThemedText style={styles.reviewLabel}>Aadhaar:</ThemedText>
                        <ThemedText style={styles.reviewValue}>{formData.aadhaar}</ThemedText>
                    </View>
                </View>

                {/* Contact Information */}
                <View style={[styles.reviewSection, { borderColor: Colors[colorScheme].border, backgroundColor: Colors[colorScheme].surface }]}>
                    <View style={styles.reviewSectionHeader}>
                        <ThemedText style={styles.reviewSectionTitle}>Contact Information</ThemedText>
                        <TouchableOpacity onPress={() => setStep(2)}>
                            <ThemedText style={[styles.editBtn, { color: Colors[colorScheme].tint }]}>Edit</ThemedText>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.reviewItem}>
                        <ThemedText style={styles.reviewLabel}>Email:</ThemedText>
                        <ThemedText style={styles.reviewValue}>{formData.email}</ThemedText>
                    </View>
                    <View style={styles.reviewItem}>
                        <ThemedText style={styles.reviewLabel}>Phone:</ThemedText>
                        <ThemedText style={styles.reviewValue}>{formData.phone}</ThemedText>
                    </View>
                    {formData.altPhone && (
                        <View style={styles.reviewItem}>
                            <ThemedText style={styles.reviewLabel}>Alternate Phone:</ThemedText>
                            <ThemedText style={styles.reviewValue}>{formData.altPhone}</ThemedText>
                        </View>
                    )}
                    <View style={styles.reviewItem}>
                        <ThemedText style={styles.reviewLabel}>Address:</ThemedText>
                        <ThemedText style={styles.reviewValue}>{formData.address}</ThemedText>
                    </View>
                </View>

                {/* Employment & Income */}
                <View style={[styles.reviewSection, { borderColor: Colors[colorScheme].border, backgroundColor: Colors[colorScheme].surface }]}>
                    <View style={styles.reviewSectionHeader}>
                        <ThemedText style={styles.reviewSectionTitle}>Employment & Income</ThemedText>
                        <TouchableOpacity onPress={() => setStep(3)}>
                            <ThemedText style={[styles.editBtn, { color: Colors[colorScheme].tint }]}>Edit</ThemedText>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.reviewItem}>
                        <ThemedText style={styles.reviewLabel}>Occupation:</ThemedText>
                        <ThemedText style={styles.reviewValue}>{formData.occupation}</ThemedText>
                    </View>
                    {formData.occupation === 'Salaried' && (
                        <>
                            <View style={styles.reviewItem}>
                                <ThemedText style={styles.reviewLabel}>Company:</ThemedText>
                                <ThemedText style={styles.reviewValue}>{formData.company === 'Other' ? formData.otherCompanyName : formData.company}</ThemedText>
                            </View>
                            <View style={styles.reviewItem}>
                                <ThemedText style={styles.reviewLabel}>Industry:</ThemedText>
                                <ThemedText style={styles.reviewValue}>{formData.industry === 'Other' ? formData.otherIndustryName : formData.industry}</ThemedText>
                            </View>
                            <View style={styles.reviewItem}>
                                <ThemedText style={styles.reviewLabel}>Experience:</ThemedText>
                                <ThemedText style={styles.reviewValue}>{formData.experience} years</ThemedText>
                            </View>
                        </>
                    )}
                    {formData.occupation === 'Self-Employed' && (
                        <>
                            <View style={styles.reviewItem}>
                                <ThemedText style={styles.reviewLabel}>Profession:</ThemedText>
                                <ThemedText style={styles.reviewValue}>{formData.profession === 'Other' ? formData.otherProfessionName : formData.profession}</ThemedText>
                            </View>
                            <View style={styles.reviewItem}>
                                <ThemedText style={styles.reviewLabel}>Experience:</ThemedText>
                                <ThemedText style={styles.reviewValue}>{formData.experience} years</ThemedText>
                            </View>
                        </>
                    )}
                    {formData.occupation === 'Business' && (
                        <>
                            <View style={styles.reviewItem}>
                                <ThemedText style={styles.reviewLabel}>Business Name:</ThemedText>
                                <ThemedText style={styles.reviewValue}>{formData.company}</ThemedText>
                            </View>
                            <View style={styles.reviewItem}>
                                <ThemedText style={styles.reviewLabel}>Nature of Business:</ThemedText>
                                <ThemedText style={styles.reviewValue}>{formData.businessNature === 'Other' ? formData.otherBusinessNature : formData.businessNature}</ThemedText>
                            </View>
                            <View style={styles.reviewItem}>
                                <ThemedText style={styles.reviewLabel}>Annual Turnover:</ThemedText>
                                <ThemedText style={styles.reviewValue}>₹{formData.annualTurnover}</ThemedText>
                            </View>
                            <View style={styles.reviewItem}>
                                <ThemedText style={styles.reviewLabel}>Years in Business:</ThemedText>
                                <ThemedText style={styles.reviewValue}>{formData.yearsInBusiness} years</ThemedText>
                            </View>
                        </>
                    )}
                    <View style={styles.reviewItem}>
                        <ThemedText style={styles.reviewLabel}>Monthly Income:</ThemedText>
                        <ThemedText style={styles.reviewValue}>₹{formData.monthlyIncome}</ThemedText>
                    </View>
                </View>

                {/* Loan Details */}
                <View style={[styles.reviewSection, { borderColor: Colors[colorScheme].border, backgroundColor: Colors[colorScheme].surface }]}>
                    <View style={styles.reviewSectionHeader}>
                        <ThemedText style={styles.reviewSectionTitle}>Loan Details</ThemedText>
                        <TouchableOpacity onPress={() => setStep(4)}>
                            <ThemedText style={[styles.editBtn, { color: Colors[colorScheme].tint }]}>Edit</ThemedText>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.reviewItem}>
                        <ThemedText style={styles.reviewLabel}>Loan Type:</ThemedText>
                        <ThemedText style={styles.reviewValue}>{getLoanTypeDisplay(formData.loanType)}</ThemedText>
                    </View>
                    <View style={styles.reviewItem}>
                        <ThemedText style={styles.reviewLabel}>Loan Amount:</ThemedText>
                        <ThemedText style={styles.reviewValue}>₹{formData.loanAmount}</ThemedText>
                    </View>
                    <View style={styles.reviewItem}>
                        <ThemedText style={styles.reviewLabel}>Tenure:</ThemedText>
                        <ThemedText style={styles.reviewValue}>{formData.tenure} years</ThemedText>
                    </View>
                    <View style={styles.reviewItem}>
                        <ThemedText style={styles.reviewLabel}>Property Value:</ThemedText>
                        <ThemedText style={styles.reviewValue}>₹{formData.propertyValue}</ThemedText>
                    </View>
                    {formData.loanType === 'Flat Buying Loan' && (
                        <View style={styles.reviewItem}>
                            <ThemedText style={styles.reviewLabel}>Developer:</ThemedText>
                            <ThemedText style={styles.reviewValue}>{formData.developerName === 'Other' ? formData.otherDeveloperName : formData.developerName}</ThemedText>
                        </View>
                    )}
                    {formData.loanType === 'Flat Buying Loan' && (
                        <View style={styles.reviewItem}>
                            <ThemedText style={styles.reviewLabel}>Society:</ThemedText>
                            <ThemedText style={styles.reviewValue}>{formData.societyName === 'Other' ? formData.otherSocietyName : formData.societyName}</ThemedText>
                        </View>
                    )}
                </View>

                {/* Documents */}
                <View style={[styles.reviewSection, { borderColor: Colors[colorScheme].border, backgroundColor: Colors[colorScheme].surface }]}>
                    <View style={styles.reviewSectionHeader}>
                        <ThemedText style={styles.reviewSectionTitle}>Documents Uploaded</ThemedText>
                        <TouchableOpacity onPress={() => setStep(5)}>
                            <ThemedText style={[styles.editBtn, { color: Colors[colorScheme].tint }]}>Edit</ThemedText>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.reviewItem}>
                        <ThemedText style={styles.reviewLabel}>PAN Card:</ThemedText>
                        <ThemedText style={styles.reviewValue}>{formData.docs.panFront && formData.docs.panBack ? '✅ Uploaded' : '❌ Missing'}</ThemedText>
                    </View>
                    <View style={styles.reviewItem}>
                        <ThemedText style={styles.reviewLabel}>Aadhaar Card:</ThemedText>
                        <ThemedText style={styles.reviewValue}>{formData.docs.aadhaarFront && formData.docs.aadhaarBack ? '✅ Uploaded' : '❌ Missing'}</ThemedText>
                    </View>
                    <View style={styles.reviewItem}>
                        <ThemedText style={styles.reviewLabel}>Income Proof:</ThemedText>
                        <ThemedText style={styles.reviewValue}>{formData.docs.income ? '✅ Uploaded' : '⚠️ Optional'}</ThemedText>
                    </View>
                    <View style={styles.reviewItem}>
                        <ThemedText style={styles.reviewLabel}>Property Docs:</ThemedText>
                        <ThemedText style={styles.reviewValue}>{formData.docs.property ? '✅ Uploaded' : '⚠️ Optional'}</ThemedText>
                    </View>
                </View>
            </ScrollView>
        </Animated.View>
    );

    return (
        <ThemedView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ flexGrow: 1, paddingBottom: 300 }}
                    keyboardShouldPersistTaps="always"
                    nestedScrollEnabled={true}
                >
                    <View style={[styles.header, { paddingTop: 60, backgroundColor: '#FFFFFF' }]}>
                        <View style={styles.headerTopRow}>
                            <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
                                <Ionicons name="arrow-back" size={24} color="#000000" />
                            </TouchableOpacity>
                            <ThemedText style={[styles.headerTitle, { flex: 1 }]}>Apply for Loan</ThemedText>
                            <TouchableOpacity style={[styles.backBtn, { backgroundColor: 'rgba(0,0,0,0.05)' }]} onPress={handleClearForm}>
                                <Ionicons name="trash-outline" size={22} color="#000000" />
                            </TouchableOpacity>
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
                    </View>

                    <View style={styles.formContent}>
                        <View style={{ flex: 1 }}>
                            {step === 1 && renderStep1()}
                            {step === 2 && renderStep2()}
                            {step === 3 && renderStep3()}
                            {step === 4 && renderStep4()}
                            {step === 5 && renderStep5()}
                            {step === 6 && renderStep6()}

                            {step === 6 && (
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
                                        <ActivityIndicator size="small" color="#FFFFFF" />
                                    ) : (
                                        <Ionicons name={step === totalSteps ? "checkmark-circle" : "arrow-forward"} size={20} color="#FFFFFF" />
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
            <CustomAlert
                visible={customAlert.visible}
                title={customAlert.title}
                message={customAlert.message}
                type={customAlert.type}
                primaryButtonText={customAlert.primaryText}
                secondaryButtonText={customAlert.secondaryText}
                secondaryButtonDetail={customAlert.secondaryDetail}
                ternaryButtonText={customAlert.ternaryText}
                ternaryButtonDetail={customAlert.ternaryDetail}
                onSecondaryAction={customAlert.onSecondary}
                onTernaryAction={customAlert.onTernary}
                onClose={() => {
                    customAlert.onPrimary();
                    setCustomAlert({ ...customAlert, visible: false });
                }}
            />
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
        color: '#000000',
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
        backgroundColor: '#000000',
    },
    progressText: {
        color: '#000000',
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
        color: '#000000',
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
        backgroundColor: '#000000',
        borderColor: '#000000',
    },
    chipText: {
        fontSize: 14,
        fontWeight: '600',
    },
    chipTextSelected: {
        color: '#FFFFFF',
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
        backgroundColor: '#000000',
        shadowColor: '#000000',
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
        color: '#FFFFFF',
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
        backgroundColor: '#F9F9F9',
        borderColor: '#000000',
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
        backgroundColor: '#F6F6F6',
        borderRadius: 8,
    },
    locationBtnText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#000000',
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
    reviewSection: {
        marginBottom: 20,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
    },
    reviewSectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    reviewSectionTitle: {
        fontSize: 16,
        fontWeight: '700',
    },
    editBtn: {
        fontSize: 14,
        fontWeight: '600',
    },
    reviewItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingVertical: 8,
    },
    reviewLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#666',
        flex: 1,
    },
    reviewValue: {
        fontSize: 14,
        fontWeight: '600',
        flex: 1.5,
        textAlign: 'right',
    },
});
