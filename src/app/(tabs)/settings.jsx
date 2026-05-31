import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, Switch, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useTaskContext } from '../../context/TaskContext';

export default function SettingsScreen() {
  const { user } = useAuth();
  const { radarRadius, setRadarRadius, isMuted, setIsMuted } = useTaskContext();
  
  const [name, setName] = useState(user?.user_metadata?.full_name || '');
  const [loading, setLoading] = useState(false);

  const handleUpdateProfile = async () => {
    setLoading(true);
    const { error } = await supabase.auth.updateUser({
      data: { full_name: name }
    });
    
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Success', 'Profile updated successfully.');
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      await supabase.auth.signOut();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <Text style={styles.label}>Display Name</Text>
        <TextInput 
          style={styles.input} 
          value={name}
          onChangeText={setName}
        />
        <TouchableOpacity style={styles.primaryButton} onPress={handleUpdateProfile} disabled={loading}>
          <Text style={styles.primaryButtonText}>{loading ? 'Saving...' : 'Update Profile'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Radar Preferences</Text>
        
        <View style={styles.row}>
          <Text style={styles.label}>Mute Notifications</Text>
          <Switch 
            value={isMuted} 
            onValueChange={setIsMuted}
            trackColor={{ false: "#cbd5e1", true: "#6366f1" }}
          />
        </View>

        <Text style={styles.label}>Detection Radius</Text>
        <View style={styles.radiusRow}>
          <TouchableOpacity 
            style={[styles.radiusButton, radarRadius === 50 && styles.radiusActive]} 
            onPress={() => setRadarRadius(50)}
          >
            <Text style={[styles.radiusText, radarRadius === 50 && styles.radiusTextActive]}>50m</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.radiusButton, radarRadius === 100 && styles.radiusActive]} 
            onPress={() => setRadarRadius(100)}
          >
            <Text style={[styles.radiusText, radarRadius === 100 && styles.radiusTextActive]}>100m</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.radiusButton, radarRadius === 200 && styles.radiusActive]} 
            onPress={() => setRadarRadius(200)}
          >
            <Text style={[styles.radiusText, radarRadius === 200 && styles.radiusTextActive]}>200m</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
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
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
    fontWeight: '500',
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
  primaryButton: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  radiusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  radiusButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  radiusActive: {
    backgroundColor: '#e0e7ff',
    borderColor: '#6366f1',
  },
  radiusText: {
    color: '#64748b',
    fontWeight: '600',
  },
  radiusTextActive: {
    color: '#4f46e5',
  },
  logoutButton: {
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  }
});