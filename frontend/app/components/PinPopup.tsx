import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Image,
  StyleSheet,
  Pressable,
  PanResponder,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IPin } from '../../types';

interface PinPopupProps {
  visible: boolean;
  pin: IPin | null;
  onClose: () => void;
  onAccept: (pin: IPin) => void;
  isDarkMode?: boolean;
}

export default function PinPopup({ visible, pin, onClose, onAccept, isDarkMode = false }: PinPopupProps) {
  const [timeRemaining, setTimeRemaining] = useState(1800);
  const panY = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  // Reset panY when closing to prevent visual artifacts
  useEffect(() => {
    if (!visible) {
      panY.setValue(0);
    }
  }, [visible]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          panY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100 || gestureState.vy > 0.5) {
          Animated.timing(panY, {
            toValue: 500,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            onClose();
            panY.setValue(0);
          });
        } else {
          Animated.spring(panY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current; // 30 minutes in seconds

  useEffect(() => {
    if (!visible || !pin) {
      setTimeRemaining(1800);
      return;
    }

    // Calculate time remaining if claimExpiry exists
    if (pin.claimExpiry) {
      const remaining = Math.max(0, Math.floor((pin.claimExpiry - Date.now()) / 1000));
      setTimeRemaining(remaining);
    }

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 0) {
          clearInterval(interval);
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [visible, pin]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!pin) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
          <Animated.View
            style={[
              styles.container,
              isDarkMode && styles.containerDark,
              {
                transform: [{ translateY: panY }],
              },
            ]}
            {...panResponder.panHandlers}
          >
            <View style={styles.header} {...panResponder.panHandlers}>
              <View style={styles.handle} />
            </View>

          {/* Bottle Image */}
          <View style={styles.imageContainer}>
            {pin.imageUrl ? (
              <Image
                source={{ uri: pin.imageUrl }}
                style={styles.bottleImage}
                resizeMode="cover"
                onError={(error) => {
                  console.log('[PinPopup] Image load error:', error.nativeEvent.error);
                  console.log('[PinPopup] Image URL:', pin.imageUrl);
                }}
                onLoad={() => {
                  console.log('[PinPopup] Image loaded successfully:', pin.imageUrl);
                }}
              />
            ) : (
              <View style={styles.placeholderImage}>
                <Text style={styles.bottleEmoji}>🍾</Text>
                <Text style={styles.placeholderText}>No image available</Text>
              </View>
            )}
          </View>

          {/* Details */}
          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <Text style={[styles.label, isDarkMode && styles.labelDark]}>Bottle Count:</Text>
              <Text style={[styles.value, isDarkMode && styles.valueDark]}>{pin.bottleCount} bottles</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={[styles.label, isDarkMode && styles.labelDark]}>Estimated Value:</Text>
              <Text style={styles.valueHighlight}>${pin.estimatedValue.toFixed(2)}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={[styles.label, isDarkMode && styles.labelDark]}>Uploaded:</Text>
              <Text style={[styles.value, isDarkMode && styles.valueDark]}>{formatDate(pin.createdAt)}</Text>
            </View>

            {pin.location.address && (
              <View style={styles.detailRow}>
                <Text style={[styles.label, isDarkMode && styles.labelDark]}>Location:</Text>
                <Text style={[styles.value, isDarkMode && styles.valueDark]} numberOfLines={2}>{pin.location.address}</Text>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View style={[styles.buttonContainer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
            <TouchableOpacity
              style={styles.goButton}
              onPress={() => onAccept(pin)}
            >
              <Text style={styles.goButtonText}>Start Collecting</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
  },
  containerDark: {
    backgroundColor: '#1f2937',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 12,
    position: 'relative',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    top: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#6B7280',
    fontWeight: '600',
  },
  imageContainer: {
    width: '100%',
    height: 180,
    backgroundColor: '#F3F4F6',
    marginBottom: 16,
  },
  bottleImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E5E7EB',
  },
  bottleEmoji: {
    fontSize: 64,
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 14,
    color: '#6B7280',
  },
  detailsContainer: {
    paddingHorizontal: 24,
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  labelDark: {
    color: '#d1d5db',
  },
  value: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  valueDark: {
    color: '#f9fafb',
  },
  valueHighlight: {
    fontSize: 18,
    color: '#10B981',
    fontWeight: '700',
  },
  timerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 12,
    marginTop: 4,
  },
  timerLabel: {
    fontSize: 16,
    color: '#92400E',
    fontWeight: '600',
  },
  timerValue: {
    fontSize: 24,
    color: '#92400E',
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  buttonContainer: {
    paddingHorizontal: 24,
    marginTop: 16,
  },
  goButton: {
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  goButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
