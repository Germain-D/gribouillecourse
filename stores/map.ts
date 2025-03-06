import { defineStore } from 'pinia';

// Define types
interface LatLng {
  lat: number;
  lng: number;
}

type DrawingEventCallback = (points: LatLng[]) => void;

interface MapState {
  mapCenter: LatLng;
  zoom: number;
  drawingPoints: LatLng[];
  isDrawingMode: boolean;
  eventSubscribers: DrawingEventCallback[];
}

export const useMapStore = defineStore('map', {
  state: (): MapState => ({
    mapCenter: { lat: 48.856614, lng: 2.3522219 }, // Default to Paris
    zoom: 13,
    drawingPoints: [],
    isDrawingMode: false,
    eventSubscribers: [],
  }),
  
  getters: {
    pointsCount: (state) => state.drawingPoints.length,
  },
  
  actions: {
    // Map control methods
    centerMap(location: LatLng) {
      this.mapCenter = location;
    },
    
    setZoom(newZoom: number) {
      this.zoom = newZoom;
    },
    
    // Drawing methods
    startDrawing() {
      this.isDrawingMode = true;
    },
    
    stopDrawing() {
      this.isDrawingMode = false;
    },
    
    toggleDrawingMode() {
      this.isDrawingMode = !this.isDrawingMode;
      if (!this.isDrawingMode && this.drawingPoints.length === 0) {
        this.notifySubscribers();
      }
    },
    
    addPoint(point: LatLng) {
      this.drawingPoints.push(point);
      this.notifySubscribers();
    },
    
    removeLastPoint() {
      if (this.drawingPoints.length > 0) {
        this.drawingPoints.pop();
        this.notifySubscribers();
      }
    },
    
    clearDrawing() {
      this.drawingPoints = [];
      this.notifySubscribers();
    },
    
    // Event subscription system
    subscribeToDrawingEvents(callback: DrawingEventCallback) {
      this.eventSubscribers.push(callback);
      // Immediately notify with current state
      callback([...this.drawingPoints]);
      return () => {
        // Return unsubscribe function
        const index = this.eventSubscribers.indexOf(callback);
        if (index !== -1) {
          this.eventSubscribers.splice(index, 1);
        }
      };
    },
    
    notifySubscribers() {
      // Make a copy of the points to avoid mutation issues
      const pointsCopy = [...this.drawingPoints];
      this.eventSubscribers.forEach(callback => {
        callback(pointsCopy);
      });
    },
    
    // Location-based methods
    getDistance(point1: LatLng, point2: LatLng): number {
      const R = 6371; // Earth's radius in km
      const dLat = (point2.lat - point1.lat) * Math.PI / 180;
      const dLng = (point2.lng - point1.lng) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) * 
        Math.sin(dLng/2) * Math.sin(dLng/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    },
    
    getTotalDistance(): number {
      if (this.drawingPoints.length < 2) return 0;
      
      let totalDistance = 0;
      for (let i = 1; i < this.drawingPoints.length; i++) {
        totalDistance += this.getDistance(this.drawingPoints[i-1], this.drawingPoints[i]);
      }
      
      return totalDistance;
    }
  }
});