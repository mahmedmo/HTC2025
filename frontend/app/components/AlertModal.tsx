import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface AlertButton {
    text: string;
    style?: 'default' | 'cancel' | 'destructive';
    onPress?: () => void;
}

interface AlertModalProps {
    visible: boolean;
    title: string;
    message: string;
    buttons: AlertButton[];
    onRequestClose?: () => void;
    isDarkMode?: boolean;
}

export default function AlertModal({ 
    visible, 
    title, 
    message, 
    buttons, 
    onRequestClose,
    isDarkMode = false
}: AlertModalProps) {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onRequestClose}
        >
            <View style={styles.overlay}>
                <View style={[styles.container, isDarkMode && styles.containerDark]}>
                    <Text style={[styles.title, isDarkMode && styles.titleDark]}>{title}</Text>
                    <Text style={[styles.message, isDarkMode && styles.messageDark]}>{message}</Text>
                    <View style={styles.buttonContainer}>
                        {buttons.map((button, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.button,
                                    button.style === 'cancel' && styles.cancelButton,
                                    button.style === 'destructive' && styles.destructiveButton,
                                    isDarkMode && styles.buttonDark,
                                    isDarkMode && button.style === 'cancel' && styles.cancelButtonDark,
                                ]}
                                onPress={() => {
                                    button.onPress?.();
                                    onRequestClose?.();
                                }}
                            >
                                <Text
                                    style={[
                                        styles.buttonText,
                                        button.style === 'cancel' && styles.cancelButtonText,
                                        button.style === 'destructive' && styles.destructiveButtonText,
                                    ]}
                                >
                                    {button.text}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    container: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        width: '100%',
        maxWidth: 340,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    containerDark: {
        backgroundColor: '#1f2937',
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: 12,
        textAlign: 'center',
    },
    titleDark: {
        color: '#f9fafb',
    },
    message: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 20,
        textAlign: 'center',
        lineHeight: 20,
    },
    messageDark: {
        color: '#d1d5db',
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 12,
        justifyContent: 'center',
    },
    button: {
        flex: 1,
        backgroundColor: '#3b82f6',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonDark: {
        backgroundColor: '#2563eb',
    },
    cancelButton: {
        backgroundColor: '#e5e7eb',
    },
    cancelButtonDark: {
        backgroundColor: '#374151',
    },
    destructiveButton: {
        backgroundColor: '#ef4444',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    cancelButtonText: {
        color: '#374151',
    },
    destructiveButtonText: {
        color: '#fff',
    },
});
