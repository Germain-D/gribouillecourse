import { defineStore } from 'pinia';

interface Coordinate {
  lat: number;
  lng: number;
}

export interface PathState {
  coordinates: Coordinate[];
  gpxContent: string | null;
  distance: string;
  startPoint: { lat: number; lng: number } | null;
  userLocation: { lat: number; lng: number } | null;
}

export const usePathStore = defineStore('path', {
  state: (): PathState => ({
    coordinates: [],
    gpxContent: null,
    distance: "",
    startPoint: null,
    userLocation: null,
  }),
  
  actions: {

      setPath(path: { coordinates: Coordinate[], gpxContent: string, distance: string, startPoint?: { lat: number; lng: number }, userLocation?: { lat: number; lng: number } }) {
        this.coordinates = path.coordinates;
        this.gpxContent = path.gpxContent;
        this.distance = path.distance;
        if (path.startPoint) this.startPoint = path.startPoint;
        if (path.userLocation) this.userLocation = path.userLocation;
      },
    clearPath() {
      this.coordinates = [];
      this.gpxContent = null;
      this.distance = "";
      this.startPoint = null;
      this.userLocation = null;
    }
  }
});