import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function CompletePinScreen()
{
    const router = useRouter();

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <View style={styles.card}>
                <Text style={styles.emoji}></Text>
                <Text style={styles.title}>Collection Complete!</Text>
                <Text style={styles.subtitle}>Great job recycling</Text>

                <View style={styles.summary}>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Bottles Collected:</Text>
                        <Text style={styles.summaryValue}>24</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Earnings:</Text>
                        <Text style={styles.summaryValueGreen}>$2.40</Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.button}
                    onPress={() => router.replace('/pages/collector/map')}
                >
                    <Text style={styles.buttonText}>Find More Pins</Text>
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
        padding: 40,
        borderRadius: 16,
        alignItems: 'center',
    },
    emoji: {
        fontSize: 80,
        marginBottom: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#10b981',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 18,
        color: '#6b7280',
        marginBottom: 30,
    },
    summary: {
        width: '100%',
        backgroundColor: '#f9fafb',
        padding: 20,
        borderRadius: 12,
        marginBottom: 30,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    summaryLabel: {
        fontSize: 16,
        color: '#6b7280',
    },
    summaryValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#374151',
    },
    summaryValueGreen: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#10b981',
    },
    button: {
        backgroundColor: '#10b981',
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
