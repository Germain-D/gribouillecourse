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
    
    // Calculate total distance of drawn path
    getTotalDistance: (state) => {
      if (state.drawingPoints.length < 2) return 0;
      
      let totalDistance = 0;
      for (let i = 1; i < state.drawingPoints.length; i++) {
        const prev = state.drawingPoints[i - 1];
        const current = state.drawingPoints[i];
        totalDistance += calculateDistance(prev, current);
      }
      
      return totalDistance;
    },
    
    // Get path bounds for map fitting
    getPathBounds: (state) => {
      if (state.drawingPoints.length === 0) return null;
      
      let minLat = state.drawingPoints[0].lat;
      let maxLat = state.drawingPoints[0].lat;
      let minLng = state.drawingPoints[0].lng;
      let maxLng = state.drawingPoints[0].lng;
      
      state.drawingPoints.forEach(point => {
        minLat = Math.min(minLat, point.lat);
        maxLat = Math.max(maxLat, point.lat);
        minLng = Math.min(minLng, point.lng);
        maxLng = Math.max(maxLng, point.lng);
      });
      
      return { minLat, maxLat, minLng, maxLng };
    }
  },
  
  actions: {
    // Map control methods
    centerMap(location: LatLng) {
      this.mapCenter = location;
    },
    
    setZoom(zoom: number) {
      this.zoom = Math.max(1, Math.min(20, zoom));
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
      // Validate the point before adding
      if (isValidLatLng(point)) {
        this.drawingPoints.push(point);
        this.notifySubscribers();
      }
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
    
    // Bulk operations for performance
    setDrawingPoints(points: LatLng[]) {
      this.drawingPoints = points.filter(isValidLatLng);
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
    
    // Utility methods
    getDistance(point1: LatLng, point2: LatLng): number {
      return calculateDistance(point1, point2);
    },
    
    // Get simplified version of path for API calls
    getSimplifiedPath(maxPoints: number = 50): LatLng[] {
      if (this.drawingPoints.length <= maxPoints) {
        return [...this.drawingPoints];
      }
      
      const step = this.drawingPoints.length / maxPoints;
      const simplified: LatLng[] = [];
      
      for (let i = 0; i < maxPoints; i++) {
        const index = Math.min(Math.floor(i * step), this.drawingPoints.length - 1);
        simplified.push(this.drawingPoints[index]);
      }
      
      return simplified;
    }
  }
});

// Helper functions
function calculateDistance(point1: LatLng, point2: LatLng): number {
  const R = 6371; // Earth's radius in km
  const dLat = (point2.lat - point1.lat) * Math.PI / 180;
  const dLng = (point2.lng - point1.lng) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function isValidLatLng(point: LatLng): boolean {
  return (
    typeof point.lat === 'number' &&
    typeof point.lng === 'number' &&
    !isNaN(point.lat) &&
    !isNaN(point.lng) &&
    point.lat >= -90 &&
    point.lat <= 90 &&
    point.lng >= -180 &&
    point.lng <= 180
  );
}