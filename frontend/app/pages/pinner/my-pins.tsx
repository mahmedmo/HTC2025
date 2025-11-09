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
        <View style={styles.background}>
            {/* Decorative background elements */}
            <View style={styles.gradientTop} />
            <View style={styles.gradientBottom} />
            <View style={styles.floatingCircle1} />
            <View style={styles.floatingCircle2} />
            <View style={styles.floatingCircle3} />
            <View style={styles.floatingCircle4} />
            <View style={styles.accentShape1} />
            <View style={styles.accentShape2} />
            
            {/* Decorative dots */}
            <View style={styles.dot1} />
            <View style={styles.dot2} />
            <View style={styles.dot3} />
            <View style={styles.dot4} />
            
            <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
                <BackButton mode='arrow' />
                
                {/* Header Section */}
                <View style={styles.headerContainer}>
                    <View style={styles.headerIconContainer}>
                        <Ionicons name="location" size={40} color="#10b981" />
                    </View>
                    <Text style={styles.title}>My Pins</Text>
                    <Text style={styles.subtitle}>Your active bottle locations</Text>
                </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <View style={styles.loadingCircle}>
                        <ActivityIndicator size="large" color="#10b981" />
                    </View>
                    <Text style={styles.loadingText}>Loading your pins...</Text>
                </View>
            ) : pins.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <View style={styles.emptyIconCircle}>
                        <Ionicons name="location-outline" size={80} color="#10b981" />
                    </View>
                    <Text style={styles.emptyText}>No pins yet</Text>
                    <Text style={styles.emptySubtext}>Start by pinning some bottles!</Text>
                </View>
            ) : (
                <ScrollView 
                    style={styles.list}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContent}
                >
                    {pins.map((pin, index) => {
                        // Format the date from the database
                        const formatDate = (dateStr: string) => {
                            if (!dateStr) return 'Recently';
                            
                            try {
                                const pinDate = new Date(dateStr);
                                const now = new Date();
                                const diffMs = now.getTime() - pinDate.getTime();
                                const diffMins = Math.floor(diffMs / 60000);
                                const diffHours = Math.floor(diffMs / 3600000);
                                const diffDays = Math.floor(diffMs / 86400000);
                                
                                if (diffMins < 1) return 'Just now';
                                if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
                                if (diffHours < 24) return `${diffHours} hr${diffHours > 1 ? 's' : ''} ago`;
                                if (diffDays === 1) return '1 day ago';
                                return `${diffDays} days ago`;
                            } catch (e) {
                                console.error('Error parsing date:', e);
                                return 'Recently';
                            }
                        };
                        
                        const timeAgo = formatDate(pin.date);
                        
                        return (
                            <View key={pin.submission_id} style={styles.card}>
                                {/* Card decorations */}
                                <View style={styles.cardShimmer} />
                                <View style={styles.cardGlow} />
                                
                                <View style={styles.header}>
                                    <View style={styles.headerLeft}>
                                        <View style={styles.iconBadge}>
                                            <Ionicons name="water" size={24} color="#10b981" />
                                        </View>
                                        <View>
                                            <Text style={styles.pinName}>Bottle Collection</Text>
                                            <View style={styles.infoRow}>
                                                <Ionicons name="time" size={14} color="#94a3b8" />
                                                <Text style={styles.pinInfo}>
                                                    {timeAgo}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                    <View style={styles.badge}>
                                        <View style={styles.badgeGlow} />
                                        <Ionicons name="checkmark-circle" size={16} color="#fff" />
                                        <Text style={styles.badgeText}>ACTIVE</Text>
                                    </View>
                                </View>
                                 
                                <View style={styles.mapContainer}>
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
                                    <View style={styles.mapOverlay}>
                                        <View style={styles.locationBadge}>
                                            <Ionicons name="navigate" size={12} color="#10b981" />
                                            <Text style={styles.locationText}>Pinned Location</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        );
                    })}
                </ScrollView>
            )}

            <TouchableOpacity
                style={styles.button}
                onPress={() => router.push('/pages/pinner/upload')}
            >
                <View style={styles.buttonGradient} />
                <View style={styles.buttonContent}>
                    <Ionicons name="add-circle" size={24} color="#fff" />
                    <Text style={styles.buttonText}>Pin Bottles</Text>
                </View>
            </TouchableOpacity>
        </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        backgroundColor: '#1e293b',
        position: 'relative',
    },
    gradientTop: {
        position: 'absolute',
        top: -80,
        left: -80,
        right: -80,
        height: 350,
        backgroundColor: '#3b82f6',
        opacity: 0.08,
        borderRadius: 175,
        transform: [{ scaleX: 1.5 }],
    },
    gradientBottom: {
        position: 'absolute',
        bottom: -100,
        left: -80,
        right: -80,
        height: 400,
        backgroundColor: '#10b981',
        opacity: 0.08,
        borderRadius: 200,
        transform: [{ scaleX: 1.5 }],
    },
    floatingCircle1: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: '#10b981',
        opacity: 0.06,
        top: 100,
        right: -60,
    },
    floatingCircle2: {
        position: 'absolute',
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: '#3b82f6',
        opacity: 0.05,
        top: 250,
        left: -40,
    },
    floatingCircle3: {
        position: 'absolute',
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: '#8b5cf6',
        opacity: 0.05,
        bottom: 200,
        right: 30,
    },
    floatingCircle4: {
        position: 'absolute',
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: '#06b6d4',
        opacity: 0.06,
        bottom: -50,
        left: -50,
    },
    accentShape1: {
        position: 'absolute',
        width: 220,
        height: 220,
        backgroundColor: '#ec4899',
        opacity: 0.04,
        top: -70,
        left: -70,
        borderRadius: 110,
        transform: [{ rotate: '45deg' }],
    },
    accentShape2: {
        position: 'absolute',
        width: 190,
        height: 190,
        backgroundColor: '#f59e0b',
        opacity: 0.04,
        bottom: -60,
        right: -60,
        borderRadius: 95,
        transform: [{ rotate: '-30deg' }],
    },
    dot1: {
        position: 'absolute',
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#34d399',
        opacity: 0.4,
        top: 160,
        left: 70,
    },
    dot2: {
        position: 'absolute',
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#60a5fa',
        opacity: 0.5,
        top: 300,
        right: 90,
    },
    dot3: {
        position: 'absolute',
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#a78bfa',
        opacity: 0.4,
        bottom: 300,
        left: 50,
    },
    dot4: {
        position: 'absolute',
        width: 7,
        height: 7,
        borderRadius: 3.5,
        backgroundColor: '#fbbf24',
        opacity: 0.4,
        top: 450,
        right: 130,
    },
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    headerContainer: {
        alignItems: 'center',
        marginTop: 16,
        marginBottom: 16,
        paddingVertical: 14,
        paddingHorizontal: 16,
        backgroundColor: 'rgba(16, 185, 129, 0.12)',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(16, 185, 129, 0.25)',
    },
    headerIconContainer: {
        marginBottom: 6,
    },
    title: {
        fontSize: 30,
        fontWeight: '900',
        color: '#fff',
        marginBottom: 4,
        textShadowColor: 'rgba(16, 185, 129, 0.4)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 6,
        letterSpacing: 0.5,
    },
    subtitle: {
        fontSize: 13,
        color: '#94a3b8',
        fontWeight: '600',
        letterSpacing: 0.8,
        textTransform: 'uppercase',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 2,
        borderColor: 'rgba(16, 185, 129, 0.3)',
    },
    loadingText: {
        fontSize: 16,
        color: '#cbd5e1',
        fontWeight: '600',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyIconCircle: {
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        borderWidth: 3,
        borderColor: 'rgba(16, 185, 129, 0.3)',
        shadowColor: '#10b981',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyText: {
        fontSize: 24,
        fontWeight: '800',
        color: '#fff',
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    emptySubtext: {
        fontSize: 16,
        color: '#94a3b8',
        fontWeight: '500',
    },
    list: {
        flex: 1,
    },
    listContent: {
        paddingBottom: 16,
    },
    card: {
        backgroundColor: 'rgba(51, 65, 85, 0.5)',
        padding: 16,
        borderRadius: 18,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: 'rgba(148, 163, 184, 0.2)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
        position: 'relative',
        overflow: 'hidden',
    },
    cardShimmer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '30%',
        backgroundColor: 'rgba(255, 255, 255, 0.04)',
        borderTopLeftRadius: 18,
        borderTopRightRadius: 18,
    },
    cardGlow: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 2,
        backgroundColor: '#10b981',
        opacity: 0.3,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 14,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    iconBadge: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(16, 185, 129, 0.18)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: 'rgba(16, 185, 129, 0.35)',
    },
    pinName: {
        fontSize: 17,
        fontWeight: '800',
        color: '#fff',
        marginBottom: 5,
        letterSpacing: 0.3,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    pinInfo: {
        fontSize: 12,
        color: '#cbd5e1',
        fontWeight: '500',
        marginLeft: 2,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#10b981',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        shadowColor: '#10b981',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.4,
        shadowRadius: 6,
        elevation: 4,
        position: 'relative',
        overflow: 'hidden',
    },
    badgeGlow: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '50%',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
    },
    badgeText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 0.8,
        textShadowColor: 'rgba(0, 0, 0, 0.2)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
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
    mapContainer: {
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: 'rgba(16, 185, 129, 0.25)',
        position: 'relative',
        shadowColor: '#10b981',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
    },
    map: {
        width: '100%',
        height: 130,
    },
    mapOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 8,
        backgroundColor: 'rgba(30, 41, 59, 0.85)',
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
    },
    locationBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    locationText: {
        fontSize: 11,
        color: '#e2e8f0',
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    button: {
        backgroundColor: '#10b981',
        padding: 16,
        marginVertical: 16,
        marginHorizontal: 4,
        borderRadius: 14,
        alignItems: 'center',
        shadowColor: '#10b981',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 6,
        borderWidth: 2,
        borderColor: 'rgba(52, 211, 153, 0.4)',
        position: 'relative',
        overflow: 'hidden',
    },
    buttonGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '50%',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderTopLeftRadius: 14,
        borderTopRightRadius: 14,
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        zIndex: 1,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '800',
        letterSpacing: 0.5,
        textShadowColor: 'rgba(0, 0, 0, 0.2)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    cardMap: {
        width: '100%',
        height: 150,
        borderRadius: 8,
        marginBottom: 12,
        overflow: 'hidden',
    },
});
