import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import BackButton from '../../components/BackButton';
import { apiService } from '../../../services/api';
import { sessionService } from '../../../services/session';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

export default function MyPinsScreen()
{
    const router = useRouter();
    const [pins, setPins] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() =>
        {
            loadUserPins();
        }, [])
    );

    const loadUserPins = async () =>
    {
        try
        {
            setLoading(true);
            const session = await sessionService.getSession();

            if (!session)
            {
                console.log('[MyPins] No session found');
                router.replace('/pages/login');
                return;
            }

            console.log('[MyPins] Session found:', session);
            const response = await apiService.getUserSubmissions(session.userId);

            if (response.success && response.data)
            {
                setPins(response.data.submissions);
            }
            else
            {
                console.error('[MyPins] Failed to load pins:', response.error);
            }
        }
        catch (error)
        {
            console.error('[MyPins] Error loading pins:', error);
        }
        finally
        {
            setLoading(false);
        }
    };

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
            <BackButton  mode='arrow' />
            <Text style={styles.title}>My Pins</Text>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#10b981" />
                    <Text style={styles.loadingText}>Loading your pins...</Text>
                </View>
            ) : pins.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyIcon}>📍</Text>
                    <Text style={styles.emptyText}>No pins yet</Text>
                    <Text style={styles.emptySubtext}>Start by pinning some bottles!</Text>
                </View>
            ) : (
                <ScrollView style={styles.list}>
                    {pins.map(pin => (
                        <View key={pin.submission_id} style={styles.card}>
                            <View style={styles.header}>
                                <View>
                                    <Text style={styles.count}>Bottle</Text>
                                </View>
                                <View style={[styles.badge, { backgroundColor: '#10b981' }]}>
                                    <Text style={styles.badgeText}>ACTIVE</Text>
                                </View>
                            </View>
                            
                            <View style={styles.container}>
                                <MapView
                                    style={styles.map}
                                    initialRegion={{
                                        latitude: parseFloat(pin.location.split(',')[0]),
                                        longitude: parseFloat(pin.location.split(',')[1]),
                                        latitudeDelta: 0.005,
                                        longitudeDelta: 0.005,
                                    }}
                                    scrollEnabled={false}
                                    zoomEnabled={false}
                                    rotateEnabled={false}
                                >
                                    <Marker
                                        coordinate={{
                                            latitude: parseFloat(pin.location.split(',')[0]),
                                            longitude: parseFloat(pin.location.split(',')[1]),
                                        }}
                                    />
                                </MapView>
                            </View>
                        </View>
                    ))}
                </ScrollView>
            )}

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
    cardMap: {
        width: '100%',
        height: 150,
        borderRadius: 8,
        marginBottom: 12,
        overflow: 'hidden',
    },
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    map: {
        width: '100%',
        height: 120,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#10b981',
        marginTop: 20,
        marginBottom: 10,
        textAlign: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#6b7280',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#374151',
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 16,
        color: '#6b7280',
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
        marginBottom: 8,
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
    },
    submissionId: {
        fontSize: 12,
        color: '#9ca3af',
        fontFamily: 'monospace',
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
