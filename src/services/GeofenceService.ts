import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { MONITORED_LOCATIONS } from '../constants/locations';

export const GEOFENCE_TASK_NAME = 'BACKGROUND_GEOFENCE_TASK';

class GeofenceService {
  /**
   * Start geofencing for all predefined monitored locations.
   */
  async startGeofencing(): Promise<void> {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(GEOFENCE_TASK_NAME);
    if (isRegistered) {
      console.log('Geofencing task is already registered.');
      return;
    }

    // Map locations to expo-location geofencing region structures
    const regions: Location.LocationRegion[] = MONITORED_LOCATIONS.map((loc) => ({
      identifier: String(loc.id),
      latitude: loc.latitude,
      longitude: loc.longitude,
      radius: loc.radius,
      notifyOnEnter: true, // Only notify when user enters the radius
      notifyOnExit: false, // User requested notification_on_exit: false
    }));

    try {
      await Location.startGeofencingAsync(GEOFENCE_TASK_NAME, regions);
      console.log('Geofencing started with regions:', regions);
    } catch (error) {
      console.error('Failed to start geofencing:', error);
      throw error;
    }
  }

  /**
   * Stop geofencing task.
   */
  async stopGeofencing(): Promise<void> {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(GEOFENCE_TASK_NAME);
    if (!isRegistered) {
      console.log('Geofencing task is not running.');
      return;
    }

    try {
      await Location.stopGeofencingAsync(GEOFENCE_TASK_NAME);
      console.log('Geofencing stopped successfully.');
    } catch (error) {
      console.error('Failed to stop geofencing:', error);
      throw error;
    }
  }

  /**
   * Check if the geofencing task is active.
   */
  async isGeofencingActive(): Promise<boolean> {
    return await TaskManager.isTaskRegisteredAsync(GEOFENCE_TASK_NAME);
  }
}

export default new GeofenceService();
