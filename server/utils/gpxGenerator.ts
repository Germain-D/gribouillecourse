/**
 * Utilitaire pour générer des fichiers GPX et transformer les points canvas en coordonnées GPS
 * Version améliorée avec validation robuste et métadonnées enrichies
 */

interface Coordinate {
  lat: number;
  lng: number;
}

interface Point {
  x: number;
  y: number;
}

interface GPXMetadata {
  name?: string;
  description?: string;
  author?: string;
  keywords?: string[];
  bounds?: {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  };
}

// Validation des coordonnées
function isValidCoordinate(coord: Coordinate): boolean {
  return (
    typeof coord.lat === 'number' &&
    typeof coord.lng === 'number' &&
    !isNaN(coord.lat) &&
    !isNaN(coord.lng) &&
    coord.lat >= -90 &&
    coord.lat <= 90 &&
    coord.lng >= -180 &&
    coord.lng <= 180
  );
}

/**
 * Génère le contenu XML GPX à partir d'un tableau de coordonnées
 * Version améliorée avec métadonnées et validation
 */
export function generateGpxFromCoordinates(
  coordinates: Coordinate[], 
  metadata: GPXMetadata = {}
): string {
  // Validation des entrées
  if (!Array.isArray(coordinates) || coordinates.length === 0) {
    throw new Error('Les coordonnées sont requises et doivent être un tableau non vide');
  }

  // Filtrer et valider les coordonnées
  const validCoordinates = coordinates.filter(isValidCoordinate);
  if (validCoordinates.length === 0) {
    throw new Error('Aucune coordonnée valide trouvée');
  }

  if (validCoordinates.length !== coordinates.length) {
    console.warn(`${coordinates.length - validCoordinates.length} coordonnées invalides ignorées`);
  }

  // Calculer les statistiques du parcours
  const stats = calculateRouteStats(validCoordinates);
  const bounds = calculateBounds(validCoordinates);
  
  // Métadonnées par défaut
  const finalMetadata: GPXMetadata = {
    name: metadata.name || 'Route générée à partir d\'un dessin',
    description: metadata.description || `Parcours de ${stats.distance.toFixed(2)} km généré automatiquement`,
    author: metadata.author || 'Map Drawing App',
    keywords: metadata.keywords || ['route', 'parcours', 'généré'],
    bounds: metadata.bounds || bounds,
    ...metadata
  };

  try {
    // En-tête GPX avec métadonnées enrichies
    let gpx = generateGPXHeader(finalMetadata, stats);
    
    // Section track
    gpx += '  <trk>\n';
    gpx += `    <name><![CDATA[${finalMetadata.name}]]></name>\n`;
    if (finalMetadata.description) {
      gpx += `    <desc><![CDATA[${finalMetadata.description}]]></desc>\n`;
    }
    
    // Ajouter les mots-clés comme extensions
    if (finalMetadata.keywords && finalMetadata.keywords.length > 0) {
      gpx += '    <extensions>\n';
      gpx += '      <keywords>' + finalMetadata.keywords.join(',') + '</keywords>\n';
      gpx += '    </extensions>\n';
    }
    
    gpx += '    <trkseg>\n';

    // Ajouter chaque point comme trackpoint avec timestamp et vitesse estimée
    validCoordinates.forEach((coord, index) => {
      const timestamp = generateTimestamp(index, validCoordinates.length);
      const speed = index > 0 ? calculateSpeed(validCoordinates[index - 1], coord) : 0;
      
      gpx += `      <trkpt lat="${coord.lat.toFixed(7)}" lon="${coord.lng.toFixed(7)}">\n`;
      gpx += `        <time>${timestamp}</time>\n`;
      if (speed > 0) {
        gpx += `        <extensions>\n`;
        gpx += `          <speed>${speed.toFixed(2)}</speed>\n`;
        gpx += `        </extensions>\n`;
      }
      gpx += `      </trkpt>\n`;
    });

    // Fermer le fichier GPX
    gpx += '    </trkseg>\n';
    gpx += '  </trk>\n';
    gpx += '</gpx>';

    return gpx;
    
  } catch (error) {
    console.error('Erreur lors de la génération GPX:', error);
    throw new Error(`Échec de la génération GPX: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Génère l'en-tête GPX avec métadonnées complètes
 */
function generateGPXHeader(metadata: GPXMetadata, stats: { distance: number; estimatedDuration: number }): string {
  const timestamp = new Date().toISOString();
  
  let header = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  header += `<gpx creator="${metadata.author}" version="1.1" xmlns="http://www.topografix.com/GPX/1/1" \n`;
  header += `     xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" \n`;
  header += `     xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">\n`;
  
  // Métadonnées
  header += '  <metadata>\n';
  header += `    <name><![CDATA[${metadata.name}]]></name>\n`;
  if (metadata.description) {
    header += `    <desc><![CDATA[${metadata.description}]]></desc>\n`;
  }
  header += `    <time>${timestamp}</time>\n`;
  
  // Limites géographiques
  if (metadata.bounds) {
    header += '    <bounds ';
    header += `minlat="${metadata.bounds.minLat.toFixed(7)}" `;
    header += `minlon="${metadata.bounds.minLng.toFixed(7)}" `;
    header += `maxlat="${metadata.bounds.maxLat.toFixed(7)}" `;
    header += `maxlon="${metadata.bounds.maxLng.toFixed(7)}"/>\n`;
  }
  
  // Extensions personnalisées
  header += '    <extensions>\n';
  header += `      <distance>${stats.distance.toFixed(3)}</distance>\n`;
  header += `      <estimated_duration>${Math.round(stats.estimatedDuration)}</estimated_duration>\n`;
  header += '    </extensions>\n';
  header += '  </metadata>\n';
  
  return header;
}

/**
 * Calcule les statistiques d'un parcours
 */
function calculateRouteStats(coordinates: Coordinate[]): { distance: number; estimatedDuration: number } {
  const distance = calculatePathDistance(coordinates);
  
  // Estimation de la durée basée sur une vitesse moyenne de marche (5 km/h)
  const averageWalkingSpeed = 5; // km/h
  const estimatedDuration = (distance / averageWalkingSpeed) * 3600; // en secondes
  
  return {
    distance,
    estimatedDuration
  };
}

/**
 * Calcule les limites géographiques d'un ensemble de coordonnées
 */
function calculateBounds(coordinates: Coordinate[]): { minLat: number; maxLat: number; minLng: number; maxLng: number } {
  if (coordinates.length === 0) {
    return { minLat: 0, maxLat: 0, minLng: 0, maxLng: 0 };
  }
  
  let minLat = coordinates[0].lat;
  let maxLat = coordinates[0].lat;
  let minLng = coordinates[0].lng;
  let maxLng = coordinates[0].lng;
  
  for (const coord of coordinates) {
    minLat = Math.min(minLat, coord.lat);
    maxLat = Math.max(maxLat, coord.lat);
    minLng = Math.min(minLng, coord.lng);
    maxLng = Math.max(maxLng, coord.lng);
  }
  
  return { minLat, maxLat, minLng, maxLng };
}

/**
 * Génère un timestamp pour un point donné
 */
function generateTimestamp(index: number, totalPoints: number): string {
  const baseTime = new Date();
  // Distribuer les points sur une durée réaliste (ex: 1 heure pour un parcours moyen)
  const intervalMs = (60 * 60 * 1000) / totalPoints; // 1 heure répartie
  const pointTime = new Date(baseTime.getTime() + index * intervalMs);
  return pointTime.toISOString();
}

/**
 * Calcule la vitesse estimée entre deux points
 */
function calculateSpeed(p1: Coordinate, p2: Coordinate): number {
  const distance = calculateDistance(p1, p2); // en km
  const timeInterval = 60; // Supposer 1 minute entre les points (à ajuster selon le contexte)
  return (distance / timeInterval) * 3600; // km/h
}

/**
 * Calcule la distance entre deux points en utilisant la formule de Haversine
 * @returns Distance en kilomètres
 */
function calculateDistance(p1: Coordinate, p2: Coordinate): number {
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

/**
 * Calcule la distance totale d'un parcours
 * @returns Distance en kilomètres
 */
export function calculatePathDistance(coordinates: Coordinate[]): number {
  if (!Array.isArray(coordinates) || coordinates.length < 2) {
    return 0;
  }
  
  const validCoordinates = coordinates.filter(isValidCoordinate);
  if (validCoordinates.length < 2) {
    return 0;
  }
  
  let distance = 0;
  for (let i = 0; i < validCoordinates.length - 1; i++) {
    distance += calculateDistance(validCoordinates[i], validCoordinates[i + 1]);
  }
  
  return distance;
}

/**
 * Transforme les points de dessin canvas en parcours GPS réaliste
 * Version améliorée avec respect des contraintes de distance et positionnement utilisateur
 */
export function mockPathGeneration(
  points: Point[], 
  maxDistance: number = 10,
  userLocation?: Coordinate
): Coordinate[] {
  // Validation des entrées
  if (!Array.isArray(points) || points.length < 2) {
    throw new Error('Au moins deux points sont requis pour générer un parcours');
  }

  if (typeof maxDistance !== 'number' || maxDistance <= 0) {
    throw new Error('La distance maximale doit être un nombre positif');
  }

  // Valider les points
  const validPoints = points.filter(point => 
    typeof point.x === 'number' && 
    typeof point.y === 'number' && 
    !isNaN(point.x) && 
    !isNaN(point.y)
  );

  if (validPoints.length < 2) {
    throw new Error('Au moins deux points valides sont requis');
  }

  try {
    // Définir la zone géographique de projection
    const MAP_BOUNDS = calculateMapBounds(userLocation, maxDistance);
    
    // Dimensions du canvas (configurable)
    const CANVAS_WIDTH = 800;
    const CANVAS_HEIGHT = 600;

    // Convertir les points de dessin en coordonnées géographiques
    let geoPoints: Coordinate[] = [];
    
    // Si localisation utilisateur fournie, l'utiliser comme point de départ
    if (userLocation && isValidCoordinate(userLocation)) {
      geoPoints.push(userLocation);
    }
    
    // Contrôler la densité des points pour éviter la surcharge
    const densityFactor = calculateDensityFactor(validPoints.length);
    
    validPoints.forEach((point, index) => {
      if (index % densityFactor === 0 || index === validPoints.length - 1) {
        const lat = MAP_BOUNDS.maxLat - (point.y / CANVAS_HEIGHT) * (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat);
        const lng = MAP_BOUNDS.minLng + (point.x / CANVAS_WIDTH) * (MAP_BOUNDS.maxLng - MAP_BOUNDS.minLng);
        
        const coord = { lat, lng };
        if (isValidCoordinate(coord)) {
          geoPoints.push(coord);
        }
      }
    });

    // Ajuster l'échelle si la distance dépasse la limite
    const totalDistance = calculatePathDistance(geoPoints);
    if (totalDistance > maxDistance) {
      geoPoints = scalePathToDistance(geoPoints, maxDistance, userLocation);
    }
    
    return geoPoints;
    
  } catch (error) {
    console.error('Erreur lors de la génération du parcours simulé:', error);
    throw new Error(`Échec de la génération de parcours: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Calcule les limites de la carte basées sur la localisation utilisateur et la distance max
 */
function calculateMapBounds(userLocation?: Coordinate, maxDistance: number = 10): {
  minLat: number; maxLat: number; minLng: number; maxLng: number;
} {
  if (userLocation && isValidCoordinate(userLocation)) {
    // Calcul dynamique basé sur la position utilisateur
    const kmPerDegreeLat = 111.32;
    const latDelta = maxDistance / kmPerDegreeLat / 2; // Diviser par 2 pour centrer
    const lngDelta = latDelta / Math.cos(userLocation.lat * Math.PI / 180);
    
    return {
      minLat: userLocation.lat - latDelta,
      maxLat: userLocation.lat + latDelta,
      minLng: userLocation.lng - lngDelta,
      maxLng: userLocation.lng + lngDelta
    };
  } else {
    // Fallback sur Paris comme région par défaut
    return {
      minLat: 48.815, maxLat: 48.905,
      minLng: 2.25, maxLng: 2.42
    };
  }
}

/**
 * Calcule le facteur de densité pour éviter trop de points
 */
function calculateDensityFactor(pointsCount: number): number {
  if (pointsCount <= 50) return 1;
  if (pointsCount <= 100) return 2;
  if (pointsCount <= 200) return 3;
  return Math.ceil(pointsCount / 50);
}

/**
 * Redimensionne un parcours pour respecter la distance maximale
 */
function scalePathToDistance(
  geoPoints: Coordinate[], 
  maxDistance: number, 
  anchorPoint?: Coordinate
): Coordinate[] {
  const currentDistance = calculatePathDistance(geoPoints);
  const scaleFactor = maxDistance / currentDistance;
  
  // Point d'ancrage pour la mise à l'échelle
  const anchor = anchorPoint && isValidCoordinate(anchorPoint) 
    ? anchorPoint 
    : calculateCentroid(geoPoints);
  
  const startIdx = anchorPoint ? 1 : 0; // Garder le point d'ancrage fixe
  
  return geoPoints.map((point, index) => {
    if (index < startIdx) return point; // Garder les points d'ancrage
    
    return {
      lat: anchor.lat + (point.lat - anchor.lat) * scaleFactor,
      lng: anchor.lng + (point.lng - anchor.lng) * scaleFactor
    };
  });
}

/**
 * Calcule le centroïde d'un ensemble de points
 */
function calculateCentroid(points: Coordinate[]): Coordinate {
  if (points.length === 0) return { lat: 0, lng: 0 };
  
  const sum = points.reduce(
    (acc, point) => ({
      lat: acc.lat + point.lat,
      lng: acc.lng + point.lng
    }),
    { lat: 0, lng: 0 }
  );
  
  return {
    lat: sum.lat / points.length,
    lng: sum.lng / points.length
  };
}