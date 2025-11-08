import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PinnerMapScreen()
{
    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <Text style={styles.title}>My Pins Map</Text>
            <View style={styles.placeholder}>
                <Text style={styles.placeholderIcon}>=ú</Text>
                <Text style={styles.placeholderText}>Map view of pins you created</Text>
            </View>
        </SafeAreaView>
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
    placeholderIcon: {
        fontSize: 80,
        marginBottom: 20,
    },
    placeholderText: {
        fontSize: 18,
        color: '#6b7280',
    },
});
