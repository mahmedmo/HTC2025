import { View, Text, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect, useRef } from 'react';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { MAPS_CONFIG } from '../../../config/maps';
import { apiService } from '../../../services/api';
import BackButton from '../../components/BackButton';

interface IPinLocation
{
    lat: number;
    lng: number;
}

export default function PinnerMapScreen()
{
    const mapRef = useRef<MapView>(null);
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [pins, setPins] = useState<IPinLocation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() =>
    {
        initializeMap();
    }, []);

    const initializeMap = async () =>
    {
        try
        {
            const { status } = await Location.requestForegroundPermissionsAsync();

            if (status !== 'granted')
            {
                Alert.alert('Permission needed', 'Location access is required');
                setLoading(false);
                return;
            }

            const currentLocation = await Location.getCurrentPositionAsync({});
            setLocation(currentLocation);

            await fetchPins();
        }
        catch (error)
        {
            Alert.alert('Error', 'Unable to get location');
            setLoading(false);
        }
    };

    const fetchPins = async () =>
    {
        const result = await apiService.getActiveLocations();

        if (result.success && result.data)
        {
            setPins(result.data.locations);
        }
        else
        {
            Alert.alert('Error', result.error || 'Failed to load pins');
        }

        setLoading(false);
    };

    if (loading || !location)
    {
        return (
            <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
                <Text style={styles.title}>My Pins Map</Text>
                <View style={styles.placeholder}>
                    <Text style={styles.loadingText}>Loading map...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={styles.map}
                provider={PROVIDER_GOOGLE}
                initialRegion={{
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                }}
                showsUserLocation
                showsMyLocationButton
            >
                {pins.map((pin, index) => (
                    <Marker
                        key={`pin-${index}`}
                        coordinate={{
                            latitude: pin.lat,
                            longitude: pin.lng,
                        }}
                    >
                        <View style={styles.markerContainer}>
                            <View style={styles.pinContainer}>
                                <View style={styles.pinHead}>
                                    <Text style={styles.pinIcon}>📍</Text>
                                </View>
                                <View style={styles.pinStem} />
                                <View style={styles.pinPoint} />
                            </View>
                        </View>
                    </Marker>
                ))}
            </MapView>

            <BackButton mode="arrow" />

            <View style={styles.infoBox}>
                <Text style={styles.infoText}>
                    {pins.length} pin{pins.length !== 1 ? 's' : ''} uploaded
                </Text>
            </View>
        </View>
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
    placeholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 18,
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
    infoBox: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        backgroundColor: '#ffffff',
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
    },
    infoText: {
        fontSize: 16,
        color: '#10b981',
        fontWeight: '600',
        textAlign: 'center',
    },
});
