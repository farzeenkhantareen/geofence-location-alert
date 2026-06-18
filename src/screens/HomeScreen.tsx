import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import { getDistance } from 'geolib';
import LocationService from '../services/LocationService';
import GeofenceService from '../services/GeofenceService';
import NotificationService from '../services/NotificationService';
import { MONITORED_LOCATIONS, MonitoredLocation } from '../constants/locations';

export default function HomeScreen() {
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObjectCoords | null>(null);
  const [isGeofencing, setIsGeofencing] = useState<boolean>(false);
  const [isForegroundWatching, setIsForegroundWatching] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const watchSubscription = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    // Check initial geofencing task registration state
    const checkInitialState = async () => {
      try {
        const active = await GeofenceService.isGeofencingActive();
        setIsGeofencing(active);
        
        const { foregroundGranted } = await LocationService.checkPermissions();
        
        // If background geofencing is already active, resume foreground tracking for UI updates
        if (active && foregroundGranted) {
          await startForegroundWatch();
        }
      } catch (err) {
        console.error('Error checking initial status:', err);
      } finally {
        setLoading(false);
      }
    };
    
    checkInitialState();

    return () => {
      stopForegroundWatch();
    };
  }, []);

  const startForegroundWatch = async () => {
    stopForegroundWatch(); // Safety clear
    try {
      const sub = await LocationService.watchLocation((location) => {
        setCurrentLocation(location.coords);
        setIsForegroundWatching(true);
      });
      watchSubscription.current = sub;
    } catch (err) {
      console.log('Error starting location watcher:', err);
    }
  };

  const stopForegroundWatch = () => {
    if (watchSubscription.current) {
      watchSubscription.current.remove();
      watchSubscription.current = null;
    }
    setIsForegroundWatching(false);
  };

  const handleStartMonitoring = async () => {
    try {
      setLoading(true);
      
      // 1. Request notifications permissions
      const notificationGranted = await NotificationService.requestPermission();
      if (!notificationGranted) {
        Alert.alert('Permission Recommended', 'Local notifications are recommended for location alerts.');
      }

      // 2. Request foreground location permission
      const foregroundGranted = await LocationService.requestForegroundPermission();
      if (!foregroundGranted) {
        Alert.alert('Permission Denied', 'Foreground location permission is required.');
        setLoading(false);
        return;
      }

      // 3. Request background location permission
      const backgroundGranted = await LocationService.requestBackgroundPermission();
      if (!backgroundGranted) {
        Alert.alert(
          'Background Location Required',
          'Please select "Allow all the time" in location settings to enable background tracking.'
        );
        setLoading(false);
        return;
      }

      // 4. Start background geofencing
      await GeofenceService.startGeofencing();
      setIsGeofencing(true);

      // 5. Start watching foreground location for live UI coordinates
      await startForegroundWatch();
      
      Alert.alert('Monitoring Active', 'Background location alerts are now monitoring.');
    } catch (error: any) {
      Alert.alert('Error', 'Failed to start monitoring: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStopMonitoring = async () => {
    try {
      setLoading(true);
      await GeofenceService.stopGeofencing();
      stopForegroundWatch();
      setIsGeofencing(false);
      setCurrentLocation(null);
      Alert.alert('Monitoring Disabled', 'Location tracking is now stopped.');
    } catch (error: any) {
      Alert.alert('Error', 'Failed to stop monitoring: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getDistanceText = (loc: MonitoredLocation) => {
    if (!currentLocation) return 'Calculating...';
    const dist = getDistance(
      { latitude: currentLocation.latitude, longitude: currentLocation.longitude },
      { latitude: loc.latitude, longitude: loc.longitude }
    );
    return `${dist} meters`;
  };

  const isWithinRadius = (loc: MonitoredLocation) => {
    if (!currentLocation) return false;
    const dist = getDistance(
      { latitude: currentLocation.latitude, longitude: currentLocation.longitude },
      { latitude: loc.latitude, longitude: loc.longitude }
    );
    return dist <= loc.radius;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Tracker Status Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Tracking Status</Text>
        
        <View style={styles.statusRow}>
          <View style={[styles.statusIndicator, isGeofencing ? styles.activeIndicator : styles.inactiveIndicator]} />
          <Text style={styles.statusText}>
            Background Geofence: {isGeofencing ? 'ACTIVE' : 'INACTIVE'}
          </Text>
        </View>

        <View style={styles.statusRow}>
          <View style={[styles.statusIndicator, isForegroundWatching ? styles.activeIndicator : styles.inactiveIndicator]} />
          <Text style={styles.statusText}>
            Foreground Watcher: {isForegroundWatching ? 'ACTIVE' : 'INACTIVE'}
          </Text>
        </View>
      </View>

      {/* Current Location Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Current Coordinates</Text>
        {currentLocation ? (
          <View>
            <View style={styles.coordRow}>
              <Text style={styles.label}>Latitude:</Text>
              <Text style={styles.value}>{currentLocation.latitude.toFixed(6)}°</Text>
            </View>
            <View style={styles.coordRow}>
              <Text style={styles.label}>Longitude:</Text>
              <Text style={styles.value}>{currentLocation.longitude.toFixed(6)}°</Text>
            </View>
            <View style={styles.coordRow}>
              <Text style={styles.label}>Accuracy:</Text>
              <Text style={styles.value}>{currentLocation.accuracy?.toFixed(1)}m</Text>
            </View>
          </View>
        ) : (
          <Text style={styles.placeholderText}>
            {isGeofencing ? 'Acquiring GPS Signal...' : 'Location tracking not started'}
          </Text>
        )}
      </View>

      {/* Monitored Locations Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Monitored Locations ({MONITORED_LOCATIONS.length})</Text>
        {MONITORED_LOCATIONS.map((loc) => {
          const active = isWithinRadius(loc);
          return (
            <View key={loc.id} style={[styles.locationRow, active && styles.locationRowActive]}>
              <View>
                <Text style={styles.locationName}>{loc.name}</Text>
                <Text style={styles.locationCoords}>Lat: {loc.latitude}, Lon: {loc.longitude}</Text>
                <Text style={styles.locationRadius}>Radius: {loc.radius}m</Text>
              </View>
              <View style={styles.distanceBadge}>
                <Text style={[styles.distanceText, active && styles.distanceTextActive]}>
                  {getDistanceText(loc)}
                </Text>
                {active && <Text style={styles.insideText}>INSIDE RADIUS</Text>}
              </View>
            </View>
          );
        })}
      </View>

      {/* Control Actions */}
      <View style={styles.buttonGroup}>
        {loading ? (
          <ActivityIndicator size="large" color="#4F46E5" style={styles.loader} />
        ) : !isGeofencing ? (
          <TouchableOpacity style={styles.startButton} onPress={handleStartMonitoring}>
            <Text style={styles.buttonText}>Start Monitoring</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.stopButton} onPress={handleStopMonitoring}>
            <Text style={styles.buttonText}>Stop Monitoring</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121214',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#1E1E24',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  cardTitle: {
    color: '#8E8E9F',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  activeIndicator: {
    backgroundColor: '#10B981',
  },
  inactiveIndicator: {
    backgroundColor: '#6B7280',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
  },
  coordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#2B2B36',
  },
  label: {
    color: '#A0AEC0',
    fontSize: 16,
  },
  value: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  placeholderText: {
    color: '#718096',
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 12,
    fontStyle: 'italic',
  },
  locationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2B2B36',
  },
  locationRowActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  locationName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  locationCoords: {
    color: '#A0AEC0',
    fontSize: 13,
    marginTop: 2,
  },
  locationRadius: {
    color: '#718096',
    fontSize: 12,
    marginTop: 1,
  },
  distanceBadge: {
    alignItems: 'flex-end',
  },
  distanceText: {
    color: '#4F46E5',
    fontSize: 14,
    fontWeight: '600',
  },
  distanceTextActive: {
    color: '#10B981',
  },
  insideText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  buttonGroup: {
    marginTop: 8,
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 8,
  },
  stopButton: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  loader: {
    marginVertical: 16,
  },
});
