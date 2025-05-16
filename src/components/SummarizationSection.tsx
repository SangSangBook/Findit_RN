// /Users/kkm/Findit_RN/Findit/src/components/SummarizationSection.tsx
import React from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { summarizationSectionStyles as styles } from '../styles/SummarizationSection.styles';

interface SummarizationSectionProps {
  questionText: string;
  setQuestionText: (text: string) => void;
  infoResult?: string | null;
  isFetchingInfo?: boolean;
  handleGetInfo?: () => void;
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
      <Text style={styles.title}>질문하기</Text>
      <TextInput
        style={styles.input}
        placeholder="이미지에 대해 질문해보세요."
        multiline
        numberOfLines={3}
        onChangeText={setQuestionText}
        value={questionText}
        scrollEnabled={true}
        textAlignVertical="top"
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
