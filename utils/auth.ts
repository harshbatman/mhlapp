import { GoogleSignin } from '@react-native-google-signin/google-signin';
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

const AUTH_KEY = 'user_session';

// Configure Google Sign-In
GoogleSignin.configure({
    webClientId: '94425344059-bkb1nnbp3a5tpf65uggohvlqhov7kt4q.apps.googleusercontent.com', // From google-services.json
});

// Helper to convert phone to a Firebase-compatible email
const phoneToEmail = (phone: string) => `${phone}@mahto.app`;

export const AuthService = {
    async loginWithGoogle() {
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
            throw new Error(error.message || 'Google Sign-In failed');
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

