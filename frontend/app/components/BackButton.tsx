import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';

interface BackButtonProps {
    mode?: 'back' | 'cancel' | 'arrow';
    onCancel?: () => void;
    onPress?: () => void;
    isDarkMode?: boolean;
}

export default function BackButton({ mode = 'back', onCancel, onPress, isDarkMode = false }: BackButtonProps)
{
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const handlePress = () => {
        if (onPress) {
            onPress();
            return;
        }

        if (mode === 'cancel' && onCancel) {
            onCancel();
        } else {
            router.back();
        }
    };

    return (
        <TouchableOpacity
            style={[
                styles.button, 
                { top: 20 + insets.top }, 
                mode === 'cancel' && styles.cancelButton,
                isDarkMode && styles.buttonDark,
                isDarkMode && mode === 'cancel' && styles.cancelButtonDark
            ]}
            onPress={handlePress}
        >
            {mode === 'cancel' ? (
                <Text style={styles.cancelText}>✕ Cancel</Text>
            ) : mode === 'arrow' ? (
                <FontAwesome name="arrow-left" size={20} color={isDarkMode ? '#34d399' : '#10b981'} />
            ) : (
                <View style={styles.backContainer}>
                    <FontAwesome name="arrow-left" size={18} color={isDarkMode ? '#34d399' : '#10b981'} />
                    <Text style={[styles.backText, isDarkMode && styles.backTextDark]}>Back</Text>
                </View>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        position: 'absolute',
        left: 15,
        zIndex: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        padding: 12,
        borderRadius: 8,
        shadowColor: '#10b981',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(16, 185, 129, 0.3)',
    },
    buttonDark: {
        backgroundColor: 'rgba(51, 65, 85, 0.95)',
        borderColor: 'rgba(52, 211, 153, 0.3)',
    },
    cancelButton: {
        backgroundColor: 'rgba(239, 68, 68, 0.9)',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#F59E0B',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 5,
    },
    cancelButtonDark: {
        backgroundColor: 'rgba(220, 38, 38, 0.9)',
        borderColor: '#F59E0B',
    },
    cancelText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '700',
    },
    backContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    backText: {
        color: '#10b981',
        fontSize: 16,
        fontWeight: '600',
    },
    backTextDark: {
        color: '#34d399',
    },
});
