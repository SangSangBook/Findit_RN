import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  iconCircle: {
    width: 13,
    height: 13,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedTypeText: {
    fontSize: 13,
    fontFamily: 'PretendardMedium',
    textAlign: 'left',
    flex: 1,
  },
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContentContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  modalTitle: {
    fontFamily: 'GmarketSansBold',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingHorizontal: 20,
  },
  modalItemSelected: {
    backgroundColor: '#e0e0e0', 
  },
  itemIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  modalItemText: {
    fontFamily: 'GmarketSansMedium',
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
});
