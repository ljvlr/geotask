import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { useLocalSearchParams, router } from 'expo-router';
import { useTaskContext } from '../context/TaskContext';

export default function MapScreen() {
  const { title, description } = useLocalSearchParams();
  const { addTask } = useTaskContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState({ latitude: 10.3539, longitude: 123.9115 });
  const webViewRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        const coords = { latitude: location.coords.latitude, longitude: location.coords.longitude };
        setSelectedLocation(coords);
        updateMapLocation(coords.latitude, coords.longitude);
      }
    })();
  }, []);

  const updateMapLocation = (lat, lng) => {
    const jsCode = `window.map.setView([${lat}, ${lng}], 16); window.marker.setLatLng([${lat}, ${lng}]);`;
    webViewRef.current?.injectJavaScript(jsCode);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}`);
      const data = await res.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        setSelectedLocation({ latitude: lat, longitude: lng });
        updateMapLocation(lat, lng);
      } else {
        Alert.alert("Not Found", "Location not found.");
      }
    } catch (err) {
      Alert.alert("Error", "Search failed.");
    }
  };

  const handleConfirm = async () => {
    try {
      await addTask(title, description, selectedLocation.latitude, selectedLocation.longitude);
      router.replace('/dashboard');
    } catch (error) {
      Alert.alert("Error", "Failed to save task.");
    }
  };

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
        var map = L.map('map').setView([10.3539, 123.9115], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19
        }).addTo(map);
        var marker = L.marker([10.3539, 123.9115], { draggable: true }).addTo(map);
        
        marker.on('dragend', function(e) {
          var position = marker.getLatLng();
          window.ReactNativeWebView.postMessage(JSON.stringify({ lat: position.lat, lng: position.lng }));
        });

        map.on('click', function(e) {
          marker.setLatLng(e.latlng);
          window.ReactNativeWebView.postMessage(JSON.stringify({ lat: e.latlng.lat, lng: e.latlng.lng }));
        });
        
        window.map = map;
        window.marker = marker;
      </script>
    </body>
    </html>
  `;

  const onMessage = (event) => {
    const data = JSON.parse(event.nativeEvent.data);
    setSelectedLocation({ latitude: data.lat, longitude: data.lng });
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search a location..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
      </View>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: mapHtml }}
        onMessage={onMessage}
        style={styles.map}
        javaScriptEnabled={true}
      />
      <View style={styles.footer}>
        <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
          <Text style={styles.confirmBtnText}>Confirm Task Location</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchContainer: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    zIndex: 10,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  searchInput: { height: 50, paddingHorizontal: 16, fontSize: 16 },
  map: { flex: 1 },
  footer: { position: 'absolute', bottom: 40, left: 20, right: 20, zIndex: 10 },
  confirmBtn: { backgroundColor: '#6366f1', height: 50, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  confirmBtnText: { color: '#ffffff', fontSize: 16, fontWeight: '600' }
});