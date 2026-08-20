import * as ImageManipulator from 'expo-image-manipulator';

export async function compressImage(uri: string) {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 1080 } }],
    { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG, base64: true }
  );
  return result;
}
