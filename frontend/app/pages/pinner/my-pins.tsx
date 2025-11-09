import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import BackButton from '../../components/BackButton';
import { apiService } from '../../../services/api';
import { sessionService } from '../../../services/session';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps'; 
import { Ionicons } from '@expo/vector-icons';


export default function MyPinsScreen()
{
    const router = useRouter();
    const [pins, setPins] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [dropdownVisible, setDropdownVisible] = useState(false);

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
            <View style={styles.topBar}>
                <BackButton mode='arrow' />
                
                <TouchableOpacity 
                    style={styles.profileButton}
                    onPress={() => setDropdownVisible(!dropdownVisible)}
                >
                    <Ionicons name="person-circle" size={40} color="#10b981" />
                </TouchableOpacity>

            </View>

            {dropdownVisible && (
                <><TouchableOpacity
                    style={styles.dropdownOverlay}
                    onPress={() => setDropdownVisible(false)}
                    activeOpacity={1} /><View style={styles.dropdown}>
                        <TouchableOpacity
                            style={styles.dropdownItem}
                            onPress={() => {
                                setDropdownVisible(false);
                                router.push('/pages/profile');
                            } }
                        >
                            <Ionicons name="person-outline" size={20} color="#374151" />
                            <Text style={styles.dropdownText}>Your Profile</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.dropdownItem}
                            onPress={() => {
                                setDropdownVisible(false);
                                router.push('/pages/leaderboard');
                            } }
                        >
                            <Ionicons name="trophy-outline" size={20} color="#374151" />
                            <Text style={styles.dropdownText}>Leaderboard</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                            style={styles.dropdownItem}
                            onPress={() => {
                                setDropdownVisible(false);
                                router.push('/pages/login');
                            } }
                        >
                            <Ionicons name="power-outline" size={20} color="#374151" />
                            <Text style={styles.dropdownText} onPress={handleLogout}>Log Out</Text>
                        </TouchableOpacity>
                    </View></>
            )}
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
                                    <Text style={styles.location}>{pin.location}</Text>
                                    <Text style={styles.count}>{pin.bottle_count ?? 12}</Text>
                                    <Text style={styles.count}>
                                        {pin.bottle_count ?? Math.floor(Math.random() * 10) + 1} bottles pinged {Math.floor(Math.random() * 25)} hrs ago
                                    </Text>
=                                </View>
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
    cardMap: {
        width: '100%',
        height: 150,
        borderRadius: 8,
        marginBottom: 12,
        overflow: 'hidden',
    },
    map: {
            width: '100%',
            height: 120,
    },
    dropdownOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 999,    
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    profileButton: {
        padding: 5,
        top: 5,
        right: -320,
    },
    dropdown: {
        position: 'absolute',
        top: 70,
        right: 20,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        zIndex: 1000,
        minWidth: 200,
    },
    dropdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    dropdownText: {
        marginLeft: 6,
        fontSize: 16,
        color: '#374151',
        fontWeight: '500',
    }
});
