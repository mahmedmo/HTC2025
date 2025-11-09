import { View, Text, TouchableOpacity, StyleSheet, Image, Alert, ActivityIndicator, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import BackButton from '../../components/BackButton';
import { apiService } from '../../../services/api';
import { sessionService } from '../../../services/session';
import { Ionicons } from '@expo/vector-icons';

export default function UploadScreen()
{
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [image, setImage] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [userId, setUserId] = useState<number>(1);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

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
                setShowSuccessModal(true);
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
            {/* Decorative background elements */}
            <View style={styles.gradientTop} />
            <View style={styles.gradientBottom} />
            <View style={styles.floatingCircle1} />
            <View style={styles.floatingCircle2} />
            <View style={styles.floatingCircle3} />
            <View style={styles.dot1} />
            <View style={styles.dot2} />
            <View style={styles.dot3} />
            
            <BackButton mode="arrow" />

            {!image ? (
                <View style={styles.placeholderContainer}>
                    <View style={styles.iconCircle}>
                        <Ionicons name="camera" size={60} color="#10b981" />
                    </View>
                    <Text style={styles.placeholderTitle}>Capture Bottles</Text>
                    <Text style={styles.placeholderText}>Take a photo of your bottles to create a pin</Text>
                    <View style={styles.instructionContainer}>
                        <View style={styles.instructionItem}>
                            <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                            <Text style={styles.instructionText}>Clear photo of bottles</Text>
                        </View>
                        <View style={styles.instructionItem}>
                            <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                            <Text style={styles.instructionText}>Good lighting</Text>
                        </View>
                        <View style={styles.instructionItem}>
                            <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                            <Text style={styles.instructionText}>Location enabled</Text>
                        </View>
                    </View>
                </View>
            ) : (
                <View style={[styles.imageContainer, { paddingTop: 60 + insets.top }]}>
                    <View style={styles.imageWrapper}>
                        <Image source={{ uri: image }} style={styles.image} />
                        <View style={styles.imageOverlay} />
                    </View>
                    <TouchableOpacity
                        style={styles.retakeButton}
                        onPress={retakePhoto}
                    >
                        <Ionicons name="refresh" size={20} color="#ef4444" />
                        <Text style={styles.retakeText}>Retake Photo</Text>
                    </TouchableOpacity>
                </View>
            )}

            <View style={[styles.buttonContainer, { paddingBottom: 20 + insets.bottom }]}>
                {!image ? (
                    <TouchableOpacity style={styles.button} onPress={takePhoto} disabled={isUploading}>
                        <View style={styles.buttonGradient} />
                        <View style={styles.buttonContent}>
                            <Ionicons name="camera-outline" size={24} color="#fff" />
                            <Text style={styles.buttonText}>Take Photo</Text>
                        </View>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={[styles.button, isUploading && styles.buttonDisabled]}
                        onPress={usePhoto}
                        disabled={isUploading}
                    >
                        <View style={styles.buttonGradient} />
                        {isUploading ? (
                            <View style={styles.uploadingContainer}>
                                <ActivityIndicator color="#fff" />
                                <Text style={styles.buttonText}>Uploading...</Text>
                            </View>
                        ) : (
                            <View style={styles.buttonContent}>
                                <Ionicons name="cloud-upload-outline" size={24} color="#fff" />
                                <Text style={styles.buttonText}>Upload Pin</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                )}
            </View>

            {/* Success Modal */}
            <Modal
                visible={showSuccessModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => {
                    setShowSuccessModal(false);
                    router.back();
                }}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        {/* Decorative background elements */}
                        <View style={styles.modalCircle1} />
                        <View style={styles.modalCircle2} />
                        <View style={styles.modalGlow} />
                        
                        {/* Success Icon */}
                        <View style={styles.successIconContainer}>
                            <View style={styles.successIconOuter}>
                                <View style={styles.successIconInner}>
                                    <Ionicons name="checkmark" size={60} color="#fff" />
                                </View>
                            </View>
                        </View>

                        {/* Success Text */}
                        <Text style={styles.successTitle}>Pin Uploaded! 🎉</Text>
                        <Text style={styles.successMessage}>
                            Your bottle pin has been successfully uploaded and is now visible to collectors!
                        </Text>

                        {/* Stats */}
                        <View style={styles.statsContainer}>
                            <View style={styles.statItem}>
                                <Ionicons name="location" size={24} color="#10b981" />
                                <Text style={styles.statLabel}>Location Saved</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                                <Ionicons name="image" size={24} color="#10b981" />
                                <Text style={styles.statLabel}>Photo Uploaded</Text>
                            </View>
                        </View>

                        {/* Action Button */}
                        <TouchableOpacity
                            style={styles.modalButton}
                            onPress={() => {
                                setShowSuccessModal(false);
                                router.back();
                            }}
                        >
                            <View style={styles.modalButtonGradient} />
                            <Text style={styles.modalButtonText}>Awesome!</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f172a',
        position: 'relative',
    },
    gradientTop: {
        position: 'absolute',
        top: -80,
        left: -80,
        right: -80,
        height: 350,
        backgroundColor: '#1e40af',
        opacity: 0.12,
        borderRadius: 175,
        transform: [{ scaleX: 1.5 }],
    },
    gradientBottom: {
        position: 'absolute',
        bottom: -100,
        left: -80,
        right: -80,
        height: 400,
        backgroundColor: '#059669',
        opacity: 0.1,
        borderRadius: 200,
        transform: [{ scaleX: 1.5 }],
    },
    floatingCircle1: {
        position: 'absolute',
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: '#10b981',
        opacity: 0.08,
        top: 120,
        right: -50,
    },
    floatingCircle2: {
        position: 'absolute',
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: '#3b82f6',
        opacity: 0.07,
        top: 250,
        left: -40,
    },
    floatingCircle3: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: '#8b5cf6',
        opacity: 0.06,
        bottom: -60,
        right: -60,
    },
    dot1: {
        position: 'absolute',
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#34d399',
        opacity: 0.5,
        top: 180,
        left: 70,
    },
    dot2: {
        position: 'absolute',
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#60a5fa',
        opacity: 0.4,
        bottom: 250,
        right: 90,
    },
    dot3: {
        position: 'absolute',
        width: 7,
        height: 7,
        borderRadius: 3.5,
        backgroundColor: '#a78bfa',
        opacity: 0.5,
        top: 350,
        right: 120,
    },
    placeholderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 30,
    },
    iconCircle: {
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
        borderWidth: 3,
        borderColor: 'rgba(16, 185, 129, 0.3)',
        shadowColor: '#10b981',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    placeholderIcon: {
        fontSize: 80,
        marginBottom: 20,
    },
    placeholderTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: '#fff',
        marginBottom: 12,
        textAlign: 'center',
        letterSpacing: 0.5,
    },
    placeholderText: {
        fontSize: 16,
        color: '#94a3b8',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 30,
        paddingHorizontal: 20,
    },
    instructionContainer: {
        gap: 14,
        alignItems: 'flex-start',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(16, 185, 129, 0.2)',
    },
    instructionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    instructionText: {
        fontSize: 15,
        color: '#cbd5e1',
        fontWeight: '500',
    },
    imageContainer: {
        flex: 1,
        paddingHorizontal: 24,
        justifyContent: 'center',
    },
    imageWrapper: {
        width: '100%',
        height: '75%',
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 10,
        borderWidth: 3,
        borderColor: 'rgba(16, 185, 129, 0.3)',
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    imageOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '30%',
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
    },
    retakeButton: {
        marginTop: 20,
        padding: 14,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: 'rgba(239, 68, 68, 0.15)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.3)',
    },
    retakeText: {
        color: '#ef4444',
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    buttonContainer: {
        paddingHorizontal: 24,
        paddingTop: 20,
    },
    button: {
        backgroundColor: '#10b981',
        padding: 20,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#10b981',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
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
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
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
        fontWeight: '700',
        letterSpacing: 0.5,
        textShadowColor: 'rgba(0, 0, 0, 0.2)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    buttonDisabled: {
        backgroundColor: '#475569',
        shadowColor: '#000',
        borderColor: 'rgba(148, 163, 184, 0.3)',
    },
    uploadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        zIndex: 1,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalContent: {
        width: '100%',
        maxWidth: 400,
        backgroundColor: '#1e293b',
        borderRadius: 28,
        padding: 32,
        alignItems: 'center',
        shadowColor: '#10b981',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.4,
        shadowRadius: 24,
        elevation: 12,
        borderWidth: 2,
        borderColor: 'rgba(16, 185, 129, 0.3)',
        position: 'relative',
        overflow: 'hidden',
    },
    modalCircle1: {
        position: 'absolute',
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: '#10b981',
        opacity: 0.1,
        top: -40,
        right: -40,
    },
    modalCircle2: {
        position: 'absolute',
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#3b82f6',
        opacity: 0.08,
        bottom: -30,
        left: -30,
    },
    modalGlow: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '40%',
        backgroundColor: 'rgba(16, 185, 129, 0.05)',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
    },
    successIconContainer: {
        marginBottom: 24,
        zIndex: 1,
    },
    successIconOuter: {
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: 'rgba(16, 185, 129, 0.4)',
        shadowColor: '#10b981',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    },
    successIconInner: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#10b981',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#10b981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.6,
        shadowRadius: 12,
    },
    successTitle: {
        fontSize: 32,
        fontWeight: '900',
        color: '#fff',
        marginBottom: 12,
        textAlign: 'center',
        letterSpacing: 0.5,
        textShadowColor: 'rgba(16, 185, 129, 0.4)',
        textShadowOffset: { width: 0, height: 3 },
        textShadowRadius: 8,
        zIndex: 1,
    },
    successMessage: {
        fontSize: 16,
        color: '#cbd5e1',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 28,
        paddingHorizontal: 8,
        zIndex: 1,
    },
    statsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        padding: 20,
        borderRadius: 16,
        marginBottom: 28,
        borderWidth: 1,
        borderColor: 'rgba(16, 185, 129, 0.2)',
        width: '100%',
        zIndex: 1,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
        gap: 8,
    },
    statDivider: {
        width: 1,
        height: 40,
        backgroundColor: 'rgba(16, 185, 129, 0.3)',
        marginHorizontal: 12,
    },
    statLabel: {
        fontSize: 13,
        color: '#94a3b8',
        fontWeight: '600',
        textAlign: 'center',
    },
    modalButton: {
        backgroundColor: '#10b981',
        paddingVertical: 16,
        paddingHorizontal: 48,
        borderRadius: 16,
        shadowColor: '#10b981',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.5,
        shadowRadius: 12,
        elevation: 8,
        borderWidth: 2,
        borderColor: 'rgba(52, 211, 153, 0.5)',
        position: 'relative',
        overflow: 'hidden',
        zIndex: 1,
    },
    modalButtonGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '50%',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
    },
    modalButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '800',
        letterSpacing: 1,
        textShadowColor: 'rgba(0, 0, 0, 0.2)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
        zIndex: 1,
    },
});
