import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  TextInput, 
  Alert 
} from 'react-native';
import { Plus, Trash2, Save, ChevronRight, CheckCircle2 } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import API from '../api';

export default function TaskDetail({ route, navigation }) {
  const { taskId } = route.params;
  const [task, setTask] = useState(null);
  const [subtasks, setSubtasks] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newSubTitle, setNewSubTitle] = useState('');

  useFocusEffect(
    useCallback(() => {
      fetchTaskData();
    }, [taskId])
  );

  const fetchTaskData = async () => {
    try {
      const { data } = await API.get(`/tasks/${taskId}`);
      setTask(data.task || data); 
      setSubtasks(data.subtasks || []);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Could not fetch task details");
    }
  };

  // --- NEW TOGGLE FUNCTION ---
  const handleToggleSubtask = async (subtaskId) => {
    try {
      // Optimistic UI Update: Toggle locally first for instant feedback
      setSubtasks(prev => prev.map(sub => 
        sub._id === subtaskId ? { ...sub, isCompleted: !sub.isCompleted } : sub
      ));

      await API.patch(`/subtasks/${subtaskId}/toggle`);
      
      // Refresh task data to get updated progress percentage
      fetchTaskData(); 
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Could not update status");
      fetchTaskData(); // Revert on error
    }
  };

  const handleUpdateTask = async () => {
    try {
      await API.put(`/tasks/${taskId}`, { title: task.title });
      Alert.alert("Success", "Task title updated");
    } catch (err) {
      Alert.alert("Error", "Failed to update task");
    }
  };

  const handleDeleteTask = () => {
    Alert.alert("Delete Task", "Are you sure? All subtasks will be deleted.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
          await API.delete(`/tasks/${taskId}`);
          navigation.goBack();
      }}
    ]);
  };

  const handleAddSubtask = async () => {
    if (!newSubTitle.trim()) return;
    try {
      const { data } = await API.post('/subtasks', { title: newSubTitle, taskId });
      setSubtasks([...subtasks, data]);
      setModalVisible(false);
      setNewSubTitle('');
      fetchTaskData();
    } catch (err) {
      console.error(err);
    }
  };

  if (!task) return null;

  return (
    <View style={styles.container}>
      <View style={styles.headerCard}>
        <Text style={styles.label}>Task Title</Text>
        <TextInput 
          style={styles.titleInput} 
          value={task?.title} 
          onChangeText={(t) => setTask({...task, title: t})} 
        />
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.saveAction} onPress={handleUpdateTask}>
            <Save color="#007AFF" size={18} />
            <Text style={styles.saveText}>Save Changes</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteAction} onPress={handleDeleteTask}>
            <Trash2 color="#FF3B30" size={18} />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Subtasks ({task.progress}%)</Text>

      <FlatList
        data={subtasks}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.subCard}>
            <View style={styles.subLeft}>
              {/* --- WRAPPED DOT IN TOUCHABLEOPACITY --- */}
              <TouchableOpacity 
                onPress={() => handleToggleSubtask(item._id)}
                style={[styles.dot, item.isCompleted && styles.dotDone]}
                activeOpacity={0.7}
              >
                {item.isCompleted && <CheckCircle2 color="#fff" size={12} />}
              </TouchableOpacity>
              
              {/* Clicking the text still goes to details */}
              <TouchableOpacity 
                style={{ flex: 1 }}
                onPress={() => navigation.navigate('SubtaskDetail', { subtaskId: item._id, taskId })}
              >
                <Text style={[styles.subText, item.isCompleted && styles.completedText]}>
                  {item.title}
                </Text>
              </TouchableOpacity>
            </View>
            <ChevronRight color="#CCC" size={16} />
          </View>
        )}
      />

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Plus color="#fff" size={30} />
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>New Subtask</Text>
            <TextInput 
              style={styles.modalInput} 
              placeholder="What needs to be done?"
              value={newSubTitle} 
              onChangeText={setNewSubTitle} 
              autoFocus 
            />
            <TouchableOpacity style={styles.modalAddBtn} onPress={handleAddSubtask}>
              <Text style={styles.btnText}>Add Subtask</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  headerCard: { backgroundColor: '#fff', padding: 20, borderBottomWidth: 1, borderBottomColor: '#E5E5EA' },
  label: { fontSize: 11, fontWeight: '700', color: '#8E8E93', marginBottom: 5, textTransform: 'uppercase' },
  titleInput: { fontSize: 20, fontWeight: '700', color: '#1C1C1E', marginBottom: 15 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  saveAction: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E5F1FF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  saveText: { color: '#007AFF', fontWeight: '600', marginLeft: 6, fontSize: 14 },
  deleteAction: { padding: 8 },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: '#8E8E93', marginHorizontal: 20, marginTop: 25, marginBottom: 10, textTransform: 'uppercase' },
  listContent: { paddingHorizontal: 20, paddingBottom: 100 },
  subCard: { 
    backgroundColor: '#fff', 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: 16, 
    borderRadius: 12, 
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2
  },
  subLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  dot: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#007AFF', marginRight: 12, justifyContent: 'center', alignItems: 'center' },
  dotDone: { backgroundColor: '#34C759', borderColor: '#34C759' },
  subText: { fontSize: 16, color: '#1C1C1E' },
  completedText: { color: '#8E8E93', textDecorationLine: 'line-through' },
  fab: { position: 'absolute', bottom: 60, right: 30, backgroundColor: '#007AFF', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', backgroundColor: '#fff', borderRadius: 20, padding: 20, alignItems: 'center' },
  modalHeader: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  modalInput: { width: '100%', backgroundColor: '#F2F2F7', padding: 12, borderRadius: 10, marginBottom: 15 },
  modalAddBtn: { backgroundColor: '#007AFF', width: '100%', padding: 12, borderRadius: 10, alignItems: 'center', marginBottom: 10 },
  btnText: { color: '#fff', fontWeight: 'bold' },
  cancelBtn: { padding: 5 },
  cancelText: { color: '#8E8E93' }
});