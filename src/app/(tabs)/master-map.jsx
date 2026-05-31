import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useTaskContext } from '../../context/TaskContext';

export default function MasterMapScreen() {
  const { tasks } = useTaskContext();
  const [userLocation, setUserLocation] = useState(null);

  const activeTasks = tasks.filter(t => !t.completed);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      }
    })();
  }, []);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: userLocation ? userLocation.latitude : 10.3539,
          longitude: userLocation ? userLocation.longitude : 123.9115,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation
      >
        {activeTasks.map(task => (
          <Marker 
            key={task.id} 
            coordinate={{ latitude: task.latitude, longitude: task.longitude }} 
            title={task.title}
            description={task.description}
            pinColor="#6366f1"
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  }
});