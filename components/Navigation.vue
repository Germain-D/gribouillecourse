<template>
  <nav
    class="flex justify-between items-center p-4 bg-base-300 text-base-content"
  >
    <NuxtLink
      :to="$t('nav.links.home')"
      class="text-xl font-bold strava-font flex items-center"
    >
      <img
        src="/assets/img/logo-gribouillecourse-orange.png"
        alt="GribouilleCourse"
        class="w-12 h-12 mr-2"
      />
      <span
        class="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent uppercase tracking-tight hidden md:nlock lg:block"
      >
        {{ $t("hero.title") }}
        <span class="text-sm font-normal text-base-content/60 ml-2"
          >V 0.1.0</span
        >
      </span>
    </NuxtLink>
    <div class="flex items-center gap-2">
      <NuxtLink :to="$t('nav.links.draw')" class="btn btn-ghost normal-case">
        {{ $t("nav.draw") }}
      </NuxtLink>
      <NuxtLink
        :to="$t('nav.links.results')"
        class="btn btn-ghost normal-case"
        >{{ $t("nav.results") }}</NuxtLink
      >

      <!-- Language Selector -->
      <div class="dropdown dropdown-end">
        <div
          tabindex="0"
          role="button"
          class="btn btn-ghost btn-sm normal-case"
        >
          <Icon name="ph:globe" class="mr-1" />
          <span class="hidden sm:inline">{{ currentLocale.name }}</span>
          <Icon name="ph:caret-down" class="ml-1" />
        </div>
        <ul
          tabindex="0"
          class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-40"
        >
          <li v-for="locale in availableLocales" :key="locale.code">
            <button
              @click="switchLanguage(locale.code)"
              :class="{ active: locale.code === currentLocaleCode }"
            >
              <span
                class="fi"
                :class="`fi-${locale.code === 'en' ? 'us' : locale.code}`"
              ></span>
              {{ locale.name }}
            </button>
          </li>
        </ul>
      </div>

      <a
        :href="$t('nav.links.apiKeyUrl')"
        target="_blank"
        class="btn btn-sm btn-primary normal-case"
        :title="$t('nav.getApiKey')"
      >
        <Icon name="ph:key" class="mr-1" />
        <span class="hidden sm:inline">{{ $t("nav.apiKey") }}</span>
      </a>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";

const { t: $t } = useI18n();
const { locale, locales } = useI18n();
const localePath = useLocalePath();

const currentLocaleCode = computed(() => locale.value);

const availableLocales = computed(() => {
  return locales.value.filter((loc: any) => loc.code !== locale.value);
});

const currentLocale = computed(() => {
  return (
    locales.value.find((loc: any) => loc.code === locale.value) || {
      code: "fr",
      name: "Français",
    }
  );
});

function switchLanguage(newLocale: string) {
  if (newLocale === "fr" || newLocale === "en") {
    navigateTo(localePath("/", newLocale));
  }
}

onMounted(() => {
  // Add Strava-like font if not already added
  if (!document.getElementById("strava-font")) {
    const linkFont = document.createElement("link");
    linkFont.id = "strava-font";
    linkFont.rel = "stylesheet";
    linkFont.href =
      "https://fonts.googleapis.com/css2?family=Roboto+Condensed:wght@400;700&display=swap";
    document.head.appendChild(linkFont);
  }

  // Add flag icons CSS
  if (!document.getElementById("flag-icons")) {
    const linkFlags = document.createElement("link");
    linkFlags.id = "flag-icons";
    linkFlags.rel = "stylesheet";
    linkFlags.href =
      "https://cdn.jsdelivr.net/npm/flag-icons@7.2.3/css/flag-icons.min.css";
    document.head.appendChild(linkFlags);
  }
});
</script>

<style scoped>
.strava-font {
  font-family: "Roboto Condensed", sans-serif;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.fi {
  width: 20px;
  height: 15px;
  margin-right: 8px;
}
</style>
