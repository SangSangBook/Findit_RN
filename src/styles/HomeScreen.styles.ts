import { Platform, StyleSheet } from 'react-native';

export const homeScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  contentContainer: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row', // 가로 정렬
    alignItems: 'center', // 세로 중앙 정렬
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20, // 좌우 여백 추가
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  logo: {
    width: 40, // 로고 크기 조정
    height: 40,
    marginRight: 10, // 텍스트와 간격 추가
  },
  headerTextContainer: {
    flex: 1, // 텍스트가 남은 공간을 차지하도록 설정
  },
  title: {
    fontFamily: 'GmarketSansBold', // 폰트 변경
    fontSize: 24, // 제목 크기 조정
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 5, // 제목과 부제목 간격 조정
  },
  subtitle: {
    fontFamily: 'GmarketSansLight', // 폰트 변경
    fontSize: 14, // 부제목 크기 조정
    color: '#718096',
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
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontFamily: 'GmarketSansBold',
    fontSize: 20,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 15,
  },
  imagesScrollContainer: {
    paddingVertical: 10,
  },
  imageWrapper: {
    shadowRadius: 3,
    elevation: 3,
    position: 'relative',
    marginRight: 10, // 이미지 간 간격 추가
  },
  imageThumbnail: {
    width: 100, 
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
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 30,
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
});