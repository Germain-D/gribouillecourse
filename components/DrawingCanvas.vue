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
    <div class="buttons mt-4">
      <button class="btn btn-primary" @click="clearCanvas">Effacer</button>
      <button class="btn btn-success ml-2" @click="generatePath">Générer le parcours</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { usePathStore } from '@/stores/path';

const router = useRouter();
const pathStore = usePathStore();
const canvas = ref<HTMLCanvasElement | null>(null);
const context = ref<CanvasRenderingContext2D | null>(null);
const isDrawing = ref(false);
const previous = ref({ x: 0, y: 0 });
const points = ref<{x: number, y: number}[]>([]);

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
  try {
    const response = await fetch('/api/generate-path', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ points: points.value })
    });
    
    const data = await response.json();
    if (response.ok) {
      // Save the generated path
      pathStore.setPathName(data.path);
      // Navigate to results page
      router.push('/results');
    }
  } catch (error) {
    console.error('Failed to generate path:', error);
    alert('Failed to generate path. Please try again.');
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
}
</style>