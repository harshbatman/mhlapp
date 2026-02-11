import * as SecureStore from 'expo-secure-store';

const AUTH_KEY = 'user_session';

export const AuthService = {
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

    async clearSession() {
        try {
            await SecureStore.deleteItemAsync(AUTH_KEY);
        } catch (error) {
            console.error('Error clearing session', error);
        }
    },

    async isLoggedIn() {
        const session = await this.getSession();
        return !!session;
    }
};
