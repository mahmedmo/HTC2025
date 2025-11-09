import { View, Text, TouchableOpacity, StyleSheet, Image, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import BackButton from '../../components/BackButton';
import { apiService } from '../../../services/api';
import { sessionService } from '../../../services/session';

export default function UploadScreen()
{
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [image, setImage] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [userId, setUserId] = useState<number>(1);

    useEffect(() =>
    {
        const loadSession = async () =>
        {
            const session = await sessionService.getSession();
            if (session)
            {
                console.log('[Upload] Setting userId from session:', session.userId);
                setUserId(session.userId);
            }
            else
            {
                console.log('[Upload] No session found, using default userId: 1');
            }
        };

        loadSession();
    }, []);

    const takePhoto = async () =>
    {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();

        if (status !== 'granted')
        {
            Alert.alert('Permission needed', 'Camera access is required to take photos');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled)
        {
            setImage(result.assets[0].uri);
        }
    };

    const retakePhoto = async () =>
    {
        await takePhoto();
    };

    const usePhoto = async () =>
    {
        if (!image)
        {
            return;
        }

        setIsUploading(true);

        try
        {
            const { status } = await Location.requestForegroundPermissionsAsync();

            if (status !== 'granted')
            {
                Alert.alert('Permission needed', 'Location access is required to upload pins');
                setIsUploading(false);
                return;
            }

            const currentLocation = await Location.getCurrentPositionAsync({});

            console.log('[Upload] Uploading pin with userId:', userId);
            const result = await apiService.uploadPin(
                image,
                {
                    lat: currentLocation.coords.latitude,
                    lng: currentLocation.coords.longitude,
                },
                userId
            );

            setIsUploading(false);

            if (result.success)
            {
                Alert.alert(
                    'Success!',
                    'Your pin has been uploaded successfully.',
                    [
                        {
                            text: 'OK',
                            onPress: () => router.back(),
                        },
                    ]
                );
            }
            else
            {
                Alert.alert('Upload Failed', result.error || 'Failed to upload pin');
            }
        }
        catch (error)
        {
            setIsUploading(false);
            Alert.alert(
                'Error',
                error instanceof Error ? error.message : 'An error occurred while uploading'
            );
        }
    };

    return (
        <View style={styles.container}>
            <BackButton mode="arrow" />

            {!image ? (
                <View style={styles.placeholderContainer}>
                    <Text style={styles.placeholderIcon}>📸</Text>
                    <Text style={styles.placeholderText}>Take a photo of your bottles</Text>
                </View>
            ) : (
                <View style={[styles.imageContainer, { paddingTop: 60 + insets.top }]}>
                    <Image source={{ uri: image }} style={styles.image} />
                    <TouchableOpacity
                        style={styles.retakeButton}
                        onPress={retakePhoto}
                    >
                        <Text style={styles.retakeText}>Retake</Text>
                    </TouchableOpacity>
                </View>
            )}

            <View style={[styles.buttonContainer, { paddingBottom: 20 + insets.bottom }]}>
                {!image ? (
                    <TouchableOpacity style={styles.button} onPress={takePhoto} disabled={isUploading}>
                        <Text style={styles.buttonText}>Take Photo</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={[styles.button, isUploading && styles.buttonDisabled]}
                        onPress={usePhoto}
                        disabled={isUploading}
                    >
                        {isUploading ? (
                            <View style={styles.uploadingContainer}>
                                <ActivityIndicator color="#fff" />
                                <Text style={styles.buttonText}>Uploading...</Text>
                            </View>
                        ) : (
                            <Text style={styles.buttonText}>Use Photo</Text>
                        )}
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    placeholderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    placeholderIcon: {
        fontSize: 80,
        marginBottom: 20,
    },
    placeholderText: {
        fontSize: 18,
        color: '#6b7280',
        textAlign: 'center',
    },
    imageContainer: {
        flex: 1,
        paddingHorizontal: 20,
    },
    image: {
        width: '100%',
        height: '80%',
        borderRadius: 12,
    },
    retakeButton: {
        marginTop: 15,
        padding: 12,
        alignItems: 'center',
    },
    retakeText: {
        color: '#ef4444',
        fontSize: 16,
        fontWeight: '600',
    },
    buttonContainer: {
        paddingHorizontal: 20,
        paddingTop: 20,
        gap: 12,
    },
    button: {
        backgroundColor: '#10b981',
        padding: 18,
        borderRadius: 12,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    buttonDisabled: {
        backgroundColor: '#9ca3af',
    },
    uploadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
});
