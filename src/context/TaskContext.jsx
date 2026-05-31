import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const TaskContext = createContext();

function getDistanceInMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const p1 = lat1 * Math.PI / 180;
  const p2 = lat2 * Math.PI / 180;
  const deltaP = p2 - p1;
  const deltaLon = lon2 - lon1;
  const deltaLambda = (deltaLon * Math.PI) / 180;
  const a = Math.sin(deltaP / 2) * Math.sin(deltaP / 2) +
            Math.cos(p1) * Math.cos(p2) *
            Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const d = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * d;
}

export function TaskProvider({ children }) {
  const [tasks, setTasks] = useState([]);
  const [radarRadius, setRadarRadiusState] = useState(50);
  const [isMuted, setIsMutedState] = useState(false);
  const { user } = useAuth();
  
  const insideTasks = useRef(new Set());
  const knownTaskIds = useRef(new Set());
  const isFirstPing = useRef(true);
  
  const locationSubscription = useRef(null);

  useEffect(() => {
    const loadSettings = async () => {
      const savedRadius = await AsyncStorage.getItem('radarRadius');
      const savedMute = await AsyncStorage.getItem('isMuted');
      if (savedRadius) setRadarRadiusState(parseInt(savedRadius));
      if (savedMute) setIsMutedState(savedMute === 'true');
    };
    loadSettings();
  }, []);

  const setRadarRadius = async (radius) => {
    setRadarRadiusState(radius);
    await AsyncStorage.setItem('radarRadius', radius.toString());
  };

  const setIsMuted = async (muted) => {
    setIsMutedState(muted);
    await AsyncStorage.setItem('isMuted', muted.toString());
  };

  const fetchTasks = async () => {
    if (!user?.id) return; 

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id); 

    if (!error && data) {
      setTasks(data);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchTasks();
    } else {
      setTasks([]);
    }
  }, [user?.id]);

  useEffect(() => {
    let isMounted = true;

    const startRadar = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 5000,
          distanceInterval: 5,
        },
        (location) => {
          if (!isMounted || isMuted) return;
          
          const currentLat = location.coords.latitude;
          const currentLng = location.coords.longitude;
          const activeTasks = tasks.filter(t => !t.completed);

          activeTasks.forEach((task) => {
            const distance = getDistanceInMeters(currentLat, currentLng, task.latitude, task.longitude);
            const isBrandNewTask = !knownTaskIds.current.has(task.id);
            
            knownTaskIds.current.add(task.id);
            
            if (distance <= radarRadius) {
              if (isFirstPing.current || isBrandNewTask) {
                insideTasks.current.add(task.id);
              } else if (!insideTasks.current.has(task.id)) {
                Alert.alert(
                  "📍 You have arrived!",
                  `Task: ${task.title}\n\n${task.description}`
                );
                insideTasks.current.add(task.id);
              }
            } else if (distance > radarRadius + 10) {
              insideTasks.current.delete(task.id);
            }
          });

          isFirstPing.current = false;
        }
      );
    };

    if (tasks.length > 0) {
      startRadar();
    }

    return () => {
      isMounted = false;
      if (locationSubscription.current) {
        locationSubscription.current.remove();
      }
    };
  }, [tasks, radarRadius, isMuted]);

  const addTask = async (title, description, lat, lng) => {
    if (!user) return;
    await supabase.from('tasks').insert([
      { title, description, latitude: lat, longitude: lng, user_id: user.id, completed: false }
    ]);
    fetchTasks();
  };

  const updateTask = async (id, title, description) => {
    await supabase.from('tasks').update({ title, description }).eq('id', id);
    fetchTasks();
  };

  const completeTask = async (id) => {
    await supabase.from('tasks').update({ completed: true }).eq('id', id);
    fetchTasks();
  };

  const deleteTask = async (id) => {
    await supabase.from('tasks').delete().eq('id', id);
    fetchTasks();
  };

  return (
    <TaskContext.Provider value={{ tasks, radarRadius, isMuted, setRadarRadius, setIsMuted, fetchTasks, addTask, updateTask, deleteTask, completeTask }}>
      {children}
    </TaskContext.Provider>
  );
}

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('Provider missing');
  }
  return context;
};