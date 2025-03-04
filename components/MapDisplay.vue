<template>
  <div class="map-container">
    <div ref="mapContainer" style="width: 100%; height: 400px;"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import * as L from 'leaflet';

const props = defineProps<{
  coordinates: { lat: number; lng: number }[]
}>();

const mapContainer = ref<HTMLElement | null>(null);
let map: L.Map | null = null;
let pathLayer: L.Polyline | null = null;

function displayPath() {
  if (!map || !props.coordinates || props.coordinates.length === 0) return;
  
  // Remove previous path if exists
  if (pathLayer) {
    map.removeLayer(pathLayer);
  }
  
  // Create polyline from coordinates
  const points = props.coordinates.map(coord => [coord.lat, coord.lng] as [number, number]);
  
  pathLayer = L.polyline(points, {
    color: 'blue',
    weight: 4,
    opacity: 0.8
  }).addTo(map);
  
  // Add start and end markers
  if (points.length > 0) {
    const startPoint = points[0];
    const endPoint = points[points.length - 1];
    
    // Start marker (green)
    L.marker(startPoint, {
      icon: L.divIcon({
        className: 'start-marker',
        html: '<div style="background-color: green; width: 12px; height: 12px; border-radius: 50%;"></div>',
        iconSize: [12, 12]
      })
    }).addTo(map).bindPopup('Départ');
    
    // End marker (red)
    L.marker(endPoint, {
      icon: L.divIcon({
        className: 'end-marker',
        html: '<div style="background-color: red; width: 12px; height: 12px; border-radius: 50%;"></div>',
        iconSize: [12, 12]
      })
    }).addTo(map).bindPopup('Arrivée');
  }
  
  // Fit map to path bounds
  map.fitBounds(pathLayer.getBounds());
}

onMounted(() => {
  if (process.client && mapContainer.value) {
    // Import Leaflet CSS
    import('leaflet/dist/leaflet.css');
    
    // Initialize map
    map = L.map(mapContainer.value);
    
    // Add the tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    
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