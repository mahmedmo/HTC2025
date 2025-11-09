import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { sessionService } from '../services/session';

export default function SplashScreen()
{
    const router = useRouter();

    useEffect(() =>
    {
        const checkAuth = async () =>
        {
            await new Promise(resolve => setTimeout(resolve, 1500));

            const isAuthenticated = await sessionService.isAuthenticated();

            if (isAuthenticated)
            {
                router.replace('/home');
            }
            else
            {
                router.replace('/pages/login');
            }
        };

        checkAuth();
    }, []);

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <Text style={styles.title}>🍾</Text>
            <Text style={styles.appName}>Bottles Ping</Text>
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
    title: {
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
