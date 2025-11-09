import { View, Text, TouchableOpacity, StyleSheet, Alert, Modal, BackHandler } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { FontAwesome5 } from '@expo/vector-icons';
import { MAPS_CONFIG, darkMapStyle } from '../../../config/maps';
import { getRoute, TravelMode } from '../../../services/routing';
import BackButton from '../../components/BackButton';

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

interface BottleDepot
{
    name: string;
    address: string;
    location: RoutePoint;
    placeId: string;
}

export default function NavigateDepotScreen()
{
    const router = useRouter();
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
    const [travelMode, setTravelMode] = useState<TravelMode>('driving');
    const [navigationMode, setNavigationMode] = useState<boolean>(false);
    const [nearestDepot, setNearestDepot] = useState<BottleDepot | null>(null);
    const [showCompletionPopup, setShowCompletionPopup] = useState(false);

    useEffect(() =>
    {
        setupNavigation();
        const locationSubscription = subscribeToLocation();
        const headingSubscription = subscribeToHeading();

        // Lock navigation - prevent back button
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            return true;
        });

        return () =>
        {
            locationSubscription.then(sub => sub?.remove());
            headingSubscription.then(sub => sub?.remove());
            backHandler.remove();
        };
    }, []);

    useEffect(() =>
    {
        if (userLocation && nearestDepot)
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

            // Find nearest bottle depot
            const depot = await findNearestBottleDepot(loc.coords.latitude, loc.coords.longitude);

            if (!depot)
            {
                Alert.alert('Error', 'No bottle depots found nearby');
                setLoading(false);
                return;
            }

            setNearestDepot(depot);

            // Fetch route to depot
            const route = await getRoute(
                {
                    latitude: loc.coords.latitude,
                    longitude: loc.coords.longitude,
                },
                depot.location,
                travelMode
            );

            if (route)
            {
                setRouteCoordinates(route.coordinates);
                setDistance(route.distance);
                setDuration(route.duration);
                setNavigationSteps(route.steps || []);
                setCurrentStepIndex(0);

                // Show route overview
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

    const findNearestBottleDepot = async (lat: number, lng: number): Promise<BottleDepot | null> =>
    {
        const apiKey = MAPS_CONFIG.google.apiKey;

        if (!apiKey)
        {
            throw new Error('Google Maps API key not configured');
        }

        // Search for bottle depots using Google Places API
        const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=10000&keyword=bottle+depot+recycling&key=${apiKey}`;

        try
        {
            const response = await fetch(url);
            const data = await response.json();

            if (data.status === 'OK' && data.results && data.results.length > 0)
            {
                const place = data.results[0];
                return {
                    name: place.name,
                    address: place.vicinity,
                    location: {
                        latitude: place.geometry.location.lat,
                        longitude: place.geometry.location.lng,
                    },
                    placeId: place.place_id,
                };
            }

            return null;
        }
        catch (error)
        {
            console.error('Error finding bottle depot:', error);
            return null;
        }
    };

    const fetchRoute = async () =>
    {
        if (!userLocation || !nearestDepot) return;

        const route = await getRoute(
            {
                latitude: userLocation.coords.latitude,
                longitude: userLocation.coords.longitude,
            },
            nearestDepot.location,
            travelMode
        );

        if (route)
        {
            setRouteCoordinates(route.coordinates);
            setDistance(route.distance);
            setDuration(route.duration);
            setNavigationSteps(route.steps || []);
            setCurrentStepIndex(0);

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
                updateCurrentStep(loc);

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
        const R = 6371e3;
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

    const distanceToDepot = userLocation && nearestDepot
        ? calculateDistance(
              { latitude: userLocation.coords.latitude, longitude: userLocation.coords.longitude },
              nearestDepot.location
          )
        : 0;

    const isNearby = distanceToDepot <= 100;

    const toggleNavigationMode = () =>
    {
        const newMode = !navigationMode;
        setNavigationMode(newMode);

        if (newMode && mapRef.current && userLocation)
        {
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

    const markComplete = () =>
    {
        if (!isNearby)
        {
            return;
        }
        setShowCompletionPopup(true);
    };

    const handleCompletionConfirm = () =>
    {
        setShowCompletionPopup(false);
        router.replace('/pages/collector/map');
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

    if (loading || !userLocation || !nearestDepot)
    {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Finding nearest bottle depot...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <MapView
                ref={mapRef}
                style={styles.map}
                provider={PROVIDER_GOOGLE}
                customMapStyle={darkMapStyle}
                initialRegion={{
                    latitude: userLocation.coords.latitude,
                    longitude: userLocation.coords.longitude,
                    latitudeDelta: 0.02,
                    longitudeDelta: 0.02,
                }}
                showsUserLocation
                showsMyLocationButton={false}
            >
                {routeCoordinates.length > 0 && (
                    <Polyline
                        coordinates={routeCoordinates}
                        strokeColor="#3b82f6"
                        strokeWidth={4}
                    />
                )}

                {nearestDepot && (
                    <Marker
                        coordinate={nearestDepot.location}
                        title={nearestDepot.name}
                        description={nearestDepot.address}
                    >
                        <View style={styles.markerContainer}>
                            <View style={styles.depotMarker}>
                                <Text style={styles.depotIcon}>♻️</Text>
                            </View>
                        </View>
                    </Marker>
                )}
            </MapView>

            <BackButton mode="cancel" onCancel={() => router.replace('/pages/collector/map')} />

            {!navigationMode && (
                <View style={[styles.travelModeContainer, { top: 20 + insets.top }]}>
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
                </View>
            )}

            {navigationMode && currentStep && (
                <View style={[styles.navigationInstructionContainer, { top: 20 + insets.top }]}>
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

            <View style={styles.depotInfoContainer}>
                <Text style={styles.depotName}>{nearestDepot.name}</Text>
                <Text style={styles.depotAddress}>{nearestDepot.address}</Text>
            </View>

            <View style={styles.infoContainer}>
                <View style={styles.stat}>
                    <Text style={styles.statLabel}>Distance</Text>
                    <Text style={styles.statValue}>{formatDistance(distanceToDepot)}</Text>
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
                onPress={markComplete}
                disabled={!isNearby}
            >
                <Text style={styles.buttonText}>
                    {isNearby ? 'Complete Drop-off' : `Get within 100m (${Math.round(distanceToDepot)}m away)`}
                </Text>
            </TouchableOpacity>

            <Modal
                visible={showCompletionPopup}
                transparent
                animationType="fade"
                onRequestClose={() => setShowCompletionPopup(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalIcon}>✅</Text>
                        <Text style={styles.modalTitle}>Drop-off Complete!</Text>
                        <Text style={styles.modalMessage}>
                            Great job! The bottles have been successfully delivered to the depot.
                        </Text>
                        <TouchableOpacity
                            style={styles.modalButton}
                            onPress={handleCompletionConfirm}
                        >
                            <Text style={styles.modalButtonText}>Back to Map</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
        backgroundColor: '#0f172a',
    },
    loadingText: {
        fontSize: 16,
        color: '#94a3b8',
    },
    map: {
        flex: 1,
    },
    markerContainer: {
        alignItems: 'center',
    },
    depotMarker: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#3b82f6',
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
    depotIcon: {
        fontSize: 24,
    },
    depotInfoContainer: {
        position: 'absolute',
        top: 20,
        left: 20,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        maxWidth: '60%',
    },
    depotName: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: 4,
    },
    depotAddress: {
        fontSize: 12,
        color: '#6b7280',
    },
    travelModeContainer: {
        position: 'absolute',
        right: 20,
        flexDirection: 'column',
        gap: 8,
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
        color: '#3b82f6',
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 32,
        alignItems: 'center',
        marginHorizontal: 40,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 10,
    },
    modalIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: 12,
        textAlign: 'center',
    },
    modalMessage: {
        fontSize: 16,
        color: '#6b7280',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 24,
    },
    modalButton: {
        backgroundColor: '#10b981',
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 12,
        width: '100%',
        alignItems: 'center',
    },
    modalButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
