<template>
  <div class="landing-page">
    <!-- Hero Section -->
    <section class="hero bg-gradient-to-br from-primary to-primary-focus text-primary-content py-16">
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
                    <i class="fas fa-route"></i>
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
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- Feature 1 -->
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <div class="text-primary text-4xl mb-4">
                <i class="fas fa-pencil-alt"></i>
              </div>
              <h3 class="card-title">Dessinez votre idée</h3>
              <p>Esquissez rapidement le parcours de vos rêves à main levée, sans contraintes.</p>
            </div>
          </div>
          
          <!-- Feature 2 -->
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <div class="text-primary text-4xl mb-4">
                <i class="fas fa-map-marked-alt"></i>
              </div>
              <h3 class="card-title">Routes réelles</h3>
              <p>Notre algorithme transforme votre dessin en parcours suivant les vraies routes et chemins.</p>
            </div>
          </div>
          
          <!-- Feature 3 -->
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <div class="text-primary text-4xl mb-4">
                <i class="fas fa-file-download"></i>
              </div>
              <h3 class="card-title">Exportez en GPX</h3>
              <p>Exportez facilement vers Strava, Garmin ou votre application préférée au format GPX.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- How it Works -->
    <section class="how-it-works py-16">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold text-center mb-12">Comment ça fonctionne</h2>
        
        <div class="steps steps-vertical lg:steps-horizontal w-full">
          <div class="step step-primary">
            <div class="step-content mt-4">
              <h3 class="text-xl font-semibold mb-2">Dessinez votre parcours</h3>
              <p class="text-base-content">Utilisez notre canvas interactif pour dessiner le parcours que vous imaginez.</p>
              <div class="mt-4 mx-auto w-full max-w-xs">
                <div class="mockup-window border bg-base-300 w-full">
                  <div class="flex justify-center px-4 py-8 bg-base-200">
                    <i class="fas fa-pencil-alt text-4xl text-primary"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="step step-primary">
            <div class="step-content mt-4">
              <h3 class="text-xl font-semibold mb-2">Configurez vos options</h3>
              <p class="text-base-content">Définissez la distance maximale et le point de départ flexible.</p>
              <div class="mt-4 mx-auto w-full max-w-xs">
                <div class="mockup-window border bg-base-300 w-full">
                  <div class="flex justify-center px-4 py-8 bg-base-200">
                    <i class="fas fa-sliders-h text-4xl text-primary"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="step step-primary">
            <div class="step-content mt-4">
              <h3 class="text-xl font-semibold mb-2">Obtenez votre parcours</h3>
              <p class="text-base-content">Notre algorithme génère un parcours réel suivant les routes.</p>
              <div class="mt-4 mx-auto w-full max-w-xs">
                <div class="mockup-window border bg-base-300 w-full">
                  <div class="flex justify-center px-4 py-8 bg-base-200">
                    <i class="fas fa-map-marked-alt text-4xl text-primary"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Testimonials/Examples -->
    <section class="testimonials py-16 bg-base-200">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold text-center mb-12">Ce que nos utilisateurs en disent</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <!-- Testimonial 1 -->
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <div class="flex items-center mb-4">
                <div class="avatar">
                  <div class="w-12 h-12 rounded-full bg-primary text-primary-content flex items-center justify-center">
                    <span class="text-xl font-bold">TL</span>
                  </div>
                </div>
                <div class="ml-4">
                  <h4 class="font-semibold">Thomas L.</h4>
                  <p class="text-sm opacity-70">Coureur amateur</p>
                </div>
              </div>
              <div class="chat chat-start">
                <div class="chat-bubble chat-bubble-accent">
                  "J'ai dessiné un parcours en forme d'étoile et GribouilleCourse l'a transformé en un itinéraire réel. Bluffant ! Je l'utilise maintenant pour toutes mes sorties."
                </div>
              </div>
            </div>
          </div>
          
          <!-- Testimonial 2 -->
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <div class="flex items-center mb-4">
                <div class="avatar">
                  <div class="w-12 h-12 rounded-full bg-primary text-primary-content flex items-center justify-center">
                    <span class="text-xl font-bold">SM</span>
                  </div>
                </div>
                <div class="ml-4">
                  <h4 class="font-semibold">Sophie M.</h4>
                  <p class="text-sm opacity-70">Triathlète</p>
                </div>
              </div>
              <div class="chat chat-start">
                <div class="chat-bubble chat-bubble-accent">
                  "L'option de point de départ flexible est géniale ! Elle me permet de trouver des parcours originaux tout près de chez moi. Simple et efficace."
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Call to Action -->
    <section class="cta py-16 bg-primary text-primary-content" id="app-section">
      <div class="container mx-auto px-4 text-center">
        <h2 class="text-3xl font-bold mb-6">Prêt à créer votre parcours ?</h2>
        <p class="text-xl mb-8">Dessinez, générez, courez. C'est aussi simple que ça !</p>
        <div class="card w-full bg-base-100 shadow-2xl mx-auto max-w-4xl">
          <div class="card-body">
            <DrawingCanvas />
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer p-10 bg-accent text-accent-content">
      <div>
        <span class="footer-title text-xl">GribouilleCourse</span>
        <p>© 2024 GribouilleCourse. Tous droits réservés.</p>
      </div> 
      <div>
        <span class="footer-title">Liens</span> 
        <a class="link link-hover">À propos</a> 
        <a class="link link-hover">Confidentialité</a> 
        <a class="link link-hover">Contact</a>
      </div> 
      <div>
        <span class="footer-title">Social</span> 
        <div class="grid grid-flow-col gap-4">
          <a><i class="fab fa-twitter text-2xl"></i></a> 
          <a><i class="fab fa-instagram text-2xl"></i></a>
          <a><i class="fab fa-facebook text-2xl"></i></a>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import DrawingCanvas from '@/components/DrawingCanvas.vue';

function scrollToApp() {
  const appElement = document.getElementById('app-section');
  if (appElement) {
    appElement.scrollIntoView({ behavior: 'smooth' });
  }
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
});
</script>

<style scoped>
.landing-page {
  font-family: 'Nunito', 'Helvetica', sans-serif;
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

