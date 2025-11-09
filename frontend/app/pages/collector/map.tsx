import { View, Text, TouchableOpacity, StyleSheet, Alert, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import MapView, { Marker, UrlTile } from 'react-native-maps';
import * as Location from 'expo-location';
import { MAPS_CONFIG } from '../../../config/maps';
import BackButton from '../../components/BackButton';
import PinPopup from '../../components/PinPopup';
import { IPin } from '../../../types';

export default function CollectorMapScreen()
{
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const mapRef = useRef<MapView>(null);
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [mockPins, setMockPins] = useState<IPin[]>([]);
    const [selectedPin, setSelectedPin] = useState<IPin | null>(null);
    const [showPopup, setShowPopup] = useState(false);
    const glowAnimations = useRef<Map<string, Animated.Value>>(new Map()).current;

    const handleBackPress = () =>
    {
        router.back();
    };

    useEffect(() =>
    {
        getCurrentLocation();
    }, []);

    const getCurrentLocation = async () =>
    {
        try
        {
            const { status } = await Location.requestForegroundPermissionsAsync();

            if (status !== 'granted')
            {
                Alert.alert('Permission needed', 'Location access is required');
                return;
            }

            const loc = await Location.getCurrentPositionAsync({});
            setLocation(loc);

            // Calgary, AB coordinates for testing
            const calgaryLat = 51.0447;
            const calgaryLng = -114.0719;

            const now = Date.now();
            const claimExpiry = now + (30 * 60 * 1000); // 30 minutes from now

            setMockPins([
                {
                    pinId: '1',
                    creatorId: 'user123',
                    location: {
                        lat: calgaryLat + 0.002,
                        lng: calgaryLng + 0.002,
                        address: '123 Main St, Calgary, AB',
                    },
                    bottleCount: 24,
                    estimatedValue: 2.40,
                    imageUrl: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400',
                    status: 'available' as const,
                    claimExpiry,
                    createdAt: now - (2 * 60 * 60 * 1000), // 2 hours ago
                },
                {
                    pinId: '2',
                    creatorId: 'user456',
                    location: {
                        lat: calgaryLat - 0.003,
                        lng: calgaryLng + 0.001,
                        address: '456 Oak Ave, Calgary, AB',
                    },
                    bottleCount: 12,
                    estimatedValue: 1.20,
                    imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400',
                    status: 'available' as const,
                    claimExpiry,
                    createdAt: now - (1 * 60 * 60 * 1000), // 1 hour ago
                },
                {
                    pinId: '3',
                    creatorId: 'user789',
                    location: {
                        lat: calgaryLat + 0.001,
                        lng: calgaryLng - 0.003,
                        address: '789 Pine Rd, Calgary, AB',
                    },
                    bottleCount: 18,
                    estimatedValue: 1.80,
                    imageUrl: 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=400',
                    status: 'available' as const,
                    claimExpiry,
                    createdAt: now - (30 * 60 * 1000), // 30 minutes ago
                },
            ]);
        }
        catch (error)
        {
            Alert.alert('Error', 'Unable to get location');
        }
    };

    const handlePinPress = (pinId: string) =>
    {
        const pin = mockPins.find(p => p.pinId === pinId);
        if (pin)
        {
            // Fade out previous glow
            if (selectedPin && glowAnimations.has(selectedPin.pinId)) {
                Animated.timing(glowAnimations.get(selectedPin.pinId)!, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }).start();
            }

            // Initialize animation value if it doesn't exist
            if (!glowAnimations.has(pinId)) {
                glowAnimations.set(pinId, new Animated.Value(0));
            }

            // Fade in new glow
            Animated.timing(glowAnimations.get(pinId)!, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();

            setSelectedPin(pin);
            setShowPopup(true);

            // Animate camera to pin
            if (mapRef.current) {
                const offsetLatitude = pin.location.lat - 0.002;
                mapRef.current.animateToRegion({
                    latitude: offsetLatitude,
                    longitude: pin.location.lng,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                }, 1000);
            }
        }
    };

    const handleClosePopup = () =>
    {
        // Fade out the glow when closing popup
        if (selectedPin && glowAnimations.has(selectedPin.pinId)) {
            Animated.timing(glowAnimations.get(selectedPin.pinId)!, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }

        setShowPopup(false);
        setSelectedPin(null);
    };

    const handleAcceptPin = (pin: IPin) =>
    {
        // Fade out the glow when accepting
        if (glowAnimations.has(pin.pinId)) {
            Animated.timing(glowAnimations.get(pin.pinId)!, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }

        setShowPopup(false);
        setSelectedPin(null);

        router.push({
            pathname: '/pages/collector/navigate-pickup',
            params: {
                pinId: pin.pinId,
                latitude: pin.location.lat.toString(),
                longitude: pin.location.lng.toString(),
                bottleCount: pin.bottleCount.toString(),
                estimatedValue: pin.estimatedValue.toString(),
                claimExpiry: pin.claimExpiry?.toString() || '',
            },
        });
    };

    const findClosestBottle = () => {
        if (!location || mockPins.length === 0) return;

        const pinsWithDistance = mockPins.map(pin => {
            const R = 6371e3;
            const φ1 = (location.coords.latitude * Math.PI) / 180;
            const φ2 = (pin.location.lat * Math.PI) / 180;
            const Δφ = ((pin.location.lat - location.coords.latitude) * Math.PI) / 180;
            const Δλ = ((pin.location.lng - location.coords.longitude) * Math.PI) / 180;

            const a =
                Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

            const distance = R * c;

            return { pin, distance };
        });

        const closest = pinsWithDistance.reduce((prev, current) =>
            current.distance < prev.distance ? current : prev
        );

        // Fade out previous glow
        if (selectedPin && glowAnimations.has(selectedPin.pinId)) {
            Animated.timing(glowAnimations.get(selectedPin.pinId)!, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }

        // Initialize animation value if it doesn't exist
        if (!glowAnimations.has(closest.pin.pinId)) {
            glowAnimations.set(closest.pin.pinId, new Animated.Value(0));
        }

        // Animate camera to closest pin
        if (mapRef.current) {
            const offsetLatitude = closest.pin.location.lat - 0.002;
            mapRef.current.animateToRegion({
                latitude: offsetLatitude,
                longitude: closest.pin.location.lng,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            }, 1000);
        }

        // Show popup and fade in glow after camera animation starts
        setTimeout(() => {
            setSelectedPin(closest.pin);
            setShowPopup(true);

            Animated.timing(glowAnimations.get(closest.pin.pinId)!, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }, 300);
    };

    if (!location)
    {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Getting your location...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={{
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    latitudeDelta: 0.02,
                    longitudeDelta: 0.02,
                }}
                showsUserLocation
                showsMyLocationButton
            >
                <UrlTile
                    urlTemplate={`${MAPS_CONFIG.geoapify.tileUrl}${MAPS_CONFIG.geoapify.apiKey}`}
                    maximumZ={19}
                    tileSize={256}
                />
                {mockPins.map(pin => {
                    const isSelected = selectedPin?.pinId === pin.pinId;

                    // Get or create animation value for this pin
                    if (!glowAnimations.has(pin.pinId)) {
                        glowAnimations.set(pin.pinId, new Animated.Value(0));
                    }
                    const glowOpacity = glowAnimations.get(pin.pinId)!;

                    return (
                        <Marker
                            key={pin.pinId}
                            coordinate={{
                                latitude: pin.location.lat,
                                longitude: pin.location.lng,
                            }}
                            onPress={() => handlePinPress(pin.pinId)}
                        >
                            <View style={styles.markerContainer}>
                                <Animated.View style={[styles.glowCircleOuter, { opacity: glowOpacity }]} />
                                <Animated.View style={[styles.glowCircleMiddle, { opacity: glowOpacity }]} />
                                <Animated.View style={[styles.glowCircleInner, { opacity: glowOpacity }]} />
                                <Text style={styles.markerText}>{pin.bottleCount}</Text>
                                <Text style={styles.markerIcon}>🍾</Text>
                            </View>
                        </Marker>
                    );
                })}
            </MapView>

            <BackButton onPress={handleBackPress} />

            <TouchableOpacity
                style={[styles.findClosestButton, { bottom: 20 + insets.bottom }]}
                onPress={findClosestBottle}
            >
                <Text style={styles.findClosestButtonText}>🔍 Find Closest Bottle</Text>
            </TouchableOpacity>

            <PinPopup
                visible={showPopup}
                pin={selectedPin}
                onClose={handleClosePopup}
                onAccept={handleAcceptPin}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
        position: 'relative',
    },
    glowCircleOuter: {
        position: 'absolute',
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        top: -5,
        left: -33,
        zIndex: -3,
    },
    glowCircleMiddle: {
        position: 'absolute',
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: 'rgba(16, 185, 129, 0.3)',
        top: 10,
        left: -18,
        zIndex: -2,
    },
    glowCircleInner: {
        position: 'absolute',
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
        top: 18,
        left: -8,
        zIndex: -1,
        borderWidth: 2,
        borderColor: '#10b981',
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
        marginBottom: 3,
    },
    findClosestButton: {
        position: 'absolute',
        left: 20,
        right: 20,
        backgroundColor: '#10b981',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
    },
    findClosestButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
});
