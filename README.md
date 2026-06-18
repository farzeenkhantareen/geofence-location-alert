
# Location Alert React Native 📍🔔

A React Native location-based notification application that monitors predefined GPS coordinates and alerts users when they enter a specific geofence area.

The app uses background location tracking and local notifications to detect when a user reaches configured locations.

## Features

- 📍 Background location tracking
- 🗺️ Geofencing support
- 🔔 Local push notifications
- 📌 Multiple monitored GPS locations
- 📏 Radius-based location detection
- 🔄 Notification reset after leaving and re-entering a location
- 📱 Android APK support
- ⚡ Battery-efficient location monitoring

## How It Works

The application contains predefined latitude and longitude coordinates.

When the user enters the configured radius around any location:

```

User enters geofence area
↓
Location detected
↓
Notification triggered
↓
"You have reached this location"

````

## Development Setup

### Install dependencies

```bash
npm install
````

### Start development server

```bash
npx expo start
```

## Important Note About Expo Go

This project was initially developed using Expo.

Due to limitations with background location tracking and notification handling inside Expo Go, the application was tested using a generated Android APK.

The complete functionality works after building and installing the APK on a physical device.

## Build Android APK

Install EAS CLI:

```bash
npm install -g eas-cli
```

Login:

```bash
eas login
```

Configure EAS:

```bash
eas build:configure
```

Create Android APK:

```bash
eas build --platform android --profile preview
```

After building:

1. Download the APK
2. Install it on an Android device
3. Allow location permissions
4. Allow notification permissions
5. Start monitoring locations

## Required Permissions

### Android

* Fine Location Permission
* Background Location Permission
* Notification Permission

### iOS

* Location When In Use Permission
* Always Location Permission
* Notification Permission

## Project Structure

```
src/
│
├── screens/
│   └── HomeScreen.js
│
├── services/
│   ├── LocationService.js
│   ├── GeofenceService.js
│   └── NotificationService.js
│
└── constants/
    └── locations.js
```

## Technologies Used

* React Native
* Expo
* Expo Location
* Expo Task Manager
* Expo Notifications
* JavaScript

## Future Improvements

* Dynamic location management
* Backend integration
* User-created geofences
* Map visualization
* Cloud notifications
* Location history tracking

## Learn More

* Expo Documentation:
  [https://docs.expo.dev/](https://docs.expo.dev/)

* React Native Documentation:
  [https://reactnative.dev/](https://reactnative.dev/)

## Author

Developed as a location-based notification system using React Native and Expo.
