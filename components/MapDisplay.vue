<template>
  <div class="map-display">
    <div ref="mapContainer" class="w-full h-full"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import { usePathStore } from '@/stores/path';

export default defineComponent({
  name: 'MapDisplay',
  props: {
    pathData: {
      type: Array as () => Array<{ lat: number; lng: number }>,
      required: true
    }
  },
  setup(props) {
    const mapContainer = ref<HTMLElement | null>(null);
    const pathStore = usePathStore();

    onMounted(() => {
      if (mapContainer.value) {
        const map = L.map(mapContainer.value).setView([props.pathData[0].lat, props.pathData[0].lng], 13);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
        }).addTo(map);

        const latlngs = props.pathData.map(point => [point.lat, point.lng]);
        const polyline = L.polyline(latlngs, { color: 'blue' }).addTo(map);
        map.fitBounds(polyline.getBounds());
      }
    });

    return {
      mapContainer
    };
  }
});
</script>

<style scoped>
.map-display {
  position: relative;
  width: 100%;
  height: 100%;
}
</style>