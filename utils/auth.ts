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
const phoneToEmail = (phone: string) => `${phone}@mahto.id`;

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
            throw new Error(error.message || 'Login failed');
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
            throw new Error(error.message || 'Registration failed');
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

