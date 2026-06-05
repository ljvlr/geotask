import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { useTaskContext } from '../../context/TaskContext';

export default function MasterMapScreen() {
  const { tasks } = useTaskContext();
  const [userLocation, setUserLocation] = useState({ latitude: 10.3539, longitude: 123.9115 });
  const webViewRef = useRef(null);

  const activeTasks = tasks ? tasks.filter(t => !t.completed) : [];

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

  const markersJs = activeTasks.map(task => {
    const lat = task.latitude || 10.3539;
    const lng = task.longitude || 123.9115;
    const title = task.title ? task.title.replace(/"/g, '\\"') : 'Task';
    const desc = task.description ? task.description.replace(/"/g, '\\"') : '';
    return `L.marker([${lat}, ${lng}]).bindPopup("<b>${title}</b><br>${desc}").addTo(map);`;
  }).join('\n');

  const mapHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        body { margin: 0; padding: 0; }
        #map { height: 100vh; width: 100vw; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map = L.map('map').setView([${userLocation.latitude}, ${userLocation.longitude}], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19
        }).addTo(map);
        
        ${markersJs}
      </script>
    </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <WebView
        key={activeTasks.length}
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: mapHtml }}
        style={styles.map}
        javaScriptEnabled={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 }
});