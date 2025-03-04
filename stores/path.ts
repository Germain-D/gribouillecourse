import { defineStore } from 'pinia';

interface Coordinate {
  lat: number;
  lng: number;
}

interface PathState {
  coordinates: Coordinate[];
  gpxContent: string | null;
}

export const usePathStore = defineStore('path', {
  state: (): PathState => ({
    coordinates: [],
    gpxContent: null
  }),
  
  actions: {
    setPath(path: { coordinates: Coordinate[]; gpxContent: string }) {
      this.coordinates = path.coordinates;
      this.gpxContent = path.gpxContent;
    },
    
    clearPath() {
      this.coordinates = [];
      this.gpxContent = null;
    }
  },
  
  persist: true
});