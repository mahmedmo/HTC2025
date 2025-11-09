import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import BackButton from '../../components/BackButton';

const MOCK_PINS = [
    {
        id: '1',
        bottleCount: 24,
        estimatedValue: 2.40,
        status: 'available',
        createdAt: Date.now() - 3600000,
        location: '123 Main St',
    },
    {
        id: '2',
        bottleCount: 12,
        estimatedValue: 1.20,
        status: 'claimed',
        createdAt: Date.now() - 7200000,
        location: '456 Oak Ave',
    },
];

export default function MyPinsScreen()
{
    const router = useRouter();

    const handleBackPress = () =>
    {
        router.back();
    };

    const getStatusColor = (status: string) =>
    {
        switch (status)
        {
            case 'available':
                return '#10b981';
            case 'claimed':
                return '#f59e0b';
            case 'picked_up':
                return '#3b82f6';
            case 'completed':
                return '#6b7280';
            default:
                return '#6b7280';
        }
    };

    const getStatusText = (status: string) =>
    {
        return status.replace('_', ' ').toUpperCase();
    };

    const formatTime = (timestamp: number) =>
    {
        const diff = Date.now() - timestamp;
        const hours = Math.floor(diff / 3600000);

        if (hours < 1)
        {
            return 'Just now';
        }
        if (hours === 1)
        {
            return '1 hour ago';
        }
        if (hours < 24)
        {
            return `${hours} hours ago`;
        }

        const days = Math.floor(hours / 24);
        return `${days} day${days > 1 ? 's' : ''} ago`;
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <BackButton onPress={handleBackPress} />
            <Text style={styles.title}>My Pins</Text>
            <ScrollView style={styles.list}>
                {MOCK_PINS.map(pin => (
                    <View key={pin.id} style={styles.card}>
                        <View style={styles.header}>
                            <View>
                                <Text style={styles.count}>{pin.bottleCount} bottles</Text>
                                <Text style={styles.value}>${pin.estimatedValue.toFixed(2)}</Text>
                            </View>
                            <View style={[styles.badge, { backgroundColor: getStatusColor(pin.status) }]}>
                                <Text style={styles.badgeText}>{getStatusText(pin.status)}</Text>
                            </View>
                        </View>

                        <Text style={styles.location}>{pin.location}</Text>
                        <Text style={styles.time}>{formatTime(pin.createdAt)}</Text>
                    </View>
                ))}
            </ScrollView>

            <TouchableOpacity
                style={styles.button}
                onPress={() => router.push('/pages/pinner/upload')}
            >
                <Text style={styles.buttonText}>Pin Bottles</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#10b981',
        marginTop: 20,
        marginBottom: 10,
        textAlign: 'center',
    },
    list: {
        flex: 1,
        padding: 20,
    },
    card: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 12,
        marginBottom: 15,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 15,
    },
    count: {
        fontSize: 18,
        fontWeight: '700',
        color: '#374151',
    },
    value: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#10b981',
        marginTop: 5,
    },
    badge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    badgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    location: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 5,
    },
    time: {
        fontSize: 12,
        color: '#9ca3af',
    },
    button: {
        backgroundColor: '#10b981',
        padding: 18,
        margin: 20,
        borderRadius: 12,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
});
