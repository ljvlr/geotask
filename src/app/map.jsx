import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTaskContext } from '../context/TaskContext';

export default function MapScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { tasks, addTask, updateTask, deleteTask } = useTaskContext();
  
  const mode = params.mode;
  const taskId = params.taskId;

  const existingTask = mode === 'view' ? tasks.find(t => t.id === taskId) : null;
  const activeTasks = tasks.filter(t => !t.completed);

  const [title, setTitle] = useState(existingTask?.title || '');
  const [description, setDescription] = useState(existingTask?.description || '');
  const [dropCoordinate, setDropCoordinate] = useState(
    existingTask ? { latitude: existingTask.latitude, longitude: existingTask.longitude } : null
  );

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;
      } catch (error) {
        console.log(error);
      }
    })();
  }, []);

  const handleMapPress = (e) => {
    if (mode === 'create') {
      setDropCoordinate(e.nativeEvent.coordinate);
    }
  };

  const handleSave = async () => {
    if (!title || !description || !dropCoordinate) {
      Alert.alert('Error', 'Please ensure you dropped a pin and filled all fields.');
      return;
    }

    if (mode === 'create') {
      await addTask(title, description, dropCoordinate.latitude, dropCoordinate.longitude);
    } else if (existingTask) {
      await updateTask(existingTask.id, title, description);
    }
    router.back();
  };

  const handleDelete = async () => {
    if (existingTask) {
      await deleteTask(existingTask.id);
      router.back();
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {mode === 'create' && (
        <View style={styles.promptHeader}>
          <Text style={styles.promptText}>Long-press on the map to drop your pin</Text>
        </View>
      )}
      
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: dropCoordinate ? dropCoordinate.latitude : 10.3539,
          longitude: dropCoordinate ? dropCoordinate.longitude : 123.9115,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation
        onLongPress={handleMapPress}
      >
        {mode === 'create' && activeTasks.map(t => (
          <Marker 
            key={t.id} 
            coordinate={{ latitude: t.latitude, longitude: t.longitude }} 
            pinColor="#cbd5e1" 
            title={t.title} 
          />
        ))}
        {dropCoordinate && (
          <Marker 
            coordinate={dropCoordinate} 
            pinColor="#6366f1" 
            title={mode === 'create' ? 'New Target' : title} 
          />
        )}
      </MapView>

      <View style={styles.bottomSheet}>
        <TextInput 
          style={styles.input} 
          placeholder="Task Title" 
          value={title}
          onChangeText={setTitle}
        />
        <TextInput 
          style={styles.input} 
          placeholder="Task Description" 
          value={description}
          onChangeText={setDescription}
        />

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.saveAction} onPress={handleSave}>
            <Text style={styles.actionTextText}>{mode === 'create' ? 'Save Task' : 'Update Task'}</Text>
          </TouchableOpacity>
          {mode === 'view' && (
            <TouchableOpacity style={styles.deleteAction} onPress={handleDelete}>
              <Text style={styles.actionTextText}>Delete</Text>
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity style={styles.cancelAction} onPress={() => router.back()}>
          <Text style={styles.cancelActionText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  map: {
    flex: 1,
  },
  promptHeader: {
    position: 'absolute',
    top: 64,
    left: 20,
    right: 20,
    backgroundColor: '#1e293b',
    zIndex: 10,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  promptText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  bottomSheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 10,
  },
  input: {
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#1e293b',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  saveAction: {
    flex: 2,
    backgroundColor: '#6366f1',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 4,
  },
  deleteAction: {
    flex: 1,
    backgroundColor: '#ef4444',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginLeft: 4,
  },
  actionTextText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 15,
  },
  cancelAction: {
    alignItems: 'center',
    padding: 12,
    marginTop: 12,
  },
  cancelActionText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '500',
  },
});