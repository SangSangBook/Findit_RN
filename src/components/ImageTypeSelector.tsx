import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Text, TouchableOpacity, View } from 'react-native';
import Modal from 'react-native-modal';
import { IMAGE_TYPE_COLORS, IMAGE_TYPE_NAMES, ImageType } from '../constants/ImageTypes';
import { styles } from '../styles/ImageTypeSelector.styles'; // Import styles

interface ImageTypeSelectorProps {
  uri: string;
  currentType: ImageType;
  onTypeChange: (uri: string, newType: ImageType) => void;
  disabled?: boolean;
}

const ImageTypeSelector: React.FC<ImageTypeSelectorProps> = ({ uri, currentType, onTypeChange, disabled }) => {
  const [selectedType, setSelectedType] = useState<ImageType>(currentType);
  const [modalVisible, setModalVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current; // Start slightly below

  useEffect(() => {
    setSelectedType(currentType);
  }, [currentType]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handleTypeSelect = (type: ImageType) => {
    if (type !== selectedType) {
      setSelectedType(type);
      onTypeChange(uri, type);
    }
    setModalVisible(false);
  };

  const pickerItems = Object.keys(IMAGE_TYPE_NAMES).map((key) => ({
    label: IMAGE_TYPE_NAMES[key as ImageType],
    value: key as ImageType,
  }));

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <TouchableOpacity
        style={styles.selectorButton}
        onPress={() => !disabled && setModalVisible(true)}
        disabled={disabled}
      >
        <View style={[styles.iconCircle, { backgroundColor: IMAGE_TYPE_COLORS[selectedType] || '#ccc', marginRight: 7.5 }]}>
        </View>
        <Text style={[styles.selectedTypeText, { color: IMAGE_TYPE_COLORS[selectedType] || '#000' }]}>
          {IMAGE_TYPE_NAMES[selectedType]}
        </Text>
        <MaterialIcons name="keyboard-arrow-down" size={24} color={IMAGE_TYPE_COLORS[selectedType] || '#000'} />
      </TouchableOpacity>

      <Modal
        isVisible={modalVisible}
        onBackdropPress={() => setModalVisible(false)}
        onSwipeComplete={() => setModalVisible(false)}
        swipeDirection={['down']}
        style={styles.modal}
        backdropOpacity={0.4}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        propagateSwipe={true}
      >
        <View style={styles.modalContentContainer}>
          <View style={styles.swipeIndicator} />
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>유형선택</Text>
          </View>
          <View>
            {pickerItems.map((item) => (
              <TouchableOpacity
                key={item.value}
                style={[
                  styles.modalItem,
                  item.value === selectedType && styles.modalItemSelected
                ]}
                onPress={() => handleTypeSelect(item.value)}
              >
                <View style={[
                  styles.itemIconCircle, 
                  { 
                    backgroundColor: IMAGE_TYPE_COLORS[item.value] || '#ccc',
                    opacity: item.value === selectedType ? 1 : 0.5
                  }
                ]}>
                </View>
                <Text style={[
                  styles.modalItemText,
                  { opacity: item.value === selectedType ? 1 : 0.5 }
                ]}>
                  {item.label}
                </Text>
                {item.value === selectedType && (
                  <MaterialIcons name="check" size={24} color={IMAGE_TYPE_COLORS[item.value]} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </Animated.View>
  );
};

export default ImageTypeSelector;
