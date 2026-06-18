import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Set notification handler to show alert when app is running in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

class NotificationService {
  /**
   * Request permission to send notifications.
   * Required for Android 13+ (POST_NOTIFICATIONS) and iOS.
   */
  async requestPermission(): Promise<boolean> {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for notification permission!');
      return false;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('location-alerts', {
        name: 'Location Alerts',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    return true;
  }

  /**
   * Check if notifications permission is granted.
   */
  async checkPermission(): Promise<boolean> {
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
  }

  /**
   * Immediately trigger a notification.
   */
  async triggerLocalNotification(title: string, body: string): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.MAX,
        },
        trigger: null, // trigger immediately
      });
      console.log(`Notification triggered: "${title}" - "${body}"`);
    } catch (error) {
      console.error('Failed to trigger notification:', error);
    }
  }
}

export default new NotificationService();
