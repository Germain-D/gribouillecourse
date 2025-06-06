<template>
  <div class="drawing-container">
    <!-- Map display area -->
    <div
      id="map-container"
      class="w-full h-[70vh] max-h-[35rem] min-h-80 mb-4 relative"
    >
      <!-- Mode indicator overlay -->
      <div
        v-if="mapStore.isDrawingMode"
        class="absolute top-4 right-4 z-[1000] bg-success text-success-content px-3 py-2 rounded-lg shadow-lg"
      >
        <Icon name="ph:pencil-bold" class="mr-2" />
        Mode dessin actif
      </div>

      <!-- Point counter overlay -->
      <div
        v-if="mapStore.pointsCount > 0"
        class="absolute top-4 left-4 z-[1000] bg-info text-info-content px-3 py-2 rounded-lg shadow-lg"
      >
        <Icon name="ph:map-pin-bold" class="mr-2" />
        {{ mapStore.pointsCount }} points
      </div>
    </div>

    <!-- Map drawing controls -->
    <div class="options-container mt-4 w-full max-w-md">
      <!-- Profile Selection -->
      <div class="form-control mb-4">
        <label class="label">
          <span class="label-text">Type de parcours</span>
        </label>
        <select v-model="routeProfile" class="select select-bordered">
          <option value="foot">🚶 À pied / Course</option>
          <option value="bike">🚴 Vélo</option>
          <option value="car">🚗 Voiture</option>
        </select>
      </div>

      <!-- Distance Slider -->
      <div class="form-control">
        <label class="label">
          <span class="label-text">Distance maximale</span>
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
          <span class="font-bold text-primary">{{ maxDistance }}km</span>
          <span>50km</span>
        </div>
      </div>

      <!-- User Location -->
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
        <div
          v-if="locationStatus"
          class="text-sm mt-1"
          :class="{
            'text-error': locationError,
            'text-success': !locationError,
          }"
        >
          <Icon
            :name="locationError ? 'ph:warning-circle' : 'ph:check-circle'"
            class="mr-1"
          />
          {{ locationStatus }}
        </div>
      </div>

      <!-- Drawing Mode -->
      <div class="form-control mt-4">
        <label class="label cursor-pointer">
          <span class="label-text">Activer le mode dessin à main levée</span>
          <input
            type="checkbox"
            v-model="drawingModeActive"
            class="checkbox checkbox-primary"
          />
        </label>
        <div v-if="mapStore.isDrawingMode" class="alert alert-success mt-2 p-2">
          <Icon name="ph:hand-pointing" class="mr-2" />
          <span class="text-sm"
            >Cliquez et faites glisser sur la carte pour dessiner votre
            parcours.</span
          >
        </div>
        <div
          v-else-if="mapStore.pointsCount > 0"
          class="alert alert-info mt-2 p-2"
        >
          <Icon name="ph:info" class="mr-2" />
          <span class="text-sm"
            >{{ mapStore.pointsCount }} points dessinés. Activez le mode dessin
            pour continuer.</span
          >
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="buttons mt-6 flex gap-2 flex-wrap justify-center">
      <button
        class="btn btn-warning"
        @click="clearDrawing"
        :disabled="mapStore.pointsCount === 0"
      >
        <Icon name="ph:eraser" class="mr-2" />
        Effacer
      </button>

      <button
        class="btn btn-success"
        @click="generatePath"
        :disabled="mapStore.pointsCount < 2 || isGenerating"
        :class="{ loading: isGenerating }"
      >
        <Icon v-if="!isGenerating" name="ph:magic-wand" class="mr-2" />
        {{ isGenerating ? "Génération..." : "Générer le parcours" }}
      </button>
    </div>

    <!-- Preview Info -->
    <div v-if="mapStore.pointsCount > 1" class="stats shadow mt-4 bg-base-100">
      <div class="stat">
        <div class="stat-title">Aperçu du dessin</div>
        <div class="stat-value text-sm">
          {{ previewDistance.toFixed(2) }} km
        </div>
        <div class="stat-desc">Distance estimée du dessin</div>
      </div>
    </div>

    <!-- Help Guide for first-time users -->
    <div
      v-if="mapStore.pointsCount === 0 && !mapStore.isDrawingMode"
      class="alert alert-info mt-4"
    >
      <Icon name="ph:info" class="mr-2" />
      <div>
        <h4 class="font-bold">Comment dessiner votre parcours :</h4>
        <ol class="list-decimal list-inside mt-2 text-sm space-y-1">
          <li>Activez le mode dessin avec la case à cocher ci-dessus</li>
          <li>
            Cliquez et faites glisser sur la carte pour dessiner votre forme
          </li>
          <li>Votre dessin apparaîtra en bleu sur la carte</li>
          <li>Ajustez la distance maximale selon vos préférences</li>
          <li>
            Cliquez sur "Générer le parcours" pour créer votre itinéraire GPX
          </li>
        </ol>
      </div>
    </div>

    <!-- Loading overlay with enhanced UI -->
    <div
      v-if="isGenerating"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]"
    >
      <div class="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div class="flex items-center mb-4">
          <div
            class="loading loading-spinner loading-md mr-3 text-primary"
          ></div>
          <h3 class="text-lg font-bold">Génération du parcours</h3>
        </div>

        <div class="mb-4">
          <div class="flex justify-between mb-1">
            <span class="text-sm font-medium">{{ generationStep.title }}</span>
            <span class="text-sm font-bold text-primary"
              >{{ Math.round(generationProgress) }}%</span
            >
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div
              class="bg-primary h-2 rounded-full transition-all duration-300"
              :style="`width: ${generationProgress}%`"
            ></div>
          </div>
        </div>

        <div class="text-sm mb-3 text-gray-600">
          {{ generationStep.description }}
        </div>

        <ul class="text-sm mb-4">
          <li
            v-for="(step, index) in generationSteps"
            :key="index"
            class="flex items-start mb-2"
            :class="{
              'text-gray-400': currentStepIndex < index,
              'text-green-600 font-medium': currentStepIndex > index,
              'text-blue-600 font-medium': currentStepIndex === index,
            }"
          >
            <Icon
              v-if="currentStepIndex > index"
              name="ph:check"
              class="mr-2 mt-0.5 text-green-600"
            />
            <Icon
              v-else-if="currentStepIndex === index"
              name="ph:arrow-right"
              class="mr-2 mt-0.5 text-blue-600"
            />
            <Icon v-else name="ph:circle" class="mr-2 mt-0.5 text-gray-400" />
            {{ step.title }}
          </li>
        </ul>

        <div class="border-t pt-4 mt-2 flex justify-end">
          <button @click="cancelGeneration" class="btn btn-sm btn-outline">
            <Icon name="ph:x" class="mr-2" />
            Annuler
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue";
import { useRouter } from "vue-router";
import { usePathStore } from "@/stores/path";
import { useMapStore } from "@/stores/map";
// Import Leaflet
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const router = useRouter();
const pathStore = usePathStore();
const mapStore = useMapStore();

// Reactive state
const maxDistance = ref(10);
const routeProfile = ref<"foot" | "bike" | "car">("foot");
const useUserLocation = ref(false);
const userLocation = ref<{ lat: number; lng: number } | null>(null);
const locationStatus = ref<string | null>(null);
const locationError = ref(false);
const isDrawing = ref(false);
const samplingRate = 10; // Reduced for smoother drawing
let lastSampleTime = 0;

// Drawing mode computed property
const drawingModeActive = computed({
  get: () => mapStore.isDrawingMode,
  set: (value) => {
    if (value) {
      mapStore.startDrawing();
    } else {
      mapStore.stopDrawing();
    }
  },
});

// Preview distance calculation
const previewDistance = computed(() => {
  return mapStore.getTotalDistance;
});

// Leaflet map instance
let map: L.Map | null = null;
let polyline: L.Polyline | null = null;
let markers: L.Marker[] = [];

// Initialize the map with enhanced styling
function initMap() {
  if (map) return;

  map = L.map("map-container", {
    dragging: true,
    zoomControl: true,
    scrollWheelZoom: true,
    doubleClickZoom: false, // Disable to avoid conflicts with drawing
    touchZoom: true,
  }).setView([mapStore.mapCenter.lat, mapStore.mapCenter.lng], mapStore.zoom);

  // Add tile layer with better attribution
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
    detectRetina: true,
  }).addTo(map);

  // Initialize enhanced polyline for drawing
  polyline = L.polyline([], {
    color: "#3B82F6",
    weight: 4,
    opacity: 0.8,
    smoothFactor: 1,
    lineCap: "round",
    lineJoin: "round",
  }).addTo(map);

  // Setup drawing handlers
  setupFreehandDrawing();

  // Add custom controls
  addCustomControls();
}

// Add custom map controls
function addCustomControls() {
  if (!map) return;

  // Add a custom control for drawing info
  const DrawingInfoControl = L.Control.extend({
    onAdd: function () {
      const div = L.DomUtil.create(
        "div",
        "leaflet-control leaflet-control-custom"
      );
      div.innerHTML = `
        <div class="bg-white p-2 rounded shadow-lg text-xs border">
          <div id="drawing-info">Mode navigation</div>
        </div>
      `;
      return div;
    },
  });

  const drawingInfo = new DrawingInfoControl({ position: "bottomleft" });
  drawingInfo.addTo(map);
}

// Enhanced freehand drawing setup
function setupFreehandDrawing() {
  if (!map) return;

  // Remove old event listeners
  map.off("mousedown");
  map.off("mousemove");
  map.off("mouseup");
  map.off("mouseout");

  // Mouse events
  map.on("mousedown", startDrawing);
  map.on("mousemove", drawIfActive);
  map.on("mouseup", stopDrawing);
  map.on("mouseout", stopDrawing);

  // Touch events with better handling
  const container = map.getContainer();
  container.addEventListener("touchstart", handleTouchStart, {
    passive: false,
  });
  container.addEventListener("touchmove", handleTouchMove, { passive: false });
  container.addEventListener("touchend", handleTouchEnd, { passive: true });
  container.addEventListener("touchcancel", handleTouchEnd, { passive: true });
}

// Enhanced touch event handlers
function handleTouchStart(e: TouchEvent) {
  if (!mapStore.isDrawingMode) return;

  e.preventDefault();
  const touch = e.touches[0];
  const rect = map!.getContainer().getBoundingClientRect();
  const point = L.point(touch.clientX - rect.left, touch.clientY - rect.top);
  const latlng = map!.containerPointToLatLng(point);

  startDrawing({ latlng } as L.LeafletMouseEvent);
}

function handleTouchMove(e: TouchEvent) {
  if (!isDrawing.value || !mapStore.isDrawingMode) return;

  e.preventDefault();
  const touch = e.touches[0];
  const rect = map!.getContainer().getBoundingClientRect();
  const point = L.point(touch.clientX - rect.left, touch.clientY - rect.top);
  const latlng = map!.containerPointToLatLng(point);

  drawIfActive({ latlng } as L.LeafletMouseEvent);
}

function handleTouchEnd() {
  stopDrawing();
}

// Start drawing with visual feedback
function startDrawing(e: L.LeafletMouseEvent) {
  if (!mapStore.isDrawingMode) return;

  isDrawing.value = true;

  const point = { lat: e.latlng.lat, lng: e.latlng.lng };
  mapStore.addPoint(point);
  lastSampleTime = Date.now();

  // Disable map interactions during drawing
  map!.dragging.disable();
  map!.scrollWheelZoom.disable();

  // Update drawing info
  updateDrawingInfo("Dessin en cours...");
}

// Enhanced drawing with smooth point addition
function drawIfActive(e: L.LeafletMouseEvent) {
  if (!isDrawing.value || !mapStore.isDrawingMode) return;

  const now = Date.now();
  if (now - lastSampleTime >= samplingRate) {
    const point = { lat: e.latlng.lat, lng: e.latlng.lng };

    // Check minimum distance to avoid dense points
    const lastPoint = mapStore.drawingPoints[mapStore.drawingPoints.length - 1];
    if (lastPoint) {
      const distMeters = calculateDistanceInMeters(lastPoint, point);
      if (distMeters < 3) return; // Reduced threshold for smoother drawing
    }

    mapStore.addPoint(point);
    lastSampleTime = now;
  }
}

// Stop drawing with feedback
function stopDrawing() {
  if (isDrawing.value) {
    isDrawing.value = false;

    // Re-enable map interactions
    if (map) {
      map.dragging.enable();
      map.scrollWheelZoom.enable();
    }

    updateDrawingInfo(`${mapStore.pointsCount} points dessinés`);
  }
}

// Update drawing info display
function updateDrawingInfo(text: string) {
  const infoElement = document.getElementById("drawing-info");
  if (infoElement) {
    infoElement.textContent = text;
  }
}

// Helper function to calculate distance between points in meters
function calculateDistanceInMeters(
  p1: { lat: number; lng: number },
  p2: { lat: number; lng: number }
) {
  const R = 6371e3;
  const φ1 = (p1.lat * Math.PI) / 180;
  const φ2 = (p2.lat * Math.PI) / 180;
  const Δφ = ((p2.lat - p1.lat) * Math.PI) / 180;
  const Δλ = ((p2.lng - p1.lng) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Enhanced map display update
function updateMapDisplay(points: { lat: number; lng: number }[]) {
  if (!map) return;

  // Update polyline with smooth rendering
  if (polyline) {
    const latlngs = points.map((p) => [p.lat, p.lng] as L.LatLngTuple);
    polyline.setLatLngs(latlngs);
  }

  // Clear existing markers
  markers.forEach((marker) => map?.removeLayer(marker));
  markers = [];

  // Add enhanced markers
  if (points.length > 0) {
    // Start point with custom icon
    const startMarker = L.marker([points[0].lat, points[0].lng], {
      icon: L.divIcon({
        className: "custom-marker start-marker",
        html: `<div class="marker-content bg-green-500 text-white">S</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      }),
    }).addTo(map!);
    startMarker.bindTooltip("Départ", { permanent: false, direction: "top" });
    markers.push(startMarker);

    // End point if different from start
    if (points.length > 1) {
      const endMarker = L.marker(
        [points[points.length - 1].lat, points[points.length - 1].lng],
        {
          icon: L.divIcon({
            className: "custom-marker end-marker",
            html: `<div class="marker-content bg-red-500 text-white">E</div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          }),
        }
      ).addTo(map!);
      endMarker.bindTooltip("Arrivée", { permanent: false, direction: "top" });
      markers.push(endMarker);
    }
  }

  updateDrawingInfo(
    points.length > 0 ? `${points.length} points` : "Mode navigation"
  );
}

// Generation state
const isGenerating = ref(false);
const generationProgress = ref(0);
const currentStepIndex = ref(0);
const isCancelled = ref(false);
const generationSteps = [
  {
    title: "Préparation des données",
    description: "Analyse et optimisation des points de dessin...",
  },
  {
    title: "Détection des points critiques",
    description:
      "Identification des virages et éléments importants du tracé...",
  },
  {
    title: "Génération du parcours",
    description:
      "Recherche des routes existantes correspondant à votre dessin...",
  },
  {
    title: "Finalisation",
    description:
      "Application des ajustements finaux et création du fichier GPX...",
  },
];

const generationStep = computed(() => {
  return generationSteps[currentStepIndex.value] || generationSteps[0];
});

// Function to update progress
function updateProgress(step: number, progress: number) {
  currentStepIndex.value = step;
  generationProgress.value = step * 25 + (progress * 25) / 100;
}

function cancelGeneration() {
  isCancelled.value = true;
  isGenerating.value = false;
}

async function generatePath() {
  if (mapStore.pointsCount < 2) {
    alert(
      "Veuillez dessiner un chemin sur la carte avant de générer le parcours."
    );
    return;
  }

  // Reset generation state
  isGenerating.value = true;
  generationProgress.value = 0;
  currentStepIndex.value = 0;
  isCancelled.value = false;

  try {
    // Step 1: Prepare data
    updateProgress(0, 0);
    await simulateProgress(0, 100);
    if (isCancelled.value) return;

    console.log(
      `Sending ${mapStore.pointsCount} points to generate path with max distance: ${maxDistance.value}km, profile: ${routeProfile.value}`
    );

    const requestBody: any = {
      points: mapStore.drawingPoints,
      maxDistance: maxDistance.value,
      profile: routeProfile.value, // Ajout du profil de route
    };

    // Add user location if available for context
    if (userLocation.value) {
      requestBody.userLocation = userLocation.value;
    }

    // Step 2: Detect critical points
    updateProgress(1, 0);
    await simulateProgress(1, 100);
    if (isCancelled.value) return;

    // Step 3: Generate route - This is where the actual API call happens
    updateProgress(2, 0);

    const controller = new AbortController();
    const signal = controller.signal;

    // Set up cancellation
    watch(isCancelled, (cancelled) => {
      if (cancelled) controller.abort();
    });

    const response = await fetch("/api/generate-path", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
      signal,
    });

    // Update progress for route generation
    await simulateProgress(2, 100);
    if (isCancelled.value) return;

    const data = await response.json();

    // Check if the response contains an error status code
    if (response.status >= 400) {
      throw new Error(
        data.statusMessage ||
          data.message ||
          "Erreur lors de la génération du parcours"
      );
    }

    // Step 4: Finalize
    updateProgress(3, 0);
    await simulateProgress(3, 100);
    if (isCancelled.value) return;

    if (data.success) {
      // Store the generated path in the store
      pathStore.setPath({
        coordinates: data.coordinates,
        gpxContent: data.gpxContent,
        distance: data.distance,
        startPoint: data.startPoint || null,
      });

      // Save user location for context
      if (userLocation.value) {
        pathStore.userLocation = userLocation.value;
      }

      // Hide loading screen
      isGenerating.value = false;

      // Navigate to results page
      router.push("/results");
    } else {
      throw new Error(
        data.statusMessage ||
          data.message ||
          "Erreur lors de la génération du parcours"
      );
    }
  } catch (error) {
    if (isCancelled.value) {
      console.log("Path generation cancelled");
      return;
    }

    console.error("Failed to generate path:", error);

    // More user-friendly error handling
    const errorMessage =
      error instanceof Error ? error.message : "Erreur inconnue";
    alert(
      `Échec de la génération du parcours: ${errorMessage}\n\nVeuillez vérifier votre connexion internet et réessayer.`
    );
    isGenerating.value = false;
  }
}

// Helper function to simulate progress (for demo purposes)
async function simulateProgress(step: number, targetProgress: number) {
  let currentProgress = 0;
  const increment = 5;
  const delay = 50;

  while (currentProgress < targetProgress && !isCancelled.value) {
    currentProgress += increment;
    if (currentProgress > targetProgress) currentProgress = targetProgress;
    updateProgress(step, currentProgress);
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
}

// Enhanced user location management
function getCurrentLocation() {
  if (!navigator.geolocation) {
    locationStatus.value =
      "La géolocalisation n'est pas prise en charge par votre navigateur";
    locationError.value = true;
    return;
  }

  locationStatus.value = "Recherche de votre position...";
  locationError.value = false;

  const options = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 60000, // 1 minute cache
  };

  navigator.geolocation.getCurrentPosition(
    (position) => {
      userLocation.value = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      locationStatus.value = `Position trouvée (précision: ${Math.round(
        position.coords.accuracy
      )}m)`;
      locationError.value = false;

      // If enabled, center the map on the user's location
      if (useUserLocation.value && map) {
        mapStore.centerMap(userLocation.value);
        map.setView([userLocation.value.lat, userLocation.value.lng], 15);

        // Add user location marker
        addUserLocationMarker();
      }
    },
    (error) => {
      console.error("Erreur de géolocalisation:", error);
      let errorMsg = "Impossible d'obtenir votre position";

      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMsg = "Permission de géolocalisation refusée";
          break;
        case error.POSITION_UNAVAILABLE:
          errorMsg = "Position non disponible";
          break;
        case error.TIMEOUT:
          errorMsg = "Délai de géolocalisation dépassé";
          break;
      }

      locationStatus.value = errorMsg;
      locationError.value = true;
      useUserLocation.value = false;
    },
    options
  );
}

// Add user location marker to map
function addUserLocationMarker() {
  if (!map || !userLocation.value) return;

  // Remove existing user marker
  markers.forEach((marker) => {
    if (marker.options.icon?.options?.className?.includes("user-marker")) {
      map?.removeLayer(marker);
    }
  });

  const userMarker = L.marker(
    [userLocation.value.lat, userLocation.value.lng],
    {
      icon: L.divIcon({
        className: "custom-marker user-marker",
        html: `<div class="marker-content bg-purple-500 text-white border-2 border-white">👤</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      }),
    }
  ).addTo(map);

  userMarker.bindTooltip("Votre position", {
    permanent: false,
    direction: "top",
  });
  markers.push(userMarker);
}

// Center map on user location when enabled
function centerOnUserLocation() {
  if (useUserLocation.value) {
    if (userLocation.value && map) {
      // If we already have the location, center map immediately
      mapStore.centerMap(userLocation.value);
      map.setView([userLocation.value.lat, userLocation.value.lng], 15);
      addUserLocationMarker();
    } else {
      // Otherwise fetch location first
      getCurrentLocation();
    }
  } else {
    // Remove user location marker when unchecked
    markers.forEach((marker) => {
      if (marker.options.icon?.options?.className?.includes("user-marker")) {
        map?.removeLayer(marker);
      }
    });
  }
}

function clearDrawing() {
  mapStore.clearDrawing();
  // Clear user location marker if exists
  markers.forEach((marker) => {
    if (marker.options.icon?.options?.className?.includes("user-marker")) {
      map?.removeLayer(marker);
    }
  });
}

// Initialize map and subscribe to drawing events
onMounted(() => {
  // Initialize the map
  initMap();

  // Subscribe to map store changes
  mapStore.subscribeToDrawingEvents(updateMapDisplay);

  // Listen to center changes
  watch(
    () => mapStore.mapCenter,
    (newCenter) => {
      if (map) {
        map.setView([newCenter.lat, newCenter.lng], map.getZoom());
      }
    }
  );

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
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

/* Enhanced marker styles */
:deep(.custom-marker) {
  background: transparent;
  border: none;
}

:deep(.marker-content) {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  transition: transform 0.2s ease;
}

:deep(.marker-content:hover) {
  transform: scale(1.1);
}

/* Leaflet control customization */
:deep(.leaflet-control-custom) {
  background: white;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(0, 0, 0, 0.1);
}

/* Drawing feedback styles */
:deep(.leaflet-container) {
  cursor: crosshair;
}

:deep(.leaflet-container.leaflet-drag-target) {
  cursor: grab;
}

:deep(.leaflet-container.leaflet-drag-target:active) {
  cursor: grabbing;
}

/* Polyline animation for active drawing */
@keyframes draw-animation {
  0% {
    stroke-dasharray: 5, 5;
    stroke-dashoffset: 0;
  }
  100% {
    stroke-dasharray: 5, 5;
    stroke-dashoffset: 10;
  }
}

/* Loading spinner enhancement */
.loading-spinner {
  display: inline-block;
  width: 24px;
  height: 24px;
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: #3b82f6;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .drawing-container {
    padding: 10px;
  }

  .options-container {
    max-width: 100%;
  }

  .buttons {
    flex-direction: column;
    width: 100%;
  }

  .buttons .btn {
    width: 100%;
    margin: 4px 0;
  }
}

/* Animation for overlays */
.absolute {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Enhanced form controls */
.form-control {
  transition: all 0.2s ease;
}

.range:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Button enhancements */
.btn {
  transition: all 0.2s ease;
}

.btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.btn:active {
  transform: translateY(0);
}

/* Stats card enhancement */
.stats {
  border-radius: 12px;
  transition: all 0.2s ease;
}

.stats:hover {
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}
</style>
