import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useTaskContext } from '../../context/TaskContext';

export default function ArchiveScreen() {
  const { tasks, deleteTask } = useTaskContext();
  const completedTasks = tasks.filter(t => t.completed);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>History</Text>
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {completedTasks.map(task => (
          <View key={task.id} style={styles.card}>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{task.title}</Text>
              <Text style={styles.cardDesc}>{task.description}</Text>
            </View>
            <TouchableOpacity style={styles.deleteButton} onPress={() => deleteTask(task.id)}>
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        ))}
        {completedTasks.length === 0 && (
          <Text style={styles.emptyState}>No completed tasks yet.</Text>
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
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
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
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  cardContent: {
    flex: 1,
    padding: 20,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
    textDecorationLine: 'line-through',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 14,
    color: '#94a3b8',
  },
  deleteButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  deleteButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  emptyState: {
    textAlign: 'center',
    color: '#94a3b8',
    marginTop: 40,
  }
});