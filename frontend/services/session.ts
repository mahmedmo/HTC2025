import AsyncStorage from '@react-native-async-storage/async-storage';

const SESSION_KEY = 'user_session';

interface IUserSession
{
    userId: number;
    email: string;
    name: string;
}

export const sessionService = {
    async saveSession(userId: number, email: string, name: string): Promise<void>
    {
        try
        {
            const session: IUserSession = {
                userId,
                email,
                name,
            };
            await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
            console.log('[Session] Session saved:', session);
        }
        catch (error)
        {
            console.error('[Session] Error saving session:', error);
            throw error;
        }
    },

    async getSession(): Promise<IUserSession | null>
    {
        try
        {
            const sessionData = await AsyncStorage.getItem(SESSION_KEY);
            if (sessionData)
            {
                const session = JSON.parse(sessionData);
                console.log('[Session] Session retrieved:', session);
                return session;
            }
            console.log('[Session] No session found');
            return null;
        }
        catch (error)
        {
            console.error('[Session] Error getting session:', error);
            return null;
        }
    },

    async clearSession(): Promise<void>
    {
        try
        {
            await AsyncStorage.removeItem(SESSION_KEY);
            console.log('[Session] Session cleared');
        }
        catch (error)
        {
            console.error('[Session] Error clearing session:', error);
            throw error;
        }
    },

    async isAuthenticated(): Promise<boolean>
    {
        const session = await this.getSession();
        return session !== null;
    },
};
