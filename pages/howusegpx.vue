<template>
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <h1 class="text-3xl font-bold mb-8 text-center">
      {{ $t("howToUseGpx.title") }}
    </h1>

    <div class="mb-8 bg-base-200 p-6 rounded-lg">
      <h2 class="text-2xl font-semibold mb-4">
        {{ $t("howToUseGpx.whatIsGpx.title") }}
      </h2>
      <p class="mb-4">{{ $t("howToUseGpx.whatIsGpx.description1") }}</p>
      <p>{{ $t("howToUseGpx.whatIsGpx.description2") }}</p>
    </div>

    <div class="grid grid-cols-1 gap-6">
      <!-- Garmin -->
      <div
        tabindex="0"
        class="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box"
      >
        <div class="collapse-title text-xl font-medium bg-base-200">
          <div class="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-8 w-8 mr-3"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22C6.486 22 2 17.514 2 12S6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"
              />
              <circle cx="12" cy="12" r="3" />
            </svg>
            {{ $t("howToUseGpx.garmin.title") }}
          </div>
        </div>
        <div class="collapse-content">
          <div class="p-2">
            <h3 class="font-bold text-lg mb-2">
              {{ $t("howToUseGpx.garmin.viaConnect") }}
            </h3>
            <ol class="list-decimal list-inside space-y-2 mb-4">
              <li>{{ $t("howToUseGpx.garmin.steps.connect1") }}</li>
              <li>{{ $t("howToUseGpx.garmin.steps.connect2") }}</li>
              <li>{{ $t("howToUseGpx.garmin.steps.connect3") }}</li>
              <li>{{ $t("howToUseGpx.garmin.steps.connect4") }}</li>
              <li>{{ $t("howToUseGpx.garmin.steps.connect5") }}</li>
              <li>{{ $t("howToUseGpx.garmin.steps.connect6") }}</li>
              <li>{{ $t("howToUseGpx.garmin.steps.connect7") }}</li>
              <li>{{ $t("howToUseGpx.garmin.steps.connect8") }}</li>
            </ol>

            <h3 class="font-bold text-lg mb-2">
              {{ $t("howToUseGpx.garmin.viaUsb") }}
            </h3>
            <ol class="list-decimal list-inside space-y-2">
              <li>{{ $t("howToUseGpx.garmin.steps.usb1") }}</li>
              <li>{{ $t("howToUseGpx.garmin.steps.usb2") }}</li>
              <li>{{ $t("howToUseGpx.garmin.steps.usb3") }}</li>
              <li>{{ $t("howToUseGpx.garmin.steps.usb4") }}</li>
              <li>{{ $t("howToUseGpx.garmin.steps.usb5") }}</li>
              <li>{{ $t("howToUseGpx.garmin.steps.usb6") }}</li>
            </ol>
            <div class="alert alert-info mt-4">
              <span>{{ $t("howToUseGpx.garmin.note") }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Coros -->
      <div
        tabindex="0"
        class="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box"
      >
        <div class="collapse-title text-xl font-medium bg-base-200">
          {{ $t("howToUseGpx.coros.title") }}
        </div>
        <div class="collapse-content">
          <div class="p-2">
            <p>{{ $t("howToUseGpx.coros.warning") }}</p>
          </div>
        </div>
      </div>

      <!-- Apple Watch -->
      <div
        tabindex="0"
        class="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box"
      >
        <div class="collapse-title text-xl font-medium bg-base-200">
          {{ $t("howToUseGpx.appleWatch.title") }}
        </div>
        <div class="collapse-content">
          <div class="p-2">
            <p>{{ $t("howToUseGpx.appleWatch.description") }}</p>
            <p class="mt-2">{{ $t("howToUseGpx.appleWatch.note") }}</p>
          </div>
        </div>
      </div>

      <!-- Polar -->
      <div
        tabindex="0"
        class="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box"
      >
        <div class="collapse-title text-xl font-medium bg-base-200">
          {{ $t("howToUseGpx.polar.title") }}
        </div>
        <div class="collapse-content">
          <div class="p-2">
            <p>{{ $t("howToUseGpx.polar.warning") }}</p>
          </div>
        </div>
      </div>

      <!-- Suunto -->
      <div
        tabindex="0"
        class="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box"
      >
        <div class="collapse-title text-xl font-medium bg-base-200">
          {{ $t("howToUseGpx.suunto.title") }}
        </div>
        <div class="collapse-content">
          <div class="p-2">
            <p>{{ $t("howToUseGpx.suunto.note") }}</p>
          </div>
        </div>
      </div>

      <!-- Applications smartphone -->
      <div
        tabindex="0"
        class="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box"
      >
        <div class="collapse-title text-xl font-medium bg-base-200">
          {{ $t("howToUseGpx.smartphone.title") }}
        </div>
        <div class="collapse-content">
          <div class="p-2">
            <p>{{ $t("howToUseGpx.smartphone.description") }}</p>
            <p class="mt-2">{{ $t("howToUseGpx.smartphone.note") }}</p>
          </div>
        </div>
      </div>

      <!-- Conseils généraux -->
      <div
        tabindex="0"
        class="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box"
      >
        <div class="collapse-title text-xl font-medium bg-base-200">
          {{ $t("howToUseGpx.generalTips.title") }}
        </div>
        <div class="collapse-content">
          <div class="p-2">
            <h3 class="font-bold text-lg mb-2">
              {{ $t("howToUseGpx.generalTips.subtitle") }}
            </h3>
            <ul class="list-disc list-inside space-y-2">
              <li>
                <strong
                  >{{ $t("howToUseGpx.generalTips.battery.title") }} :</strong
                >
                {{ $t("howToUseGpx.generalTips.battery.description") }}
              </li>
              <li>
                <strong
                  >{{
                    $t("howToUseGpx.generalTips.complexity.title")
                  }}
                  :</strong
                >
                {{ $t("howToUseGpx.generalTips.complexity.description") }}
              </li>
              <li>
                <strong
                  >{{ $t("howToUseGpx.generalTips.alerts.title") }} :</strong
                >
                {{ $t("howToUseGpx.generalTips.alerts.description") }}
              </li>
              <li>
                <strong
                  >{{ $t("howToUseGpx.generalTips.offline.title") }} :</strong
                >
                {{ $t("howToUseGpx.generalTips.offline.description") }}
              </li>
              <li>
                <strong
                  >{{ $t("howToUseGpx.generalTips.safety.title") }} :</strong
                >
                {{ $t("howToUseGpx.generalTips.safety.description") }}
              </li>
            </ul>
            <div class="alert alert-success mt-4">
              <span>{{ $t("howToUseGpx.generalTips.test") }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-8 text-center">
      <button
        class="btn btn-primary"
        @click="$router.push($t('howToUseGpx.links.home'))"
      >
        {{ $t("howToUseGpx.backToHome") }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t: $t } = useI18n();
</script>

<style scoped>
/* Any additional styling can go here */
</style>
