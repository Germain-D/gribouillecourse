<template>
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <div class="text-primary text-4xl mb-4">
                <i :class="'fa '+icon"></i>
              </div>
              <h3 class="card-title">{{ titre }}</h3>
              <p>{{ description }}</p>
            </div>
          </div>
</template>

<script setup lang="ts">

const props = defineProps<{
  titre: string;
  description: string;
  icon: string;
}>();

</script>