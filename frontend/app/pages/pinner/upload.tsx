import { View, Text, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import BackButton from '../../components/BackButton';

export default function UploadScreen()
{
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [image, setImage] = useState<string | null>(null);

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

    const usePhoto = () =>
    {
        if (!image)
        {
            return;
        }
        router.back();
    };

    return (
        <View style={styles.container}>
            <BackButton />

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
                        onPress={() => setImage(null)}
                    >
                        <Text style={styles.retakeText}>Retake</Text>
                    </TouchableOpacity>
                </View>
            )}

            <View style={[styles.buttonContainer, { paddingBottom: 20 + insets.bottom }]}>
                {!image ? (
                    <TouchableOpacity style={styles.button} onPress={takePhoto}>
                        <Text style={styles.buttonText}>Take Photo</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity style={styles.button} onPress={usePhoto}>
                        <Text style={styles.buttonText}>Use Photo</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ece3e3ff',
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
});
