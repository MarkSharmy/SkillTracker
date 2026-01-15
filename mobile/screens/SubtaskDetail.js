import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ActivityIndicator 
} from 'react-native';
import { Save, Trash2, ArrowLeft } from 'lucide-react-native';
import API from '../api';

export default function SubtaskDetail({ route, navigation }) {
  const { subtaskId } = route.params;
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);

  // 1. Fetch the specific subtask data on load
  useEffect(() => {
    const fetchSubtask = async () => {
      try {
        // We use the general subtasks endpoint or a specific ID endpoint
        const { data } = await API.get(`/subtasks/${subtaskId}`);
        setTitle(data.title);
      } catch (err) {
        console.error("Error fetching subtask:", err);
        Alert.alert("Error", "Could not load subtask data.");
      } finally {
        setLoading(false);
      }
    };

    fetchSubtask();
  }, [subtaskId]);

  // 2. Handle Save
  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert("Validation", "Title cannot be empty");
      return;
    }
    try {
      await API.put(`/subtasks/${subtaskId}`, { title });
      navigation.goBack();
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to save subtask");
    }
  };

  // 3. Handle Delete
  const handleDelete = () => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to remove this subtask? This will update your task progress.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: async () => {
            try {
              await API.delete(`/subtasks/${subtaskId}`);
              navigation.goBack();
            } catch (err) {
              console.error(err);
              Alert.alert("Error", "Failed to delete subtask");
            }
          } 
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.label}>Subtask Title</Text>
        <TextInput 
          style={styles.input} 
          value={title} 
          onChangeText={setTitle}
          placeholder="Enter subtask name..."
          multiline
        />
      </View>

      <TouchableOpacity style={styles.fullSaveBtn} onPress={handleSave}>
        <Save color="#fff" size={20} style={{ marginRight: 10 }} />
        <Text style={styles.btnText}>Save Changes</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.fullDeleteBtn} onPress={handleDelete}>
        <Trash2 color="#FF3B30" size={20} style={{ marginRight: 10 }} />
        <Text style={styles.deleteBtnText}>Delete Subtask</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    padding: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8E8E93',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  input: {
    fontSize: 18,
    color: '#1C1C1E',
    minHeight: 40,
    textAlignVertical: 'top',
  },
  fullSaveBtn: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  btnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  fullDeleteBtn: {
    flexDirection: 'row',
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteBtnText: {
    color: '#FF3B30',
    fontSize: 17,
    fontWeight: '600',
  },
});