<template>
  <!-- Footer -->
  <footer class="footer p-10 bg-accent text-accent-content">
    <NuxtLink :to="$t('footer.links.urls.home')">
      <img
        src="/assets/img/logo-gribouillecourse-orange.png"
        alt="GribouilleCourse"
        class="w-12 h-12 mb-4"
      />
      <span class="footer-title text-xl">{{ $t("footer.title") }}</span>
      <p>{{ $t("footer.copyright") }}</p>
    </NuxtLink>
    <div>
      <span class="footer-title">{{ $t("footer.links.title") }}</span>
      <NuxtLink :to="$t('footer.links.urls.about')"
        ><a class="link link-hover">{{ $t("footer.links.about") }}</a></NuxtLink
      >
      <NuxtLink :to="$t('footer.links.urls.draw')"
        ><a class="link link-hover">{{ $t("footer.links.draw") }}</a></NuxtLink
      >
      <NuxtLink :to="$t('footer.links.urls.results')"
        ><a class="link link-hover">{{
          $t("footer.links.results")
        }}</a></NuxtLink
      >
      <NuxtLink :to="$t('footer.links.urls.howToUseGpx')"
        ><a class="link link-hover">{{
          $t("footer.links.howToUseGpx")
        }}</a></NuxtLink
      >
    </div>
    <div>
      <span class="footer-title">{{ $t("footer.social.title") }}</span>
      <div class="grid grid-flow-col gap-4">
        <a><i class="fab fa-twitter text-2xl"></i></a>
        <a><i class="fab fa-instagram text-2xl"></i></a>
        <a><i class="fab fa-facebook text-2xl"></i></a>
      </div>
    </div>
  </footer>
</template>
<script setup lang="ts">
const { t: $t } = useI18n();

onMounted(() => {
  // Add Font Awesome if not already in your index.html
  if (!document.getElementById("font-awesome")) {
    const link = document.createElement("link");
    link.id = "font-awesome";
    link.rel = "stylesheet";
    link.href =
      "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css";
    document.head.appendChild(link);
  }

  // Add Strava-like fonts
  if (!document.getElementById("strava-font")) {
    const linkFont = document.createElement("link");
    linkFont.id = "strava-font";
    linkFont.rel = "stylesheet";
    linkFont.href =
      "https://fonts.googleapis.com/css2?family=Roboto+Condensed:wght@400;700&display=swap";
    document.head.appendChild(linkFont);
  }
});
</script>

<style scoped>
.landing-page {
  font-family: "Nunito", "Helvetica", sans-serif;
}

h1,
h2,
h3,
.card-title,
.footer-title,
.btn {
  font-family: "Roboto Condensed", sans-serif;
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
