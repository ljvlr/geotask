import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const TaskContext = createContext({});

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
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [radarRadius, setRadarRadius] = useState(50);

  const locationSubscription = useRef(null);
  const insideTasks = useRef(new Set());
  const knownTaskIds = useRef(new Set());
  const isFirstPing = useRef(true);

  useEffect(() => {
    const setupNotifications = async () => {
      await Notifications.requestPermissionsAsync();
    };
    setupNotifications();
  }, []);

  useEffect(() => {
    if (user) {
      fetchTasks();
      loadRadiusSettings();
    } else {
      setTasks([]);
      setLoading(false);
      stopRadar();
    }
    return () => stopRadar();
  }, [user]);

  useEffect(() => {
    if (user && tasks.length > 0) {
      startRadar();
    }
    return () => stopRadar();
  }, [tasks, radarRadius]);

  const loadRadiusSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('radar_radius')
        .eq('id', user.id)
        .single();
      if (data && !error) {
        setRadarRadius(data.radar_radius || 50);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateRadiusSettings = async (radius) => {
    try {
      setRadarRadius(radius);
      await supabase
        .from('profiles')
        .update({ radar_radius: radius })
        .eq('id', user.id);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) {
        setTasks(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (title, description, latitude, longitude) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([{ title, description, latitude, longitude, user_id: user.id, completed: false }])
        .select()
        .single();
      if (!error && data) {
        setTasks((prev) => [data, ...prev]);
        return data;
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleTaskCompletion = async (id, currentStatus) => {
    try {
      const updatedStatus = !currentStatus;
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: updatedStatus } : t)));
      if (updatedStatus) {
        insideTasks.current.delete(id);
      }
      await supabase
        .from('tasks')
        .update({ completed: updatedStatus })
        .eq('id', id);
    } catch (err) {
      console.error(err);
      fetchTasks();
    }
  };

  const deleteTask = async (id) => {
    try {
      setTasks((prev) => prev.filter((t) => t.id !== id));
      insideTasks.current.delete(id);
      knownTaskIds.current.delete(id);
      await supabase
        .from('tasks')
        .delete()
        .eq('id', id);
    } catch (err) {
      console.error(err);
      fetchTasks();
    }
  };

  const startRadar = async () => {
    stopRadar();
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;

    const activeTasks = tasks.filter((t) => !t.completed);

    locationSubscription.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 5000,
        distanceInterval: 5,
      },
      (location) => {
        const currentLat = location.coords.latitude;
        const currentLng = location.coords.longitude;

        activeTasks.forEach(async (task) => {
          const distance = getDistanceInMeters(currentLat, currentLng, task.latitude, task.longitude);
          const isBrandNewTask = !knownTaskIds.current.has(task.id);

          knownTaskIds.current.add(task.id);

          if (distance <= radarRadius) {
            if (isFirstPing.current || isBrandNewTask) {
              insideTasks.current.add(task.id);
            } else if (!insideTasks.current.has(task.id)) {
              await Notifications.scheduleNotificationAsync({
                content: {
                  title: "📍 You have arrived!",
                  body: `Task: ${task.title}\n\n${task.description}`,
                  sound: true,
                },
                trigger: null,
              });
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

  const stopRadar = () => {
    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
    }
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        loading,
        radarRadius,
        updateRadiusSettings,
        fetchTasks,
        addTask,
        toggleTaskCompletion,
        deleteTask,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export const useTaskContext = () => useContext(TaskContext);