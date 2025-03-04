<template>
  <button @click="exportGPX" class="btn btn-primary">
    Export as GPX
  </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { usePathStore } from '@/stores/path';

export default defineComponent({
  setup() {
    const pathStore = usePathStore();

    const exportGPX = () => {
      const pathData = pathStore.pathData; // Assuming pathData contains the coordinates
      const gpxContent = generateGPX(pathData);
      downloadGPX(gpxContent);
    };

    const generateGPX = (pathData: Array<{ lat: number; lng: number }>) => {
      let gpx = '<?xml version="1.0" encoding="UTF-8"?>\n';
      gpx += '<gpx version="1.1" creator="Map Drawing App">\n';
      gpx += '  <trk>\n    <name>Drawn Path</name>\n    <trkseg>\n';

      pathData.forEach(point => {
        gpx += `      <trkpt lat="${point.lat}" lon="${point.lng}"></trkpt>\n`;
      });

      gpx += '    </trkseg>\n  </trk>\n</gpx>';
      return gpx;
    };

    const downloadGPX = (gpxContent: string) => {
      const blob = new Blob([gpxContent], { type: 'application/gpx+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'path.gpx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };

    return {
      exportGPX,
    };
  },
});
</script>

<style scoped>
.btn {
  @apply px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600;
}
</style>