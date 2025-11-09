import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { sessionService } from '../services/session';

export default function SplashScreen() {
    const router = useRouter();

    useEffect(() =>
    {
        const checkAuth = async () =>
        {
            await new Promise(resolve => setTimeout(resolve, 1500));

            const isAuthenticated = await sessionService.isAuthenticated();
            const session = await sessionService.getSession();

            console.log('[Splash] Authentication check:', {
                isAuthenticated,
                session,
            });

            if (isAuthenticated)
            {
                console.log('[Splash] User is authenticated, navigating to home');
                router.replace('/home');
            }
            else
            {
                console.log('[Splash] User is NOT authenticated, navigating to login');
                router.replace('/pages/login');
            }
        };

        checkAuth();
    }, []);

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <Text style={styles.bottleIcon}>🍾</Text>
            <Text style={styles.appName}>Bottle Ping</Text>
            <ActivityIndicator size="large" color="#10b981" style={styles.loader} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9fafb',
        padding: 20,
    },
    bottleIcon: {
        fontSize: 80,
        marginBottom: 10,
    },
    appName: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#10b981',
        marginBottom: 40,
    },
    loader: {
        marginTop: 20,
    },
});