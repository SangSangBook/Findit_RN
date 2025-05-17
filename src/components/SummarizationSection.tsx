// /Users/kkm/Findit_RN/Findit/src/components/SummarizationSection.tsx
import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { summarizationSectionStyles as styles } from '../styles/SummarizationSection.styles';

interface SummarizationSectionProps {
  questionText: string;
  setQuestionText: (text: string) => void;
}

const SummarizationSection: React.FC<SummarizationSectionProps> = ({
  questionText,
  setQuestionText,
}) => {
  const underlineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(underlineAnim, {
      toValue: questionText.length > 0 ? 1 : 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [questionText]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>질문하기</Text>
      <View style={styles.textFieldWrapper}>
        <View style={styles.textFieldContainerRow}>
          <TextInput
            style={styles.textInput}
            placeholder="이미지에 대해 질문해보세요."
            placeholderTextColor="#888"
            onChangeText={setQuestionText}
            value={questionText}
          />
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => {
              if (questionText.length > 0) {
                setQuestionText('');
              }
            }}
            accessibilityLabel="입력 지우기"
            activeOpacity={questionText.length > 0 ? 0.7 : 1}
          >
            <MaterialIcons name="close" size={20} color={questionText.length > 0 ? '#888' : '#ddd'} />
          </TouchableOpacity>
        </View>
        <Animated.View
          style={{
            height: 1,
            backgroundColor: underlineAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ['#efefef', '#4299E2']
            }),
            marginTop: 2
          }}
        />
      </View>
    </View>
  );
};

export default SummarizationSection;
