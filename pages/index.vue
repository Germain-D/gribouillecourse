<template>
  <div class="landing-page">
    <!-- Hero Section -->
    <section class="hero bg-gradient-to-r from-primary to-secondary text-primary-content py-16">
      <div class="container mx-auto px-4">
        <div class="flex flex-col md:flex-row items-center">
          <div class="md:w-1/2 mb-10 md:mb-0">
            <h1 class="text-4xl md:text-5xl font-bold leading-tight mb-4">
              GribouilleCourse
            </h1>
            <p class="text-xl md:text-2xl mb-6">
              Dessinez. Générez. Courez.
            </p>
            <p class="text-lg opacity-90 mb-8 max-w-lg">
              Transformez un simple dessin en parcours réel qui suit les routes, sentiers et chemins. 
              Créez vos itinéraires de course ou de randonnée en quelques secondes.
            </p>
            <button class="btn btn-neutral text-primary normal-case font-bold" @click="scrollToApp">
              Créer mon parcours
            </button>
          </div>
          <div class="md:w-1/2 flex justify-center">
            <div class="mockup-phone border-primary">
              <div class="camera"></div> 
              <div class="display">
                <div class="artboard artboard-demo phone-1 bg-base-100 px-4 py-6 flex items-center justify-center">
                  <div class="text-primary text-6xl mb-2">
                     <img src="/assets/img/logo-gribouillecourse-orange.png" alt="GribouilleCourse" class="w-24 h-24 mb-6">
                  </div>
                  <h3 class="text-lg font-semibold">GribouilleCourse App</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features py-16 bg-base-200">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold text-center mb-12">Pourquoi choisir GribouilleCourse?</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8" >
          <div v-for="feature in features.items" :key="feature.title">
          <FeaturesCard :titre="feature.title" :description="feature.description" :icon="feature.icon" />
          </div>
        </div>
      </div>
    </section>

    <!-- How it Works -->
    <section class="how-it-works py-16">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold text-center mb-12">Comment ça fonctionne</h2>
        
        <div class="steps steps-vertical lg:steps-horizontal w-full " >

          <HowCard v-for="step in howSteps.items" :key="step.title" :titre="step.title" :description="step.description" :image="step.image || '/assets/img/parcourssmall.png'" />
        
        </div>
      </div>
    </section>

    <!-- Testimonials/Examples -->
    <section class="testimonials py-16 bg-base-200">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold text-center mb-12">Ce que nos utilisateurs en disent</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <TestimonialCard v-for="testimonial in testimonials.items" :key="testimonial.name" :name="testimonial.name" :role="testimonial.role" :quote="testimonial.quote" />
        </div>
      </div>
    </section>

    <!-- Call to Action -->
    <section class="cta py-16 bg-primary " id="app-section">
      <div class="container mx-auto px-4 text-center">
        <h2 class="text-3xl font-bold mb-6 text-primary-content">Prêt à créer votre parcours ?</h2>
        <p class="text-xl mb-8 text-primary-content">Dessinez, générez, courez. C'est aussi simple que ça !</p>
        <div class="card w-full bg-base-100 shadow-2xl mx-auto max-w-4xl">
          <div class="card-body">
            <DrawingCanvas />
          </div>
        </div>
      </div>
    </section>


  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import DrawingCanvas from '@/components/DrawingCanvas.vue';
import { icon } from 'leaflet';

function scrollToApp() {
  const appElement = document.getElementById('app-section');
  if (appElement) {
    appElement.scrollIntoView({ behavior: 'smooth' });
  }
}

const features = {
  title: 'Pourquoi choisir GribouilleCourse?',
  items: [
    { title: 'Dessinez votre idée', description: 'Esquissez rapidement le parcours de vos rêves à main levée, sans contraintes.', icon: 'fa-pencil-alt' },
    { title: 'Routes réelles', description: 'Notre algorithme transforme votre dessin en parcours suivant les vraies routes et chemins.', icon: 'fa-map-marked-alt' },
    { title: 'Exportez en GPX', description: 'Exportez facilement vers Strava, Garmin ou votre application préférée au format GPX.', icon: 'fa-file-export' }
  ]
}

const howSteps = {
  title: 'Comment ça fonctionne',
  items: [
    { title: 'Dessinez votre parcours', description: 'Utilisez notre canvas interactif pour dessiner le parcours que vous imaginez.', image: '/assets/img/dessinmainleveesmall.png' },
    { title: 'Configurez vos options', description: 'Définissez la distance maximale et le point de départ flexible.',  image: '/assets/img/options.png'},
    { title: 'Obtenez votre parcours', description: 'Notre algorithme génère un parcours réel suivant les routes.', image: '/assets/img/parcourssmall.png' }
  ]
}

const testimonials = {
  title: 'Ce que nos utilisateurs en disent',
  items: [
    { name: 'Thomas L.', role: 'Coureur amateur', quote: "J'ai dessiné un parcours en forme d'étoile et GribouilleCourse l'a transformé en un itinéraire réel. Bluffant ! Je l'utilise maintenant pour toutes mes sorties." },
    { name: 'Sophie M.', role: 'Triathlète', quote: "L'option de point de départ flexible est géniale ! Elle me permet de trouver des parcours originaux tout près de chez moi. Simple et efficace." }
  ]
}

onMounted(() => {
  // Add Font Awesome if not already in your index.html
  if (!document.getElementById('font-awesome')) {
    const link = document.createElement('link');
    link.id = 'font-awesome';
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
    document.head.appendChild(link);
  }
  
  // Add Strava-like fonts
  if (!document.getElementById('strava-font')) {
    const linkFont = document.createElement('link');
    linkFont.id = 'strava-font';
    linkFont.rel = 'stylesheet';
    linkFont.href = 'https://fonts.googleapis.com/css2?family=Roboto+Condensed:wght@400;700&display=swap';
    document.head.appendChild(linkFont);
  }
});
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

