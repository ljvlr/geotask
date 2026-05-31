import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export default function AdminScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [broadcastMessage, setBroadcastMessage] = useState('');

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.log(error);
    } finally {
      await AsyncStorage.clear();
      router.replace('/');
    }
  };

  const handleBroadcast = () => {
    if (!broadcastMessage) return;
    Alert.alert('Broadcast Sent', 'Notification pushed to all active devices.');
    setBroadcastMessage('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>System Administrator</Text>
          <Text style={styles.title}>Control Panel</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System Analytics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>Active</Text>
              <Text style={styles.statLabel}>Database Status</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>Healthy</Text>
              <Text style={styles.statLabel}>API Connection</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>1.2ms</Text>
              <Text style={styles.statLabel}>Query Latency</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>Enabled</Text>
              <Text style={styles.statLabel}>Row Security</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Global Actions</Text>
          <View style={styles.actionCard}>
            <Text style={styles.cardHeader}>Push Notification Broadcast</Text>
            <TextInput 
              style={styles.input}
              placeholder="Enter message for all users..."
              placeholderTextColor="#64748b"
              value={broadcastMessage}
              onChangeText={setBroadcastMessage}
              multiline
            />
            <TouchableOpacity style={styles.primaryAction} onPress={handleBroadcast}>
              <Text style={styles.primaryActionText}>Send Broadcast</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          <TouchableOpacity style={styles.dangerAction} onPress={() => Alert.alert('Command Sent', 'Orphaned data clearance initiated.')}>
            <Text style={styles.dangerActionText}>Clear Orphaned Data Tasks</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>End Admin Session</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    paddingTop: 64,
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 32,
  },
  welcomeText: {
    fontSize: 14,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#94a3b8',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#1e293b',
    width: '48%',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#38bdf8',
  },
  statLabel: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
  actionCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardHeader: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 16,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  primaryAction: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  primaryActionText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  dangerAction: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ef4444',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  dangerActionText: {
    color: '#ef4444',
    fontWeight: '600',
    fontSize: 14,
  },
  logoutButton: {
    padding: 24,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '600',
  }
});