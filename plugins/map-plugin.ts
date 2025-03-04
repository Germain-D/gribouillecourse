
export default defineNuxtPlugin(async (nuxtApp) => {
  // Only initialize Leaflet on client-side
  if (process.client) {
    // Import Leaflet dynamically to avoid SSR issues
    const leafletModule = await import('leaflet')
    const L = leafletModule.default || leafletModule
    
    // Make sure Leaflet CSS is loaded
    await import('leaflet/dist/leaflet.css')
    
    // Initialize the Leaflet map
    nuxtApp.provide('initMap', (mapId: string) => {
      const map = L.map(mapId).setView([51.505, -0.09], 13)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
      }).addTo(map)

      return map
    })
  } else {
    // Provide a stub function for SSR
    nuxtApp.provide('initMap', () => null)
  }
})