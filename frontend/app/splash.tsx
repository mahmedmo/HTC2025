import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';

export default function SplashScreen()
{
    const router = useRouter();
    const [showRoleSelection, setShowRoleSelection] = useState(false);

    useEffect(() =>
    {
        const timeout = setTimeout(() =>
        {
            setShowRoleSelection(true);
        }, 2000);

        return () => clearTimeout(timeout);
    }, []);

    const selectRole = (role: 'pinner' | 'collector') =>
    {
        if (role === 'pinner')
        {
            router.replace('/pages/pinner/upload');
        }
        else
        {
            router.replace('/pages/collector/map');
        }
    };

    if (!showRoleSelection)
    {
        return (
            <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
                <Text style={styles.title}>🍾</Text>
                <Text style={styles.appName}>Bottles Ping</Text>
                <ActivityIndicator size="large" color="#10b981" style={styles.loader} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <Text style={styles.title}>🍾</Text>
            <Text style={styles.appName}>Bottles Ping</Text>
            <Text style={styles.subtitle}>Select your role</Text>

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.roleButton, styles.pinnerButton]}
                    onPress={() => selectRole('pinner')}
                >
                    <Text style={styles.roleEmoji}>frontend/assets/pin.png</Text>
                    <Text style={styles.roleTitle}>Pinner</Text>
                    <Text style={styles.roleDescription}>Post bottle locations</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.roleButton, styles.collectorButton]}
                    onPress={() => selectRole('collector')}
                >
                    <Text style={styles.roleEmoji}>🚗</Text>
                    <Text style={styles.roleTitle}>Collector</Text>
                    <Text style={styles.roleDescription}>Collect and recycle</Text>
                </TouchableOpacity>
            </View>
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
    subtitle: {
        fontSize: 18,
        color: '#6b7280',
        marginBottom: 30,
    },
    buttonContainer: {
        width: '100%',
        gap: 20,
    },
    roleButton: {
        padding: 30,
        borderRadius: 12,
        alignItems: 'center',
    },
    pinnerButton: {
        backgroundColor: '#10b981',
    },
    collectorButton: {
        backgroundColor: '#3b82f6',
    },
    roleEmoji: {
        fontSize: 48,
        marginBottom: 10,
    },
    roleTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 5,
    },
    roleDescription: {
        fontSize: 14,
        color: '#fff',
        opacity: 0.9,
    },
});
