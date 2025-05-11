import { StyleSheet } from 'react-native';

export const imagePreviewStyles = StyleSheet.create({
  imageContainer: {
    alignItems: 'center',
    marginHorizontal: 5,
    marginBottom: 20,
    width: 150,
  },
  previewImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 5,
    marginBottom: 5,
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