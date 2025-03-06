<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>

</template>

<script setup>
useHead({
  title: "GribbouilleCourse",
  meta: [
    {
      name: "description",
      content:
        "GribouilleCourse est une application web qui vous permet de dessiner un parcours de course à pied, de le générer en fichier GPX et de le suivre avec votre montre GPS ou votre smartphone."
    },
  ],
});


</script>

<style>
h1, h2, h3, .card-title, .footer-title, .btn {
  font-family: 'Roboto Condensed', sans-serif;
  font-weight: 700;
  letter-spacing: -0.5px;
  text-transform: uppercase;
}

</style>