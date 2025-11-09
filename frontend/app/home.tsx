import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { sessionService } from '../services/session';

export default function HomeScreen()
{
    const router = useRouter();
    const [userName, setUserName] = useState<string>('');

    useEffect(() =>
    {
        const loadUserSession = async () =>
        {
            const session = await sessionService.getSession();
            if (session)
            {
                setUserName(session.name);
            }
        };

        loadUserSession();
    }, []);

    const selectRole = (role: 'pinner' | 'collector') =>
    {
        if (role === 'pinner')
        {
            router.push('/pages/pinner/my-pins');
        }
        else
        {
            router.push('/pages/collector/map');
        }
    };

    const handleLogout = async () =>
    {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () =>
                    {
                        await sessionService.clearSession();
                        router.replace('/pages/login');
                    },
                },
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>

            <Text style={styles.title}>🍾</Text>
            <Text style={styles.appName}>Bottles Ping</Text>
            {userName && <Text style={styles.welcomeText}>Welcome, {userName}!</Text>}
            <Text style={styles.subtitle}>Select your role</Text>

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.roleButton, styles.pinnerButton]}
                    onPress={() => selectRole('pinner')}
                >
                    <Text style={styles.roleEmoji}>📍</Text>
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
    logoutButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        backgroundColor: '#ef4444',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        zIndex: 1,
    },
    logoutButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    title: {
        fontSize: 80,
        marginBottom: 10,
    },
    appName: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#10b981',
        marginBottom: 10,
    },
    welcomeText: {
        fontSize: 18,
        color: '#374151',
        fontWeight: '600',
        marginBottom: 20,
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
