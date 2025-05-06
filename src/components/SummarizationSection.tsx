// /Users/kkm/Findit_RN/Findit/src/components/SummarizationSection.tsx
import React from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet } from 'react-native';
import Button from './Button'; // 공통 버튼 컴포넌트 임포트

interface SummarizationSectionProps {
  questionText: string; // inputText -> questionText
  setQuestionText: (text: string) => void; // setInputText -> setQuestionText
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
        style={styles.textInput}
        placeholder="선택된 이미지의 OCR 결과에 대해 질문해보세요... (예: 대표자가 누구야?)"
        multiline
        numberOfLines={3} // 질문 입력란이므로 줄 수를 줄임
        onChangeText={setQuestionText}
        value={questionText}
        scrollEnabled={true}
      />
      <Button
        title={isFetchingInfo ? "정보 가져오는 중..." : "정보 가져오기"}
        onPress={handleGetInfo}
        isLoading={isFetchingInfo}
      />
      {infoResult && (
        <ScrollView style={styles.resultScrollView}>
          <Text style={styles.resultText}>{infoResult}</Text>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '90%',
    marginTop: 30,
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    alignSelf: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#333',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    minHeight: 100,
    textAlignVertical: 'top',
    backgroundColor: '#fff',
    fontSize: 14,
  },
  resultScrollView: {
    maxHeight: 180,
    marginTop: 15,
    padding: 10,
    backgroundColor: '#e9e9e9',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  resultText: {
    fontSize: 14,
    color: '#333',
  },
});

export default SummarizationSection;
