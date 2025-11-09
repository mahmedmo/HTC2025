import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { sessionService } from '../services/session';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
    const router = useRouter();
    const [userName, setUserName] = useState<string>('');
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const [logoutModalVisible, setLogoutModalVisible] = useState(false);

    useEffect(() => {
        const loadUserSession = async () => {
            const session = await sessionService.getSession();
            if (session) {
                setUserName(session.name);
            }
        };
        loadUserSession();
    }, []);

    const selectRole = (role: 'pinner' | 'collector' | 'leaderboard') => {
        if (role === 'pinner') {
            router.push('/pages/pinner/upload');
        } else if (role === 'leaderboard') {
            router.push('/pages/leaderboard');
        } else {
            router.push('/pages/collector/map');
        }
    };

    const handleLogout = async () => {
        setDropdownVisible(false);
        setLogoutModalVisible(true);
    };

    const confirmLogout = async () => {
        setLogoutModalVisible(false);
        await sessionService.clearSession();
        router.replace('/pages/login');
    };

    return (
        <View style={styles.background}>
            {/* Gradient overlays */}
            <View style={styles.gradientTop} />
            <View style={styles.gradientBottom} />
            
            {/* Floating decorative elements */}
            <View style={styles.floatingCircle1} />
            <View style={styles.floatingCircle2} />
            <View style={styles.floatingCircle3} />
            <View style={styles.floatingCircle4} />
            <View style={styles.floatingCircle5} />
            <View style={styles.floatingCircle6} />
            
            {/* Accent shapes */}
            <View style={styles.accentShape1} />
            <View style={styles.accentShape2} />
            <View style={styles.accentShape3} />
            
            {/* Dots pattern */}
            <View style={styles.dot1} />
            <View style={styles.dot2} />
            <View style={styles.dot3} />
            <View style={styles.dot4} />
            <View style={styles.dot5} />
            <View style={styles.dot6} />
            <View style={styles.dot7} />
            <View style={styles.dot8} />
            
            <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
                <TouchableOpacity 
                    style={styles.profileButton}
                    onPress={() => setDropdownVisible(!dropdownVisible)}
                >
                    <View style={styles.profileIconContainer}>
                        <View style={styles.profileIconBg} />
                        <Ionicons name="person-circle" size={50} color="#fff" style={styles.profileIcon} />
                    </View>
                </TouchableOpacity>

            {dropdownVisible && (
                <>
                    <TouchableOpacity
                        style={styles.dropdownOverlay}
                        onPress={() => setDropdownVisible(false)}
                        activeOpacity={1}
                    />
                    <View style={styles.dropdown}>
                        
                        
                        <TouchableOpacity
                            style={styles.dropdownItem}
                            onPress={() => {
                                setDropdownVisible(false);
                                router.push('/pages/pinner/my-pins');
                            }}
                        >
                            <Ionicons name="location-outline" size={20} color="#f1f5f9" />
                            <Text style={styles.dropdownText}>My Pins</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                            style={styles.dropdownItem}
                            onPress={handleLogout}
                        >
                            <Ionicons name="power-outline" size={20} color="#f87171" />
                            <Text style={[styles.dropdownText, { color: '#f87171' }]}>Log Out</Text>
                        </TouchableOpacity>
                    </View>
                </>
            )}


            <View style={styles.headerSection}>
                <Text style={styles.appName}>Bottles Ping</Text>
                {userName && (
                    <View style={styles.welcomeContainer}>
                        <Text style={styles.welcomeText}>Welcome back,</Text>
                        <Text style={styles.userName}>{userName}! 👋</Text>
                    </View>
                )}
            </View>
            
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.roleButton, styles.pinnerButton]}
                    onPress={() => selectRole('pinner')}
                >
                    <View style={styles.buttonGradientOverlay} />
                    <View style={styles.buttonShine} />
                    <View style={styles.buttonContent}>
                        <View style={styles.emojiContainer}>
                            <Text style={styles.emoji}>📍</Text>
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={styles.roleTitle}>Pin</Text>
                            <Text style={styles.roleDescription}>Post bottles</Text>
                        </View>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.roleButton, styles.collectorButton]}
                    onPress={() => selectRole('collector')}
                >
                    <View style={styles.buttonGradientOverlay} />
                    <View style={styles.buttonShine} />
                    <View style={styles.buttonContent}>
                        <View style={styles.emojiContainer}>
                            <Text style={styles.emoji}>♻️</Text>
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={styles.roleTitle}>Collect</Text>
                            <Text style={styles.roleDescription}>Collect bottles</Text>
                        </View>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.roleButton, styles.leaderboardButton]}
                    onPress={() => selectRole('leaderboard')}
                >
                    <View style={styles.buttonGradientOverlay} />
                    <View style={styles.buttonShine} />
                    <View style={styles.buttonContent}>
                        <View style={styles.emojiContainer}>
                            <Text style={styles.emoji}>🏆</Text>
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={styles.roleTitle}>Leaderboard</Text>
                            <Text style={styles.roleDescription}>See top collectors</Text>
                        </View>
                    </View>
                </TouchableOpacity>
            </View>

            {/* Logout Confirmation Modal */}
            <Modal
                visible={logoutModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setLogoutModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalIconContainer}>
                            <Ionicons name="log-out-outline" size={48} color="#f87171" />
                        </View>
                        
                        <Text style={styles.modalTitle}>Logout</Text>
                        <Text style={styles.modalMessage}>Are you sure you want to logout?</Text>
                        
                        <View style={styles.modalButtonContainer}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalCancelButton]}
                                onPress={() => setLogoutModalVisible(false)}
                            >
                                <Text style={styles.modalCancelText}>Cancel</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalLogoutButton]}
                                onPress={confirmLogout}
                            >
                                <Text style={styles.modalLogoutText}>Logout</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        backgroundColor: '#0f172a',
        position: 'relative',
        overflow: 'hidden',
    },
    gradientTop: {
        position: 'absolute',
        top: -100,
        left: -100,
        right: -100,
        height: 400,
        backgroundColor: '#1e40af',
        opacity: 0.15,
        borderRadius: 200,
        transform: [{ scaleX: 1.5 }],
    },
    gradientBottom: {
        position: 'absolute',
        bottom: -150,
        left: -100,
        right: -100,
        height: 500,
        backgroundColor: '#059669',
        opacity: 0.12,
        borderRadius: 250,
        transform: [{ scaleX: 1.5 }],
    },
    floatingCircle1: {
        position: 'absolute',
        width: 250,
        height: 250,
        borderRadius: 125,
        backgroundColor: '#3b82f6',
        opacity: 0.08,
        top: 50,
        right: -80,
        borderWidth: 2,
        borderColor: '#3b82f6',
    },
    floatingCircle2: {
        position: 'absolute',
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: '#10b981',
        opacity: 0.1,
        top: 150,
        left: -60,
    },
    floatingCircle3: {
        position: 'absolute',
        width: 220,
        height: 220,
        borderRadius: 110,
        backgroundColor: '#8b5cf6',
        opacity: 0.07,
        bottom: 100,
        left: 30,
    },
    floatingCircle4: {
        position: 'absolute',
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: '#f59e0b',
        opacity: 0.09,
        bottom: 250,
        right: 20,
    },
    floatingCircle5: {
        position: 'absolute',
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#ec4899',
        opacity: 0.08,
        top: 350,
        right: 50,
    },
    floatingCircle6: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: '#06b6d4',
        opacity: 0.06,
        bottom: -50,
        left: -70,
    },
    accentShape1: {
        position: 'absolute',
        width: 300,
        height: 300,
        backgroundColor: '#6366f1',
        opacity: 0.04,
        top: -100,
        left: -100,
        borderRadius: 150,
        transform: [{ rotate: '45deg' }],
    },
    accentShape2: {
        position: 'absolute',
        width: 250,
        height: 250,
        backgroundColor: '#14b8a6',
        opacity: 0.05,
        bottom: -80,
        right: -80,
        borderRadius: 125,
        transform: [{ rotate: '-30deg' }],
    },
    accentShape3: {
        position: 'absolute',
        width: 180,
        height: 180,
        backgroundColor: '#f97316',
        opacity: 0.06,
        top: 200,
        left: -40,
        borderRadius: 90,
        transform: [{ rotate: '15deg' }],
    },
    dot1: {
        position: 'absolute',
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#60a5fa',
        opacity: 0.4,
        top: 120,
        left: 80,
    },
    dot2: {
        position: 'absolute',
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#34d399',
        opacity: 0.5,
        top: 200,
        right: 100,
    },
    dot3: {
        position: 'absolute',
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#a78bfa',
        opacity: 0.3,
        bottom: 300,
        left: 50,
    },
    dot4: {
        position: 'absolute',
        width: 7,
        height: 7,
        borderRadius: 3.5,
        backgroundColor: '#fbbf24',
        opacity: 0.4,
        bottom: 200,
        right: 60,
    },
    dot5: {
        position: 'absolute',
        width: 5,
        height: 5,
        borderRadius: 2.5,
        backgroundColor: '#f472b6',
        opacity: 0.5,
        top: 300,
        left: 120,
    },
    dot6: {
        position: 'absolute',
        width: 9,
        height: 9,
        borderRadius: 4.5,
        backgroundColor: '#22d3ee',
        opacity: 0.4,
        top: 450,
        right: 80,
    },
    dot7: {
        position: 'absolute',
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#fb923c',
        opacity: 0.5,
        bottom: 150,
        left: 90,
    },
    dot8: {
        position: 'absolute',
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#4ade80',
        opacity: 0.3,
        top: 250,
        right: 140,
    },
    container: {
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 40,
    },
    headerSection: {
        alignItems: 'center',
        marginTop: 80,
        marginBottom: 20,
    },
    profileButton: {
        position: 'absolute',
        top: 50,
        right: 24,
        zIndex: 1,
    },
    profileIconContainer: {
        backgroundColor: '#10b981',
        borderRadius: 30,
        padding: 5,
        shadowColor: '#10b981',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 8,
        position: 'relative',
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: 'rgba(52, 211, 153, 0.5)',
    },
    profileIconBg: {
        position: 'absolute',
        top: -20,
        right: -20,
        width: 50,
        height: 50,
        backgroundColor: 'rgba(52, 211, 153, 0.3)',
        borderRadius: 25,
    },
    profileIcon: {
        zIndex: 1,
    },
    dropdownOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 999,    
    },
    dropdown: {
        position: 'absolute',
        top: 100,
        right: 24,
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        borderRadius: 16,
        padding: 6,
        shadowColor: '#10b981',
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 10,
        zIndex: 1000,
        minWidth: 200,
        borderWidth: 1,
        borderColor: 'rgba(16, 185, 129, 0.2)',
    },
    dropdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: 10,
        gap: 10,
    },
    dropdownText: {
        fontSize: 15,
        color: '#f1f5f9',
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    title: {
        fontSize: 80,
        marginBottom: 10,
    },
    appName: {
        fontSize: 44,
        fontWeight: '900',
        color: '#fff',
        marginBottom: 16,
        textShadowColor: 'rgba(16, 185, 129, 0.5)',
        textShadowOffset: { width: 0, height: 4 },
        textShadowRadius: 12,
        letterSpacing: 1.5,
        textAlign: 'center',
    },
    welcomeContainer: {
        alignItems: 'center',
        gap: 4,
    },
    welcomeText: {
        fontSize: 15,
        color: '#94a3b8',
        fontWeight: '400',
        letterSpacing: 0.5,
    },
    userName: {
        fontSize: 24,
        color: '#fff',
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    subtitle: {
        fontSize: 18,
        color: '#6b7280',
        marginBottom: 30,
    },
    buttonContainer: {
        width: '100%',
        gap: 16,
        marginBottom: 20,
    },
    roleButton: {
        paddingVertical: 20,
        paddingHorizontal: 24,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
        position: 'relative',
        overflow: 'hidden',
    },
    buttonGradientOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    buttonShine: {
        position: 'absolute',
        top: -50,
        right: -50,
        width: 150,
        height: 150,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 75,
        transform: [{ rotate: '45deg' }],
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: 16,
        zIndex: 1,
        paddingLeft: 8,
    },
    emojiContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 14,
        padding: 10,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        width: 64,
        height: 64,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emoji: {
        fontSize: 36,
        lineHeight: 36,
        textAlign: 'center',
    },
    textContainer: {
        alignItems: 'flex-start',
        flex: 1,
    },
    pinnerButton: {
        backgroundColor: '#10b981',
        borderWidth: 2,
        borderColor: 'rgba(52, 211, 153, 0.4)',
    },
    collectorButton: {
        backgroundColor: '#3b82f6',
        borderWidth: 2,
        borderColor: 'rgba(96, 165, 250, 0.4)',
    },
    leaderboardButton: {
        backgroundColor: '#8b5cf6',
        borderWidth: 2,
        borderColor: 'rgba(167, 139, 250, 0.4)',
    },
    roleTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#fff',
        marginBottom: 3,
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
        letterSpacing: 0.5,
    },
    roleDescription: {
        fontSize: 13,
        color: '#fff',
        opacity: 0.9,
        fontWeight: '500',
        letterSpacing: 0.3,
    },
    modalOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalContainer: {
        backgroundColor: '#1e293b',
        borderRadius: 24,
        padding: 28,
        width: '100%',
        maxWidth: 340,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(248, 113, 113, 0.3)',
        shadowColor: '#f87171',
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 12,
    },
    modalIconContainer: {
        backgroundColor: 'rgba(248, 113, 113, 0.15)',
        borderRadius: 40,
        padding: 16,
        marginBottom: 20,
        borderWidth: 2,
        borderColor: 'rgba(248, 113, 113, 0.3)',
    },
    modalTitle: {
        fontSize: 26,
        fontWeight: '800',
        color: '#fff',
        marginBottom: 10,
        letterSpacing: 0.5,
    },
    modalMessage: {
        fontSize: 15,
        color: '#94a3b8',
        textAlign: 'center',
        marginBottom: 28,
        lineHeight: 22,
        letterSpacing: 0.3,
    },
    modalButtonContainer: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    modalButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    modalCancelButton: {
        backgroundColor: '#334155',
        borderWidth: 1,
        borderColor: '#475569',
    },
    modalLogoutButton: {
        backgroundColor: '#ef4444',
        borderWidth: 1,
        borderColor: '#f87171',
        shadowColor: '#ef4444',
    },
    modalCancelText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#f1f5f9',
        letterSpacing: 0.5,
    },
    modalLogoutText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
        letterSpacing: 0.5,
    },
});