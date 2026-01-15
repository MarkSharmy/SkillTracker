import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { Plus, Trash2, ChevronRight } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import API from '../api';

export default function GoalDetail({ route, navigation }) {
  const { goalId } = route.params;
  const [goal, setGoal] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  useFocusEffect(useCallback(() => { fetchGoalData(); }, []));

  const fetchGoalData = async () => {
    try {
      const { data } = await API.get(`/goals/${goalId}`);
      setGoal(data.goal);
      setTasks(data.tasks);
    } catch (err) { 
      console.error(err); 
      Alert.alert("Error", "Could not load goal details.");
    }
  };

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return;
    try {
      const { data } = await API.post('/tasks', { title: newTaskTitle, goalId });
      setTasks([...tasks, data]);
      setModalVisible(false);
      setNewTaskTitle('');
    } catch (err) { console.error(err); }
  };

  const handleDeleteGoal = () => {
    Alert.alert("Delete Goal", "Are you sure? All associated tasks will be lost permanently.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
          try {
            await API.delete(`/goals/${goalId}`);
            navigation.goBack();
          } catch (err) { console.error(err); }
      }}
    ]);
  };

  if (!goal) return null;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.title}>{goal.title}</Text>
          <Text style={styles.subtitle}>{goal.progress}% Overall Progress</Text>
        </View>
        <TouchableOpacity onPress={handleDeleteGoal} style={styles.deleteIcon}>
          <Trash2 color="#FF3B30" size={22} />
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={tasks}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.card} 
            onPress={() => navigation.navigate('TaskDetail', { taskId: item._id, goalId })}
          >
            <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardProgress}>{item.progress}% Complete</Text>
            </View>
            <ChevronRight color="#CCC" size={20} />
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Plus color="#fff" size={30} />
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Create New Task</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Task name"
              value={newTaskTitle} 
              onChangeText={setNewTaskTitle} 
              autoFocus 
            />
            <TouchableOpacity style={styles.saveBtn} onPress={handleAddTask}>
              <Text style={styles.btnText}>Add Task</Text>
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
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  headerRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 24, 
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE'
  },
  headerTextContainer: { flex: 1 },
  title: { fontSize: 24, fontWeight: '800', color: '#1A1A1A' },
  subtitle: { fontSize: 14, color: '#666', marginTop: 4 },
  deleteIcon: { padding: 8 },
  listContent: { padding: 20, paddingBottom: 100 },
  card: { 
    backgroundColor: '#FFF', 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 20, 
    borderRadius: 16, 
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3
  },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 17, fontWeight: '600', color: '#333' },
  cardProgress: { fontSize: 13, color: '#007AFF', fontWeight: 'bold', marginTop: 4 },
  fab: { 
    position: 'absolute', 
    bottom: 60, 
    right: 30, 
    backgroundColor: '#007AFF', 
    width: 60, 
    height: 60, 
    borderRadius: 30, 
    justifyContent: 'center', 
    alignItems: 'center', 
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  modalContent: { 
    width: '85%', 
    backgroundColor: '#FFF', 
    borderRadius: 24, 
    padding: 24, 
    alignItems: 'center' 
  },
  modalHeader: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  input: { 
    width: '100%', 
    backgroundColor: '#F0F0F0', 
    padding: 16, 
    borderRadius: 12, 
    fontSize: 16, 
    marginBottom: 20 
  },
  saveBtn: { 
    backgroundColor: '#007AFF', 
    width: '100%', 
    padding: 16, 
    borderRadius: 12, 
    alignItems: 'center',
    marginBottom: 12
  },
  btnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  cancelBtn: { padding: 8 },
  cancelText: { color: '#666', fontSize: 15 }
});