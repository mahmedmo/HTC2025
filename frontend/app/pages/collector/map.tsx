import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import MapView, { Marker, UrlTile } from 'react-native-maps';
import * as Location from 'expo-location';
import { MAPS_CONFIG } from '../../../config/maps';
import BackButton from '../../components/BackButton';

export default function CollectorMapScreen()
{
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [radius, setRadius] = useState(5000);
    const [mockPins, setMockPins] = useState<Array<{
        id: string;
        latitude: number;
        longitude: number;
        bottleCount: number;
        estimatedValue: number;
    }>>([]);

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

            setMockPins([
                {
                    id: '1',
                    latitude: calgaryLat + 0.002,
                    longitude: calgaryLng + 0.002,
                    bottleCount: 24,
                    estimatedValue: 2.40,
                },
                {
                    id: '2',
                    latitude: calgaryLat - 0.003,
                    longitude: calgaryLng + 0.001,
                    bottleCount: 12,
                    estimatedValue: 1.20,
                },
                {
                    id: '3',
                    latitude: calgaryLat + 0.001,
                    longitude: calgaryLng - 0.003,
                    bottleCount: 18,
                    estimatedValue: 1.80,
                },
            ]);
        }
        catch (error)
        {
            Alert.alert('Error', 'Unable to get location');
        }
    };

    const acceptPin = (pinId: string) =>
    {
        const pin = mockPins.find(p => p.id === pinId);
        if (pin)
        {
            router.push({
                pathname: '/pages/collector/accept-pin',
                params: {
                    pinId: pin.id,
                    latitude: pin.latitude.toString(),
                    longitude: pin.longitude.toString(),
                    bottleCount: pin.bottleCount.toString(),
                    estimatedValue: pin.estimatedValue.toString(),
                },
            });
        }
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
                {mockPins.map(pin => (
                    <Marker
                        key={pin.id}
                        coordinate={{
                            latitude: pin.latitude,
                            longitude: pin.longitude,
                        }}
                        onPress={() => acceptPin(pin.id)}
                    >
                        <View style={styles.markerContainer}>
                            <Text style={styles.markerText}>{pin.bottleCount}</Text>
                            <Text style={styles.markerIcon}>🍾</Text>
                        </View>
                    </Marker>
                ))}
            </MapView>

            <BackButton />

            <View style={[styles.radiusSelector, { top: 20 + insets.top }]}>
                {[1000, 5000, 10000].map(r => (
                    <TouchableOpacity
                        key={r}
                        style={[styles.radiusButton, radius === r && styles.radiusButtonActive]}
                        onPress={() => setRadius(r)}
                    >
                        <Text style={[styles.radiusText, radius === r && styles.radiusTextActive]}>
                            {r / 1000}km
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
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
    radiusSelector: {
        position: 'absolute',
        top: 20,
        right: 20,
        flexDirection: 'column',
        gap: 8,
    },
    radiusButton: {
        backgroundColor: '#fff',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#e5e7eb',
    },
    radiusButtonActive: {
        backgroundColor: '#10b981',
        borderColor: '#10b981',
    },
    radiusText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
    },
    radiusTextActive: {
        color: '#fff',
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
});
