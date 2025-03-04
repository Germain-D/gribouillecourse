<template>
    <div class="map-display">
      <div ref="mapContainer" style="width: 100%; height: 400px;"></div>
      <p v-if="locationError" class="text-red-500 mt-2">{{ locationError }}</p>
      <div class="mt-4 flex gap-2">
        <button @click="showUserLocation" class="btn btn-primary btn-sm">Ma position</button>
        <button @click="showGpxTrack" class="btn btn-success btn-sm">Afficher le parcours GPX</button>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { onMounted, ref } from 'vue';
  import * as L from 'leaflet';
  
  const mapContainer = ref<HTMLElement | null>(null);
  const locationError = ref<string | null>(null);
  let map: L.Map | null = null;
  let gpxLayer: L.Polyline | null = null;
  
  // Fonction pour analyser le GPX
  function parseGpx(gpxString: string) {
    const parser = new DOMParser();
    const gpx = parser.parseFromString(gpxString, "text/xml");
    const points: [number, number][] = [];
    
    const trackPoints = gpx.querySelectorAll('trkpt');
    trackPoints.forEach(trkpt => {
      const lat = parseFloat(trkpt.getAttribute('lat') || '0');
      const lon = parseFloat(trkpt.getAttribute('lon') || '0');
      if (lat && lon) {
        points.push([lat, lon]);
      }
    });
    
    return points;
  }
  
  // Fonction pour charger le fichier GPX à partir des assets
  async function loadGpxFile() {
    try {
      const response = await fetch('/assets/data/fichier_test.gpx');
      const gpxData = await response.text();
      return gpxData;
    } catch (error) {
      console.error("Erreur lors du chargement du fichier GPX:", error);
      return null;
    }
  }
  
  // Afficher le tracé GPX sur la carte
  async function showGpxTrack() {
    if (!map) return;
    
    // Supprimer l'ancien tracé s'il existe
    if (gpxLayer) {
      map.removeLayer(gpxLayer);
    }
    
    try {
      // Charger le fichier GPX
      const gpxData = await loadGpxFile();
      
      if (!gpxData) {
        locationError.value = "Impossible de charger le fichier GPX.";
        return;
      }
      
      // Parser le fichier GPX pour extraire les points
      const points = parseGpx(gpxData);
      
      if (points.length === 0) {
        locationError.value = "Aucun point trouvé dans le fichier GPX.";
        return;
      }
      
      // Créer une polyline avec les points
      gpxLayer = L.polyline(points, {
        color: 'blue',
        weight: 3,
        opacity: 0.8
      }).addTo(map);
  
      // Ajuster la vue pour afficher tout le tracé
      map.fitBounds(gpxLayer.getBounds());
      
      // Effacer les erreurs précédentes
      locationError.value = null;
    } catch (error) {
      console.error("Erreur lors de l'affichage du tracé GPX:", error);
      locationError.value = "Erreur lors de l'affichage du tracé GPX.";
    }
  }
  
  // Afficher la position actuelle de l'utilisateur
  function showUserLocation() {
    if (!map) return;
    
    if (navigator.geolocation) {
      try {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            
            // Center map on user's location
            map?.setView([latitude, longitude], 15);
            
            // Add marker for user's location
            L.marker([latitude, longitude])
              .addTo(map!)
              .bindPopup('Votre position actuelle')
              .openPopup();
              
            locationError.value = null;
          },
          (error) => {
            console.error('Geolocation error:', error);
            locationError.value = "Impossible d'accéder à votre position. Utilisez le parcours GPX.";
          }
        );
      } catch (err) {
        locationError.value = "Erreur de géolocalisation. Utilisez le parcours GPX.";
      }
    } else {
      locationError.value = "Géolocalisation non supportée. Utilisez le parcours GPX.";
    }
  }
  
  onMounted(async () => {
    if (!mapContainer.value) return;
  
    // Initialize map with default location
    map = L.map(mapContainer.value).setView([48.8566, 2.3522], 13); // Paris as default
  
    // Add the tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    
    // Charger automatiquement le parcours GPX au démarrage
    showGpxTrack();
  });
  </script>
  
  <style scoped>
  .map-display {
    position: relative;
    width: 100%;
    margin: 20px 0;
  }
</style>