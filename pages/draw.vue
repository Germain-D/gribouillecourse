<template>
    <div class="flex flex-col items-center justify-center h-full">
      <h1 class="text-2xl font-bold m-10">Griboulle ta course ici !</h1>
      <ClientOnly>
              <DrawingCanvas />
            </ClientOnly>
    </div>
  </template>
  
  