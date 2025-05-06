import React, { useState } from 'react';
import { ocrWithGoogleVision, summarizeTextWithOpenAI } from '../api/api'; // Import the OCR and Summarize functions
import { StyleSheet, View, Text, TouchableOpacity, Image, ScrollView, Platform, TextInput, ActivityIndicator } from 'react-native'; // Added TextInput, ActivityIndicator
import * as ImagePicker from 'expo-image-picker';

export default function HomeScreen() {
  const [selectedImages, setSelectedImages] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [ocrResults, setOcrResults] = useState<{[uri: string]: string | null}>({});
  const [isLoading, setIsLoading] = useState<{[uri: string]: boolean}>({});

  // States for OpenAI Summarization Test
  const [inputText, setInputText] = useState<string>('');
  const [summaryResult, setSummaryResult] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState<boolean>(false);

  const pickImageAsync = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      quality: 1,
      // mediaTypes: ImagePicker.MediaTypeOptions.Images, // Default is Images, can be All or Videos
    });

    if (!result.canceled) {
      setSelectedImages(result.assets);
      console.log('Selected images: ', result.assets.map(asset => asset.uri));
      // Reset previous results for new selections
      setOcrResults({}); 
      setIsLoading({});

      result.assets.forEach(async (asset) => {
        if (asset.uri) {
          setIsLoading(prev => ({ ...prev, [asset.uri]: true }));
          try {
            const text = await ocrWithGoogleVision(asset.uri);
            setOcrResults(prevResults => ({ ...prevResults, [asset.uri]: text }));
          } catch (error) {
            console.error("Error during OCR for image ", asset.uri, error);
            setOcrResults(prevResults => ({ ...prevResults, [asset.uri]: 'OCR failed' }));
          }
          setIsLoading(prev => ({ ...prev, [asset.uri]: false }));
        }
      });
    } else {
      // alert('You did not select any image.');
    }
  };

  const handleSummarize = async () => {
    if (!inputText.trim()) {
      setSummaryResult('Please enter text to summarize.');
      return;
    }
    setIsSummarizing(true);
    setSummaryResult(null);
    try {
      const summary = await summarizeTextWithOpenAI(inputText);
      setSummaryResult(summary);
    } catch (error) {
      console.error("Error during summarization:", error);
      setSummaryResult('Failed to summarize text.');
    }
    setIsSummarizing(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>Findit</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={pickImageAsync}>
          <Text style={styles.buttonText}>사진 업로드</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => console.log('Take Photo pressed')}>
          <Text style={styles.buttonText}>사진 촬영</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.imagePreviewContainer}>
        {selectedImages.map((image, index) => (
          <View key={index} style={styles.imageContainer}>
            <Image source={{ uri: image.uri }} style={styles.previewImage} />
            {isLoading[image.uri] && <Text>Loading OCR...</Text>}
            {ocrResults[image.uri] && (
              <ScrollView style={styles.ocrTextScrollView}>
                <Text style={styles.ocrText}>{ocrResults[image.uri]}</Text>
              </ScrollView>
            )}
          </View>
        ))}
      </ScrollView>

      {/* OpenAI Summarization Test UI */}
      <View style={styles.summarizeContainer}>
        <Text style={styles.summarizeTitle}>Test OpenAI Summarization</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Enter text to summarize..."
          multiline
          numberOfLines={4}
          onChangeText={setInputText}
          value={inputText}
        />
        <TouchableOpacity style={styles.button} onPress={handleSummarize} disabled={isSummarizing}>
          {isSummarizing ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Summarize Text</Text>
          )}
        </TouchableOpacity>
        {summaryResult && (
          <ScrollView style={styles.summaryResultScrollView}>
            <Text style={styles.summaryResultText}>{summaryResult}</Text>
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? 25 : 0, // Status bar height for Android
  },
  logo: {
    fontSize: 48,
    fontWeight: 'bold',
    marginTop: 40, // Adjusted for status bar and to give more space
    marginBottom: 30,
    color: '#000',
  },
  buttonContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginBottom: 20,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  imagePreviewContainer: {
    // flexDirection: 'row', // Removed to allow vertical stacking of image and text
    // flexWrap: 'wrap', // Removed for clarity with vertical stacking
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: { // Added a container for image and its OCR text
    alignItems: 'center',
    marginBottom: 20, // Space between image items
  },
  previewImage: {
    width: 100,
    height: 100,
    margin: 5,
    borderRadius: 5,
    marginBottom: 5, // Space between image and its OCR text
  },
  ocrTextScrollView: {
    maxHeight: 100, // Limit the height of the OCR text display
    marginTop: 5,
    padding: 5,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  ocrText: {
    fontSize: 12,
  },
  // Styles for Summarization Test UI
  summarizeContainer: {
    width: '90%',
    marginTop: 30,
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  summarizeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    minHeight: 80,
    textAlignVertical: 'top', // For Android multiline
    backgroundColor: '#fff',
  },
  summaryResultScrollView: {
    maxHeight: 150,
    marginTop: 10,
    padding: 10,
    backgroundColor: '#e9e9e9',
    borderRadius: 5,
  },
  summaryResultText: {
    fontSize: 14,
  },
});
