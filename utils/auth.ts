import * as SecureStore from 'expo-secure-store';
import {
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut
} from 'firebase/auth';
import { auth } from './firebase';

const AUTH_KEY = 'user_session';

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
