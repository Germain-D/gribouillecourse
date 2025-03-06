<template>
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <h1 class="text-3xl font-bold mb-8 text-center">Comment utiliser un fichier GPX</h1>
    
    <div class="mb-8 bg-base-200 p-6 rounded-lg">
      <h2 class="text-2xl font-semibold mb-4">Qu'est-ce qu'un fichier GPX?</h2>
      <p class="mb-4">
        Un fichier GPX (GPS Exchange Format) est un format standard pour stocker des données GPS comme des itinéraires, 
        des parcours et des points d'intérêt. Il vous permet de suivre un parcours prédéfini sur votre montre ou appareil de sport.
      </p>
      <p>
        Une fois que vous avez généré un parcours avec notre application, vous pouvez télécharger le fichier GPX et l'utiliser 
        sur de nombreuses montres de sport et applications. Suivez les instructions ci-dessous selon votre appareil.
      </p>
    </div>

    <div class="grid grid-cols-1 gap-6">
      <!-- Garmin -->
      <div tabindex="0" class="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box">
        <div class="collapse-title text-xl font-medium bg-base-200">
          <div class="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mr-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22C6.486 22 2 17.514 2 12S6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/>
              <path d="M12 4a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            Garmin
          </div>
        </div>
        <div class="collapse-content">
          <div class="p-2">
            <h3 class="font-bold text-lg mb-2">Via Garmin Connect</h3>
            <ol class="list-decimal list-inside space-y-2 mb-4">
              <li>Connectez-vous à <a href="https://connect.garmin.com" class="link link-primary" target="_blank">Garmin Connect</a> depuis votre navigateur</li>
              <li>Cliquez sur <span class="badge badge-primary">Entraînement</span> dans la barre de navigation</li>
              <li>Sélectionnez <span class="badge badge-primary">Parcours</span></li>
              <li>Cliquez sur <span class="badge badge-primary">Importer</span> ou <span class="badge badge-primary">Créer un parcours</span></li>
              <li>Sélectionnez le fichier GPX téléchargé depuis notre application</li>
              <li>Une fois importé, donnez un nom à votre parcours et sauvegardez-le</li>
              <li>Synchronisez votre montre Garmin avec l'application Garmin Connect</li>
              <li>Le parcours sera maintenant disponible dans la section "Parcours" de votre montre</li>
            </ol>

            <h3 class="font-bold text-lg mb-2">Via USB (Méthode alternative)</h3>
            <ol class="list-decimal list-inside space-y-2">
              <li>Connectez votre montre Garmin à votre ordinateur via câble USB</li>
              <li>La montre apparaîtra comme un périphérique de stockage</li>
              <li>Naviguez jusqu'au dossier <code class="bg-base-300 p-1 rounded">Garmin/NewFiles</code></li>
              <li>Copiez le fichier GPX directement dans ce dossier</li>
              <li>Éjectez et débranchez votre montre</li>
              <li>Les parcours seront disponibles dans le menu Parcours de votre montre</li>
            </ol>
            <div class="alert alert-info mt-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <span>L'emplacement exact du dossier peut varier selon votre modèle de montre Garmin.</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Coros -->
      <div tabindex="0" class="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box">
        <div class="collapse-title text-xl font-medium bg-base-200">
          <div class="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mr-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22C6.486 22 2 17.514 2 12S6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/>
              <path d="M12 4a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            Coros
          </div>
        </div>
        <div class="collapse-content">
          <div class="p-2">
            <h3 class="font-bold text-lg mb-2">Via l'application COROS</h3>
            <ol class="list-decimal list-inside space-y-2">
              <li>Ouvrez l'application COROS sur votre smartphone</li>
              <li>Allez dans l'onglet <span class="badge badge-primary">Entraînement</span></li>
              <li>Sélectionnez <span class="badge badge-primary">Navigation</span></li>
              <li>Touchez l'icône <span class="badge badge-primary">+</span> pour ajouter un nouveau parcours</li>
              <li>Sélectionnez <span class="badge badge-primary">Importer un fichier GPX</span></li>
              <li>Choisissez le fichier GPX téléchargé depuis notre application</li>
              <li>Donnez un nom à votre parcours et sauvegardez-le</li>
              <li>Synchronisez avec votre montre COROS</li>
            </ol>

            <div class="alert alert-warning mt-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              <span>Les montres COROS ont une limite de points GPX (2000-5000 selon les modèles). Si votre parcours est très détaillé, il pourrait être tronqué.</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Apple Watch -->
      <div tabindex="0" class="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box">
        <div class="collapse-title text-xl font-medium bg-base-200">
          <div class="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mr-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            Apple Watch
          </div>
        </div>
        <div class="collapse-content">
          <div class="p-2">
            <h3 class="font-bold text-lg mb-2">Via WorkOutDoors (recommandé)</h3>
            <p class="mb-2">L'Apple Watch ne prend pas en charge nativement les fichiers GPX, mais vous pouvez utiliser l'application tierce <a href="https://apps.apple.com/app/workoutdoors/id1241909999" class="link link-primary" target="_blank">WorkOutDoors</a> (payante mais très efficace).</p>
            <ol class="list-decimal list-inside space-y-2 mb-4">
              <li>Installez WorkOutDoors sur votre iPhone et Apple Watch</li>
              <li>Ouvrez l'application WorkOutDoors sur votre iPhone</li>
              <li>Touchez l'onglet <span class="badge badge-primary">Paramètres</span></li>
              <li>Sélectionnez <span class="badge badge-primary">Parcours</span></li>
              <li>Touchez <span class="badge badge-primary">Importer</span> et sélectionnez le fichier GPX</li>
              <li>Une fois importé, le parcours sera automatiquement synchronisé avec l'app sur votre Apple Watch</li>
            </ol>

            <h3 class="font-bold text-lg mb-2">Via d'autres applications</h3>
            <p>Alternatives à WorkOutDoors :</p>
            <ul class="list-disc list-inside space-y-2">
              <li>ViewRanger : Gratuit, synchronisation avec Apple Watch</li>
              <li>Strava : Parcours Premium (abonnement payant requis)</li>
              <li>Komoot : Navigation pas à pas (fonctionnalités complètes avec abonnement)</li>
            </ul>

            <div class="alert alert-info mt-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <span>WorkOutDoors est généralement considérée comme la meilleure application pour suivre des parcours GPX sur l'Apple Watch en raison de ses cartes détaillées et de sa faible consommation de batterie.</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Polar -->
      <div tabindex="0" class="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box">
        <div class="collapse-title text-xl font-medium bg-base-200">
          <div class="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mr-3" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="6" fill="white" />
            </svg>
            Polar
          </div>
        </div>
        <div class="collapse-content">
          <div class="p-2">
            <h3 class="font-bold text-lg mb-2">Via Polar Flow</h3>
            <ol class="list-decimal list-inside space-y-2">
              <li>Connectez-vous à <a href="https://flow.polar.com" class="link link-primary" target="_blank">Polar Flow</a> depuis votre navigateur</li>
              <li>Allez dans <span class="badge badge-primary">Favoris</span></li>
              <li>Cliquez sur <span class="badge badge-primary">Importer un itinéraire</span></li>
              <li>Sélectionnez le fichier GPX téléchargé depuis notre application</li>
              <li>Donnez un nom à votre itinéraire et enregistrez-le</li>
              <li>Synchronisez votre montre Polar avec l'application Polar Flow</li>
              <li>Accédez à l'itinéraire sur votre montre via le menu Itinéraires</li>
            </ol>

            <div class="alert alert-warning mt-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              <span>Tous les modèles Polar ne prennent pas en charge la navigation par itinéraire. Vérifiez la compatibilité de votre montre.</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Suunto -->
      <div tabindex="0" class="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box">
        <div class="collapse-title text-xl font-medium bg-base-200">
          <div class="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mr-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
              <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/>
            </svg>
            Suunto
          </div>
        </div>
        <div class="collapse-content">
          <div class="p-2">
            <h3 class="font-bold text-lg mb-2">Via l'application Suunto</h3>
            <ol class="list-decimal list-inside space-y-2">
              <li>Ouvrez l'application Suunto sur votre smartphone</li>
              <li>Appuyez sur l'icône de carte (ou Planifier & Naviguer)</li>
              <li>Touchez <span class="badge badge-primary">Importer un itinéraire</span></li>
              <li>Sélectionnez le fichier GPX téléchargé</li>
              <li>Donnez un nom à votre itinéraire</li>
              <li>Synchronisez avec votre montre Suunto</li>
              <li>L'itinéraire sera maintenant disponible dans le menu Navigation de votre montre</li>
            </ol>

            <h3 class="font-bold text-lg mb-2">Via Suunto Movescount (anciens modèles)</h3>
            <ol class="list-decimal list-inside space-y-2">
              <li>Connectez-vous à <a href="http://movescount.com" class="link link-primary" target="_blank">Movescount</a></li>
              <li>Allez dans la section <span class="badge badge-primary">Planification & Création d'itinéraires</span></li>
              <li>Cliquez sur <span class="badge badge-primary">Importer</span></li>
              <li>Sélectionnez le fichier GPX et enregistrez l'itinéraire</li>
              <li>Synchronisez votre montre avec Movescount</li>
            </ol>

            <div class="alert alert-info mt-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <span>Suunto a migré de Movescount vers l'application Suunto. Si vous avez une montre plus récente, utilisez l'application Suunto.</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Applications smartphone -->
      <div tabindex="0" class="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box">
        <div class="collapse-title text-xl font-medium bg-base-200">
          <div class="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mr-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z"/>
            </svg>
            Applications Smartphone
          </div>
        </div>
        <div class="collapse-content">
          <div class="p-2">
            <h3 class="font-bold text-lg mb-2">Applications populaires pour utiliser des fichiers GPX</h3>
            
            <div class="mb-6">
              <h4 class="font-semibold mb-1">Strava</h4>
              <ol class="list-decimal list-inside space-y-1 ml-2">
                <li>Ouvrez l'application Strava</li>
                <li>Allez dans l'onglet <span class="badge badge-sm badge-primary">Explore</span></li>
                <li>Touchez <span class="badge badge-sm badge-primary">Routes</span> (nécessite un abonnement Premium)</li>
                <li>Touchez le symbole <span class="badge badge-sm badge-primary">+</span> puis <span class="badge badge-sm badge-primary">Importer un fichier GPX</span></li>
                <li>Sélectionnez votre fichier GPX</li>
              </ol>
            </div>

            <div class="mb-6">
              <h4 class="font-semibold mb-1">Komoot</h4>
              <ol class="list-decimal list-inside space-y-1 ml-2">
                <li>Ouvrez l'application Komoot</li>
                <li>Allez dans l'onglet <span class="badge badge-sm badge-primary">Profil</span></li>
                <li>Sélectionnez <span class="badge badge-sm badge-primary">Tours</span></li>
                <li>Appuyez sur <span class="badge badge-sm badge-primary">Import GPX</span></li>
                <li>Choisissez votre fichier GPX</li>
              </ol>
            </div>

            <div class="mb-6">
              <h4 class="font-semibold mb-1">AllTrails</h4>
              <ol class="list-decimal list-inside space-y-1 ml-2">
                <li>Ouvrez AllTrails sur votre navigateur (pas disponible dans l'application)</li>
                <li>Cliquez sur <span class="badge badge-sm badge-primary">Créer un parcours</span></li>
                <li>Sélectionnez <span class="badge badge-sm badge-primary">Importer</span></li>
                <li>Choisissez votre fichier GPX</li>
              </ol>
            </div>

            <div class="mb-6">
              <h4 class="font-semibold mb-1">ViewRanger / Outdooractive</h4>
              <ol class="list-decimal list-inside space-y-1 ml-2">
                <li>Ouvrez l'application ViewRanger (maintenant Outdooractive)</li>
                <li>Allez dans <span class="badge badge-sm badge-primary">Menu</span> puis <span class="badge badge-sm badge-primary">Mes parcours</span></li>
                <li>Appuyez sur <span class="badge badge-sm badge-primary">+</span> puis <span class="badge badge-sm badge-primary">Importer</span></li>
                <li>Sélectionnez le fichier GPX</li>
              </ol>
            </div>

            <div class="alert alert-info mt-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <span>La plupart des applications de course, de randonnée et de navigation prennent en charge l'importation de fichiers GPX. Certaines fonctionnalités peuvent nécessiter un abonnement.</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Conseils généraux -->
      <div tabindex="0" class="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box">
        <div class="collapse-title text-xl font-medium bg-base-200">
          <div class="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            Conseils généraux
          </div>
        </div>
        <div class="collapse-content">
          <div class="p-2">
            <h3 class="font-bold text-lg mb-2">Pour une utilisation optimale des parcours GPX</h3>
            
            <ul class="list-disc list-inside space-y-3">
              <li>
                <strong>Autonomie de batterie :</strong> 
                <p class="ml-6 mt-1">Suivre un parcours GPX consomme davantage de batterie qu'un enregistrement normal. Assurez-vous que votre montre soit bien chargée avant de partir.</p>
              </li>
              
              <li>
                <strong>Complexité du parcours :</strong> 
                <p class="ml-6 mt-1">Un fichier GPX très détaillé avec de nombreux points peut ralentir certains appareils. Si vous rencontrez des problèmes, essayez une version simplifiée du parcours.</p>
              </li>
              
              <li>
                <strong>Alertes de déviation :</strong> 
                <p class="ml-6 mt-1">Configurez les alertes de déviation de parcours dans les paramètres de votre appareil pour être notifié si vous vous éloignez de l'itinéraire prévu.</p>
              </li>
              
              <li>
                <strong>Cartographie hors ligne :</strong> 
                <p class="ml-6 mt-1">Pour les zones avec une mauvaise couverture réseau, téléchargez les cartes hors ligne avant votre sortie.</p>
              </li>
              
              <li>
                <strong>Sécurité :</strong> 
                <p class="ml-6 mt-1">Ne fixez pas constamment votre montre pendant que vous courez. Faites attention à votre environnement et consultez l'itinéraire uniquement lorsque c'est sécuritaire de le faire.</p>
              </li>
            </ul>

            <div class="alert alert-success mt-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>Testez l'importation et la navigation sur votre appareil avant de partir pour une longue sortie. Cela vous permettra de vous familiariser avec l'interface et les fonctionnalités.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="mt-8 text-center">
      <button class="btn btn-primary" @click="$router.push('/')">Retour à l'accueil</button>
    </div>
  </div>
</template>

<script setup lang="ts">
// No additional script needed
</script>

<style scoped>
/* Any additional styling can go here */
</style>