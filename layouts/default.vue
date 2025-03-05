<template>
  <div class="min-h-screen flex flex-col">
    <!-- Splash Screen -->
    <div v-if="isLoading" class="fixed inset-0 bg-white z-50 flex items-center justify-center">
      <div class="text-center">
        <div class="flex flex-col items-center">
          <img src="/assets/img/logo-gribouillecourse-orange.png" alt="GribouilleCourse" class="w-48 h-48 mb-6">
          <h1 class="text-primary text-5xl md:text-6xl font-bold uppercase tracking-tight strava-font mb-8">
            GribouilleCourse
          </h1>
        </div>
        <!-- Loading dots with Tailwind animation -->
        <div class="flex justify-center mt-8 space-x-3">
          <div class="w-3 h-3 rounded-full bg-primary animate-bounce"></div>
          <div class="w-3 h-3 rounded-full bg-primary animate-bounce" style="animation-delay: 0.2s"></div>
          <div class="w-3 h-3 rounded-full bg-primary animate-bounce" style="animation-delay: 0.4s"></div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div v-show="!isLoading" class="min-h-screen flex flex-col transition-opacity duration-500" 
         :class="{'opacity-0': isLoading, 'opacity-100': !isLoading}">
      <Navigation />
      <main class="flex-grow">
        <slot></slot>
      </main>
      <Footer />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

// État pour contrôler l'affichage du splash screen
const isLoading = ref(true);

onMounted(() => {
  // Simuler un temps de chargement minimum pour afficher le splash screen
  // même si la page se charge rapidement
  const minDisplayTime = 2000; // 2 secondes minimum d'affichage
  const startTime = Date.now();
  
  // Fonction qui sera appelée quand tout est chargé
  const completeLoading = () => {
    const elapsedTime = Date.now() - startTime;
    const remainingTime = Math.max(0, minDisplayTime - elapsedTime);
    
    // Attendre le temps restant avant de masquer le splash screen
    setTimeout(() => {
      isLoading.value = false;
    }, remainingTime);
  };
  
  // Attendre que la page soit complètement chargée
  if (document.readyState === 'complete') {
    completeLoading();
  } else {
    window.addEventListener('load', completeLoading);
  }
  
  // Nettoyage de l'event listener
  return () => {
    window.removeEventListener('load', completeLoading);
  };
});
</script>

<style scoped>
/* Juste pour les animations des points que Tailwind ne peut pas faire nativement */
@keyframes custom-bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

.animate-bounce {
  animation: custom-bounce 1.4s infinite ease-in-out both;
}

.animate-bounce2 {
  animation: custom-bounce 1.6s infinite ease-in-out both;
}
</style>

