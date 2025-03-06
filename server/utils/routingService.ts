/**
 * Service for fetching routes that follow actual roads/paths
 */

interface Coordinate {
  lat: number;
  lng: number;
}

interface AnnotatedCoordinate extends Coordinate {
  originalIndex: number;
}

interface Point {
  x: number;
  y: number;
}

type RouteProfile = 'foot' | 'bike' | 'car';

// Canvas dimensions - à définir comme constantes globales
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

// Ajout des constantes de configuration par profil de route
const PROFILE_SETTINGS = {
  foot: { max_points: 30, smoothing: 3, step_size: 20 },  // Pas plus petits pour les piétons
  bike: { max_points: 40, smoothing: 2, step_size: 40 },  // Pas intermédiaires pour les vélos
  car: { max_points: 50, smoothing: 1, step_size: 100 }   // Pas plus grands pour les voitures
};

/**
 * Find the most optimal starting point for a route based on the drawing
 * This function analyzes the drawing and determines which point would give
 * the most representative route when following actual roads
 */
export function findOptimalStartingPoint(
  drawingPoints: Point[], 
  userLocation: Coordinate | null = null,
  maxDistance: number | null = null
): number {
  if (drawingPoints.length <= 2) return 0;
  
  // For a closed shape (where start and end are close), we need to find optimal starting points
  const isClosedShape = isShapeClosed(drawingPoints);
  
  // If it's not a closed shape, start from beginning unless user location is specified
  if (!isClosedShape && !userLocation) return 0;

  // Identify potential starting points
  // We'll consider points that are at corners or significant changes in direction
  const potentialStartIndices = findSignificantPoints(drawingPoints);
  
  // If user location is provided, find the closest significant point within max distance
  if (userLocation) {
    const closestIndex = findClosestPointToUser(drawingPoints, potentialStartIndices, userLocation, maxDistance);
    if (closestIndex >= 0) return closestIndex;
  }
  
  // Otherwise, evaluate each potential starting point for route quality
  let bestIndex = 0;
  let bestScore = -Infinity;
  
  for (const startIndex of potentialStartIndices) {
    const score = evaluateStartPoint(drawingPoints, startIndex);
    if (score > bestScore) {
      bestScore = score;
      bestIndex = startIndex;
    }
  }
  
  return bestIndex;
}

/**
 * Determine if the shape is approximately closed (start and end points are close)
 */
function isShapeClosed(points: Point[]): boolean {
  if (points.length < 3) return false;
  
  const start = points[0];
  const end = points[points.length - 1];
  
  // Calculate distance between start and end
  const distance = Math.sqrt(
    Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
  );
  
  // If distance is less than 10% of the drawing's width or height, consider it closed
  const maxDimension = Math.max(
    Math.max(...points.map(p => p.x)) - Math.min(...points.map(p => p.x)),
    Math.max(...points.map(p => p.y)) - Math.min(...points.map(p => p.y))
  );
  
  return distance < (maxDimension * 0.1);
}

/**
 * Find points in the drawing that represent significant direction changes (corners)
 * Version améliorée avec détection d'angles
 */
function findSignificantPoints(points: Point[]): number[] {
  const angles: number[] = [];
  const minAngle = 0.4; // Seuil dynamique basé sur la complexité globale
  const minDistance = 10; // Distance minimale entre les points significatifs

  // Calculer les angles entre segments consécutifs
  for (let i = 1; i < points.length - 1; i++) {
    const v1 = { x: points[i].x - points[i-1].x, y: points[i].y - points[i-1].y };
    const v2 = { x: points[i+1].x - points[i].x, y: points[i+1].y - points[i].y };
    
    // Éviter la division par zéro
    const magV1 = Math.hypot(v1.x, v1.y);
    const magV2 = Math.hypot(v2.x, v2.y);
    
    if (magV1 === 0 || magV2 === 0) {
      angles.push(0);
      continue;
    }
    
    const dotProduct = v1.x*v2.x + v1.y*v2.y;
    const cosAngle = Math.max(-1, Math.min(1, dotProduct/(magV1*magV2))); // Assurer que c'est entre -1 et 1
    const angle = Math.acos(cosAngle);
    angles.push(angle);
  }

  // Détection des points d'angle significatifs
  const result = angles.reduce((acc, angle, idx) => {
    if (angle > minAngle && 
        (acc.length === 0 || idx - acc[acc.length-1] > minDistance)) {
      acc.push(idx + 1); // Compenser le décalage d'indice
    }
    return acc;
  }, [0] as number[]); // Always include first point
  
  // Ajouter le dernier point si ce n'est pas déjà fait
  if (!result.includes(points.length - 1)) {
    result.push(points.length - 1);
  }
  
  return result;
}

/**
 * Calculate direction change at a specific point
 */
function calculateDirectionChange(points: Point[], index: number, step: number): number {
  if (index < step || index >= points.length - step) return 0;
  
  // Direction before the point
  const dirBefore = {
    x: points[index].x - points[index - step].x,
    y: points[index].y - points[index - step].y
  };
  
  // Direction after the point
  const dirAfter = {
    x: points[index + step].x - points[index].x,
    y: points[index + step].y - points[index].y
  };
  
  // Normalize directions
  const lenBefore = Math.sqrt(dirBefore.x * dirBefore.x + dirBefore.y * dirBefore.y);
  const lenAfter = Math.sqrt(dirAfter.x * dirAfter.x + dirAfter.y * dirAfter.y);
  
  if (lenBefore === 0 || lenAfter === 0) return 0;
  
  const normBefore = { x: dirBefore.x / lenBefore, y: dirBefore.y / lenBefore };
  const normAfter = { x: dirAfter.x / lenAfter, y: dirAfter.y / lenAfter };
  
  // Dot product to find angle change (1 = same direction, -1 = opposite direction)
  const dotProduct = normBefore.x * normAfter.x + normBefore.y * normAfter.y;
  
  // Convert to angle change (0 = no change, 2 = complete reversal)
  return 1 - dotProduct;
}

/**
 * Find the closest point from potential starting points to user's location
 */
function findClosestPointToUser(
  drawingPoints: Point[], 
  potentialIndices: number[], 
  userLocation: Coordinate,
  maxDistance: number | null
): number {
  // Convert drawing points to geographical coordinates for distance calculation
  // Passing userLocation and default maxDistance of 10km
  const geoPoints = convertToGeoCoordinates(drawingPoints, userLocation, maxDistance || 10);
  
  let closestIndex = -1;
  let minDistance = Infinity;
  
  for (const index of potentialIndices) {
    const distance = calculateGeoDistance(userLocation, geoPoints[index]);
    
    if (distance < minDistance && (maxDistance === null || distance <= maxDistance)) {
      minDistance = distance;
      closestIndex = index;
    }
  }
  
  return closestIndex;
}

/**
 * Get the aspect ratio of the canvas drawing
 */
function getCanvasAspectRatio(points: Point[]): number {
  const minX = Math.min(...points.map(p => p.x));
  const maxX = Math.max(...points.map(p => p.x));
  const minY = Math.min(...points.map(p => p.y));
  const maxY = Math.max(...points.map(p => p.y));
  
  const width = maxX - minX;
  const height = maxY - minY;
  
  // Avoid division by zero
  return height === 0 ? 1 : width / height;
}

/**
 * Calculate a dynamic bounding box based on user location and max distance
 */
function calculateDynamicBoundingBox(
  center: Coordinate, 
  distanceKm: number, 
  aspectRatio: number = 1
): { minLat: number; maxLat: number; minLng: number; maxLng: number } {
  // Approximation: 1 degree of latitude = ~111.32 km
  const kmPerDegreeLat = 111.32;
  
  // Degrees of latitude for the given distance
  const latDelta = distanceKm / kmPerDegreeLat;
  
  // Longitude degrees depend on latitude (Earth is narrower near poles)
  // Approximation using the cosine of latitude
  const lngDelta = latDelta / Math.cos(center.lat * Math.PI / 180) * aspectRatio;
  
  return {
    minLat: center.lat - latDelta,
    maxLat: center.lat + latDelta,
    minLng: center.lng - lngDelta,
    maxLng: center.lng + lngDelta
  };
}

/**
 * Convert canvas drawing points to geographic coordinates
 * Amélioré avec bounding box dynamique
 */
function convertToGeoCoordinates(points: Point[], userLocation: Coordinate | null = null, maxDistance: number = 10): Coordinate[] {
  let mapBounds;
  
  if (userLocation) {
    // Utiliser le ratio d'aspect du dessin pour une meilleure représentation
    const aspectRatio = getCanvasAspectRatio(points);
    mapBounds = calculateDynamicBoundingBox(userLocation, maxDistance, aspectRatio);
  } else {
    // Fallback sur la région de Paris si aucune position utilisateur n'est fournie
    mapBounds = {
      minLat: 48.815, maxLat: 48.905, // Latitude range
      minLng: 2.25, maxLng: 2.42      // Longitude range
    };
  }
  
  return points.map(point => {
    const lat = mapBounds.maxLat - (point.y / CANVAS_HEIGHT) * (mapBounds.maxLat - mapBounds.minLat);
    const lng = mapBounds.minLng + (point.x / CANVAS_WIDTH) * (mapBounds.maxLng - mapBounds.minLng);
    return { lat, lng };
  });
}

/**
 * Calculate geographic distance between two points
 */
function calculateGeoDistance(point1: Coordinate, point2: Coordinate): number {
  const R = 6371; // Earth's radius in km
  const dLat = (point2.lat - point1.lat) * Math.PI / 180;
  const dLon = (point2.lng - point1.lng) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * Evaluate how good a starting point is for generating a route
 */
function evaluateStartPoint(points: Point[], startIndex: number): number {
  // This is a simplified scoring system - in a real app, this could be more sophisticated
  let score = 0;
  
  // Prefer points that are near edges of the drawing
  const minX = Math.min(...points.map(p => p.x));
  const maxX = Math.max(...points.map(p => p.x));
  const minY = Math.min(...points.map(p => p.y));
  const maxY = Math.max(...points.map(p => p.y));
  
  const point = points[startIndex];
  const distanceToEdge = Math.min(
    point.x - minX,
    maxX - point.x,
    point.y - minY,
    maxY - point.y
  );
  
  // Closer to edge is better
  score += (20 - Math.min(20, distanceToEdge)) / 2;
  
  // Prefer points that are at corners (significant direction changes)
  if (startIndex > 0 && startIndex < points.length - 1) {
    const directionChange = calculateDirectionChange(points, startIndex, 1);
    score += directionChange * 10;
  }
  
  return score;
}


/**
 * Calculate segment distance between two points
 */
function calculateSegmentDistance(point1: Coordinate, point2: Coordinate): number {
  const R = 6371; // Earth's radius in km
  const dLat = (point2.lat - point1.lat) * Math.PI / 180;
  const dLon = (point2.lng - point1.lng) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * Échantillonnage stratifié pour choisir des points bien répartis
 */
function stratifiedSampling(waypoints: AnnotatedCoordinate[], maxPoints: number): AnnotatedCoordinate[] {
  if (maxPoints <= 0 || waypoints.length <= 0) return [];
  if (waypoints.length <= maxPoints) return [...waypoints];
  
  // Diviser le tracé en segments égaux
  const step = waypoints.length / maxPoints;
  const result: AnnotatedCoordinate[] = [];
  
  for (let i = 0; i < maxPoints; i++) {
    const idx = Math.floor(i * step);
    if (idx < waypoints.length) {
      result.push(waypoints[idx]);
    }
  }
  
  return result;
}

/**
 * Reduce waypoints intelligently for API calls
 * Using curvature analysis to preserve shape
 */
export function reduceWaypoints(waypoints: Coordinate[], maxApiPoints: number = 25): Coordinate[] {
  if (!waypoints || waypoints.length === 0) return [];
  if (waypoints.length <= maxApiPoints) return [...waypoints];
  
  // Trouver les points critiques (virages significatifs)
  const criticalPoints = getAnnotatedCriticalPoints(waypoints);
  
  // Calculer le nombre de points restants à choisir
  const remainingPoints = Math.max(0, maxApiPoints - criticalPoints.length);
  
  // Annoter les waypoints avec leur index original pour le tri
  const annotatedWaypoints = waypoints.map((coord, i) => ({...coord, originalIndex: i}));
  
  // Filtrer les points qui sont déjà considérés comme critiques
  const nonCriticalPoints = annotatedWaypoints.filter(point => 
    !criticalPoints.some(cp => cp.originalIndex === point.originalIndex)
  );
  
  // Effectuer un échantillonnage stratifié pour les points restants
  const sampledPoints = stratifiedSampling(nonCriticalPoints, remainingPoints);
  
  // Combiner les points critiques et l'échantillonnage
  const combinedPoints = [...criticalPoints, ...sampledPoints];
  
  // Trier par index original pour préserver l'ordre
  combinedPoints.sort((a, b) => a.originalIndex - b.originalIndex);
  
  // Supprimer les annotations avant de retourner
  return combinedPoints.map(({lat, lng}) => ({lat, lng}));
}

/**
 * Fetch a route from OpenRouteService that follows actual roads/paths
 * @param waypoints - Array of coordinates to pass through
 * @param profile - Type of routing (foot, bike, car)
 */
export async function fetchRouteFromAPI(waypoints: Coordinate[], profile: RouteProfile = 'foot'): Promise<Coordinate[]> {
  try {
    // Essayer d'abord de snapper les points aux routes réelles
    const snappedPoints = await snapToRoads(waypoints, profile);
    console.log(`Snapped ${waypoints.length} waypoints to roads`);
    
    // Réduire intelligemment le nombre de waypoints selon le profil
    const maxApiPoints = PROFILE_SETTINGS[profile].max_points;
    const optimizedWaypoints = reduceWaypoints(snappedPoints, maxApiPoints);
    console.log(`Reduced ${snappedPoints.length} waypoints to ${optimizedWaypoints.length} for API call`);
    
    // Convertir les waypoints au format attendu par l'API
    const coordinates = optimizedWaypoints.map(point => [point.lng, point.lat]);
    
    // Définir le profile API
    const apiProfile = profile === 'foot' ? 'foot-walking' : 
                       profile === 'bike' ? 'cycling-regular' : 
                       'driving-car';
    
    // Créer le corps de la requête
    const body = {
      coordinates,
      format: 'geojson',
      preference: 'recommended',
      units: 'km',
      instructions: false
    };
    
    // Appel à l'API OpenRouteService
    const response = await fetch(`https://api.openrouteservice.org/v2/directions/${apiProfile}/geojson`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': process.env.ORS_API_KEY || '',
        'Accept': 'application/json, application/geo+json'
      },
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      throw new Error(`OpenRouteService API response: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Extraire les coordonnées de la réponse GeoJSON
    if (data.features && data.features.length > 0 && data.features[0].geometry) {
      const route = data.features[0].geometry.coordinates;
      
      // Convertir du format GeoJSON [lng, lat] à notre format {lat, lng}
      const routeCoordinates: Coordinate[] = route.map((point: [number, number]): Coordinate => ({
        lat: point[1],
        lng: point[0]
      }));
      
      // Aligner la route obtenue avec les points originaux pour plus de précision
      return alignRouteToOriginal(routeCoordinates, waypoints);
    } else {
      throw new Error('No route found in the API response');
    }
  } catch (error) {
    console.error('Error fetching route:', error);
    
    // Si l'appel API échoue, revenir à la méthode simplifiée
    console.log('Falling back to direct point-to-point routing');
    return simulateRoadRoute(waypoints, profile);
  }
}

/**
 * For development/testing purpose when you don't have an API key
 * Simulates a route along roads by adding small deviations to the straight line
 */
export function simulateRoadRoute(waypoints: Coordinate[], profile: RouteProfile = 'foot'): Coordinate[] {
  if (waypoints.length <= 1) return waypoints;
  
  const result: Coordinate[] = [];
  const stepSize = PROFILE_SETTINGS[profile].step_size;
  
  // Déterminer la distance moyenne entre les segments pour calculer l'échelle des variations
  let totalDistance = 0;
  for (let i = 0; i < waypoints.length - 1; i++) {
    totalDistance += calculateGeoDistance(waypoints[i], waypoints[i+1]);
  }
  const avgSegmentLength = totalDistance / (waypoints.length - 1);
  const variationScale = Math.min(0.0005, avgSegmentLength * 0.05); // Max 5% de la longueur moyenne
  
  // Ajouter le premier point
  result.push(waypoints[0]);
  
  for (let i = 0; i < waypoints.length - 1; i++) {
    const start = waypoints[i];
    const end = waypoints[i+1];
    
    // Calcul de la distance entre ces deux points
    const segmentDistance = calculateGeoDistance(start, end);
    
    // Determiner le nombre de points intermédiaires selon la distance et le profil
    const pointsToAdd = Math.max(1, Math.ceil(segmentDistance * 1000 / stepSize));
    
    // Ajouter des points intermédiaires avec des variations adaptées au profil
    for (let j = 1; j <= pointsToAdd; j++) {
      const ratio = j / (pointsToAdd + 1);
      
      // Positionnement de base par interpolation linéaire
      let lat = start.lat + (end.lat - start.lat) * ratio;
      let lng = start.lng + (end.lng - start.lng) * ratio;
      
      // Variations selon le profil
      const variation = getProfileVariation(ratio, profile, variationScale, i * 1000 + j);
      
      // Application des variations
      lat += variation.lat;
      lng += variation.lng;
      
      result.push({lat, lng});
    }
  }
  
  // Ajouter le dernier point
  result.push(waypoints[waypoints.length - 1]);
  
  // Appliquer le lissage pour un parcours plus réaliste selon le profil
  return smoothRoute(result, profile);
}

/**
 * Detect critical points that are essential to preserve the shape of the route
 * Returns array of indices of critical points
 */
export function detectCriticalPoints(waypoints: Coordinate[]): number[] {
  // Initial points are always critical
  const criticalIndices = [0, waypoints.length - 1];
  
  // For really short paths, all points are critical
  if (waypoints.length <= 5) {
    return Array.from({ length: waypoints.length }, (_, i) => i);
  }
  
  // Analyze points for significant direction changes
  for (let i = 1; i < waypoints.length - 1; i++) {
    const curvature = calculateCurvature(waypoints, i);
    
    // Dynamic threshold based on path complexity
    const threshold = 0.1; // Adjusted based on testing
    
    if (curvature > threshold) {
      criticalIndices.push(i);
    }
  }
  
  return criticalIndices;
}

/**
 * Calculate curvature at a specific point
 * Version améliorée avec fenêtre glissante
 */
function calculateCurvature(points: Coordinate[], index: number): number {
  if (index <= 0 || index >= points.length - 1) return 0;
  
  // Ajout d'une fenêtre glissante pour une détection plus stable
  const windowSize = Math.min(2, Math.floor(points.length / 10));
  let sumCurvature = 0;
  let count = 0;
  
  for (let i = -windowSize; i <= windowSize; i++) {
    const effectiveIndex = Math.max(1, Math.min(points.length - 2, index + i));
    
    const prev = points[effectiveIndex - 1];
    const current = points[effectiveIndex];
    const next = points[effectiveIndex + 1];
    
    if (!prev || !next) continue;
    
    // Calcul de l'aire du triangle formé par les trois points
    const area = Math.abs(
      (prev.lng - current.lng) * (next.lat - current.lat) - 
      (prev.lat - current.lat) * (next.lng - current.lng)
    ) / 2;
    
    // Calcul des distances entre les points
    const a = calculateGeoDistance(prev, current);
    const b = calculateGeoDistance(current, next);
    const c = calculateGeoDistance(prev, next);
    
    // Si l'un des segments est trop petit, ignorez ce point
    if (a < 0.0001 || b < 0.0001) continue;
    
    // Calcul de courbure: plus l'aire est grande par rapport aux côtés, plus la courbure est forte
    let curvature = 4 * area / (a * b);
    
    // Cas particulier pour éviter les valeurs invalides
    if (isNaN(curvature)) curvature = 0;
    
    sumCurvature += curvature;
    count++;
  }
  
  return count > 0 ? sumCurvature / count : 0;
}

/**
 * Apply smoothing to the route to make it more realistic
 */
export function smoothRoute(route: Coordinate[], profile: RouteProfile): Coordinate[] {
  // Appliquer un lissage spécifique au profil
  const iterations = PROFILE_SETTINGS[profile].smoothing;
  
  let result = [...route];
  
  // Appliquer le lissage progressivement
  for (let i = 0; i < iterations; i++) {
    result = chaikinSmooth(result);
  }
  
  // Pour les chemins à pied, ajouter des déviations naturelles
  if (profile === 'foot') {
    result = addNaturalDeviation(result);
  }
  
  return result;
}

/**
 * Implementation of Chaikin's corner cutting algorithm
 */
function chaikinSmooth(points: Coordinate[]): Coordinate[] {
  if (points.length < 3) return points;
  
  const result: Coordinate[] = [];
  
  // Always keep first point
  result.push(points[0]);
  
  // Create new points by interpolation between existing points
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    
    // Create two new points at 1/4 and 3/4 of the way from p0 to p1
    const q = {
      lat: p0.lat * 0.75 + p1.lat * 0.25,
      lng: p0.lng * 0.75 + p1.lng * 0.25
    };
    
    const r = {
      lat: p0.lat * 0.25 + p1.lat * 0.75,
      lng: p0.lng * 0.25 + p1.lng * 0.75
    };
    
    result.push(q, r);
  }
  
  // Always keep last point
  result.push(points[points.length - 1]);
  
  return result;
}

/**
 * Add small natural deviations to make foot paths look more realistic
 */
function addNaturalDeviation(points: Coordinate[]): Coordinate[] {
  const result: Coordinate[] = [];
  
  // First and last points remain unchanged
  result.push(points[0]);
  
  // Add small, random deviations to intermediate points
  for (let i = 1; i < points.length - 1; i++) {
    const point = points[i];
    
    // Small deviation, proportional to distance to adjacent points
    const distToPrev = calculateSegmentDistance(points[i-1], point);
    const distToNext = calculateSegmentDistance(point, points[i+1]);
    const avgDist = (distToPrev + distToNext) / 2;
    
    // Add deviation max 1-2% of average segment length
    const maxDev = avgDist * 0.015 / 111.32; // Convert km to degrees (approx)
    const deviation = (Math.random() - 0.5) * maxDev;
    
    result.push({
      lat: point.lat + deviation,
      lng: point.lng + deviation
    });
  }
  
  // Add last point
  result.push(points[points.length - 1]);
  
  return result;
}

/**
 * Detect critical points that are essential to preserve the shape of the route
 * Returns annotated coordinates for critical points
 */
export function getAnnotatedCriticalPoints(waypoints: Coordinate[]): AnnotatedCoordinate[] {
  // For really short paths, all points are critical
  if (waypoints.length <= 5) {
    return waypoints.map((coord, i) => ({...coord, originalIndex: i}));
  }
  
  // Start with first and last point
  const criticalPoints: AnnotatedCoordinate[] = [
    {...waypoints[0], originalIndex: 0},
    {...waypoints[waypoints.length - 1], originalIndex: waypoints.length - 1}
  ];
  
  // Analyze points for significant direction changes
  for (let i = 1; i < waypoints.length - 1; i++) {
    const curvature = calculateCurvature(waypoints, i);
    
    // Dynamic threshold based on path complexity
    const threshold = 0.1; // Adjusted based on testing
    
    if (curvature > threshold) {
      criticalPoints.push({...waypoints[i], originalIndex: i});
    }
  }
  
  return criticalPoints;
}

/**
 * Snap points to actual roads using an external API
 */
async function snapToRoads(waypoints: Coordinate[], profile: RouteProfile = 'foot'): Promise<Coordinate[]> {
  if (waypoints.length <= 2) return waypoints;
  
  try {
    // Utiliser le profil approprié pour l'API
    const apiProfile = profile === 'foot' ? 'foot-walking' : 
                       profile === 'bike' ? 'cycling-regular' : 
                       'driving-car';
    
    // Ne pas soumettre trop de points à la fois à l'API
    const maxPointsPerRequest = 100;
    if (waypoints.length > maxPointsPerRequest) {
      // Réduire de façon intelligente
      const reducedPoints = reduceWaypoints(waypoints, maxPointsPerRequest);
      return snapToRoads(reducedPoints, profile);
    }
    
    // Appel à l'API pour le snapping
    const response = await fetch('https://api.openrouteservice.org/v2/snap/json', {
      method: 'POST',
      headers: {
        'Authorization': process.env.ORS_API_KEY || '',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        locations: waypoints.map(p => [p.lng, p.lat]),
        profile: apiProfile
      })
    });
    
    if (!response.ok) {
      console.warn(`Snapping API response: ${response.status}. Using original points.`);
      return waypoints;
    }

    const data = await response.json();
    
    // Extraire les points snappés
    if (data && data.features && data.features.length > 0) {
      return data.features.map((feature: any) => ({
        lat: feature.geometry.coordinates[1],
        lng: feature.geometry.coordinates[0]
      }));
    }
    
    return waypoints;
  } catch (error) {
    console.error('Road snapping failed, using original points:', error);
    return waypoints;
  }
}

/**
 * Align the generated route back to original points where appropriate
 */
function alignRouteToOriginal(route: Coordinate[], original: Coordinate[]): Coordinate[] {
  if (route.length <= 2 || original.length <= 2) return route;
  
  const alignedRoute: Coordinate[] = [];
  const searchRadius = 0.02; // ~200m
  
  let lastOriginalMatchIndex = -1;
  
  for (let i = 0; i < route.length; i++) {
    const routePoint = route[i];
    let closestDistance = Infinity;
    let closestPoint = routePoint;
    let closestOriginalIndex = -1;
    
    // Recherche des points originaux proches
    // Optimisation: ne chercher que dans une fenêtre autour du dernier point trouvé
    const startIdx = Math.max(0, lastOriginalMatchIndex - 10);
    const endIdx = Math.min(original.length, lastOriginalMatchIndex + 30);
    
    for (let j = startIdx; j < endIdx; j++) {
      const originalPoint = original[j];
      const distance = calculateGeoDistance(routePoint, originalPoint);
      
      if (distance < closestDistance) {
        closestDistance = distance;
        closestPoint = originalPoint;
        closestOriginalIndex = j;
      }
    }
    
    // Si un point original est assez proche, l'utiliser
    if (closestDistance < searchRadius) {
      alignedRoute.push(closestPoint);
      lastOriginalMatchIndex = closestOriginalIndex;
    } else {
      // Sinon, conserver le point de route ou faire une interpolation
      if (alignedRoute.length > 0 && i > 0) {
        // Interpolation simple entre dernier point aligné et point de route
        alignedRoute.push({
          lat: (alignedRoute[alignedRoute.length - 1].lat * 0.3) + (routePoint.lat * 0.7),
          lng: (alignedRoute[alignedRoute.length - 1].lng * 0.3) + (routePoint.lng * 0.7)
        });
      } else {
        alignedRoute.push(routePoint);
      }
    }
  }
  
  return alignedRoute;
}

/**
 * Generate profile-specific variations for route simulation
 */
function getProfileVariation(
  ratio: number, 
  profile: RouteProfile, 
  scale: number,
  seed: number
): Coordinate {
  // Valeurs de bruit pseudo-aléatoires basées sur la position
  const noise1 = Math.sin(ratio * 6.28 + seed * 0.1) * 0.5;
  const noise2 = Math.cos(ratio * 9.42 + seed * 0.2) * 0.5;
  
  switch (profile) {
    case 'foot':
      // Piéton: variations plus fréquentes et moins prévisibles
      return {
        lat: (noise1 * 0.7 + noise2 * 0.3) * scale * 1.2,
        lng: (noise1 * 0.3 + noise2 * 0.7) * scale * 1.2
      };
    
    case 'bike':
      // Vélo: variations plus douces mais encore notables
      return {
        lat: (noise1 * 0.6 + noise2 * 0.4) * scale * 0.8,
        lng: (noise1 * 0.4 + noise2 * 0.6) * scale * 0.8
      };
    
    case 'car':
      // Voiture: variations minimes, routes plus rectilignes
      return {
        lat: (noise1 * 0.5 + noise2 * 0.5) * scale * 0.4,
        lng: (noise1 * 0.5 + noise2 * 0.5) * scale * 0.4
      };
      
    default:
      return { lat: 0, lng: 0 };
  }
}