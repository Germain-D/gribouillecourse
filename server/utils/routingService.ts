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
    // Réduire intelligemment le nombre de waypoints pour l'API
    const optimizedWaypoints = reduceWaypoints(waypoints, 25);
    console.log(`Reduced ${waypoints.length} waypoints to ${optimizedWaypoints.length} for API call`);
    
    // Convert waypoints to the format expected by OpenRouteService
    const coordinates = optimizedWaypoints.map(point => [point.lng, point.lat]);
    
    // Map profile to OpenRouteService profile
    const apiProfile = profile === 'foot' ? 'foot-walking' : 
                       profile === 'bike' ? 'cycling-regular' : 
                       'driving-car';
    
    // Create the request body
    const body = {
      coordinates,
      format: 'geojson',
      preference: 'recommended',
      units: 'km'
    };
    
    // Make request to OpenRouteService API
    const response = await fetch(`https://api.openrouteservice.org/v2/directions/${apiProfile}/geojson`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': process.env.ORS_API_KEY || '',  // You'll need to create an API key
        'Accept': 'application/json, application/geo+json, application/gpx+xml'
      },
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      throw new Error(`OpenRouteService API response: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Extract coordinates from GeoJSON response
    if (data.features && data.features.length > 0 && data.features[0].geometry) {
      const route = data.features[0].geometry.coordinates;
      
      // Convert [lng, lat] format from GeoJSON to our {lat, lng} format
      const routeCoordinates: Coordinate[] = route.map((point: [number, number]): Coordinate => ({
        lat: point[1],
        lng: point[0]
      }));
      
      // Appliquer le post-traitement pour plus de réalisme
      return routeCoordinates;
    } else {
      throw new Error('No route found in the API response');
    }
  } catch (error) {
    console.error('Error fetching route:', error);
    
    // If API call fails, fall back to a simplified method by connecting the points directly
    console.log('Falling back to direct point-to-point routing');
    return waypoints;
  }
}

/**
 * For development/testing purpose when you don't have an API key
 * Simulates a route along roads by adding small deviations to the straight line
 */
export function simulateRoadRoute(waypoints: Coordinate[], profile: RouteProfile = 'foot'): Coordinate[] {
  if (waypoints.length <= 1) return waypoints;
  
  const result: Coordinate[] = [];
  
  for (let i = 0; i < waypoints.length - 1; i++) {
    const start = waypoints[i];
    const end = waypoints[i+1];
    
    // Add the start point
    result.push(start);
    
    // Calculate distance to determine number of points to add
    const distance = Math.sqrt(
      Math.pow(end.lat - start.lat, 2) + Math.pow(end.lng - start.lng, 2)
    );
    
    // Add intermediate points with slight randomization to simulate roads
    const pointsToAdd = Math.ceil(distance * 100);
    for (let j = 1; j < pointsToAdd; j++) {
      const ratio = j / pointsToAdd;
      
      // Basic linear interpolation
      const lat = start.lat + (end.lat - start.lat) * ratio;
      const lng = start.lng + (end.lng - start.lng) * ratio;
      
      // Add small random deviations to simulate roads
      const deviation = 0.0003 * Math.sin(j * 0.8); // Small sinusoidal deviation
      
      result.push({
        lat: lat + deviation * (j % 2 === 0 ? 1 : -1),
        lng: lng + deviation * (j % 3 === 0 ? 1 : -1)
      });
    }
  }
  
  // Add the last waypoint
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
 * Calculate curvature at a specific point (0 for straight line, up to 2 for sharp turn)
 */
function calculateCurvature(points: Coordinate[], index: number): number {
  if (index <= 0 || index >= points.length - 1) return 0;
  
  const prev = points[index - 1];
  const current = points[index];
  const next = points[index + 1];
  
  // Calculate vectors
  const v1 = {
    lat: current.lat - prev.lat,
    lng: current.lng - prev.lng
  };
  const v2 = {
    lat: next.lat - current.lat,
    lng: next.lng - current.lng
  };
  
  // Calculate magnitudes
  const mag1 = Math.sqrt(v1.lat * v1.lat + v1.lng * v1.lng);
  const mag2 = Math.sqrt(v2.lat * v2.lat + v2.lng * v2.lng);
  
  // Calculate dot product
  const dotProduct = v1.lat * v2.lat + v1.lng * v2.lng;
  
  // Calculate curvature (1 - cosθ)
  // Ranges from 0 (straight line) to 2 (complete reversal)
  if (mag1 === 0 || mag2 === 0) return 0;
  return 1 - (dotProduct / (mag1 * mag2));
}

/**
 * Apply smoothing to the route to make it more realistic
 * Asynchronous function signature but no actual async operations
 */
export function smoothRoute(route: Coordinate[], profile: RouteProfile): Coordinate[] {
  // Different smoothing strategies based on transport mode
  const iterations = profile === 'car' ? 1 : profile === 'bike' ? 2 : 3;
  
  let result = [...route];
  
  // Apply Chaikin smoothing
  for (let i = 0; i < iterations; i++) {
    result = chaikinSmooth(result);
  }
  
  // For foot paths, add small natural deviations
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