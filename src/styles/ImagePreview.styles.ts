import { StyleSheet } from 'react-native';

export const imagePreviewStyles = StyleSheet.create({
  imageContainer: {
    flex: 1, // Allow it to take available space
    width: '100%', // Take full width
    height: '100%', // Take full height
    justifyContent: 'center', // Center content vertically
    alignItems: 'center', // Center content horizontally
    padding: 10, // Add some padding around the image/video
  },
  previewImage: {
    width: '100%', // Fill the container width
    height: '100%', // Fill the container height
    borderRadius: 5,
    // marginBottom: 5, // No longer needed if container handles spacing
    // aspectRatio: 1, // Remove to respect original aspect ratio with resizeMode: 'contain'
  },
  loadingOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5, // previewImage와 동일하게
  },
  loadingText: {
    color: '#fff',
    fontSize: 14,
    marginTop: 10,
  },
  ocrTextScrollView: {
    maxHeight: 100,
    width: '100%',
    marginTop: 5,
    padding: 5,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  ocrText: {
    fontSize: 12,
  },
}); 