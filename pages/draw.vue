<template>
    <div class="flex flex-col items-center justify-center h-screen">
      <h1 class="text-2xl font-bold mb-4">Dessin à main levée</h1>
      <ClientOnly>
              <DrawingCanvas />
            </ClientOnly>
    </div>
  </template>
  
  