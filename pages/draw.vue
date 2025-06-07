<template>
  <div class="flex flex-col items-center justify-center h-full">
    <h1 class="text-2xl font-bold m-10">{{ $t("draw.title") }}</h1>
    <ClientOnly>
      <DrawingCanvas />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
const { t: $t } = useI18n();
</script>
