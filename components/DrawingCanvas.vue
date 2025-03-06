<template>
  <div class="drawing-container">
    <!-- Map display area -->
    <div id="map-container" class="w-full h-96 mb-4"></div>
    
    <!-- Map drawing controls -->
    <div class="options-container mt-4 w-full max-w-md">
      <div class="form-control">
        <label class="label">
          <span class="label-text">Distance maximale (km)</span>
        </label>
        <input 
          v-model.number="maxDistance" 
          type="range" 
          min="1" 
          max="50" 
          class="range range-primary" 
          step="1" 
        />
        <div class="flex justify-between text-xs px-2 mt-1">
          <span>1km</span>
          <span>{{ maxDistance }}km</span>
          <span>50km</span>
        </div>
      </div>
      
      <div class="form-control mt-4">
        <label class="label cursor-pointer">
          <span class="label-text">Centrer la carte sur ma position</span>
          <input 
            type="checkbox" 
            v-model="useUserLocation"
            @change="centerOnUserLocation" 
            class="checkbox checkbox-primary" 
          />
        </label>
        <div v-if="locationStatus" class="text-sm mt-1" :class="{ 'text-error': locationError, 'text-success': !locationError }">
          {{ locationStatus }}
        </div>
      </div>

      <div class="form-control mt-4">
        <label class="label cursor-pointer">
          <span class="label-text">Activer le mode dessin à main levée</span>
          <input 
            type="checkbox" 
            v-model="drawingModeActive"
            class="checkbox checkbox-primary" 
          />
        </label>
        <div v-if="mapStore.isDrawingMode" class="text-sm mt-1 text-success">
          Mode dessin actif. Cliquez et faites glisser sur la carte pour dessiner.
        </div>
      </div>
    </div>
    
    <div class="buttons mt-4">
      <button class="btn btn-primary" @click="clearDrawing">Effacer</button>
      <button class="btn btn-success ml-2" @click="generatePath" :disabled="mapPoints.length < 2">
        Générer le parcours
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { useRouter } from 'vue-router';
import { usePathStore } from '@/stores/path';
import { useMapStore } from '@/stores/map';
// Import Leaflet
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const router = useRouter();
const pathStore = usePathStore();
const mapStore = useMapStore();

const maxDistance = ref(10); // Default 10km
const useUserLocation = ref(false);
const drawingModeActive = computed({
  get: () => mapStore.isDrawingMode,
  set: (value) => {
    if (value) mapStore.startDrawing();
    else mapStore.stopDrawing();
  }
});
const userLocation = ref<{ lat: number; lng: number } | null>(null);
const locationStatus = ref<string | null>(null);
const locationError = ref(false);
const mapPoints = ref<{lat: number, lng: number}[]>([]);
const isDrawing = ref(false);
const samplingRate = 20; // Milliseconds between point samples
let lastSampleTime = 0;

// Leaflet map instance
let map: L.Map | null = null;
let polyline: L.Polyline | null = null;
let markers: L.Marker[] = [];

// Initialize the map
function initMap() {
  if (map) return; // Map already initialized
  
  // Create the map
  map = L.map('map-container', {
    dragging: true,  // Keep default map dragging behavior
  }).setView([mapStore.mapCenter.lat, mapStore.mapCenter.lng], mapStore.zoom);
  
  // Add tile layer (OpenStreetMap)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);
  
  // Initialize polyline for drawing
  polyline = L.polyline([], { color: 'blue', weight: 3 }).addTo(map);
  
  // Setup freehand drawing handlers
  setupFreehandDrawing();
  
  // Center map based on mapStore
  map.setView([mapStore.mapCenter.lat, mapStore.mapCenter.lng], mapStore.zoom);
}

// Setup events for freehand drawing
function setupFreehandDrawing() {
  if (!map) return;
  
  // Remove old handlers if any
  map.off('mousedown');
  map.off('mousemove');
  map.off('mouseup');
  map.off('mouseout');
  
  // Add freehand drawing handlers
  map.on('mousedown', startDrawing);
  map.on('mousemove', drawIfActive);
  map.on('mouseup', stopDrawing);
  map.on('mouseout', stopDrawing);
  
  // For touch devices
  map.getContainer().addEventListener('touchstart', handleTouchStart, { passive: false });
  map.getContainer().addEventListener('touchmove', handleTouchMove, { passive: false });
  map.getContainer().addEventListener('touchend', handleTouchEnd, { passive: true });
}

// Handle touch events
function handleTouchStart(e: TouchEvent) {
  if (!mapStore.isDrawingMode) return;
  
  e.preventDefault();
  const touch = e.touches[0];
  const container = map!.getContainer();
  const point = L.point(
    touch.clientX - container.getBoundingClientRect().left,
    touch.clientY - container.getBoundingClientRect().top
  );
  const latlng = map!.containerPointToLatLng(point);
  
  startDrawing({ latlng } as L.LeafletMouseEvent);
}

function handleTouchMove(e: TouchEvent) {
  if (!isDrawing.value || !mapStore.isDrawingMode) return;
  
  e.preventDefault();
  const touch = e.touches[0];
  const container = map!.getContainer();
  const point = L.point(
    touch.clientX - container.getBoundingClientRect().left,
    touch.clientY - container.getBoundingClientRect().top
  );
  const latlng = map!.containerPointToLatLng(point);
  
  drawIfActive({ latlng } as L.LeafletMouseEvent);
}

function handleTouchEnd() {
  stopDrawing();
}

// Start drawing when mouse is pressed
function startDrawing(e: L.LeafletMouseEvent) {
  if (!mapStore.isDrawingMode) return;
  
  isDrawing.value = true;
  
  // Add first point
  const point = { lat: e.latlng.lat, lng: e.latlng.lng };
  mapStore.addPoint(point);
  lastSampleTime = Date.now();
  
  // Disable map dragging while drawing
  map!.dragging.disable();
}

// Add points as the mouse moves (throttled)
function drawIfActive(e: L.LeafletMouseEvent) {
  if (!isDrawing.value || !mapStore.isDrawingMode) return;
  
  const now = Date.now();
  if (now - lastSampleTime >= samplingRate) {
    const point = { lat: e.latlng.lat, lng: e.latlng.lng };
    
    // Optional: Check minimum distance to avoid super-dense points
    const lastPoint = mapStore.drawingPoints[mapStore.drawingPoints.length - 1];
    if (lastPoint) {
      const distMeters = calculateDistanceInMeters(lastPoint, point);
      if (distMeters < 5) return; // Skip points that are too close (under 5 meters)
    }
    
    mapStore.addPoint(point);
    lastSampleTime = now;
  }
}

// Helper function to calculate distance between points in meters
function calculateDistanceInMeters(p1: {lat: number, lng: number}, p2: {lat: number, lng: number}) {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = p1.lat * Math.PI/180;
  const φ2 = p2.lat * Math.PI/180;
  const Δφ = (p2.lat - p1.lat) * Math.PI/180;
  const Δλ = (p2.lng - p1.lng) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Stop drawing when mouse is released
function stopDrawing() {
  if (isDrawing.value) {
    isDrawing.value = false;
    
    // Re-enable map dragging
    if (map) {
      map.dragging.enable();
    }
  }
}

// Update map display when points change
function updateMapDisplay(points: {lat: number, lng: number}[]) {
  if (!map) return;
  
  // Update polyline
  if (polyline) {
    polyline.setLatLngs(points.map(p => [p.lat, p.lng]));
  }
  
  // Clear existing markers
  markers.forEach(marker => map?.removeLayer(marker));
  markers = [];
  
  // Add markers for start and end points only
  if (points.length > 0) {
    // Start point
    const startMarker = L.marker([points[0].lat, points[0].lng], {
      icon: L.divIcon({
        className: 'start-point-icon',
        html: `<div>S</div>`,
        iconSize: [20, 20]
      })
    }).addTo(map!);
    markers.push(startMarker);
    
    // End point if different
    if (points.length > 1) {
      const endMarker = L.marker([points[points.length-1].lat, points[points.length-1].lng], {
        icon: L.divIcon({
          className: 'end-point-icon',
          html: `<div>E</div>`,
          iconSize: [20, 20]
        })
      }).addTo(map!);
      markers.push(endMarker);
    }
  }
  
  // Update local reference
  mapPoints.value = points;
}

// Get user's current location
function getCurrentLocation() {
  if (!navigator.geolocation) {
    locationStatus.value = "La géolocalisation n'est pas prise en charge par votre navigateur";
    locationError.value = true;
    return;
  }
  
  locationStatus.value = "Recherche de votre position...";
  locationError.value = false;
  
  navigator.geolocation.getCurrentPosition(
    (position) => {
      userLocation.value = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      locationStatus.value = "Position trouvée";
      locationError.value = false;
      
      // If enabled, center the map on the user's location
      if (useUserLocation.value && map) {
        mapStore.centerMap(userLocation.value);
        map.setView([userLocation.value.lat, userLocation.value.lng], 15);
      }
    },
    (error) => {
      console.error("Erreur de géolocalisation:", error);
      locationStatus.value = "Impossible d'obtenir votre position";
      locationError.value = true;
      useUserLocation.value = false;
    }
  );
}

// Center map on user location when enabled
function centerOnUserLocation() {
  if (useUserLocation.value) {
    if (userLocation.value && map) {
      // If we already have the location, center map immediately
      mapStore.centerMap(userLocation.value);
      map.setView([userLocation.value.lat, userLocation.value.lng], 15);
    } else {
      // Otherwise fetch location first
      getCurrentLocation();
    }
  }
}

function toggleDrawingMode() {
  mapStore.toggleDrawingMode();
}

function clearDrawing() {
  mapStore.clearDrawing();
}

async function generatePath() {
  if (mapPoints.value.length < 2) {
    alert('Veuillez dessiner un chemin sur la carte avant de générer le parcours.');
    return;
  }
  
  try {
    console.log(`Sending ${mapPoints.value.length} points to generate path with max distance: ${maxDistance.value}km`);
    
    const requestBody: any = { 
      points: mapPoints.value,
      maxDistance: maxDistance.value 
    };
    
    // Add user location if available for context
    if (userLocation.value) {
      requestBody.userLocation = userLocation.value;
    }
    
    const response = await fetch('/api/generate-path', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    const data = await response.json();
    
    // Check if the response contains an error status code
    if (response.status >= 400) {
      throw new Error(data.body?.message || 'Erreur lors de la génération du parcours');
    }
    
    if (data.success) {
      // Store the generated path in the store
      pathStore.setPath({
        coordinates: data.coordinates,
        gpxContent: data.gpxContent,
        distance: data.distance,
        startPoint: data.startPoint || null
      });
      
      // Navigate to results page
      router.push('/results');
    } else {
      throw new Error(data.body?.message || 'Erreur lors de la génération du parcours');
    }
  } catch (error) {
    console.error('Failed to generate path:', error);
    alert('Échec de la génération du parcours. Veuillez réessayer.');
  }
}

// Initialize map and subscribe to drawing events
onMounted(() => {
  // Initialize the map
  initMap();
  
  // Subscribe to map store changes
  mapStore.subscribeToDrawingEvents(updateMapDisplay);
  
  // Listen to center changes
  watch(() => mapStore.mapCenter, (newCenter) => {
    if (map) {
      map.setView([newCenter.lat, newCenter.lng], map.getZoom());
    }
  });
  
  // Get user location on mount
  getCurrentLocation();
});
</script>

<style scoped>
.drawing-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: 20px;
}

#map-container {
  width: 100%;
  height: 400px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

:deep(.start-point-icon) {
  background-color: green;
  color: white;
  border-radius: 50%;
  text-align: center;
  line-height: 20px;
  font-weight: bold;
}

:deep(.end-point-icon) {
  background-color: red;
  color: white;
  border-radius: 50%;
  text-align: center;
  line-height: 20px;
  font-weight: bold;
}

:deep(.drawing-point-icon) {
  background-color: blue;
  color: white;
  border-radius: 50%;
  text-align: center;
  line-height: 20px;
  font-size: 12px;
}
</style>