import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function BackButton()
{
    const router = useRouter();
    const insets = useSafeAreaInsets();

    return (
        <TouchableOpacity
            style={[styles.button, { top: 10 + insets.top }]}
            onPress={() => router.back()}
        >
            <Text style={styles.text}>← Back</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        position: 'absolute',
        left: 15,
        zIndex: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    text: {
        fontSize: 16,
        fontWeight: '600',
        color: '#10b981',
    },
});
