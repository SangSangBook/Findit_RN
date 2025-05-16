import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, FlatList, SafeAreaView, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import Modal from 'react-native-modal';
import { IMAGE_TYPE_COLORS, IMAGE_TYPE_ICONS, IMAGE_TYPE_NAMES, ImageType } from '../constants/ImageTypes';
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
        animationIn="fadeInUp"
        animationOut="fadeOutDown"
        backdropOpacity={0.4}
        style={styles.modal}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <SafeAreaView style={styles.modalContentContainer}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>유형 선택</Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                    <MaterialIcons name="close" size={24} color="#333" />
                  </TouchableOpacity>
                </View>
                <FlatList
                  data={pickerItems}
                  keyExtractor={(item) => item.value}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.modalItem,
                        item.value === selectedType && styles.modalItemSelected
                      ]}
                      onPress={() => handleTypeSelect(item.value)}
                    >
                      <View style={[styles.itemIconCircle, { backgroundColor: IMAGE_TYPE_COLORS[item.value] || '#ccc' }]}>
                        <MaterialIcons
                          name={IMAGE_TYPE_ICONS[item.value] as keyof typeof MaterialIcons.glyphMap}
                          size={18}
                          color="white"
                        />
                      </View>
                      <Text style={styles.modalItemText}>{item.label}</Text>
                      {item.value === selectedType && (
                        <MaterialIcons name="check-circle" size={20} color={IMAGE_TYPE_COLORS[item.value]} />
                      )}
                    </TouchableOpacity>
                  )}
                />
              </SafeAreaView>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </Animated.View>
  );
};

export default ImageTypeSelector;
