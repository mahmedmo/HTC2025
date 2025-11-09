import { View, Text, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function SplashScreen() {
    const router = useRouter();

    useEffect(() => {
        const timeout = setTimeout(() => {
            router.replace('/home');
        }, 2000);

        return () => clearTimeout(timeout);
    }, []);

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            {/* Changed emoji to something more environment-friendly */}
            <Image 
                source={require('./pics/avatar.png')} 
                style={styles.avatar}
            />
            {/* Kept original app name for now, but consider renaming for better theme fit */}
            <Text style={styles.appName}>Bottle Ping</Text> 
            <ActivityIndicator size="large" color="#4CAF50" style={styles.loader} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    avatar:{
        width: 80,
        height: 80,
        marginBottom: 10,
        borderRadius: 40,
    },
    gradient: {
        flex: 1,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    iconContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    tree: {
        fontSize: 70,
        marginRight: -10,
    },
    bottle: {
        fontSize: 70,
    },
    // Added title style for the emoji/title text
    title: {
        fontSize: 70,
        marginBottom: 8,
        textAlign: 'center',
    },
    appName: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#047857',
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    tagline: {
        fontSize: 14,
        color: '#0891b2',
        fontWeight: '500',
        marginBottom: 40,
    },
    loaderContainer: {
        marginTop: 20,
        padding: 15,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        borderRadius: 50,
    },
    loader: {
        marginTop: 24,
    },
});