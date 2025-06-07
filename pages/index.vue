<template>
  <div class="landing-page">
    <!-- Hero Section -->
    <section
      class="hero bg-gradient-to-r from-primary to-secondary text-primary-content py-16"
    >
      <Hero></Hero>
    </section>

    <!-- Features Section -->
    <section class="features py-16 bg-base-200">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold text-center mb-4">
          {{ $t("features.title") }}
        </h2>
        <p class="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          {{ $t("features.subtitle") }}
        </p>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div v-for="feature in features.items" :key="feature.key">
            <FeaturesCard
              :titre="$t(`features.${feature.key}.title`)"
              :description="$t(`features.${feature.key}.description`)"
              :icon="feature.icon"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- How it Works -->
    <section class="how-it-works py-16">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold text-center mb-4">
          {{ $t("howItWorks.title") }}
        </h2>
        <p class="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          {{ $t("howItWorks.subtitle") }}
        </p>

        <div class="steps steps-vertical lg:steps-horizontal w-full">
          <HowCard
            v-for="step in howSteps.items"
            :key="step.key"
            :titre="$t(`howItWorks.${step.key}.title`)"
            :description="$t(`howItWorks.${step.key}.description`)"
            :image="step.image || '/assets/img/parcourssmall.png'"
          />
        </div>
      </div>
    </section>

    <!-- Free Model Information -->
    <section class="free-info py-16 bg-gradient-to-r from-green-50 to-blue-50">
      <div class="container mx-auto px-4 text-center">
        <div class="max-w-5xl mx-auto">
          <h2 class="text-3xl font-bold mb-4 text-green-800">
            {{ $t("freeModel.title") }}
          </h2>
          <p class="text-gray-700 mb-8 max-w-3xl mx-auto">
            {{ $t("freeModel.subtitle") }}
          </p>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div
              class="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
            >
              <div class="text-4xl mb-4">🆓</div>
              <h3 class="font-bold text-lg mb-3">
                {{ $t("freeModel.freeApp.title") }}
              </h3>
              <p class="text-sm text-gray-600">
                {{ $t("freeModel.freeApp.description") }}
              </p>
            </div>
            <div
              class="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
            >
              <div class="text-4xl mb-4">🔑</div>
              <h3 class="font-bold text-lg mb-3">
                {{ $t("freeModel.yourApiKey.title") }}
              </h3>
              <p class="text-sm text-gray-600">
                {{ $t("freeModel.yourApiKey.description") }}
              </p>
            </div>
            <div
              class="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
            >
              <div class="text-4xl mb-4">📊</div>
              <h3 class="font-bold text-lg mb-3">
                {{ $t("freeModel.dailyRequests.title") }}
              </h3>
              <p class="text-sm text-gray-600">
                {{ $t("freeModel.dailyRequests.description") }}
              </p>
            </div>
          </div>

          <div class="bg-white p-8 rounded-xl shadow-lg max-w-3xl mx-auto">
            <h4 class="font-bold text-xl mb-4 text-gray-800">
              {{ $t("freeModel.howItWorksTitle") }}
            </h4>
            <p class="text-gray-700 mb-6 leading-relaxed">
              {{ $t("freeModel.howItWorksDescription") }}
            </p>
            <div class="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://openrouteservice.org/dev/#/signup"
                target="_blank"
                class="btn btn-primary"
              >
                <Icon name="ph:external-link" class="mr-2" />
                {{ $t("freeModel.getFreeKey") }}
              </a>
              <button @click="scrollToApp" class="btn btn-outline btn-primary">
                <Icon name="ph:play" class="mr-2" />
                {{ $t("freeModel.tryNow") }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Testimonials -->
    <section class="testimonials py-16 bg-base-200">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold text-center mb-4">
          {{ $t("testimonials.title") }}
        </h2>
        <p class="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          {{ $t("testimonials.subtitle") }}
        </p>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <TestimonialCard
            v-for="testimonial in testimonials.items"
            :key="testimonial.key"
            :name="$t(`testimonials.${testimonial.key}.name`)"
            :role="$t(`testimonials.${testimonial.key}.role`)"
            :quote="$t(`testimonials.${testimonial.key}.quote`)"
            :image="testimonial.image"
          />
        </div>
      </div>
    </section>

    <!-- Call to Action -->
    <section class="cta py-16 bg-primary" id="app-section">
      <div class="container mx-auto px-4 text-center">
        <h2 class="text-3xl font-bold mb-6 text-primary-content">
          {{ $t("cta.title") }}
        </h2>
        <p class="text-xl mb-8 text-primary-content max-w-2xl mx-auto">
          {{ $t("cta.subtitle") }}
        </p>
        <div class="card w-full bg-base-100 shadow-2xl mx-auto max-w-5xl">
          <div class="card-body">
            <ClientOnly>
              <DrawingCanvas />
            </ClientOnly>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import DrawingCanvas from "@/components/DrawingCanvas.vue";

function scrollToApp() {
  const appElement = document.getElementById("app-section");
  if (appElement) {
    appElement.scrollIntoView({ behavior: "smooth" });
  }
}

const features = {
  title: "Pourquoi choisir GribouilleCourse?",
  items: [
    {
      key: "intelligentDrawing",
      title: "Dessin Intelligent",
      description:
        "Notre IA analyse votre dessin et détecte automatiquement les virages, les points critiques et optimise le tracé pour un parcours naturel.",
      icon: "fa-brain",
    },
    {
      key: "drawYourIdea",
      title: "Dessinez votre idée",
      description:
        "Esquissez rapidement le parcours de vos rêves à main levée, sans contraintes ni limitations techniques.",
      icon: "fa-pencil-alt",
    },
    {
      key: "realRoutes",
      title: "Routes réelles",
      description:
        "Notre algorithme intelligent transforme votre dessin en parcours suivant les vraies routes et chemins existants.",
      icon: "fa-map-marked-alt",
    },
    {
      key: "gpxExport",
      title: "Export GPX",
      description:
        "Exportez facilement vers Strava, Garmin, Coros, Suunto ou toute autre application au format GPX standard.",
      icon: "fa-file-export",
    },
  ],
};

const howSteps = {
  title: "Comment ça fonctionne",
  items: [
    {
      key: "step1",
      title: "1. Dessinez votre parcours",
      description:
        "Utilisez notre interface intuitive pour dessiner le parcours que vous imaginez, à main levée sur la carte interactive.",
      image: "/assets/img/dessinmainleveesmall.png",
    },
    {
      key: "step2",
      title: "2. Configurez vos préférences",
      description:
        "Choisissez votre type d'activité (course, vélo, voiture), définissez la distance maximale et ajustez les paramètres.",
      image: "/assets/img/options.png",
    },
    {
      key: "step3",
      title: "3. Obtenez votre parcours",
      description:
        "Notre algorithme génère automatiquement un parcours réel qui suit les routes existantes et respecte votre dessin.",
      image: "/assets/img/parcourssmall.png",
    },
  ],
};

const testimonials = {
  title: "Ce que nos utilisateurs en disent",
  items: [
    {
      key: "roadrunner",
      name: "Bip Bip 🏃‍♂️",
      role: "Coureur ultra-rapide • Spécialiste des routes sinueuses",
      quote:
        "Meep Meep ! Enfin une app qui comprend mes parcours zigzagants ! J'ai dessiné ma route habituelle pour semer Vil Coyote et GribouilleCourse l'a parfaitement transformée en GPX. Maintenant même les autres coureurs peuvent suivre mes traces... s'ils arrivent à suivre ! 💨",
      image:
        "https://imgs.search.brave.com/GMn2i-5ucCd3MlkKoODfQt0VE3DwKvkOkvFvA_7pgV0/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93aWtp/LmxlcGF5c2R1bWFu/Z2EuZnIvX21lZGlh/L2xlc19hbmltZXMv/Yi9iaXBfYmlwX2V0/X3ZpbF9jb3lvdGVf/NC5qcGc",
    },
    {
      key: "jerry",
      name: "Jerry 🐭",
      role: "Expert en esquive • Champion de parkour urbain",
      quote:
        "Fantastique pour créer des parcours d'évasion ! J'ai dessiné un circuit avec tous mes raccourcis secrets pour échapper à Tom, et l'app a généré un vrai parcours utilisable. Maintenant je peux partager mes techniques d'esquive avec d'autres coureurs (mais chut, ne le dites pas à Tom ! 🤫).",
      image:
        "https://imgs.search.brave.com/oTMLgUD-IUnYJkCvEA95K6MHUvvN8TAB1fMoMP_MAlI/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pLnBp/bmltZy5jb20vb3Jp/Z2luYWxzL2M2LzYy/Lzg4L2M2NjI4ODJm/ZmRiYWZmZTBiODJm/ZWNmNjIzYmYyZGY2/LmpwZw",
    },
  ],
};

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

/* Animation pour les cards au hover */
.hover\:shadow-xl:hover {
  transform: translateY(-2px);
  transition: all 0.3s ease;
}

/* Amélioration des statistiques */
.stat-value {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Animation des sections */
section {
  opacity: 1;
  transform: translateY(0);
  transition: all 0.6s ease;
}

/* Responsive improvements */
@media (max-width: 768px) {
  .hero h1 {
    font-size: 2.5rem;
  }

  .stat-value {
    font-size: 2.5rem;
  }
}
</style>
