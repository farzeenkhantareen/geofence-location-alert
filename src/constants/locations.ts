export interface MonitoredLocation {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
}

export const MONITORED_LOCATIONS: MonitoredLocation[] = [
  {
    id: 1,
    name: 'Point A',
    latitude: 33.6844,
    longitude: 73.0479,
    radius: 100, // radius in meters
  },
  {
    id: 2,
    name: 'Point B',
    latitude: 33.7000,
    longitude: 73.0500,
    radius: 100,
  },
  {
    id: 3,
    name: 'Point C',
    latitude: 33.7100,
    longitude: 73.0600,
    radius: 100,
  },
];
