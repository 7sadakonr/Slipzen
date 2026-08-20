import React, { useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  interpolate
} from 'react-native-reanimated';
import { colors, typography } from '../../theme';
import { useRouter } from 'expo-router';


const { width } = Dimensions.get('window');

interface ArcMenuProps {
  visible: boolean;
  onClose: () => void;
}

export function ArcMenu({ visible, onClose }: ArcMenuProps) {
  const router = useRouter();
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withSpring(visible ? 1 : 0, {
      damping: 16,
      stiffness: 220,
      mass: 0.6,
    });
  }, [visible]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: withTiming(visible ? 1 : 0, { duration: 200 }),
  }));

  // Button 1: Left (Scan)
  const btn1Style = useAnimatedStyle(() => {
    const x = interpolate(progress.value, [0, 1], [0, -85]);
    const y = interpolate(progress.value, [0, 1], [20, -65]);
    const scale = interpolate(progress.value, [0, 1], [0.3, 1]);
    const opacity = interpolate(progress.value, [0, 0.5, 1], [0, 0, 1]);
    return {
      transform: [{ translateX: x }, { translateY: y }, { scale }],
      opacity,
    };
  });

  // Button 2: Top (E-Receipt)
  const btn2Style = useAnimatedStyle(() => {
    const y = interpolate(progress.value, [0, 1], [20, -100]);
    const scale = interpolate(progress.value, [0, 1], [0.3, 1]);
    const opacity = interpolate(progress.value, [0, 0.5, 1], [0, 0, 1]);
    return {
      transform: [{ translateY: y }, { scale }],
      opacity,
    };
  });

  // Button 3: Right (Manual)
  const btn3Style = useAnimatedStyle(() => {
    const x = interpolate(progress.value, [0, 1], [0, 85]);
    const y = interpolate(progress.value, [0, 1], [20, -65]);
    const scale = interpolate(progress.value, [0, 1], [0.3, 1]);
    const opacity = interpolate(progress.value, [0, 0.5, 1], [0, 0, 1]);
    return {
      transform: [{ translateX: x }, { translateY: y }, { scale }],
      opacity,
    };
  });

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents={visible ? 'box-none' : 'none'}>
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, backdropStyle]} pointerEvents={visible ? 'auto' : 'none'}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
      </Animated.View>

      {/* Popup Buttons */}
      <View style={styles.menuContainer} pointerEvents="box-none">
        
        {/* Left: Scan */}
        <Animated.View style={[styles.menuItem, btn1Style]}>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => { onClose(); router.push('/scan'); }}
          >
            <Ionicons name="camera" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.label}>Scan</Text>
        </Animated.View>

        {/* Top: E-Receipt */}
        <Animated.View style={[styles.menuItem, btn2Style]}>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => { 
              onClose(); 
              // TODO: Implement E-Receipt picker flow, routing to /scan for now
              router.push('/scan'); 
            }}
          >
            <Ionicons name="image" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.label}>E-Receipt</Text>
        </Animated.View>

        {/* Right: Manual */}
        <Animated.View style={[styles.menuItem, btn3Style]}>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => { onClose(); router.push('/expense/add'); }}
          >
            <Ionicons name="pencil" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.label}>Manual</Text>
        </Animated.View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent', // Removed white background per user request
  },
  menuContainer: {
    position: 'absolute',
    bottom: 120, // anchor point
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  menuItem: {
    position: 'absolute',
    alignItems: 'center',
    width: 80, // give enough width for labels
  },
  iconButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(78, 81, 235, 0.1)', // subtle primary border
    marginBottom: 8,
  },
  label: {
    ...typography.caption1,
    color: colors.textPrimary,
    fontWeight: '600',
    textAlign: 'center',
  }
});
