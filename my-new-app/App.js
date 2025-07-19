import React, { useState } from 'react';
import { View, Text, Button, Image, ActivityIndicator, ScrollView, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function App() {
  const [image, setImage] = useState(null);
  const [ocrText, setOcrText] = useState('');
  const [llmResponse, setLlmResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const pickImage = async () => {
    setError('');
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    setError('');
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 1,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const submitImage = async () => {
    if (!image) return;
    setLoading(true);
    setOcrText('');
    setLlmResponse('');
    setError('');
    const formData = new FormData();
    formData.append('file', {
      uri: image,
      name: 'photo.jpg',
      type: 'image/jpeg',
    });
    try {
      const response = await fetch('http://<YOUR_LOCAL_IP>:8000/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'multipart/form-data' },
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        setOcrText(data.ocr_text);
        setLlmResponse(data.llm_response);
      } else {
        setError(data.error || 'Unknown error');
      }
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Document Analyzer</Text>
      <View style={styles.buttonRow}>
        <Button title="Pick Image" onPress={pickImage} />
        <Button title="Take Photo" onPress={takePhoto} />
      </View>
      {image && <Image source={{ uri: image }} style={styles.image} />}
      <Button title="Submit" onPress={submitImage} disabled={!image || loading} />
      {loading && <ActivityIndicator size="large" />}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {ocrText ? (
        <View style={styles.resultBox}>
          <Text style={styles.label}>OCR Text:</Text>
          <Text>{ocrText}</Text>
        </View>
      ) : null}
      {llmResponse ? (
        <View style={styles.resultBox}>
          <Text style={styles.label}>LLM Answer:</Text>
          <Text>{llmResponse}</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 10 },
  image: { width: 300, height: 200, marginVertical: 10, borderRadius: 8 },
  resultBox: { backgroundColor: '#f0f0f0', padding: 10, borderRadius: 8, marginVertical: 10, width: '100%' },
  label: { fontWeight: 'bold', marginBottom: 4 },
  error: { color: 'red', marginVertical: 10 },
}); 