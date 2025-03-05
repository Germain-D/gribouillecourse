/**
 * Service for fetching routes that follow actual roads/paths
 */

interface Coordinate {
  lat: number;
  lng: number;
}

type RouteProfile = 'foot' | 'bike' | 'car';

/**
 * Fetch a route from OpenRouteService that follows actual roads/paths
 * @param waypoints - Array of coordinates to pass through
 * @param profile - Type of routing (foot, bike, car)
 */
export async function fetchRouteFromAPI(waypoints: Coordinate[], profile: RouteProfile = 'foot'): Promise<Coordinate[]> {
  try {
    // Convert waypoints to the format expected by OpenRouteService
    const coordinates = waypoints.map(point => [point.lng, point.lat]);
    
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
      return route.map(point => ({
        lat: point[1],
        lng: point[0]
      }));
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
export function simulateRoadRoute(waypoints: Coordinate[]): Coordinate[] {
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
  
  return result;
}