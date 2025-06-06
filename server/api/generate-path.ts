import { defineEventHandler, readBody, createError } from 'h3';
import { generateGpxFromCoordinates, calculatePathDistance } from '../utils/gpxGenerator';
import { 
  fetchRouteFromAPI, 
  simulateRoadRoute,
  detectCriticalPoints,
  smoothRoute
} from '../utils/routingService';

// Types pour la validation
interface DrawingPoint {
  lat: number;
  lng: number;
}

interface RequestBody {
  points: DrawingPoint[];
  maxDistance: number;
  userLocation?: DrawingPoint;
  profile: 'foot' | 'bike' | 'car';
}

// Validation des entrées
function validateRequestBody(body: any): RequestBody {
  if (!body || typeof body !== 'object') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Corps de requête invalide'
    });
  }

  if (!Array.isArray(body.points)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Les points de dessin sont requis et doivent être un tableau'
    });
  }

  if (body.points.length < 2) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Au moins deux points sont requis pour générer un parcours'
    });
  }

  // Valider chaque point
  const validPoints: DrawingPoint[] = [];
  for (const point of body.points) {
    if (isValidDrawingPoint(point)) {
      validPoints.push(point);
    }
  }

  if (validPoints.length < 2) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Au moins deux points valides sont requis'
    });
  }

  // Valider maxDistance
  const maxDistance = body.maxDistance ?? 10;
  if (typeof maxDistance !== 'number' || maxDistance <= 0 || maxDistance > 100) {
    throw createError({
      statusCode: 400,
      statusMessage: 'La distance maximale doit être entre 1 et 100 km'
    });
  }

  // Valider userLocation si fournie
  let userLocation: DrawingPoint | undefined;
  if (body.userLocation) {
    if (isValidDrawingPoint(body.userLocation)) {
      userLocation = body.userLocation;
    } else {
      console.warn('Localisation utilisateur invalide ignorée');
    }
  }

  // Valider le profil
  const validProfiles = ['foot', 'bike', 'car'] as const;
  const profile = validProfiles.includes(body.profile) ? body.profile : 'foot';

  return {
    points: validPoints,
    maxDistance,
    userLocation,
    profile
  };
}

function isValidDrawingPoint(point: any): point is DrawingPoint {
  return (
    point &&
    typeof point === 'object' &&
    typeof point.lat === 'number' &&
    typeof point.lng === 'number' &&
    !isNaN(point.lat) &&
    !isNaN(point.lng) &&
    point.lat >= -90 &&
    point.lat <= 90 &&
    point.lng >= -180 &&
    point.lng <= 180
  );
}

export default defineEventHandler(async (event) => {
  const startTime = Date.now();
  
  try {
    // Lire et valider le corps de la requête
    const rawBody = await readBody(event);
    const validatedBody = validateRequestBody(rawBody);
    
    const { points: drawingPoints, maxDistance, userLocation, profile } = validatedBody;
    
    console.log(`Génération de parcours: ${drawingPoints.length} points, ${maxDistance}km max, profil: ${profile}`);
    
    // Optimisation: réduire les waypoints dès le début si trop nombreux
    const optimizedPoints = intelligentReduceWaypoints(drawingPoints, profile);
    console.log(`Points optimisés: ${drawingPoints.length} -> ${optimizedPoints.length}`);
    
    // Générer une route qui suit les routes réelles
    let routeCoordinates: DrawingPoint[];
    let routeGenerationMethod = 'unknown';
    
    try {
      // Tentative avec l'API externe
      routeCoordinates = await fetchRouteFromAPI(optimizedPoints, profile);
      routeGenerationMethod = 'api';
      console.log(`Route générée via API: ${routeCoordinates.length} points`);
    } catch (apiError) {
      // Fallback vers la simulation
      console.warn('Génération API échouée, utilisation de la simulation:', apiError);
      routeCoordinates = simulateRoadRoute(optimizedPoints, profile);
      routeGenerationMethod = 'simulation';
      console.log(`Route simulée générée: ${routeCoordinates.length} points`);
    }
    
    // Vérifier et ajuster la distance si nécessaire
    let finalRoute = await adjustRouteDistance(routeCoordinates, maxDistance, profile);
    
    // Calculer la distance finale
    const distance = calculatePathDistance(finalRoute);
    const processingTime = Date.now() - startTime;
    
    // Générer le fichier GPX
    const gpxContent = generateGpxFromCoordinates(finalRoute);
    
    console.log(`Parcours généré: ${distance.toFixed(2)}km, ${finalRoute.length} points, ${processingTime}ms`);
    
    // Retourner la réponse avec métadonnées
    return {
      success: true,
      coordinates: finalRoute,
      gpxContent,
      distance: `${distance.toFixed(2)} km`,
      startPoint: drawingPoints[0],
      metadata: {
        originalPointsCount: drawingPoints.length,
        finalPointsCount: finalRoute.length,
        generationMethod: routeGenerationMethod,
        processingTimeMs: processingTime,
        profile
      }
    };
    
  } catch (error: unknown) {
    console.error('Erreur lors de la génération du parcours:', error);
    
    // Gestion des erreurs structurée
    if (error && typeof error === 'object' && 'statusCode' in error) {
      // Erreur déjà formatée par createError
      throw error;
    }
    
    // Erreur inattendue
    throw createError({
      statusCode: 500,
      statusMessage: 'Erreur interne lors de la génération du parcours',
      data: {
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      }
    });
  }
});

/**
 * Réduction intelligente des waypoints avec préservation des points critiques
 * Version améliorée avec adaptation par profil
 */
function intelligentReduceWaypoints(
  waypoints: DrawingPoint[], 
  profile: 'foot' | 'bike' | 'car' = 'foot'
): DrawingPoint[] {
  // Limites par profil
  const maxPointsByProfile = {
    foot: 25,
    bike: 30,
    car: 35
  };
  
  const maxWaypoints = maxPointsByProfile[profile];
  
  if (waypoints.length <= maxWaypoints) return [...waypoints];
  
  try {
    // Identifier les points critiques
    const criticalIndices = detectCriticalPoints(waypoints);
    
    // Stratégie adaptive selon le nombre de points critiques
    if (criticalIndices.length <= maxWaypoints) {
      // Ajouter des points équidistants si nécessaire
      return addEquidistantPoints(waypoints, criticalIndices, maxWaypoints);
    } else {
      // Prioriser les points les plus significatifs
      return prioritizeSignificantPoints(waypoints, criticalIndices, maxWaypoints);
    }
  } catch (error) {
    console.warn('Erreur lors de la réduction intelligente, utilisation de la méthode simple:', error);
    return simpleReduction(waypoints, maxWaypoints);
  }
}

/**
 * Ajoute des points équidistants entre les points critiques
 */
function addEquidistantPoints(
  waypoints: DrawingPoint[], 
  criticalIndices: number[], 
  maxWaypoints: number
): DrawingPoint[] {
  const result = new Set(criticalIndices);
  const remainingSlots = maxWaypoints - criticalIndices.length;
  
  if (remainingSlots > 0) {
    const step = Math.max(1, Math.floor(waypoints.length / remainingSlots));
    for (let i = 0; i < waypoints.length && result.size < maxWaypoints; i += step) {
      result.add(i);
    }
  }
  
  // Toujours inclure le premier et le dernier point
  result.add(0);
  result.add(waypoints.length - 1);
  
  const indices = Array.from(result).sort((a, b) => a - b);
  return indices.map(idx => waypoints[idx]);
}

/**
 * Priorise les points les plus significatifs basés sur la courbure
 */
function prioritizeSignificantPoints(
  waypoints: DrawingPoint[], 
  criticalIndices: number[], 
  maxWaypoints: number
): DrawingPoint[] {
  // Calculer la courbure pour chaque point critique
  const pointsWithCurvature = criticalIndices.map(idx => ({
    index: idx,
    curvature: calculateCurvature(waypoints, idx)
  }));
  
  // Trier par courbure décroissante
  pointsWithCurvature.sort((a, b) => b.curvature - a.curvature);
  
  // Prendre les points les plus significatifs
  const selectedIndices = pointsWithCurvature
    .slice(0, maxWaypoints - 2) // Réserver de la place pour le premier et le dernier
    .map(p => p.index);
  
  // Ajouter le premier et le dernier point
  selectedIndices.push(0, waypoints.length - 1);
  
  // Trier pour maintenir l'ordre
  selectedIndices.sort((a, b) => a - b);
  
  return selectedIndices.map(idx => waypoints[idx]);
}

/**
 * Réduction simple par échantillonnage uniforme
 */
function simpleReduction(waypoints: DrawingPoint[], maxWaypoints: number): DrawingPoint[] {
  if (waypoints.length <= maxWaypoints) return [...waypoints];
  
  const step = waypoints.length / maxWaypoints;
  const result: DrawingPoint[] = [];
  
  for (let i = 0; i < maxWaypoints; i++) {
    const index = Math.min(Math.floor(i * step), waypoints.length - 1);
    result.push(waypoints[index]);
  }
  
  return result;
}

/**
 * Ajuste la distance de la route pour respecter la limite maximale
 */
async function adjustRouteDistance(
  coordinates: DrawingPoint[], 
  maxDistanceKm: number,
  profile: 'foot' | 'bike' | 'car'
): Promise<DrawingPoint[]> {
  const currentDistance = calculatePathDistance(coordinates);
  
  if (currentDistance <= maxDistanceKm) {
    return coordinates;
  }
  
  console.log(`Ajustement nécessaire: ${currentDistance.toFixed(2)}km -> ${maxDistanceKm}km`);
  
  // Méthode 1: Tronquer la route
  const truncatedRoute = trimRouteToMaxDistance(coordinates, maxDistanceKm);
  
  // Appliquer un lissage final
  return await smoothRoute(truncatedRoute, profile);
}

/**
 * Calcule la courbure à un point spécifique
 */
function calculateCurvature(points: DrawingPoint[], index: number): number {
  if (index <= 0 || index >= points.length - 1) return 0;
  
  const prev = points[index - 1];
  const current = points[index];
  const next = points[index + 1];
  
  // Calcul des vecteurs
  const v1 = {
    lat: current.lat - prev.lat,
    lng: current.lng - prev.lng
  };
  const v2 = {
    lat: next.lat - current.lat,
    lng: next.lng - current.lng
  };
  
  // Magnitudes
  const mag1 = Math.sqrt(v1.lat * v1.lat + v1.lng * v1.lng);
  const mag2 = Math.sqrt(v2.lat * v2.lat + v2.lng * v2.lng);
  
  if (mag1 === 0 || mag2 === 0) return 0;
  
  // Produit scalaire et courbure
  const dotProduct = v1.lat * v2.lat + v1.lng * v2.lng;
  return Math.max(0, 1 - (dotProduct / (mag1 * mag2)));
}

/**
 * Tronque une route pour s'assurer qu'elle ne dépasse pas la distance maximale
 */
function trimRouteToMaxDistance(
  coordinates: DrawingPoint[], 
  maxDistanceKm: number
): DrawingPoint[] {
  if (coordinates.length < 2) return coordinates;
  
  let totalDistance = 0;
  const result: DrawingPoint[] = [coordinates[0]];
  
  for (let i = 1; i < coordinates.length; i++) {
    const prev = coordinates[i - 1];
    const current = coordinates[i];
    
    const segmentDistance = calculateSegmentDistance(prev, current);
    
    if (totalDistance + segmentDistance > maxDistanceKm) {
      // Interpoler le point final
      const remainingDistance = maxDistanceKm - totalDistance;
      const ratio = remainingDistance / segmentDistance;
      
      const finalPoint: DrawingPoint = {
        lat: prev.lat + (current.lat - prev.lat) * ratio,
        lng: prev.lng + (current.lng - prev.lng) * ratio
      };
      
      result.push(finalPoint);
      break;
    }
    
    result.push(current);
    totalDistance += segmentDistance;
  }
  
  return result;
}

/**
 * Calcule la distance entre deux points en kilomètres
 */
function calculateSegmentDistance(p1: DrawingPoint, p2: DrawingPoint): number {
  const R = 6371; // Rayon de la Terre en km
  const dLat = (p2.lat - p1.lat) * Math.PI / 180;
  const dLon = (p2.lng - p1.lng) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(p1.lat * Math.PI / 180) * Math.cos(p2.lat * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}