import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useTaskContext } from '../../context/TaskContext';
import { useAuth } from '../../context/AuthContext';

export default function DashboardScreen() {
  const router = useRouter();
  const { tasks, completeTask } = useTaskContext();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const fullName = user?.user_metadata?.full_name || '';
  const firstName = fullName.split(' ')[0] || user?.email?.split('@')[0] || 'User';

  const activeTasks = tasks.filter(t => !t.completed);
  const filteredTasks = activeTasks.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome, {firstName}</Text>
          <Text style={styles.title}>Your Tasks</Text>
        </View>
        <TouchableOpacity 
          style={styles.createButton} 
          onPress={() => router.push('/map?mode=create')}
        >
          <Text style={styles.createButtonText}>+ New Task</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{activeTasks.length}</Text>
          <Text style={styles.statLabel}>Total Active Tasks</Text>
        </View>
      </View>

      <TextInput 
        style={styles.searchBar}
        placeholder="Search your tasks..."
        placeholderTextColor="#94a3b8"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {filteredTasks.map(task => (
          <View key={task.id} style={styles.card}>
            <TouchableOpacity 
              style={styles.cardContent}
              onPress={() => router.push(`/map?mode=view&taskId=${task.id}`)}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{task.title}</Text>
              </View>
              <Text style={styles.cardDesc} numberOfLines={2}>{task.description}</Text>
              <Text style={styles.viewPrompt}>Tap to locate on map</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.completeButton} onPress={() => completeTask(task.id)}>
              <Text style={styles.completeButtonText}>Completed</Text>
            </TouchableOpacity>
          </View>
        ))}
        {filteredTasks.length === 0 && (
          <Text style={styles.emptyState}>No tasks found.</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingTop: 64,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 14,
    color: '#64748b',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
  },
  createButton: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  createButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: '#ffffff',
    flex: 1,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  searchBar: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    fontSize: 15,
    color: '#1e293b',
  },
  list: {
    paddingBottom: 32,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  cardContent: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
    marginRight: 8,
  },
  cardDesc: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  viewPrompt: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6366f1',
    marginTop: 12,
  },
  completeButton: {
    backgroundColor: '#10b981',
    paddingVertical: 12,
    alignItems: 'center',
  },
  completeButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  emptyState: {
    textAlign: 'center',
    color: '#94a3b8',
    marginTop: 24,
  }
});