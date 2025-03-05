<template>
          <div class="step step-primary ">
            <div class="step-content mt-4 ">
              <h3 class="text-xl font-semibold mb-2">{{ titre }}</h3>
              <p class="text-base-content">{{ description }}</p>
              <div class="mt-4 mx-auto w-full max-w-xs">
                <div class="mockup-window border bg-base-300 w-full">
                  <div class="flex justify-center px-4 py-8 bg-base-200">
                    <img :src="image" alt="Illustration" class="w-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
</template>

<script setup lang="ts">

const props = defineProps<{
  titre: string;
  description: string;
  image : string;
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
