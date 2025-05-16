import { Platform, StyleSheet } from 'react-native';

export const homeScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 95 : 40,
    paddingBottom: 20,
    paddingHorizontal: 24,
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontFamily: 'YdestreetL',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222222',
    marginBottom: 5,
  },
  subtitle: {
    fontFamily: 'PretendardBold',
    fontWeight: 'bold',
    fontSize: 32,
    color: '#22222',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 30,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  uploadButton: {
    backgroundColor: '#4299e1',
  },
  cameraButton: {
    backgroundColor: '#48bb78',
  },
  buttonText: {
    fontFamily: 'GmarketSansMedium',
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  imagesSection: {
    marginTop: 10,
  },
  sectionTitle: {
    fontFamily: 'GmarketSansBold',
    fontSize: 20,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  imagesScrollContainer: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  imageWrapper: {
    shadowRadius: 3,
    elevation: 3,
    position: 'relative',
    marginRight: 10,
  },
  imageThumbnail: {
    width: '100%', 
    height: 150, 
    borderRadius: 12,
    backgroundColor: '#e0e0e0',
  },
  loadingOverlayThumb: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 12,
  },
  summarySection: {
    flex: 1,
  },
  mediaUploadContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  imageUploadButton: {
    paddingVertical: 82,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    marginTop: 24,
    marginHorizontal: 36,
  },
  imageUploadButtonText: {
    fontFamily: 'PretendardMedium',
    color: '#8E8E8E',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  getInfoButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4299e1', // 파란색 버튼으로 변경
    marginTop: 16,
    marginHorizontal: 36,
  },
  getInfoButtonText: {
    fontFamily: 'PretendardMedium',
    color: '#FFFFFF', // 흰색 텍스트로 변경
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  getInfoButtonDisabled: {
    backgroundColor: '#a0aec0', // 비활성화 시 회색으로 변경
  },
  videoUploadButton: {
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    backgroundColor: '#F5F5F5',
  },
  videoUploadButtonText: {
    fontFamily: 'PretendardMedium',
    color: '#8E8E8E',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  imageTouchable: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: '90%',
    height: '70%',
    borderRadius: 12,
  },
  deleteButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    padding: 5,
    zIndex: 10,
  },
  modalCloseButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    right: 20,
    zIndex: 20,
    padding: 10,
  },
  sheetModal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  // 미디어 프리뷰 관련 스타일
  mediaPreviewContainer: {
    marginTop: 24,
    marginHorizontal: 36,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    padding: 16,
  },
  mediaPreviewScrollContainer: {
    paddingVertical: 10,
  },
  mediaPreviewWrapper: {
    marginRight: 10,
    borderRadius: 12,
    overflow: 'hidden',
    width: 120,
    height: 120,
  },
  mediaPreviewTouchable: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  mediaPreviewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  addMoreMediaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginTop: 10,
  },
  addMoreMediaText: {
    fontFamily: 'PretendardMedium',
    color: '#4299e1',
    fontSize: 14,
    marginLeft: 5,
  },
  // 정보 결과 관련 스타일
  infoResultContainer: {
    marginTop: 20,
    marginHorizontal: 36,
    padding: 15,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  infoResultScrollView: {
    maxHeight: 300,
  },
  infoResultText: {
    fontFamily: 'GmarketSansMedium',
    fontSize: 14,
    color: '#1f2937',
    lineHeight: 20,
  },
  // 로딩 애니메이션 스타일
  loadingWaveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingBar: {
    width: 4,
    height: 20,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 2,
  },
});