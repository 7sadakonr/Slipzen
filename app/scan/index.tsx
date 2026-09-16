import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Platform, Pressable, Alert, StatusBar, useColorScheme } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlassView } from 'expo-glass-effect';
import { useReceiptStore } from '../../stores/receipt-store';
import { Button } from '../../components/ui/button';

const { width } = Dimensions.get('window');

export default function CameraScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<any>(null);
  const { setImage, clear } = useReceiptStore();
  const [flash, setFlash] = useState<'off' | 'on' | 'auto'>('off');
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    clear();
  }, []);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>We need your permission to show the camera</Text>
        <Button title="Grant Permission" onPress={requestPermission} />
      </View>
    );
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 1,
        base64: false, // We will compress and get base64 in the next screen to save time here
      });
      setImage(photo.uri, 'camera');
      router.push('/scan/preview');
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0].uri, 'gallery');
      router.push('/scan/preview');
    }
  };

  const toggleFlash = () => {
    setFlash(current => current === 'off' ? 'on' : 'off');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" hidden={true} />
      <CameraView 
        style={styles.camera} 
        facing="back" 
        flash={flash} 
        enableTorch={flash === 'on'} 
        ref={cameraRef}
      >
        <SafeAreaView style={styles.safeArea}>
          {/* Top Controls */}
          <View style={styles.topControls}>
            <GlassView tintColor="#333333" style={styles.glassButtonSmall}>
              <Pressable onPress={() => router.back()} style={StyleSheet.absoluteFill}>
                {({ pressed }) => (
                  <View style={[
                    {flex: 1, justifyContent: 'center', alignItems: 'center'},
                    pressed && { backgroundColor: 'rgba(255,255,255,0.2)' }
                  ]}>
                    <Ionicons name="close" size={24} color="white" />
                  </View>
                )}
              </Pressable>
            </GlassView>
          </View>

          {/* Guide Frame */}
          <View style={styles.guideContainer}>
            <View style={styles.guideFrame}>
              <View style={[styles.corner, styles.topLeft, { borderColor: 'rgba(255, 255, 255, 0.8)' }]} />
              <View style={[styles.corner, styles.topRight, { borderColor: 'rgba(255, 255, 255, 0.8)' }]} />
              <View style={[styles.corner, styles.bottomLeft, { borderColor: 'rgba(255, 255, 255, 0.8)' }]} />
              <View style={[styles.corner, styles.bottomRight, { borderColor: 'rgba(255, 255, 255, 0.8)' }]} />
            </View>
            <GlassView tintColor="#333333" style={styles.guideTextContainer}>
              <Text style={[styles.guideText, { color: '#ffffff' }]}>Align receipt within frame</Text>
            </GlassView>
          </View>

          {/* Bottom Controls */}
          <View style={styles.bottomControls}>
            <View style={styles.sideButtonContainer}>
              <GlassView tintColor="#333333" style={styles.glassButtonMedium}>
                <Pressable onPress={pickImage} style={StyleSheet.absoluteFill}>
                  {({ pressed }) => (
                    <View style={[
                      {flex: 1, justifyContent: 'center', alignItems: 'center'},
                      pressed && { backgroundColor: 'rgba(255,255,255,0.2)' }
                    ]}>
                      <Ionicons name="images-outline" size={24} color="white" />
                    </View>
                  )}
                </Pressable>
              </GlassView>
            </View>

            <GlassView tintColor="#333333" style={styles.captureButtonOuter}>
              <Pressable onPress={takePicture} style={StyleSheet.absoluteFill}>
                {({ pressed }) => (
                  <View style={[
                    {flex: 1, justifyContent: 'center', alignItems: 'center'},
                    pressed && { backgroundColor: 'rgba(255,255,255,0.1)' }
                  ]}>
                    <View style={[styles.captureButtonInner, { backgroundColor: 'white' }, pressed && { transform: [{ scale: 0.9 }], opacity: 0.8 }]} />
                  </View>
                )}
              </Pressable>
            </GlassView>

            <View style={styles.sideButtonContainer}>
              <GlassView tintColor="#333333" style={styles.glassButtonMedium}>
                <Pressable onPress={toggleFlash} style={StyleSheet.absoluteFill}>
                  {({ pressed }) => (
                    <View style={[
                      {flex: 1, justifyContent: 'center', alignItems: 'center'},
                      pressed && { backgroundColor: 'rgba(255,255,255,0.2)' }
                    ]}>
                      <Ionicons 
                        name={flash === 'on' ? 'flash' : 'flash-off'} 
                        size={24} 
                        color="white" 
                      />
                    </View>
                  )}
                </Pressable>
              </GlassView>
            </View>
          </View>
        </SafeAreaView>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: 'black',
  },
  text: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 24,
    color: 'white',
  },
  camera: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  glassButtonSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  glassButtonMedium: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
  },
  captureButtonOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'white',
  },
  guideContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guideFrame: {
    width: width * 0.85,
    height: width * 1.3,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 16,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 16,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 16,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 16,
  },
  guideTextContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 24,
    borderRadius: 20,
    overflow: 'hidden',
  },
  guideText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 32,
    paddingBottom: 24,
  },
  sideButtonContainer: {
    width: 60,
    alignItems: 'center',
  },
  iconDynamic: {
  },
  iconShadow: {
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  textShadow: {
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  }
});
