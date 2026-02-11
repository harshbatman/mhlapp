import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import {
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    onAuthStateChanged,
    signInWithCredential,
    signInWithEmailAndPassword,
    signOut
} from 'firebase/auth';
import { auth } from './firebase';
// import { GoogleSignin } from '@react-native-google-signin/google-signin';

// Placeholder for GoogleSignin when in Expo Go
let GoogleSignin: any;
if (Constants.appOwnership !== 'expo') {
    try {
        GoogleSignin = require('@react-native-google-signin/google-signin').GoogleSignin;
    } catch (e) {
        console.warn('Google Signin native module not linked', e);
    }
} else {
    GoogleSignin = {
        configure: (config: any) => { console.log('GoogleSignin Mock: configuring', config) },
        hasPlayServices: async () => true,
        signIn: async () => {
            console.log('GoogleSignin Mock: simulate sign in');
            return { data: { idToken: 'mock-token' } };
        }
    };
}

const AUTH_KEY = 'user_session';

// Configure Google Sign-In (Only for non-Expo Go environments)
if (Constants.appOwnership !== 'expo') {
    try {
        GoogleSignin.configure({
            webClientId: '94425344059-bkb1nnbp3a5tpf65uggohvlqhov7kt4q.apps.googleusercontent.com', // From google-services.json
        });
    } catch (e) {
        console.warn('Google Signin configure error (likely in Expo Go)', e);
    }
}

// Helper to convert phone to a Firebase-compatible email
const phoneToEmail = (phone: string) => `${phone}@mahto.app`;

// Helper: Convert Firebase Error Codes to Friendly Messages
const getFriendlyErrorMessage = (error: any) => {
    const code = error.code || error.message;
    if (!code) return 'We are experiencing some technical difficulties. Please try again in a few moments.';

    switch (code) {
        case 'auth/invalid-credential':
        case 'auth/user-not-found':
        case 'auth/wrong-password':
            return 'Incorrect phone number or password. Please verify your details.';
        case 'auth/email-already-in-use':
            return 'An account with this phone number already exists. Please login.';
        case 'auth/weak-password':
            return 'For your security, please use a stronger password (at least 6 characters).';
        case 'auth/network-request-failed':
            return 'Connection error. Please check your internet and try again.';
        case 'auth/too-many-requests':
            return 'Too many attempts. For your security, this account has been temporarily disabled. Please try again later.';
        case 'auth/invalid-email':
            return 'The phone number format appears to be incorrect.';
        case 'auth/user-disabled':
            return 'This account has been disabled. Please contact support.';
        case 'auth/operation-not-allowed':
            return 'This sign-in method is currently unavailable.';
        default:
            return 'We encountered an issue processing your request. Please try again shortly.';
    }
};

export const AuthService = {
    async loginWithGoogle() {
        // Prevent crash in Expo Go
        if (Constants.appOwnership === 'expo') {
            alert('Google Login is not supported in Expo Go. Please create a Development Build to test this feature.');
            return null;
        }

        try {
            await GoogleSignin.hasPlayServices();
            const { data } = await GoogleSignin.signIn();
            const idToken = data?.idToken;
            if (!idToken) throw new Error('No ID token found');

            const credential = GoogleAuthProvider.credential(idToken);
            const userCredential = await signInWithCredential(auth, credential);
            const user = userCredential.user;

            const sessionData = {
                uid: user.uid,
                name: user.displayName,
                email: user.email,
                photo: user.photoURL,
                provider: 'google'
            };

            await this.setSession(sessionData);
            return sessionData;
        } catch (error: any) {
            console.error('Google Sign-In Error', error);
            throw new Error(getFriendlyErrorMessage(error));
        }
    },

    async login(phone: string, password: string) {
        try {
            const email = phoneToEmail(phone);
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            const sessionData = {
                uid: user.uid,
                phone: phone,
                email: user.email,
            };

            await this.setSession(sessionData);
            return sessionData;
        } catch (error: any) {
            throw new Error(getFriendlyErrorMessage(error));
        }
    },

    async register(phone: string, password: string, additionalData: any = {}) {
        try {
            const email = phoneToEmail(phone);
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            const sessionData = {
                uid: user.uid,
                phone: phone,
                ...additionalData
            };

            await this.setSession(sessionData);
            return sessionData;
        } catch (error: any) {
            throw new Error(getFriendlyErrorMessage(error));
        }
    },

    async setSession(userData: any) {
        try {
            await SecureStore.setItemAsync(AUTH_KEY, JSON.stringify(userData));
        } catch (error) {
            console.error('Error saving session', error);
        }
    },

    async getSession() {
        try {
            const session = await SecureStore.getItemAsync(AUTH_KEY);
            return session ? JSON.parse(session) : null;
        } catch (error) {
            console.error('Error getting session', error);
            return null;
        }
    },

    async logout() {
        try {
            await signOut(auth);
            await SecureStore.deleteItemAsync(AUTH_KEY);
        } catch (error) {
            console.error('Error clearing session', error);
        }
    },

    async isLoggedIn() {
        return new Promise((resolve) => {
            onAuthStateChanged(auth, async (user) => {
                if (user) {
                    resolve(true);
                } else {
                    const localSession = await this.getSession();
                    resolve(!!localSession);
                }
            });
        });
    }
};

