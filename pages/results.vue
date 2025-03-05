<template>
  <div class="results-container p-4">
    <h1 class="text-2xl font-bold mb-6">Parcours Généré</h1>
    
    <div v-if="!hasPath" class="alert alert-warning mb-4">
      <p>Aucun parcours n'a été généré. Veuillez retourner à la page de dessin.</p>
      <button class="btn btn-primary mt-2" @click="router.push('/')">Retour au dessin</button>
    </div>
    
    <div v-else class="flex flex-col items-center">
      <ClientOnly>
        <MapDisplay 
          :coordinates="pathStore.coordinates" 
          :distance="pathStore.distance || '0 km'"
          :startPoint="pathStore.startPoint || { lat: 0, lng: 0 }"
          :userLocation="pathStore.userLocation || { lat: 0, lng: 0 }"
        />
      </ClientOnly>
      
      <div class="actions mt-6 flex gap-4">
        <button class="btn btn-primary" @click="router.push('/')">Nouveau dessin</button>
        <button class="btn btn-success" @click="downloadGpx">Télécharger GPX</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePathStore } from '@/stores/path';
import { useRouter } from 'vue-router';
import { computed } from 'vue';
import MapDisplay from '@/components/MapDisplay.vue';

const pathStore = usePathStore();
const router = useRouter();

const hasPath = computed(() => {
  return pathStore.coordinates.length > 0 && !!pathStore.gpxContent;
});

function downloadGpx() {
  if (!pathStore.gpxContent) return;
  
  // Create a blob with the GPX content
  const blob = new Blob([pathStore.gpxContent], { type: 'application/gpx+xml' });
  
  // Create a download link and trigger the download
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `route-${new Date().toISOString().slice(0, 10)}.gpx`;
  document.body.appendChild(a);
  a.click();
  
  // Clean up
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 0);
}
</script>

<style scoped>
/* Additional styles can be added here */
</style>