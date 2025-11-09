import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import BackButton from '../../components/BackButton';

export default function PinDetailsScreen()
{
    const router = useRouter();

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <BackButton />
            <View style={styles.card}>
                <Text style={styles.emoji}>~</Text>
                <Text style={styles.title}>Pin Details</Text>

                <View style={styles.detailsContainer}>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Bottles:</Text>
                        <Text style={styles.detailValue}>24</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Value:</Text>
                        <Text style={styles.detailValue}>$2.40</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Distance:</Text>
                        <Text style={styles.detailValue}>0.5 km</Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.button}
                    onPress={() => router.push('/pages/collector/accept-pin')}
                >
                    <Text style={styles.buttonText}>Accept Pin</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
        backgroundColor: '#f9fafb',
    },
    card: {
        backgroundColor: '#fff',
        padding: 30,
        borderRadius: 16,
        alignItems: 'center',
    },
    emoji: {
        fontSize: 64,
        marginBottom: 15,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#3b82f6',
        marginBottom: 25,
    },
    detailsContainer: {
        width: '100%',
        backgroundColor: '#f9fafb',
        padding: 20,
        borderRadius: 12,
        marginBottom: 25,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    detailLabel: {
        fontSize: 16,
        color: '#6b7280',
    },
    detailValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
    },
    button: {
        backgroundColor: '#3b82f6',
        padding: 18,
        borderRadius: 12,
        alignItems: 'center',
        width: '100%',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
});
