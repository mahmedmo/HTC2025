import { View, Text, TouchableOpacity, StyleSheet, Alert, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useEffect, useRef } from 'react';
import { useRouter, useNavigation } from 'expo-router';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { FontAwesome5 } from '@expo/vector-icons';
import { MAPS_CONFIG, darkMapStyle } from '../../../config/maps';
import BackButton from '../../components/BackButton';
import PinPopup from '../../components/PinPopup';
import { IPin } from '../../../types';
import { apiService } from '../../../services/api';
import { sessionService } from '../../../services/session';
import { CommonActions } from '@react-navigation/native';

export default function CollectorMapScreen()
{
    const router = useRouter();
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const mapRef = useRef<MapView>(null);
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [pins, setPins] = useState<IPin[]>([]);
    const [selectedPin, setSelectedPin] = useState<IPin | null>(null);
    const [showPopup, setShowPopup] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
    const colorAnimations = useRef<Map<string, Animated.Value>>(new Map()).current;

    const handleBackPress = () =>
    {
        // Navigate back to home with slide-from-left animation
        router.back();
    };

    useEffect(() =>
    {
        getCurrentLocation();
        loadMapMode();
    }, []);

    const loadMapMode = async () =>
    {
        const savedMode = await sessionService.getMapMode();
        setIsDarkMode(savedMode);
    };

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

            await fetchPins();
        }
        catch (error)
        {
            Alert.alert('Error', 'Unable to get location');
        }
    };
     // Initialize region with current location
    const [region, setRegion] = useState({
        latitude: location?.coords.latitude || 0,
        longitude: location?.coords.longitude || 0,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
    });

// Add zoom buttons to the UI
    const zoomIn = () => {
        if (location) {
            const newRegion = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: region.latitudeDelta / 2,
                longitudeDelta: region.longitudeDelta / 2,
            };
            setRegion(newRegion);
            mapRef.current?.animateToRegion(newRegion, 300);
        }
    };

    const zoomOut = () => {
        if (location) {
            const newRegion = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: region.latitudeDelta * 2,
                longitudeDelta: region.longitudeDelta * 2,
            };
            setRegion(newRegion);
            mapRef.current?.animateToRegion(newRegion, 300);
        }
    };

    const recenterMap = () => {
        if (location && mapRef.current) {
            const newRegion = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.02,
                longitudeDelta: 0.02,
            };
            setRegion(newRegion);
            mapRef.current.animateToRegion(newRegion, 300);
        }
    };

    const toggleMapMode = () => {
        const newMode = !isDarkMode;
        setIsDarkMode(newMode);
        sessionService.saveMapMode(newMode);
    };

    const fetchPins = async () =>
    {
        const result = await apiService.getActiveLocations();
		console.log("THE LOCATION RESULT IS: " + JSON.stringify(result));
        if (result.success && result.data)
        {

            const now = Date.now();
            const claimExpiry = now + (60 * 60 * 1000);

            let mappedPins: IPin[] = result.data.locations.map((loc, index) => ({
                pinId: loc.submission_id || `pin-${index}`,
                submissionId: loc.submission_id,
                creatorId: 'unknown',
                location: {
                    lat: loc.lat,
                    lng: loc.lng,
                },
                bottleCount: 12,
                estimatedValue: 1.20,
                status: 'available' as const,
                claimExpiry,
                createdAt: now - (1 * 60 * 60 * 1000),
            }));

            // Separate overlapping pins
            mappedPins = separateOverlappingPins(mappedPins);

            setPins(mappedPins);
        }
        else
        {
            Alert.alert('Error', result.error || 'Failed to load pins');
        }
    };

    const separateOverlappingPins = (pins: IPin[]): IPin[] =>
    {
        const OVERLAP_THRESHOLD = 0.0001; // ~11 meters
        const SEPARATION_OFFSET = 0.00008; // ~9 meters offset
        const adjustedPins = [...pins];

        for (let i = 0; i < adjustedPins.length; i++)
        {
            for (let j = i + 1; j < adjustedPins.length; j++)
            {
                const pin1 = adjustedPins[i];
                const pin2 = adjustedPins[j];

                const latDiff = Math.abs(pin1.location.lat - pin2.location.lat);
                const lngDiff = Math.abs(pin1.location.lng - pin2.location.lng);

                // Check if pins are too close
                if (latDiff < OVERLAP_THRESHOLD && lngDiff < OVERLAP_THRESHOLD)
                {
                    // Offset second pin slightly to the right and down
                    adjustedPins[j] = {
                        ...pin2,
                        location: {
                            lat: pin2.location.lat - SEPARATION_OFFSET,
                            lng: pin2.location.lng + SEPARATION_OFFSET,
                        },
                    };
                }
            }
        }

        return adjustedPins;
    };

    const handlePinPress = async (pinId: string) =>
    {
        const pin = pins.find(p => p.pinId === pinId);
        if (pin)
        {
            // Fade out previous selection
            if (selectedPin && colorAnimations.has(selectedPin.pinId)) {
                Animated.timing(colorAnimations.get(selectedPin.pinId)!, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: false,
                }).start();
            }

            // Initialize animation value if it doesn't exist
            if (!colorAnimations.has(pinId)) {
                colorAnimations.set(pinId, new Animated.Value(0));
            }

            // Fade in new selection
            Animated.timing(colorAnimations.get(pinId)!, {
                toValue: 1,
                duration: 200,
                useNativeDriver: false,
            }).start();

            // Fetch S3 image if submission_id exists
            let pinWithImage = pin;
            if (pin.submissionId) {
                const s3Result = await apiService.getS3Info(pin.submissionId);
                if (s3Result.success && s3Result.data) {
                    // Try multiple S3 URL formats
                    const urlFormats = [
                        `https://images-9912.s3.us-east-1.amazonaws.com/${s3Result.data.s3_key}`,
                        `https://s3.us-east-1.amazonaws.com/images-9912/${s3Result.data.s3_key}`,
                        `https://images-9912.s3.amazonaws.com/${s3Result.data.s3_key}`,
                    ];
                    const imageUrl = urlFormats[0]; // Try the first one
                    console.log('[Map] Constructed image URL:', imageUrl);
                    console.log('[Map] S3 key:', s3Result.data.s3_key);
                    pinWithImage = { ...pin, imageUrl };
                } else {
                    console.log('[Map] Failed to get S3 info:', s3Result.error);
                }
            }

            setSelectedPin(pinWithImage);
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
        // Fade out selection color
        if (selectedPin && colorAnimations.has(selectedPin.pinId)) {
            Animated.timing(colorAnimations.get(selectedPin.pinId)!, {
                toValue: 0,
                duration: 200,
                useNativeDriver: false,
            }).start();
        }

        setShowPopup(false);
        setSelectedPin(null);
    };

    const handleAcceptPin = (pin: IPin) =>
    {
        setShowPopup(false);
        setSelectedPin(null);

        router.push({
            pathname: '/pages/collector/navigate-pickup',
            params: {
                pinId: pin.pinId,
                submissionId: pin.submissionId || '',
                latitude: pin.location.lat.toString(),
                longitude: pin.location.lng.toString(),
                bottleCount: pin.bottleCount.toString(),
                estimatedValue: pin.estimatedValue.toString(),
                claimExpiry: pin.claimExpiry?.toString() || '',
            },
        });
    };

    const findClosestBottle = () => {
        if (!location || pins.length === 0) return;

        const pinsWithDistance = pins.map(pin => {
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

        // Fade out previous selection
        if (selectedPin && colorAnimations.has(selectedPin.pinId)) {
            Animated.timing(colorAnimations.get(selectedPin.pinId)!, {
                toValue: 0,
                duration: 200,
                useNativeDriver: false,
            }).start();
        }

        // Initialize animation value if it doesn't exist
        if (!colorAnimations.has(closest.pin.pinId)) {
            colorAnimations.set(closest.pin.pinId, new Animated.Value(0));
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

        // Show popup and fade in selection after camera animation starts
        setTimeout(() => {
            setSelectedPin(closest.pin);
            setShowPopup(true);

            Animated.timing(colorAnimations.get(closest.pin.pinId)!, {
                toValue: 1,
                duration: 200,
                useNativeDriver: false,
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
                provider={PROVIDER_GOOGLE}
                customMapStyle={isDarkMode ? darkMapStyle : []}
                initialRegion={{
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    latitudeDelta: 0.02,
                    longitudeDelta: 0.02,
                }}
                showsUserLocation
                showsMyLocationButton={false}
                showsCompass={false}
                toolbarEnabled={false}
                showsIndoors={true}
                showsIndoorLevelPicker={true}
                showsTraffic={false}
                showsBuildings={true}
            >
                {pins.map(pin => {
                    const isSelected = selectedPin?.pinId === pin.pinId;

                    // Get or create animation value for this pin
                    if (!colorAnimations.has(pin.pinId)) {
                        colorAnimations.set(pin.pinId, new Animated.Value(0));
                    }
                    const colorProgress = colorAnimations.get(pin.pinId)!;

                    // Interpolate colors
                    const headColor = colorProgress.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['#10b981', '#059669'], // Light green to dark green
                    });

                    const borderColor = colorProgress.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['#fff', '#047857'], // White to darker green
                    });

                    const stemColor = colorProgress.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['#10b981', '#059669'],
                    });

                    const pointColor = colorProgress.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['#10b981', '#059669'],
                    });

                    return (
                        <Marker
                            key={pin.pinId}
                            coordinate={{
                                latitude: pin.location.lat,
                                longitude: pin.location.lng,
                            }}
                            onPress={() => handlePinPress(pin.pinId)}
                            anchor={{ x: 0.5, y: 0.85 }}
                            zIndex={isSelected ? 1000 : 1}
                        >
                            <View style={styles.markerContainer}>
                                <View style={styles.pinContainer}>
                                    <Text style={styles.markerText}>{pin.bottleCount}</Text>
                                    <Animated.View style={[styles.pinHead, { backgroundColor: headColor, borderColor: borderColor }]}>
                                        <Text style={styles.pinIcon}>🍾</Text>
                                    </Animated.View>
                                    <Animated.View style={[styles.pinStem, { backgroundColor: stemColor }]} />
                                    <Animated.View style={[styles.pinPoint, { borderTopColor: pointColor }]} />
                                </View>
                            </View>
                        </Marker>
                    );
                })}
            </MapView>
            
            <BackButton onPress={handleBackPress} isDarkMode={isDarkMode} />

            {/* Map Mode Toggle - circular, above zoom controls */}
            <TouchableOpacity 
                style={[styles.mapModeToggle, isDarkMode && styles.mapModeToggleDark, { top: 20 + insets.top }]}
                onPress={toggleMapMode}
            >
                <FontAwesome5 
                    name={isDarkMode ? 'sun' : 'moon'} 
                    size={20} 
                    color={isDarkMode ? '#FCD34D' : '#1f2937'} 
                />
            </TouchableOpacity>

            {/* Zoom controls */}
            <View style={[styles.zoomButtonsContainer, { top: 68 + insets.top }]}>
                <TouchableOpacity style={[styles.zoomButton, isDarkMode && styles.zoomButtonDark]} onPress={zoomIn}>
                    <Text style={[styles.zoomButtonText, isDarkMode && styles.zoomButtonTextDark]}>+</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.zoomButton, isDarkMode && styles.zoomButtonDark]} onPress={zoomOut}>
                    <Text style={[styles.zoomButtonText, isDarkMode && styles.zoomButtonTextDark]}>-</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.zoomButton, styles.recenterButton, isDarkMode && styles.recenterButtonDark]} onPress={recenterMap}>
                    <Text style={styles.recenterButtonText}>⌖</Text>
                </TouchableOpacity>
            </View>

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
                isDarkMode={isDarkMode}
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
        position: 'relative',
    },
    pinContainer: {
        alignItems: 'center',
        justifyContent: 'flex-start',
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
    },
    pinHeadSelected: {
        backgroundColor: '#059669',
        borderColor: '#047857',
    },
    pinStem: {
        width: 3,
        height: 15,
        backgroundColor: '#10b981',
    },
    pinStemSelected: {
        backgroundColor: '#059669',
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
    pinPointSelected: {
        borderTopColor: '#059669',
    },
    pinIcon: {
        fontSize: 20,
    },
    markerText: {
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
        marginBottom: 4,
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
    mapModeToggle: {
        position: 'absolute',
        right: 10,
        width: 40,
        height: 40,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    mapModeToggleDark: {
        backgroundColor: '#374151',
    },
    mapModeText: {
        fontSize: 14,
        color: '#1f2937',
        fontWeight: '600',
    },
    mapModeTextLight: {
        color: '#1f2937',
    },
    zoomButtonsContainer: {
        position: 'absolute',
        right: 10,
        backgroundColor: 'transparent',
    },
    zoomButton: {
        width: 40,
        height: 40,
        backgroundColor: 'white',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    zoomButtonDark: {
        backgroundColor: '#374151',
    },
    zoomButtonText: {
        fontSize: 24,
        color: '#10b981',
        fontWeight: 'bold',
    },
    zoomButtonTextDark: {
        color: '#34d399',
    },
    recenterButton: {
        backgroundColor: '#10b981',
    },
    recenterButtonDark: {
        backgroundColor: '#059669',
    },
    recenterButtonText: {
        fontSize: 24,
        color: '#ffffff',
        fontWeight: 'bold',
    }
});
