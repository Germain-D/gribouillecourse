<template>
  <nav class="flex justify-between items-center p-4 bg-base-300 text-base-content">
    <NuxtLink to="/" class="text-xl font-bold strava-font flex items-center">
       <img src="/assets/img/logo-gribouillecourse-orange.png" alt="GribouilleCourse" class="w-12 h-12 mr-2" />
      <span class="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent uppercase tracking-tight hidden md:nlock lg:block">GribouilleCourse</span>
    </NuxtLink>
    <div>
      <NuxtLink to="/draw" class="btn btn-ghost normal-case mr-2">Dessiner</NuxtLink>
      <NuxtLink to="/results" class="btn btn-ghost normal-case">Résultats</NuxtLink>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';

onMounted(() => {
  // Add Strava-like font if not already added
  if (!document.getElementById('strava-font')) {
    const linkFont = document.createElement('link');
    linkFont.id = 'strava-font';
    linkFont.rel = 'stylesheet';
    linkFont.href = 'https://fonts.googleapis.com/css2?family=Roboto+Condensed:wght@400;700&display=swap';
    document.head.appendChild(linkFont);
  }
});
</script>

<style scoped>
.strava-font {
  font-family: 'Roboto Condensed', sans-serif;
  font-weight: 700;
  letter-spacing: -0.5px;
}
</style>

