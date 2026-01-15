import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  TextInput, 
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { Plus, ChevronRight, LogOut } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '../api';

export default function Dashboard({ navigation }) {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState('');

  // useFocusEffect runs every time you navigate BACK to this screen
  useFocusEffect(
    useCallback(() => {
      fetchGoals();
    }, [])
  );

  const fetchGoals = async () => {
    try {
      const { data } = await API.get('/goals');
      setGoals(data);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchGoals();
  };

  const handleAddGoal = async () => {
    if (!newGoalTitle.trim()) return;
    try {
      const { data } = await API.post('/goals', { title: newGoalTitle });
      setGoals([data, ...goals]);
      setNewGoalTitle('');
      setModalVisible(false);
    } catch (error) {
      console.error("Add goal error:", error);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    // If you aren't using a global AuthContext, you might need to use 
    // navigation.reset or navigation.navigate('Login')
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  const renderGoal = ({ item }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => navigation.navigate('GoalDetail', { goalId: item._id })}
    >
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.goalTitle}>{item.title}</Text>
          <Text style={styles.goalMeta}>{item.progress}% Complete</Text>
        </View>
        <ChevronRight color="#CCC" size={20} />
      </View>
      
      {/* Visual Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${item.progress}%` }]} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>My Goals</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <LogOut color="#8E8E93" size={20} />
        </TouchableOpacity>
      </View>
      
      {loading && !refreshing ? (
        <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={goals}
          keyExtractor={(item) => item._id}
          renderItem={renderGoal}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#007AFF" />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>No goals yet. Tap + to start!</Text>
          }
        />
      )}

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => setModalVisible(true)}
      >
        <Plus color="#fff" size={30} />
      </TouchableOpacity>

      {/* Add Goal Modal */}
      <Modal visible={modalVisible} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Goal</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Learn React Native"
              value={newGoalTitle}
              onChangeText={setNewGoalTitle}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelBtn}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleAddGoal} style={styles.saveBtn}>
                <Text style={styles.saveBtnText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7', paddingTop: 60 },
  headerRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    marginBottom: 20 
  },
  header: { fontSize: 32, fontWeight: '800', color: '#1C1C1E' },
  logoutBtn: { padding: 8 },
  listContent: { paddingHorizontal: 20, paddingBottom: 120 },
  
  // Card Styles
  card: { 
    backgroundColor: '#fff', 
    padding: 20, 
    borderRadius: 20, 
    marginBottom: 16, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 10, 
    elevation: 2 
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  goalTitle: { fontSize: 18, fontWeight: '700', color: '#1C1C1E' },
  goalMeta: { fontSize: 13, color: '#8E8E93', marginTop: 2 },
  progressContainer: { height: 6, backgroundColor: '#E5E5EA', borderRadius: 3, overflow: 'hidden' },
  progressBar: { height: '100%', backgroundColor: '#007AFF' },

  // FAB Styles
  fab: { 
    position: 'absolute', 
    bottom: 60, 
    right: 30, 
    backgroundColor: '#007AFF', 
    width: 64, 
    height: 64, 
    borderRadius: 32, 
    justifyContent: 'center', 
    alignItems: 'center', 
    elevation: 8, 
    shadowColor: '#007AFF', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.3, 
    shadowRadius: 8 
  },
  
  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 24, padding: 25 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, color: '#1C1C1E' },
  input: { backgroundColor: '#F2F2F7', borderRadius: 12, padding: 16, fontSize: 16, marginBottom: 20 },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' },
  cancelBtn: { padding: 10, marginRight: 20 },
  cancelText: { color: '#8E8E93', fontWeight: '600' },
  saveBtn: { backgroundColor: '#007AFF', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12 },
  saveBtnText: { color: '#fff', fontWeight: 'bold' },
  emptyText: { textAlign: 'center', color: '#8E8E93', marginTop: 40, fontSize: 16 }
});