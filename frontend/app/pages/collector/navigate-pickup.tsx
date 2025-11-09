import { View, Text, TouchableOpacity, StyleSheet, Alert, BackHandler } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import MapView, { Marker, Polyline, UrlTile, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { MAPS_CONFIG } from '../../../config/maps';
import { getRoute } from '../../../services/routing';
import BackButton from '../../components/BackButton';

interface RoutePoint
{
    latitude: number;
    longitude: number;
}

export default function NavigatePickupScreen()
{
    const router = useRouter();
    const params = useLocalSearchParams();
    const mapRef = useRef<MapView>(null);
    const insets = useSafeAreaInsets();

    const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
    const [routeCoordinates, setRouteCoordinates] = useState<RoutePoint[]>([]);
    const [distance, setDistance] = useState<number>(0);
    const [duration, setDuration] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [timeRemaining, setTimeRemaining] = useState<number>(0);

    const pinLocation = {
        latitude: parseFloat(params.latitude as string),
        longitude: parseFloat(params.longitude as string),
    };

    const bottleCount = parseInt(params.bottleCount as string);

    useEffect(() =>
    {
        setupNavigation();
        const locationSubscription = subscribeToLocation();

        // Lock navigation - prevent back button
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            // Return true to prevent default back behavior (locked navigation)
            return true;
        });

        // Setup timer countdown
        const claimExpiry = params.claimExpiry ? parseInt(params.claimExpiry as string) : null;
        if (claimExpiry)
        {
            const remaining = Math.max(0, Math.floor((claimExpiry - Date.now()) / 1000));
            setTimeRemaining(remaining);

            const timerInterval = setInterval(() =>
            {
                setTimeRemaining((prev) =>
                {
                    if (prev <= 0)
                    {
                        clearInterval(timerInterval);
                        Alert.alert('Time Expired', 'Your claim on this pin has expired.');
                        router.back();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () =>
            {
                locationSubscription.then(sub => sub?.remove());
                backHandler.remove();
                clearInterval(timerInterval);
            };
        }

        return () =>
        {
            locationSubscription.then(sub => sub?.remove());
            backHandler.remove();
        };
    }, []);

    const setupNavigation = async () =>
    {
        try
        {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted')
            {
                Alert.alert('Permission needed', 'Location access is required for navigation');
                return;
            }

            const loc = await Location.getCurrentPositionAsync({});
            setUserLocation(loc);

            // Fetch route
            const route = await getRoute(
                {
                    latitude: loc.coords.latitude,
                    longitude: loc.coords.longitude,
                },
                pinLocation
            );

            if (route)
            {
                setRouteCoordinates(route.coordinates);
                setDistance(route.distance);
                setDuration(route.duration);

                // Zoom to show the route
                if (mapRef.current && route.coordinates.length > 0)
                {
                    mapRef.current.fitToCoordinates(route.coordinates, {
                        edgePadding: { top: 100, right: 50, bottom: 300, left: 50 },
                        animated: true,
                    });
                }
            }

            setLoading(false);
        }
        catch (error)
        {
            console.error('Navigation setup error:', error);
            Alert.alert('Error', 'Unable to setup navigation');
            setLoading(false);
        }
    };

    const subscribeToLocation = async () =>
    {
        const subscription = await Location.watchPositionAsync(
            {
                accuracy: Location.Accuracy.High,
                distanceInterval: 10,
            },
            (loc) =>
            {
                setUserLocation(loc);
            }
        );

        return subscription;
    };

    const calculateDistance = (from: RoutePoint, to: RoutePoint): number =>
    {
        const R = 6371e3; // Earth's radius in meters
        const φ1 = (from.latitude * Math.PI) / 180;
        const φ2 = (to.latitude * Math.PI) / 180;
        const Δφ = ((to.latitude - from.latitude) * Math.PI) / 180;
        const Δλ = ((to.longitude - from.longitude) * Math.PI) / 180;

        const a =
            Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    };

    const distanceToPin = userLocation
        ? calculateDistance(
              { latitude: userLocation.coords.latitude, longitude: userLocation.coords.longitude },
              pinLocation
          )
        : 0;

    const isNearby = distanceToPin <= 50;

    const formatTime = (seconds: number): string =>
    {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const centerToUser = () => {
        if (mapRef.current && userLocation) {
            mapRef.current.animateToRegion({
                latitude: userLocation.coords.latitude,
                longitude: userLocation.coords.longitude,
                latitudeDelta: 0.02,
                longitudeDelta: 0.02,
            }, 500);
        }
    };

    const confirmPickup = () =>
    {
        if (!isNearby)
        {
            return;
        }
        router.push('/pages/collector/navigate-depot');
    };

    if (loading || !userLocation)
    {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Setting up navigation...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={{
                    latitude: userLocation.coords.latitude,
                    longitude: userLocation.coords.longitude,
                    latitudeDelta: 0.02,
                    longitudeDelta: 0.02,
                }}
                showsUserLocation
                showsMyLocationButton={false}
            >
                <UrlTile
                    urlTemplate={`${MAPS_CONFIG.geoapify.tileUrl}${MAPS_CONFIG.geoapify.apiKey}`}
                    maximumZ={19}
                    tileSize={256}
                />

                {routeCoordinates.length > 0 && (
                    <Polyline
                        coordinates={routeCoordinates}
                        strokeColor="#3b82f6"
                        strokeWidth={4}
                    />
                )}

                <Marker
                    coordinate={pinLocation}
                    title="Pickup Location"
                    description={`${bottleCount} bottles`}
                >
                    <View style={styles.markerContainer}>
                        <Text style={styles.markerText}>{bottleCount}</Text>
                        <Text style={styles.markerIcon}>🍾</Text>
                    </View>
                </Marker>
            </MapView>

            <BackButton mode="cancel" onCancel={() => router.replace('/pages/collector/map')} />

            {timeRemaining > 0 && (
                <View style={[styles.timerContainer, { top: 20 + insets.top }]}>
                    <Text style={styles.timerLabel}>Time Left</Text>
                    <Text style={styles.timerValue}>{formatTime(timeRemaining)}</Text>
                </View>
            )}

            <TouchableOpacity
                style={[styles.centerButton, { right: 20, top: timeRemaining > 0 ? 90 + insets.top : 20 + insets.top }]}
                onPress={centerToUser}
            >
                <Text style={styles.centerButtonText}>📍</Text>
            </TouchableOpacity>

            <View style={styles.infoContainer}>
                <View style={styles.stat}>
                    <Text style={styles.statLabel}>Distance</Text>
                    <Text style={styles.statValue}>
                        {distanceToPin < 1000
                            ? `${Math.round(distanceToPin)}m`
                            : `${(distanceToPin / 1000).toFixed(2)}km`}
                    </Text>
                </View>
                <View style={styles.stat}>
                    <Text style={styles.statLabel}>ETA</Text>
                    <Text style={styles.statValue}>{Math.ceil(duration)} min</Text>
                </View>
            </View>

            <TouchableOpacity
                style={[styles.button, !isNearby && styles.buttonDisabled]}
                onPress={confirmPickup}
                disabled={!isNearby}
            >
                <Text style={styles.buttonText}>
                    {isNearby ? 'Confirm Pickup' : `Get within 50m (${Math.round(distanceToPin)}m away)`}
                </Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9fafb',
    },
    loadingText: {
        fontSize: 16,
        color: '#6b7280',
    },
    map: {
        flex: 1,
    },
    markerContainer: {
        alignItems: 'center',
    },
    markerIcon: {
        fontSize: 32,
    },
    markerText: {
        backgroundColor: '#10b981',
        color: '#fff',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        fontSize: 12,
        fontWeight: '700',
        marginBottom: 2,
    },
    infoContainer: {
        position: 'absolute',
        bottom: 100,
        left: 20,
        right: 20,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        flexDirection: 'row',
        justifyContent: 'space-around',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    stat: {
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 12,
        color: '#6b7280',
        marginBottom: 4,
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#10b981',
    },
    button: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        backgroundColor: '#10b981',
        padding: 18,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    buttonDisabled: {
        backgroundColor: '#9ca3af',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    timerContainer: {
        position: 'absolute',
        top: 20,
        right: 20,
        backgroundColor: '#FEF3C7',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#F59E0B',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 5,
    },
    timerLabel: {
        fontSize: 11,
        color: '#92400E',
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 2,
    },
    timerValue: {
        fontSize: 20,
        color: '#92400E',
        fontWeight: '700',
        textAlign: 'center',
        fontVariant: ['tabular-nums'],
    },
    centerButton: {
        position: 'absolute',
        right: 20,
        backgroundColor: '#FFFFFF',
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 5,
    },
    centerButtonText: {
        fontSize: 24,
    },
});
