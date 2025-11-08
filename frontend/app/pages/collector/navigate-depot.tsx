import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import BackButton from '../../components/BackButton';

export default function NavigateDepotScreen()
{
    const router = useRouter();
    const distance = 250;
    const duration = 10;
    const isAtDepot = distance <= 100;

    const markComplete = () =>
    {
        if (!isAtDepot)
        {
            return;
        }
        router.push('/pages/collector/complete-pin');
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <BackButton />
            <View style={styles.placeholder}>
                <Text style={styles.placeholderIcon}>🍾</Text>
                <Text style={styles.placeholderText}>Navigate to bottle depot</Text>
            </View>

            <View style={styles.infoContainer}>
                <Text style={styles.infoTitle}>Nearest Bottle Depot</Text>
                <View style={styles.stats}>
                    <View style={styles.stat}>
                        <Text style={styles.statLabel}>Distance</Text>
                        <Text style={styles.statValue}>
                            {distance < 1000
                                ? `${Math.round(distance)}m`
                                : `${(distance / 1000).toFixed(2)}km`}
                        </Text>
                    </View>
                    <View style={styles.stat}>
                        <Text style={styles.statLabel}>ETA</Text>
                        <Text style={styles.statValue}>{duration} min</Text>
                    </View>
                </View>
            </View>

            <TouchableOpacity
                style={[styles.button, !isAtDepot && styles.buttonDisabled]}
                onPress={markComplete}
                disabled={!isAtDepot}
            >
                <Text style={styles.buttonText}>
                    {isAtDepot ? 'Mark Complete' : `Get to depot (${Math.round(distance)}m away)`}
                </Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
        padding: 20,
    },
    placeholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
    infoContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 10,
        textAlign: 'center',
    },
    stats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    stat: {
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 12,
        color: '#6b7280',
        marginBottom: 4,
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#3b82f6',
    },
    button: {
        backgroundColor: '#3b82f6',
        padding: 18,
        borderRadius: 12,
        alignItems: 'center',
    },
    buttonDisabled: {
        backgroundColor: '#9ca3af',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
