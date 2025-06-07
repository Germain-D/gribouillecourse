<template>
  <!-- Hero Section -->
  <div class="container mx-auto px-4">
    <div class="flex flex-col md:flex-row items-center">
      <div class="md:w-1/2 mb-10 md:mb-0">
        <h1 class="text-4xl md:text-5xl font-bold leading-tight mb-4">
          {{ $t("hero.title") }}
          <span
            class="text-lg md:text-xl text-primary-content/70 font-normal ml-2"
            >V 0.1.0</span
          >
        </h1>
        <p class="text-xl md:text-2xl mb-6">{{ $t("hero.subtitle") }}</p>
        <p class="text-lg opacity-90 mb-8 max-w-lg">
          {{ $t("hero.description") }}
        </p>
        <button
          class="hidden md:block lg:block btn btn-neutral text-primary normal-case font-bold"
          @click="scrollToApp"
        >
          {{ $t("hero.createRoute") }}
        </button>
        <button
          class="block md:hidden lg:hidden btn btn-neutral text-primary normal-case font-bold"
          @click="router.push($t('hero.links.draw'))"
        >
          {{ $t("hero.createRoute") }}
        </button>
      </div>
      <div class="md:w-1/2 flex justify-center">
        <div class="mockup-phone border-primary">
          <div class="camera"></div>
          <div class="display">
            <div
              class="artboard artboard-demo phone-1 bg-base-100 px-4 py-6 flex items-center justify-center"
            >
              <div class="text-primary text-6xl mb-2">
                <img src="/assets/img/screen.png" alt="GribouilleCourse" />
              </div>
              <h3 class="text-lg font-semibold">{{ $t("hero.title") }} App</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";

const { t: $t } = useI18n();
const router = useRouter();

function scrollToApp() {
  const appElement = document.getElementById("app-section");
  if (appElement) {
    appElement.scrollIntoView({ behavior: "smooth" });
  }
}
</script>
