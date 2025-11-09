import { TouchableOpacity, Text, StyleSheet, Alert, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';

interface BackButtonProps {
    mode?: 'back' | 'cancel' | 'arrow';
    onCancel?: () => void;
    onPress?: () => void;
}

export default function BackButton({ mode = 'back', onCancel, onPress }: BackButtonProps)
{
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const handlePress = () => {
        if (onPress) {
            onPress();
            return;
        }

        if (mode === 'cancel') {
            Alert.alert(
                'Cancel Pickup?',
                'Are you sure you want to cancel this pickup? You will lose your claim on this pin.',
                [
                    { text: 'No, Continue', style: 'cancel' },
                    {
                        text: 'Yes, Cancel',
                        style: 'destructive',
                        onPress: () => {
                            if (onCancel) {
                                onCancel();
                            } else {
                                router.back();
                            }
                        },
                    },
                ]
            );
        } else {
            router.back();
        }
    };

    return (
        <TouchableOpacity
            style={[styles.button, { top: 20 + insets.top }, mode === 'cancel' && styles.cancelButton]}
            onPress={handlePress}
        >
            {mode === 'cancel' ? (
                <Text style={styles.cancelText}>✕ Cancel</Text>
            ) : mode === 'arrow' ? (
                <FontAwesome name="arrow-left" size={20} color="#10b981" />
            ) : (
                <FontAwesome name="home" size={20} color="#10b981" />
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        position: 'absolute',
        left: 15,
        zIndex: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: 12,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: 'rgba(239, 68, 68, 0.9)',
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    cancelText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
});
