import { defineStore } from 'pinia';

interface Coordinate {
  lat: number;
  lng: number;
}

interface PathState {
  coordinates: Coordinate[];
  gpxContent: string | null;
  distance: string | null;
}

export const usePathStore = defineStore('path', {
  state: (): PathState => ({
    coordinates: [],
    gpxContent: null,
    distance: null
  }),
  
  actions: {
    setPath(path: { coordinates: Coordinate[]; gpxContent: string; distance: string }) {
      this.coordinates = path.coordinates;
      this.gpxContent = path.gpxContent;
      this.distance = path.distance;
    },
    
    clearPath() {
      this.coordinates = [];
      this.gpxContent = null;
      this.distance = null;
    }
  }
});