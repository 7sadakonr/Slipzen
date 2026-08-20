

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, interpolateColor } from 'react-native-reanimated';
import { colors } from '../../theme';
import { ArcMenu } from '../../components/layout/arc-menu';

const { width } = Dimensions.get('window');

function AnimatedAddButton({ isMenuVisible }: { isMenuVisible: boolean }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withSpring(isMenuVisible ? 1 : 0, {
      damping: 12,
      stiffness: 150,
    });
  }, [isMenuVisible]);

  const animatedStyle = useAnimatedStyle(() => {
    const rotate = `${progress.value * 45}deg`; // Rotate 45deg (from + to x)
    const backgroundColor = interpolateColor(
      progress.value,
      [0, 1],
      [colors.primary, '#FF6B6B']
    );

    return {
      transform: [{ rotate }],
      backgroundColor,
    };
  });

  return (
    <Animated.View style={[styles.addBtnContainer, animatedStyle]}>
      <Ionicons name="add" size={36} color="#fff" />
    </Animated.View>
  );
}

export default function TabsLayout() {
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  return (
    <View style={styles.container} pointerEvents="box-none">
      <Tabs 
        screenOptions={{ 
          headerShown: true,
          tabBarShowLabel: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarStyle: {
            elevation: 0,
            backgroundColor: 'transparent',
            borderTopWidth: 0,
            height: Platform.OS === 'ios' ? 85 : 70,
            shadowOpacity: 0,
          },
          tabBarBackground: () => (
            <View 
              style={{ 
                ...StyleSheet.absoluteFillObject,
                backgroundColor: 'transparent',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.1,
                shadowRadius: 10,
                overflow: 'visible', // Ensure the bump is not clipped!
              }}
            >
              {/* Flat bar */}
              <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: -50, backgroundColor: '#ffffff' }} />
              
              {/* Center bump */}
              <View style={{ 
                position: 'absolute', 
                top: -24, 
                left: (width / 2) - 38, 
                width: 76, 
                height: 76, 
                borderRadius: 38, 
                backgroundColor: '#ffffff' 
              }} />
            </View>
          ),
          tabBarItemStyle: {
            height: 70,
            justifyContent: 'center',
            alignItems: 'center',
          }
        }}
      >
        <Tabs.Screen 
          name="index" 
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home-outline" size={size || 24} color={color} />
            ),
          }} 
        />
        <Tabs.Screen 
          name="transactions" 
          options={{
            title: 'History',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="list-outline" size={size || 24} color={color} />
            ),
          }} 
        />
        <Tabs.Screen 
          name="add" 
          options={{
            title: '',
            tabBarButton: () => <View style={{ width: 60 }} pointerEvents="none" />, // Just an empty space in the tab bar
          }} 
        />
        <Tabs.Screen 
          name="analytics" 
          options={{
            title: 'Analytics',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="pie-chart-outline" size={size || 24} color={color} />
            ),
          }} 
        />
        <Tabs.Screen 
          name="profile" 
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person-outline" size={size || 24} color={color} />
            ),
          }} 
        />
      </Tabs>

      {/* The absolute, bulletproof FAB that ignores all Tab layout rules */}
      <View style={styles.absoluteFabContainer} pointerEvents="box-none">
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => setIsMenuVisible(prev => !prev)}
          style={{ width: 56, height: 56 }}
        >
          <AnimatedAddButton isMenuVisible={isMenuVisible} />
        </TouchableOpacity>
      </View>

      <ArcMenu visible={isMenuVisible} onClose={() => setIsMenuVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  absoluteFabContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 44 : 29, // Matches exactly with the top of the bump
    left: (width / 2) - 28, // 56 / 2
    zIndex: 100,
    elevation: 10,
  },
  addBtnContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary,
  }
});
