<template>
              <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <div class="flex items-center mb-4">
                <div class="avatar">
                  <div class="w-12 h-12 rounded-full bg-primary text-primary-content flex items-center justify-center">
                    <span class="text-xl font-bold">TL</span>
                  </div>
                </div>
                <div class="ml-4">
                  <h4 class="font-semibold">{{ name }}</h4>
                  <p class="text-sm opacity-70">{{ role }}</p>
                </div>
              </div>
              <div class="chat chat-start">
                <div class="chat-bubble chat-bubble-accent">
                  "{{ quote }}"
                </div>
              </div>
            </div>
          </div>
</template>

<script setup lang="ts">
const props = defineProps<{
    name: string;
    role: string;
    quote: string;
}>();
</script>


<style scoped>
.landing-page {
  font-family: 'Nunito', 'Helvetica', sans-serif;
}

h1, h2, h3, .card-title, .footer-title, .btn {
  font-family: 'Roboto Condensed', sans-serif;
  font-weight: 700;
  letter-spacing: -0.5px;
  text-transform: uppercase;
}

.hero h1 {
  font-size: 3.5rem;
  letter-spacing: -1px;
}

.hero {
  background-size: cover;
  background-position: center;
}

/* Styles personnalisés pour les steps (étapes) */
@media (max-width: 1024px) {
  .steps-horizontal {
    flex-direction: column;
  }
  
  .step-content {
    width: 100%;
    text-align: center;
  }
}
</style>
