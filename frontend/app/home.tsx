import { View, Text, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
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

            <Image 
                source={require('./pics/avatar.png')} 
                style={styles.avatar}
            />
            <Text style={styles.appName}>Bottles Ping</Text>
            {userName && <Text style={styles.welcomeText}>Welcome, {userName}!</Text>}
            <Text style={styles.subtitle}>Select your role</Text>

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.roleButton, styles.pinnerButton]}
                    onPress={() => selectRole('pinner')}
                >
                    <Image 
                        source={require('./pics/ping.png')} 
                        style={styles.icon}
                    />
                    <Text style={styles.pinRoleTitle}>Ping</Text>
                    <Text style={styles.pinRoleDescription}>Post bottle location</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.roleButton, styles.collectorButton]}
                    onPress={() => selectRole('collector')}
                >
                    <Image 
                        source={require('./pics/collect.png')} 
                        style={styles.icon}
                    />
                    <Text style={styles.collectRoleTitle}>Collect</Text>
                    <Text style={styles.collectRoleDescription}>Collect bottles</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    avatar:{
        width: 160,
        height: 140,
        marginBottom: 10,
        borderRadius: 40,
    },
    icon:{
        width: 40,
        height: 50,
        marginBottom: 5,
        borderRadius: 40,
    },
    backgroundImage: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ece3e3ff',
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
    fontSize: 36,
    fontWeight: 'bold',
    color: '#047857',
    marginBottom: 50,
    letterSpacing: 0.5,
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
        padding: 20,
        borderRadius: 30, 
        alignItems: 'center',
    },
    pinnerButton: {
        backgroundColor: '#c7dee3ff',
    },
    collectorButton: {
        backgroundColor: '#b0c6eeff',
    },
    pinRoleTitle: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#079868ff',
        marginBottom: 5,
    },
    collectRoleTitle: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#1757beff',
        marginBottom: 5,
    },
    pinRoleDescription: {
        textAlign: 'center',
        fontSize: 14,
        color: '#079868ff',
        opacity: 0.9,
    },
    collectRoleDescription: {
        textAlign: 'center',
        fontSize: 14,
        color: '#1757beff',
        opacity: 0.9,
    },
});
