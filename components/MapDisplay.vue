<template>
  <div class="map-container">
    <div ref="mapContainer" style="width: 100%; height: 400px;"></div>
    <div class="stats-container mt-4 p-4 bg-base-200 rounded-lg">
      <div class="stat">
        <div class="stat-title">Distance du parcours</div>
        <div class="stat-value text-primary">{{ distance }}</div>
        <div class="stat-desc" v-if="startPoint && userLocation">
          Point de départ à {{ calculateStartDistance().toFixed(2) }} km de votre position
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';

const props = defineProps<{
  coordinates: { lat: number; lng: number }[];
  distance: string;
  startPoint: { lat: number; lng: number };
  userLocation: { lat: number; lng: number };
}>();

const mapContainer = ref<HTMLElement | null>(null);
let map = ref(null);
let pathLayer = ref(null);
let L = ref(null);

function calculateStartDistance() {
  if (!props.startPoint || !props.userLocation) return 0;
  
  const R = 6371; // Earth's radius in km
  const dLat = (props.startPoint.lat - props.userLocation.lat) * Math.PI / 180;
  const dLon = (props.startPoint.lng - props.userLocation.lng) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(props.userLocation.lat * Math.PI / 180) * Math.cos(props.startPoint.lat * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function displayPath() {
  if (!map.value || !L.value || !props.coordinates || props.coordinates.length === 0) return;
  
  // Remove previous path if exists
  if (pathLayer.value) {
    map.value.removeLayer(pathLayer.value);
  }
  
  // Create polyline from coordinates
  const points = props.coordinates.map(coord => [coord.lat, coord.lng] as [number, number]);
  
  pathLayer.value = L.value.polyline(points, {
    color: 'blue',
    weight: 4,
    opacity: 0.8
  }).addTo(map.value);
  
  // Add start and end markers
  if (points.length > 0) {
    const startPoint = points[0];
    const endPoint = points[points.length - 1];
    
    // Start marker (green)
    L.value.marker(startPoint, {
      icon: L.value.divIcon({
        className: 'start-marker',
        html: '<div style="background-color: green; width: 12px; height: 12px; border-radius: 50%;"></div>',
        iconSize: [12, 12]
      })
    }).addTo(map.value).bindPopup('Départ');
    
    // End marker (red)
    L.value.marker(endPoint, {
      icon: L.value.divIcon({
        className: 'end-marker',
        html: '<div style="background-color: red; width: 12px; height: 12px; border-radius: 50%;"></div>',
        iconSize: [12, 12]
      })
    }).addTo(map.value).bindPopup('Arrivée');
  }
  
  // Add user location marker if available
  if (props.userLocation) {
    L.value.marker([props.userLocation.lat, props.userLocation.lng], {
      icon: L.value.divIcon({
        className: 'user-marker',
        html: '<div style="background-color: purple; width: 10px; height: 10px; border-radius: 50%; border: 2px solid white;"></div>',
        iconSize: [14, 14]
      })
    }).addTo(map.value).bindPopup('Votre position actuelle');
  }
  
  // Fit map to path bounds
  map.value.fitBounds(pathLayer.value.getBounds());
}

onMounted(async () => {
  if (process.client && mapContainer.value) {
    // Dynamically import Leaflet only on client side
    const leaflet = await import('leaflet');
    await import('leaflet/dist/leaflet.css');
    L.value = leaflet.default || leaflet;
    
    // Initialize map
    map.value = L.value.map(mapContainer.value);
    
    // Add the tile layer (OpenStreetMap)
    L.value.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(map.value);
    
    // Display path on initial load
    displayPath();
  }
});

// Re-display path when coordinates change
watch(() => props.coordinates, displayPath, { deep: true });
</script>

<style scoped>
.map-container {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}
</style>