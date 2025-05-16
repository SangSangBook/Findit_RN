import { StyleSheet } from 'react-native';

export const videoPreviewStyles = StyleSheet.create({
  previewItemContainer: {
    width: 120,
    height: 120,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  previewMedia: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -16 }, { translateY: -16 }],
  },
});