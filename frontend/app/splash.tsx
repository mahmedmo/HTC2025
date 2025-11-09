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
        <View style={styles.container}>
            {/* Gradient overlays */}
            <View style={styles.gradientTop} />
            <View style={styles.gradientBottom} />
            
            {/* Floating decorative elements */}
            <View style={styles.floatingCircle1} />
            <View style={styles.floatingCircle2} />
            <View style={styles.floatingCircle3} />
            
            <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} edges={['top', 'bottom']}>
                <Text style={styles.bottleIcon}>🍾</Text>
                <Text style={styles.appName}>Bottles Ping</Text>
                <ActivityIndicator size="large" color="#10b981" style={styles.loader} />
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0f172a',
        padding: 20,
        position: 'relative',
        overflow: 'hidden',
    },
    bottleIcon: {
        fontSize: 80,
        marginBottom: 10,
    },
    appName: {
        fontSize: 44,
        fontWeight: '900',
        color: '#fff',
        marginBottom: 40,
        textShadowColor: 'rgba(16, 185, 129, 0.5)',
        textShadowOffset: { width: 0, height: 4 },
        textShadowRadius: 12,
        letterSpacing: 1.5,
        textAlign: 'center',
    },
    loader: {
        marginTop: 20,
    },
    gradientTop: {
        position: 'absolute',
        top: -100,
        left: -100,
        right: -100,
        height: 400,
        backgroundColor: '#1e40af',
        opacity: 0.15,
        borderRadius: 200,
        transform: [{ scaleX: 1.5 }],
    },
    gradientBottom: {
        position: 'absolute',
        bottom: -150,
        left: -100,
        right: -100,
        height: 500,
        backgroundColor: '#059669',
        opacity: 0.12,
        borderRadius: 250,
        transform: [{ scaleX: 1.5 }],
    },
    floatingCircle1: {
        position: 'absolute',
        width: 250,
        height: 250,
        borderRadius: 125,
        backgroundColor: '#3b82f6',
        opacity: 0.08,
        top: 50,
        right: -80,
        borderWidth: 2,
        borderColor: '#3b82f6',
    },
    floatingCircle2: {
        position: 'absolute',
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: '#10b981',
        opacity: 0.1,
        top: 150,
        left: -60,
    },
    floatingCircle3: {
        position: 'absolute',
        width: 220,
        height: 220,
        borderRadius: 110,
        backgroundColor: '#8b5cf6',
        opacity: 0.07,
        bottom: 100,
        left: 30,
    },
});