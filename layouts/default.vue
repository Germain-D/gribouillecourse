<template>
  <div class="min-h-screen flex flex-col">
    <Navigation />
    <main class="flex-grow container mx-auto p-4">
      <slot></slot>
    </main>
  </div>
</template>

<script setup>
import Navigation from '@/components/Navigation.vue';
</script>

<style scoped>
</style>