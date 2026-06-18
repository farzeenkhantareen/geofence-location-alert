import { registerRootComponent } from 'expo';
import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import { GEOFENCE_TASK_NAME } from './src/services/GeofenceService';
import { MONITORED_LOCATIONS } from './src/constants/locations';
import NotificationService from './src/services/NotificationService';
import App from './App';

interface GeofencingTaskData {
  eventType: Location.GeofencingEventType;
  region: Location.LocationRegion;
}

// Define the background task for geofencing globally
TaskManager.defineTask(
  GEOFENCE_TASK_NAME,
  async ({ data, error }: TaskManager.TaskManagerTaskBody<GeofencingTaskData>) => {
    if (error) {
      console.error('Background Geofencing Task Error:', error.message);
      return;
    }

    if (data) {
      const { eventType, region } = data;
      console.log(`Geofence event received: eventType = ${eventType}, region =`, region);

      if (eventType === Location.GeofencingEventType.Enter) {
        // Locate target using identifier
        const matchedLocation = MONITORED_LOCATIONS.find(
          (loc) => String(loc.id) === String(region.identifier)
        );
        const locationName = matchedLocation ? matchedLocation.name : 'a monitored location';

        // Trigger local notification
        NotificationService.triggerLocalNotification(
          'Location Alert',
          `You have reached ${locationName}`
        );
      }
    }
  }
);

// Register the main app component
registerRootComponent(App);
