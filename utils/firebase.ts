import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
// @ts-ignore
import { getReactNativePersistence, initializeAuth } from 'firebase/auth/react-native';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyBLI43RC_QN8LthWpN0Fe6yEg62pSIfsPo",
    authDomain: "mahto-b8626.firebaseapp.com",
    projectId: "mahto-b8626",
    storageBucket: "mahto-b8626.firebasestorage.app",
    messagingSenderId: "94425344059",
    appId: "1:94425344059:android:916e7a3e71403461f0d41e"
};

const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

const db = getFirestore(app);

export { auth, db };
