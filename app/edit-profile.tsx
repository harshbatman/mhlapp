import { AuthService } from '@/utils/auth';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { auth, db, storage } from '@/utils/firebase';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, ThemeType } from '@/constants/theme';
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
            Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
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

    const getCurrentLocation = async () => {
        setLoadingLocation(true);
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Permission to access location was denied');
                setLoadingLocation(false);
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            let reverseGeocode = await Location.reverseGeocodeAsync({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            });

            if (reverseGeocode.length > 0) {
                const addr = reverseGeocode[0];
                const formattedAddr = `${addr.name || ''}, ${addr.street || ''}, ${addr.city || ''}, ${addr.region || ''}, ${addr.postalCode || ''}, ${addr.country || ''}`;
                setAddress(formattedAddr.replace(/^, /, ''));
            }
        } catch (error) {
            Alert.alert('Error', 'Could not fetch location. Please try again.');
        } finally {
            setLoadingLocation(false);
        }
    };

    const handleSave = async () => {
        const user = auth.currentUser;
        if (!user) {
            Alert.alert('Authentication Required', 'Please log in to update your profile.');
            return;
        }

        setLoadingLocation(true);
        try {
            let finalImageUrl = profileImage;

            // If profileImage is a local URI, upload it
            if (profileImage && profileImage.startsWith('file://')) {
                const response = await fetch(profileImage);
                const blob = await response.blob();
                const storageRef = ref(storage, `profiles/${user.uid}/avatar`);
                await uploadBytes(storageRef, blob);
                finalImageUrl = await getDownloadURL(storageRef);
            }

            const userData = {
                uid: user.uid,
                name,
                email,
                address,
                phone, // Already set from session or state
                profileImage: finalImageUrl,
                updatedAt: serverTimestamp(),
            };

            // Save to Firestore
            await setDoc(doc(db, 'users', user.uid), userData, { merge: true });

            // Save to Local Session
            const session = await AuthService.getSession() || {};
            await AuthService.setSession({
                ...session,
                ...userData,
                createdAt: undefined,
                updatedAt: undefined
            });

            Alert.alert('Success', 'Profile updated successfully!');
            router.back();
        } catch (error) {
            console.error('Profile update error:', error);
            Alert.alert('Error', 'Failed to update profile. Please try again.');
        } finally {
            setLoadingLocation(false);
        }
    };

    return (
        <ThemedView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? 60 : 40 }]}>
                    <View style={styles.headerTop}>
                        <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
                            <Ionicons name="close" size={24} color="#000000" />
                        </TouchableOpacity>
                        <ThemedText style={styles.headerTitle}>Edit Profile</ThemedText>
                        <TouchableOpacity style={styles.okBtn} onPress={handleSave} disabled={loadingLocation}>
                            {loadingLocation ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                                <ThemedText style={styles.okBtnText}>OK</ThemedText>
                            )}
                        </TouchableOpacity>
                    </View>

                    <View style={styles.imageSection}>
                        <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
                            {profileImage ? (
                                <Image source={{ uri: profileImage }} style={styles.avatar} />
                            ) : (
                                <View style={styles.placeholderAvatar}>
                                    <Ionicons name="person" size={50} color="#000000" />
                                </View>
                            )}
                            <View style={styles.editBadge}>
                                <Ionicons name="camera" size={20} color="#FFFFFF" />
                            </View>
                        </TouchableOpacity>
                        <ThemedText style={styles.changePhotoText}>Tap to change photo</ThemedText>
                    </View>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <ThemedText style={styles.label}>Full Name</ThemedText>
                        <TextInput
                            style={[styles.input, { backgroundColor: Colors[colorScheme].surface, color: Colors[colorScheme].text, borderColor: Colors[colorScheme].border }]}
                            value={name}
                            onChangeText={setName}
                            placeholder="Enter your name"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <ThemedText style={styles.label}>Phone Number</ThemedText>
                        <TextInput
                            style={[styles.input, { backgroundColor: Colors[colorScheme].surface, color: '#888', borderColor: Colors[colorScheme].border }]}
                            value={phone}
                            editable={false}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <ThemedText style={styles.label}>Email Address</ThemedText>
                        <TextInput
                            style={[styles.input, { backgroundColor: Colors[colorScheme].surface, color: Colors[colorScheme].text, borderColor: Colors[colorScheme].border }]}
                            value={email}
                            onChangeText={setEmail}
                            placeholder="Enter your email"
                            keyboardType="email-address"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <View style={styles.labelRow}>
                            <ThemedText style={styles.label}>Address</ThemedText>
                            <TouchableOpacity onPress={getCurrentLocation} disabled={loadingLocation}>
                                {loadingLocation ? (
                                    <ActivityIndicator size="small" color="#D32F2F" />
                                ) : (
                                    <View style={styles.locationLink}>
                                        <Ionicons name="location" size={14} color="#D32F2F" />
                                        <ThemedText style={styles.locationLinkText}>Use Current Location</ThemedText>
                                    </View>
                                )}
                            </TouchableOpacity>
                        </View>
                        <TextInput
                            style={[styles.textArea, { backgroundColor: Colors[colorScheme].surface, color: Colors[colorScheme].text, borderColor: Colors[colorScheme].border }]}
                            value={address}
                            onChangeText={setAddress}
                            placeholder="Enter your full address"
                            multiline
                            numberOfLines={4}
                        />
                    </View>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingHorizontal: 20,
        paddingBottom: 40,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30,
    },
    iconBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F6F6F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: '700',
    },
    okBtn: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        backgroundColor: '#000000',
    },
    okBtnText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 14,
    },
    imageSection: {
        alignItems: 'center',
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 4,
        borderColor: '#D32F2F',
    },
    placeholderAvatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: '#D32F2F',
    },
    editBadge: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        backgroundColor: '#000000',
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#FFFFFF',
    },
    changePhotoText: {
        color: '#FFFFFF',
        marginTop: 12,
        fontSize: 14,
        opacity: 0.8,
    },
    form: {
        padding: 24,
        gap: 20,
    },
    inputGroup: {
        gap: 8,
    },
    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        opacity: 0.7,
    },
    locationLink: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    locationLinkText: {
        color: '#D32F2F',
        fontSize: 13,
        fontWeight: '600',
    },
    input: {
        height: 56,
        borderRadius: 16,
        paddingHorizontal: 16,
        borderWidth: 1,
        fontSize: 16,
    },
    textArea: {
        height: 100,
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingTop: 16,
        borderWidth: 1,
        fontSize: 16,
        textAlignVertical: 'top',
    },
});
