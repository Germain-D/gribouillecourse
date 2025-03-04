import { ref } from 'vue';

export function useDrawing() {
  const isDrawing = ref(false);
  const path = ref([]);

  const startDrawing = (event) => {
    isDrawing.value = true;
    path.value.push({ x: event.clientX, y: event.clientY });
  };

  const draw = (event) => {
    if (!isDrawing.value) return;
    path.value.push({ x: event.clientX, y: event.clientY });
  };

  const finishDrawing = () => {
    isDrawing.value = false;
  };

  const clearPath = () => {
    path.value = [];
  };

  return {
    isDrawing,
    path,
    startDrawing,
    draw,
    finishDrawing,
    clearPath,
  };
}