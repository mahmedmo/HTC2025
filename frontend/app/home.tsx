import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function HomeScreen()
{
    const router = useRouter();

    const selectRole = (role: 'pinner' | 'collector' | 'leaderboard') =>
    {
        if (role === 'pinner')
        {
            router.push('/pages/pinner/my-pins');
        }
        else if (role === 'leaderboard'){
            router.push('/pages/leaderboard');
        }
        else
        {
            router.push('/pages/collector/map');
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <Image 
                source={require('./pics/avatar.png')} 
                style={styles.avatar}
            />
            <Text style={styles.appName}>Bottle Ping</Text>

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.roleButton, styles.pinnerButton]}
                    onPress={() => selectRole('pinner')}
                >
                    <Text style={styles.roleTitle}>Pin</Text>
                    <Text style={styles.roleDescription}>Post bottles</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.roleButton, styles.collectorButton]}
                    onPress={() => selectRole('collector')}
                >
                    <Text style={styles.roleTitle}>Collect</Text>
                    <Text style={styles.roleDescription}>Collect bottles</Text>
                </TouchableOpacity>
            </View>
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
    backgroundImage: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
        padding: 20,
    },
    title: {
        fontSize: 80,
        marginBottom: 10,
    },
    appName: {
        fontSize: 40,
        fontWeight: '600',
        color: '#059669',
        letterSpacing: 1.5,
        marginBottom: 40,
        textTransform: 'uppercase',
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
        backgroundColor: '#10b981',
    },
    collectorButton: {
        backgroundColor: '#3b82f6',
    },
    leaderboardButton: {
        backgroundColor: '#00CED1',
    },
    roleEmoji: {
        fontSize: 48,
        marginBottom: 10,
    },
    roleTitle: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 5,
    },
    roleDescription: {
        textAlign: 'center',
        fontSize: 14,
        color: '#fff',
        opacity: 0.9,
    },
});
