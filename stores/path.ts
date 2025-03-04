import { defineStore } from 'pinia';

export const usePathStore = defineStore('path', {
  state: () => ({
    coordinates: [] as Array<{ lat: number; lng: number }>,
    pathName: '',
  }),
  actions: {
    addCoordinate(lat: number, lng: number) {
      this.coordinates.push({ lat, lng });
    },
    setPathName(name: string) {
      this.pathName = name;
    },
    clearPath() {
      this.coordinates = [];
      this.pathName = '';
    },
  },
  getters: {
    getPathCoordinates: (state) => state.coordinates,
    getPathName: (state) => state.pathName,
  },
});