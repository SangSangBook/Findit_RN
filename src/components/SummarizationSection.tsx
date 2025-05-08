// /Users/kkm/Findit_RN/Findit/src/components/SummarizationSection.tsx
import React from 'react';
import { View, Text, TextInput, ScrollView } from 'react-native';
import Button from './Button'; // 공통 버튼 컴포넌트 임포트
import { summarizationSectionStyles as styles } from '../styles/SummarizationSection.styles';

interface SummarizationSectionProps {
  questionText: string;
  setQuestionText: (text: string) => void;
  infoResult: string | null;
  isFetchingInfo: boolean;
  handleGetInfo: () => void;
}

const SummarizationSection: React.FC<SummarizationSectionProps> = ({
  questionText,
  setQuestionText,
  infoResult,
  isFetchingInfo,
  handleGetInfo,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>OCR 결과에 대해 질문하기</Text>
      <TextInput
        style={styles.input}
        placeholder="선택된 이미지의 OCR 결과에 대해 질문해보세요... (예: 대표자가 누구야?)"
        multiline
        numberOfLines={3}
        onChangeText={setQuestionText}
        value={questionText}
        scrollEnabled={true}
        textAlignVertical="top" // textAlignVertical은 Tailwind CSS로 직접 제어하기 어려우므로 prop으로 유지
      />
      <Button
        title={isFetchingInfo ? "정보 가져오는 중..." : "정보 가져오기"}
        onPress={handleGetInfo}
        isLoading={isFetchingInfo}
        // Tailwind CSS 클래스를 Button 컴포넌트 내부에서 관리한다고 가정
      />
      {infoResult && (
        <ScrollView style={styles.resultContainer}>
          <Text style={styles.resultText}>{infoResult}</Text>
        </ScrollView>
      )}
    </View>
  );
};

export default SummarizationSection;
