import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import BackButton from '../../components/BackButton';

export default function AcceptPinScreen()
{
    const router = useRouter();
    const params = useLocalSearchParams();
    const [timeRemaining, setTimeRemaining] = useState(30 * 60);

    const pinData = {
        id: params.pinId as string,
        latitude: parseFloat(params.latitude as string),
        longitude: parseFloat(params.longitude as string),
        bottleCount: parseInt(params.bottleCount as string),
        estimatedValue: parseFloat(params.estimatedValue as string),
    };

    useEffect(() =>
    {
        const interval = setInterval(() =>
        {
            setTimeRemaining(prev => Math.max(0, prev - 1));
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const formatTime = (seconds: number) =>
    {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const startNavigation = () =>
    {
        router.push({
            pathname: '/pages/collector/navigate-pickup',
            params: {
                pinId: pinData.id,
                latitude: pinData.latitude.toString(),
                longitude: pinData.longitude.toString(),
                bottleCount: pinData.bottleCount.toString(),
                estimatedValue: pinData.estimatedValue.toString(),
            },
        });
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <BackButton />
            <View style={styles.card}>
                <Text style={styles.emoji}>~</Text>
                <Text style={styles.title}>Pin Accepted!</Text>
                <Text style={styles.subtitle}>You have 30 minutes to collect</Text>

                <View style={styles.timerContainer}>
                    <Text style={styles.timerLabel}>Time Remaining</Text>
                    <Text style={styles.timer}>{formatTime(timeRemaining)}</Text>
                </View>

                <View style={styles.detailsContainer}>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Bottles:</Text>
                        <Text style={styles.detailValue}>{pinData.bottleCount}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Value:</Text>
                        <Text style={styles.detailValue}>${pinData.estimatedValue.toFixed(2)}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Location:</Text>
                        <Text style={styles.detailValue}>Calgary, AB</Text>
                    </View>
                </View>

                <TouchableOpacity style={styles.button} onPress={startNavigation}>
                    <Text style={styles.buttonText}>Start Navigation</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
        backgroundColor: '#f9fafb',
    },
    card: {
        backgroundColor: '#fff',
        padding: 30,
        borderRadius: 16,
        alignItems: 'center',
    },
    emoji: {
        fontSize: 64,
        marginBottom: 15,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#10b981',
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 16,
        color: '#6b7280',
        marginBottom: 25,
    },
    timerContainer: {
        alignItems: 'center',
        marginBottom: 25,
    },
    timerLabel: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 5,
    },
    timer: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#f59e0b',
    },
    detailsContainer: {
        width: '100%',
        backgroundColor: '#f9fafb',
        padding: 20,
        borderRadius: 12,
        marginBottom: 25,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    detailLabel: {
        fontSize: 16,
        color: '#6b7280',
    },
    detailValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
    },
    button: {
        backgroundColor: '#10b981',
        padding: 18,
        borderRadius: 12,
        alignItems: 'center',
        width: '100%',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
});
