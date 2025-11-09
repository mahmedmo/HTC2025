import { View, Text, TouchableOpacity, StyleSheet, Alert, BackHandler } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { FontAwesome5 } from '@expo/vector-icons';
import { MAPS_CONFIG } from '../../../config/maps';
import { getRoute, TravelMode } from '../../../services/routing';
import BackButton from '../../components/BackButton';
import { apiService } from '../../../services/api';

interface RoutePoint
{
    latitude: number;
    longitude: number;
}

interface NavigationStep
{
    instruction: string;
    distance: number;
    duration: number;
    startLocation: RoutePoint;
    endLocation: RoutePoint;
    maneuver?: string;
}

export default function NavigatePickupScreen()
{
    const router = useRouter();
    const params = useLocalSearchParams();
    const mapRef = useRef<MapView>(null);
    const insets = useSafeAreaInsets();

    const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
    const [heading, setHeading] = useState<number>(0);
    const [routeCoordinates, setRouteCoordinates] = useState<RoutePoint[]>([]);
    const [navigationSteps, setNavigationSteps] = useState<NavigationStep[]>([]);
    const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
    const [distance, setDistance] = useState<number>(0);
    const [duration, setDuration] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [timeRemaining, setTimeRemaining] = useState<number>(0);
    const [travelMode, setTravelMode] = useState<TravelMode>('walking');
    const [navigationMode, setNavigationMode] = useState<boolean>(false);

    const [region, setRegion] = useState<Region>({
        latitude: 0,
        longitude: 0,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
    });

    const zoomIn = () => {
        if (userLocation) {
            const newRegion = {
                latitude: userLocation.coords.latitude,
                longitude: userLocation.coords.longitude,
                latitudeDelta: region.latitudeDelta / 2,
                longitudeDelta: region.longitudeDelta / 2,
            };
            setRegion(newRegion);
            mapRef.current?.animateToRegion(newRegion, 300);
        }
    };

    const zoomOut = () => {
        if (userLocation) {
            const newRegion = {
                latitude: userLocation.coords.latitude,
                longitude: userLocation.coords.longitude,
                latitudeDelta: region.latitudeDelta * 2,
                longitudeDelta: region.longitudeDelta * 2,
            };
            setRegion(newRegion);
            mapRef.current?.animateToRegion(newRegion, 300);
        }
    };

    const recenterMap = () => {
        if (userLocation && mapRef.current) {
            const newRegion = {
                latitude: userLocation.coords.latitude,
                longitude: userLocation.coords.longitude,
                latitudeDelta: 0.02,
                longitudeDelta: 0.02,
            };
            setRegion(newRegion);
            mapRef.current.animateToRegion(newRegion, 300);
        }
    };

    const pinLocation = {
        latitude: parseFloat(params.latitude as string),
        longitude: parseFloat(params.longitude as string),
    };

    const bottleCount = parseInt(params.bottleCount as string);

    useEffect(() =>
    {
        setupNavigation();
        const locationSubscription = subscribeToLocation();
        const headingSubscription = subscribeToHeading();

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
                headingSubscription.then(sub => sub?.remove());
                backHandler.remove();
                clearInterval(timerInterval);
            };
        }

        return () =>
        {
            locationSubscription.then(sub => sub?.remove());
            headingSubscription.then(sub => sub?.remove());
            backHandler.remove();
        };
    }, []);

    useEffect(() =>
    {
        if (userLocation)
        {
            fetchRoute();
        }
    }, [travelMode]);

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

            // Fetch route with initial travel mode (driving)
            const route = await getRoute(
                {
                    latitude: loc.coords.latitude,
                    longitude: loc.coords.longitude,
                },
                pinLocation,
                travelMode
            );

            if (route)
            {
                setRouteCoordinates(route.coordinates);
                setDistance(route.distance);
                setDuration(route.duration);
                setNavigationSteps(route.steps || []);
                setCurrentStepIndex(0);

                // Always show route overview initially
                if (mapRef.current && route.coordinates.length > 0)
                {
                    mapRef.current.fitToCoordinates(route.coordinates, {
                        edgePadding: { top: 150, right: 80, bottom: 400, left: 80 },
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

    const fetchRoute = async () =>
    {
        if (!userLocation) return;

        const route = await getRoute(
            {
                latitude: userLocation.coords.latitude,
                longitude: userLocation.coords.longitude,
            },
            pinLocation,
            travelMode
        );

        if (route)
        {
            setRouteCoordinates(route.coordinates);
            setDistance(route.distance);
            setDuration(route.duration);
            setNavigationSteps(route.steps || []);
            setCurrentStepIndex(0);

            // Show route overview when switching modes (only if not in navigation mode)
            if (!navigationMode && mapRef.current && route.coordinates.length > 0)
            {
                mapRef.current.fitToCoordinates(route.coordinates, {
                    edgePadding: { top: 150, right: 80, bottom: 400, left: 80 },
                    animated: true,
                });
            }
        }
    };

    const subscribeToLocation = async () =>
    {
        const subscription = await Location.watchPositionAsync(
            {
                accuracy: Location.Accuracy.High,
                distanceInterval: 5,
                timeInterval: 1000,
            },
            (loc) =>
            {
                setUserLocation(loc);

                // Update current step based on location
                updateCurrentStep(loc);

                // Follow user in navigation mode
                if (navigationMode && mapRef.current)
                {
                    mapRef.current.animateCamera({
                        center: {
                            latitude: loc.coords.latitude,
                            longitude: loc.coords.longitude,
                        },
                        pitch: 60,
                        heading: loc.coords.heading || heading,
                        zoom: 18,
                    }, { duration: 500 });
                }
            }
        );

        return subscription;
    };

    const subscribeToHeading = async () =>
    {
        const subscription = await Location.watchHeadingAsync((headingData) =>
        {
            setHeading(headingData.trueHeading);
        });

        return subscription;
    };

    const updateCurrentStep = (loc: Location.LocationObject) =>
    {
        if (navigationSteps.length === 0) return;

        for (let i = currentStepIndex; i < navigationSteps.length; i++)
        {
            const step = navigationSteps[i];
            const distanceToStepEnd = calculateDistance(
                { latitude: loc.coords.latitude, longitude: loc.coords.longitude },
                step.endLocation
            );

            // If within 20m of step end, move to next step
            if (distanceToStepEnd < 20 && i < navigationSteps.length - 1)
            {
                setCurrentStepIndex(i + 1);
            }
            else
            {
                break;
            }
        }
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

    const toggleNavigationMode = () =>
    {
        const newMode = !navigationMode;
        setNavigationMode(newMode);

        if (newMode && mapRef.current && userLocation)
        {
            // Switch to navigation view
            mapRef.current.animateCamera({
                center: {
                    latitude: userLocation.coords.latitude,
                    longitude: userLocation.coords.longitude,
                },
                pitch: 60,
                heading: userLocation.coords.heading || heading,
                zoom: 18,
            }, { duration: 1000 });
        }
        else if (!newMode && mapRef.current && routeCoordinates.length > 0)
        {
            // Switch back to overview
            mapRef.current.fitToCoordinates(routeCoordinates, {
                edgePadding: { top: 150, right: 80, bottom: 400, left: 80 },
                animated: true,
            });
        }
    };

    const changeTravelMode = (mode: TravelMode) =>
    {
        if (mode !== travelMode)
        {
            setTravelMode(mode);
        }
    };

    const confirmPickup = async () =>
    {
        if (!isNearby)
        {
            return;
        }

        const submissionId = params.submissionId as string;

        if (submissionId)
        {
            const result = await apiService.markPinComplete(submissionId);

            if (!result.success)
            {
                console.error('[NavigatePickup] Failed to mark pin complete:', result.error);
            }
            else
            {
                console.log('[NavigatePickup] Pin marked as complete');
            }
        }

        Alert.alert(
            'Bottles Collected!',
            `You've successfully collected ${bottleCount} bottles. Great work!`,
            [
                {
                    text: 'Done',
                    onPress: () => {
                        router.replace('/pages/collector/map');
                    },
                },
            ]
        );
    };

    const formatDistance = (meters: number): string =>
    {
        if (meters < 1000)
        {
            return `${Math.round(meters)}m`;
        }
        return `${(meters / 1000).toFixed(1)}km`;
    };

    const currentStep = navigationSteps[currentStepIndex];

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
                provider={PROVIDER_GOOGLE}
                initialRegion={{
                    latitude: userLocation.coords.latitude,
                    longitude: userLocation.coords.longitude,
                    latitudeDelta: 0.02,
                    longitudeDelta: 0.02,
                }}
                showsUserLocation
                showsMyLocationButton={false}
                showsCompass={false}
                toolbarEnabled={false}
            >
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
                        <View style={styles.pinContainer}>
                            <View style={styles.pinHead}>
                                <Text style={styles.pinIcon}>🍾</Text>
                            </View>
                            <View style={styles.pinStem} />
                            <View style={styles.pinPoint} />
                            <Text style={styles.markerText}>{bottleCount}</Text>
                        </View>
                    </View>
                </Marker>
            </MapView>
            <BackButton mode="cancel" onCancel={() => router.replace('/pages/collector/map')} />

            {timeRemaining > 0 && (
                <View style={[styles.timerContainer, { top: 20 + insets.top }]}>
                    <Text style={styles.timerText}>Time Left: {formatTime(timeRemaining)}</Text>
                </View>
            )}

            {!navigationMode && (
                <View style={[styles.travelModeContainer, { bottom: 200 }]}>
                    <TouchableOpacity
                        style={[styles.travelModeButton, travelMode === 'walking' && styles.travelModeButtonActive]}
                        onPress={() => changeTravelMode('walking')}
                    >
                        <FontAwesome5 name="walking" size={20} color={travelMode === 'walking' ? '#3b82f6' : '#6b7280'} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.travelModeButton, travelMode === 'bicycling' && styles.travelModeButtonActive]}
                        onPress={() => changeTravelMode('bicycling')}
                    >
                        <FontAwesome5 name="biking" size={20} color={travelMode === 'bicycling' ? '#3b82f6' : '#6b7280'} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.travelModeButton, travelMode === 'driving' && styles.travelModeButtonActive]}
                        onPress={() => changeTravelMode('driving')}
                    >
                        <FontAwesome5 name="car" size={20} color={travelMode === 'driving' ? '#3b82f6' : '#6b7280'} />
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                        style={styles.zoomButton}
                        onPress={zoomIn}
                    >
                        <Text style={styles.zoomButtonText}>+</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.zoomButton}
                        onPress={zoomOut}
                    >
                        <Text style={styles.zoomButtonText}>−</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.zoomButton, styles.recenterButton]}
                        onPress={recenterMap}
                    >
                        <Text style={styles.recenterButtonText}>⌖</Text>
                    </TouchableOpacity>
                </View>
            )}

            {navigationMode && currentStep && (
                <View style={[styles.navigationInstructionContainer, { top: timeRemaining > 0 ? 90 + insets.top : 20 + insets.top }]}>
                    <View style={styles.instructionHeader}>
                        <Text style={styles.instructionDistance}>{formatDistance(currentStep.distance)}</Text>
                        <Text style={styles.instructionText}>{currentStep.instruction}</Text>
                    </View>
                    <View style={styles.instructionFooter}>
                        <Text style={styles.instructionSubtext}>
                            Then {navigationSteps.length - currentStepIndex - 1} more {navigationSteps.length - currentStepIndex - 1 === 1 ? 'step' : 'steps'}
                        </Text>
                    </View>
                </View>
            )}

            <View style={styles.infoContainer}>
                <View style={styles.stat}>
                    <Text style={styles.statLabel}>Distance</Text>
                    <Text style={styles.statValue}>{formatDistance(distanceToPin)}</Text>
                </View>
                <View style={styles.stat}>
                    <Text style={styles.statLabel}>ETA</Text>
                    <Text style={styles.statValue}>{Math.ceil(duration)} min</Text>
                </View>
                <TouchableOpacity
                    style={styles.navigationToggle}
                    onPress={toggleNavigationMode}
                >
                    <FontAwesome5
                        name={navigationMode ? 'map' : 'play'}
                        size={16}
                        color="#fff"
                        style={{ marginRight: 8 }}
                    />
                    <Text style={styles.navigationToggleText}>
                        {navigationMode ? 'Overview' : 'Start'}
                    </Text>
                </TouchableOpacity>
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
    pinContainer: {
        alignItems: 'center',
        justifyContent: 'flex-end',
        height: 60,
    },
    pinHead: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#10b981',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    pinStem: {
        width: 3,
        height: 15,
        backgroundColor: '#10b981',
    },
    pinPoint: {
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: 6,
        borderRightWidth: 6,
        borderTopWidth: 9,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: '#10b981',
    },
    pinIcon: {
        fontSize: 20,
    },
    markerText: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: '#ef4444',
        color: '#fff',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
        fontSize: 10,
        fontWeight: '700',
        minWidth: 20,
        textAlign: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    infoContainer: {
        position: 'absolute',
        bottom: 100,
        left: 20,
        right: 20,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    stat: {
        alignItems: 'center',
        flex: 1,
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
    navigationToggle: {
        backgroundColor: '#3b82f6',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8,
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    navigationToggleText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
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
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#F59E0B',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 5,
    },
    timerText: {
        fontSize: 16,
        color: '#92400E',
        fontWeight: '600',
        textAlign: 'center',
        fontVariant: ['tabular-nums'],
    },
    travelModeContainer: {
        position: 'absolute',
        left: 20,
        right: 20,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 12,
    },
    travelModeButton: {
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
        borderWidth: 2,
        borderColor: '#e5e7eb',
    },
    travelModeButtonActive: {
        borderColor: '#3b82f6',
        backgroundColor: '#eff6ff',
    },
    navigationInstructionContainer: {
        position: 'absolute',
        left: 20,
        right: 20,
        backgroundColor: '#1f2937',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 8,
    },
    instructionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    instructionDistance: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#3b82f6',
        marginRight: 12,
        minWidth: 60,
    },
    instructionText: {
        fontSize: 16,
        color: '#FFFFFF',
        fontWeight: '600',
        flex: 1,
    },
    instructionFooter: {
        borderTopWidth: 1,
        borderTopColor: '#374151',
        paddingTop: 8,
        marginTop: 4,
    },
    instructionSubtext: {
        fontSize: 13,
        color: '#9ca3af',
    },
    zoomButton: {
        width: 48,
        height: 48,
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 5,
        borderWidth: 2,
        borderColor: '#e5e7eb',
    },
    zoomButtonText: {
        fontSize: 24,
        color: '#6b7280',
        fontWeight: 'bold',
    },
    recenterButton: {
        backgroundColor: '#FFFFFF',
        borderColor: '#e5e7eb',
    },
    recenterButtonText: {
        fontSize: 20,
        color: '#6b7280',
        fontWeight: 'bold',
    },
});
