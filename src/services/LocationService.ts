import * as Location from 'expo-location';

export interface LocationPermissionsStatus {
  foregroundGranted: boolean;
  backgroundGranted: boolean;
}

class LocationService {
  /**
   * Request permission for foreground location.
   */
  async requestForegroundPermission(): Promise<boolean> {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  }

  /**
   * Request permission for background location.
   * Note: Foreground permission must be granted first.
   */
  async requestBackgroundPermission(): Promise<boolean> {
    const { status } = await Location.requestBackgroundPermissionsAsync();
    return status === 'granted';
  }

  /**
   * Check permissions status for foreground and background location.
   */
  async checkPermissions(): Promise<LocationPermissionsStatus> {
    const foreground = await Location.getForegroundPermissionsAsync();
    const background = await Location.getBackgroundPermissionsAsync();
    return {
      foregroundGranted: foreground.status === 'granted',
      backgroundGranted: background.status === 'granted',
    };
  }

  /**
   * Get user's current location once.
   */
  async getCurrentLocation(): Promise<Location.LocationObject> {
    const enabled = await Location.hasServicesEnabledAsync();
    if (!enabled) {
      throw new Error('Location services are disabled');
    }
    return await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
  }

  /**
   * Watch user's location in the foreground to update the UI.
   * @param callback - success callback receiving the location object
   */
  async watchLocation(
    callback: (location: Location.LocationObject) => void
  ): Promise<Location.LocationSubscription> {
    const enabled = await Location.hasServicesEnabledAsync();
    if (!enabled) {
      throw new Error('Location services are disabled');
    }
    return await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 5000, // Update every 5 seconds
        distanceInterval: 10, // Or every 10 meters
      },
      callback
    );
  }
}

export default new LocationService();
