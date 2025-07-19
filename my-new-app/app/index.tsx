import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Modal, FlatList, Button, SafeAreaView } from 'react-native';
import { GiftedChat, IMessage, Bubble } from 'react-native-gifted-chat';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

interface ChatHistoryItem {
  id: string;
  title: string;
  messages: IMessage[];
}

export default function MainChat() {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [history, setHistory] = useState<ChatHistoryItem[]>([]);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  // Initialize with a welcome message
  useEffect(() => {
    if (!activeChatId) {
      startNewReview();
    }
  }, []);

  // Save current chat to history when messages change
  useEffect(() => {
    if (activeChatId) {
      setHistory(prev => prev.map(chat => chat.id === activeChatId ? { ...chat, messages } : chat));
    }
  }, [messages]);

  const startNewReview = () => {
    const newId = Date.now().toString();
    const newChat: ChatHistoryItem = {
      id: newId,
      title: `Review ${history.length + 1}`,
      messages: [
        {
          _id: 1,
          text: 'Welcome to your document review chat! Ask anything about your document.',
          createdAt: new Date(),
          user: { _id: 2, name: 'AI Bot' },
        },
      ],
    };
    setHistory(prev => [newChat, ...prev]);
    setActiveChatId(newId);
    setMessages(newChat.messages);
    setSidebarVisible(false);
  };

  const selectChat = (id: string) => {
    const chat = history.find(c => c.id === id);
    if (chat) {
      setActiveChatId(id);
      setMessages(chat.messages);
      setSidebarVisible(false);
    }
  };

  const onSend = useCallback((newMessages = []) => {
    setMessages(previousMessages => GiftedChat.append(previousMessages, newMessages));
    // Here you would send the message to your backend and append the AI's response
  }, []);

  // File/image upload handlers
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images });
    if (!result.canceled) {
      // You can send the image as a message or handle upload here
      onSend([
        {
          _id: Date.now(),
          text: '[Image uploaded]',
          createdAt: new Date(),
          user: { _id: 1 },
          image: result.assets[0].uri,
        },
      ]);
    }
  };
  const pickDocument = async () => {
    let result = await DocumentPicker.getDocumentAsync({});
    if (result.type === 'success') {
      onSend([
        {
          _id: Date.now(),
          text: `[File uploaded: ${result.name}]`,
          createdAt: new Date(),
          user: { _id: 1 },
        },
      ]);
    }
  };

  // Sidebar (drawer) UI
  const renderSidebar = () => (
    <Modal visible={sidebarVisible} animationType="slide" transparent={true}>
      <SafeAreaView style={styles.sidebarContainer}>
        <Text style={styles.sidebarTitle}>Chat History</Text>
        <Button title="New Review" onPress={startNewReview} />
        <FlatList
          data={history}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.sidebarItem} onPress={() => selectChat(item.id)}>
              <Text style={styles.sidebarItemText}>{item.title}</Text>
            </TouchableOpacity>
          )}
        />
        <Button title="Close" onPress={() => setSidebarVisible(false)} />
      </SafeAreaView>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {/* Header with sidebar (history) icon */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setSidebarVisible(true)}>
          <Ionicons name="menu" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Document Review</Text>
        <View style={{ width: 28 }} />
      </View>
      {/* Sidebar */}
      {renderSidebar()}
      {/* File/Image upload buttons */}
      <View style={styles.uploadRow}>
        <Button title="Upload Image" onPress={pickImage} />
        <View style={{ width: 10 }} />
        <Button title="Upload File" onPress={pickDocument} />
      </View>
      {/* Chat UI */}
      <GiftedChat
        messages={messages}
        onSend={messages => onSend(messages)}
        user={{ _id: 1 }}
        renderBubble={props => (
          <Bubble
            {...props}
            wrapperStyle={{
              right: { backgroundColor: '#007AFF' },
              left: { backgroundColor: '#f0f0f0' },
            }}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#222' },
  uploadRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fafafa',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sidebarContainer: {
    flex: 1,
    backgroundColor: '#fff',
    width: '80%',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 2, height: 0 },
    shadowRadius: 8,
    elevation: 8,
    padding: 20,
  },
  sidebarTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  sidebarItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sidebarItemText: { fontSize: 18 },
}); 