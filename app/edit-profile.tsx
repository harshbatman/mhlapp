import { CustomAlert } from '@/components/CustomAlert';
import { AuthService } from '@/utils/auth';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { auth, db, storage } from '@/utils/firebase';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ThemeType } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function EditProfileScreen() {
    const colorScheme = (useColorScheme() ?? 'light') as ThemeType;
    const router = useRouter();

    // User profile state
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [name, setName] = useState('Harsh Mahto');
    const [phone, setPhone] = useState('9876543210');
    const [email, setEmail] = useState('harsh.mahto@example.com');
    const [address, setAddress] = useState('');
    const [loadingLocation, setLoadingLocation] = useState(false);
    const [alertConfig, setAlertConfig] = useState({
        visible: false,
        title: '',
        message: '',
        type: 'info' as 'info' | 'error' | 'success' | 'warning',
        primaryText: 'OK',
        onPrimary: () => { }
    });

    const showAlert = (title: string, message: string, type: 'info' | 'error' | 'success' | 'warning' = 'info', onPrimary: () => void = () => { }) => {
        setAlertConfig({ visible: true, title, message, type, primaryText: 'OK', onPrimary });
    };

    useEffect(() => {
        const loadProfile = async () => {
            const user = auth.currentUser;
            let session = await AuthService.getSession();
            if (user) {
                const synced = await AuthService.syncProfile(user.uid);
                if (synced) session = synced;
            }
            if (session) {
                if (session.profileImage) setProfileImage(session.profileImage);
                if (session.name) setName(session.name);
                if (session.phone) setPhone(session.phone);
                if (session.email) setEmail(session.email);
                if (session.address) setAddress(session.address);
            }
        };
        loadProfile();
    }, []);

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            showAlert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!', 'warning');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            setProfileImage(result.assets[0].uri);
        }
    };

    const fetchLocation = async () => {
        try {
            setLoadingLocation(true);
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                showAlert('Permission Denied', 'Permission to access location was denied', 'warning');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            let [addressResponse] = await Location.reverseGeocodeAsync({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
            });

            if (addressResponse) {
                const formattedAddress = `${addressResponse.name || ''}, ${addressResponse.street || ''}, ${addressResponse.city || ''}, ${addressResponse.region || ''} ${addressResponse.postalCode || ''}`.replace(/^, /, '');
                setAddress(formattedAddress);
            }
        } catch (error) {
            showAlert('Error', 'Could not fetch location. Please try again.', 'error');
        } finally {
            setLoadingLocation(false);
        }
    };

    const handleSave = async () => {
        const user = auth.currentUser;
        if (!user) {
            showAlert('Authentication Required', 'Please log in to update your profile.', 'error');
            return;
        }

        try {
            setLoadingLocation(true);

            let photoURL = profileImage;

            // If profile image is a local URI, upload it
            if (profileImage && profileImage.startsWith('file://')) {
                const response = await fetch(profileImage);
                const blob = await response.blob();
                const storageRef = ref(storage, `profiles/${user.uid}`);
                await uploadBytes(storageRef, blob);
                photoURL = await getDownloadURL(storageRef);
            }

            const profileData = {
                name,
                phone,
                email,
                address,
                profileImage: photoURL,
                updatedAt: serverTimestamp()
            };

            await setDoc(doc(db, 'users', user.uid), profileData, { merge: true });

            // Sync with local AuthService session
            const synced = await AuthService.syncProfile(user.uid);
            if (synced) {
                showAlert('Success', 'Profile updated successfully!', 'success', () => router.back());
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            showAlert('Error', 'Failed to update profile. Please try again.', 'error');
        } finally {
            setLoadingLocation(false);
        }
    };

    return (
        <ThemedView style={styles.container}>
            <View style={[styles.header, { backgroundColor: '#F6F6F6' }]}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#000000" />
                </TouchableOpacity>
                <ThemedText style={styles.headerTitle}>Edit Profile</ThemedText>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={styles.avatarSection}>
                    <TouchableOpacity style={styles.avatarWrapper} onPress={pickImage}>
                        {profileImage ? (
                            <Image source={{ uri: profileImage }} style={styles.avatar} />
                        ) : (
                            <Ionicons name="person" size={60} color="#000000" />
                        )}
                        <View style={styles.editBadge}>
                            <Ionicons name="camera" size={16} color="#FFFFFF" />
                        </View>
                    </TouchableOpacity>
                    <ThemedText style={styles.avatarHint}>Tap to change photo</ThemedText>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <ThemedText style={styles.label}>Full Name</ThemedText>
                        <TextInput
                            style={[styles.input, { color: '#000000', borderColor: '#EEEEEE' }]}
                            value={name}
                            onChangeText={setName}
                            placeholder="Enter your name"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <ThemedText style={styles.label}>Phone Number</ThemedText>
                        <TextInput
                            style={[styles.input, { color: '#000000', borderColor: '#EEEEEE', backgroundColor: '#F9F9F9' }]}
                            value={phone}
                            editable={false}
                            keyboardType="phone-pad"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <ThemedText style={styles.label}>Email Address</ThemedText>
                        <TextInput
                            style={[styles.input, { color: '#000000', borderColor: '#EEEEEE' }]}
                            value={email}
                            onChangeText={setEmail}
                            placeholder="Enter your email"
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <ThemedText style={styles.label}>Home Address</ThemedText>
                        <View style={styles.addressContainer}>
                            <TextInput
                                style={[styles.input, styles.addressInput, { color: '#000000', borderColor: '#EEEEEE' }]}
                                value={address}
                                onChangeText={setAddress}
                                placeholder="Enter your address"
                                multiline
                                numberOfLines={3}
                            />
                            <TouchableOpacity style={styles.locationBtn} onPress={fetchLocation} disabled={loadingLocation}>
                                {loadingLocation ? (
                                    <ActivityIndicator size="small" color="#000000" />
                                ) : (
                                    <Ionicons name="location-outline" size={20} color="#000000" />
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.saveBtn, loadingLocation && { opacity: 0.7 }]}
                    onPress={handleSave}
                    disabled={loadingLocation}
                >
                    {loadingLocation ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <ThemedText style={styles.saveBtnText}>Save Changes</ThemedText>
                    )}
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>

            <CustomAlert
                visible={alertConfig.visible}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
                primaryButtonText={alertConfig.primaryText}
                onClose={() => {
                    alertConfig.onPrimary();
                    setAlertConfig({ ...alertConfig, visible: false });
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000000',
    },
    scrollContent: {
        paddingHorizontal: 20,
    },
    avatarSection: {
        alignItems: 'center',
        marginVertical: 30,
    },
    avatarWrapper: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#000000',
        position: 'relative',
    },
    avatar: {
        width: 116,
        height: 116,
        borderRadius: 58,
    },
    editBadge: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        backgroundColor: '#000000',
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#FFFFFF',
    },
    avatarHint: {
        marginTop: 12,
        fontSize: 14,
        color: '#666666',
    },
    form: {
        marginTop: 10,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#444444',
        marginBottom: 8,
        marginLeft: 4,
    },
    input: {
        height: 55,
        borderWidth: 1,
        borderRadius: 16,
        paddingHorizontal: 16,
        fontSize: 16,
        backgroundColor: '#FFFFFF',
    },
    addressContainer: {
        position: 'relative',
    },
    addressInput: {
        height: 100,
        paddingTop: 16,
        paddingRight: 50,
        textAlignVertical: 'top',
    },
    locationBtn: {
        position: 'absolute',
        right: 12,
        top: 12,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    saveBtn: {
        backgroundColor: '#000000',
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    saveBtnText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
    },
});
