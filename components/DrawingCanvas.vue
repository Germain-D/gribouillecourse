<template>
  <div class="drawing-container">
    <canvas
      ref="canvas"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @mouseleave="handleMouseUp"
      class="drawing-canvas"
    ></canvas>
    
    <!-- Options de génération de parcours -->
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
          <span class="label-text">Démarrer depuis ma position actuelle</span>
          <input type="checkbox" v-model="useUserLocation" class="checkbox checkbox-primary" />
        </label>
        <div v-if="locationStatus" class="text-sm mt-1" :class="{ 'text-error': locationError, 'text-success': !locationError }">
          {{ locationStatus }}
        </div>
      </div>
    </div>
    
    <div class="buttons mt-4">
      <button class="btn btn-primary" @click="clearCanvas">Effacer</button>
      <button class="btn btn-success ml-2" @click="generatePath" :disabled="points.length < 2">Générer le parcours</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { usePathStore } from '@/stores/path';

const router = useRouter();
const pathStore = usePathStore();
const canvas = ref<HTMLCanvasElement | null>(null);
const context = ref<CanvasRenderingContext2D | null>(null);
const isDrawing = ref(false);
const previous = ref({ x: 0, y: 0 });
const points = ref<{x: number, y: number}[]>([]);
const maxDistance = ref(10); // Default 10km
const useUserLocation = ref(false);
const userLocation = ref<{ lat: number; lng: number } | null>(null);
const locationStatus = ref<string | null>(null);
const locationError = ref(false);

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
    },
    (error) => {
      console.error("Erreur de géolocalisation:", error);
      locationStatus.value = "Impossible d'obtenir votre position";
      locationError.value = true;
      useUserLocation.value = false;
    }
  );
}

// Watch for changes to useUserLocation
watch(useUserLocation, (newValue) => {
  if (newValue && !userLocation.value) {
    getCurrentLocation();
  }
});

onMounted(() => {
  if (canvas.value) {
    canvas.value.width = 800;  // Fixed width
    canvas.value.height = 600; // Fixed height
    
    context.value = canvas.value.getContext('2d');
    
    if (context.value) {
      context.value.lineWidth = 5;
      context.value.lineCap = 'round';
      context.value.strokeStyle = 'black';
    }
  }
});

function handleMouseDown(event: MouseEvent) {
  isDrawing.value = true;
  const rect = canvas.value?.getBoundingClientRect();
  if (rect) {
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    previous.value = { x, y };
    points.value.push({ x, y });
  }
}

function handleMouseMove(event: MouseEvent) {
  if (!isDrawing.value || !context.value || !canvas.value) return;
  
  const rect = canvas.value.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  
  context.value.beginPath();
  context.value.moveTo(previous.value.x, previous.value.y);
  context.value.lineTo(x, y);
  context.value.stroke();
  
  // Save the point for path generation
  points.value.push({ x, y });
  
  previous.value = { x, y };
}

function handleMouseUp() {
  isDrawing.value = false;
}

function clearCanvas() {
  if (context.value && canvas.value) {
    context.value.clearRect(0, 0, canvas.value.width, canvas.value.height);
    points.value = [];
  }
}

async function generatePath() {
  if (points.value.length < 2) {
    alert('Veuillez dessiner un chemin avant de générer le parcours.');
    return;
  }
  
  try {
    console.log(`Sending ${points.value.length} points to generate path with max distance: ${maxDistance.value}km`);
    
    const requestBody: any = { 
      points: points.value,
      maxDistance: maxDistance.value 
    };
    
    // Add user location if enabled and available
    if (useUserLocation.value && userLocation.value) {
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
        distance: data.distance
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
</script>

<style scoped>
.drawing-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.drawing-canvas {
  border: 2px solid #333;
  cursor: crosshair;
  background-color: #f9f9f9;
  width: 800px;
  height: 600px;
}
</style>