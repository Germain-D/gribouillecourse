import { defineEventHandler, readBody } from 'h3';
import { mockPathGeneration, generateGpxFromCoordinates, calculatePathDistance, findOptimalStartPoint } from '../utils/gpxGenerator';
import { fetchRouteFromAPI } from '../utils/routingService';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    
    if (!body || !body.points || !Array.isArray(body.points)) {
      return {
        statusCode: 400,
        body: { message: 'Valid drawing points are required' }
      };
    }

    const drawingPoints = body.points;
    const maxDistance = body.maxDistance || 10; // Default to 10km if not specified
    const userLocation = body.userLocation; // May be undefined
    const maxStartDistance = body.maxStartDistance || 0; // New parameter
    
    if (drawingPoints.length < 2) {
      return {
        statusCode: 400,
        body: { message: 'At least two points are required to generate a path' }
      };
    }

    // Log the received points to help debugging
    console.log(`Received ${drawingPoints.length} points for path generation with max distance: ${maxDistance}km`);
    if (userLocation) {
      console.log(`Using user location as starting point: [${userLocation.lat}, ${userLocation.lng}]`);
      if (maxStartDistance > 0) {
        console.log(`Allowing start point up to ${maxStartDistance}km from user location`);
      }
    }
    
    // 1. Find the optimal start point if flexible start is enabled
    let startPoint = userLocation;
    if (userLocation && maxStartDistance > 0) {
      startPoint = findOptimalStartPoint(drawingPoints, userLocation, maxStartDistance);
      console.log(`Found optimal start point: [${startPoint.lat}, ${startPoint.lng}], ` +
                 `${calculateDistance(userLocation, startPoint).toFixed(2)}km from user location`);
    }
    
    // 2. Convert drawing points to geographic waypoints
    const waypoints = mockPathGeneration(drawingPoints, maxDistance, startPoint);
    
    // 3. Reduce number of waypoints to avoid API limits
    const reducedWaypoints = reduceWaypoints(waypoints, 10); // Max 10 waypoints
    
    // 4. Get actual route following roads from routing service
    // If you don't have an API key yet, use simulateRoadRoute
    // const routeCoordinates = await fetchRouteFromAPI(reducedWaypoints, 'foot');
    const routeCoordinates = simulateRoadRoute(reducedWaypoints);
    
    // 5. Calculate the actual distance of the generated path
    const distance = calculatePathDistance(routeCoordinates);
    const formattedDistance = `${distance.toFixed(2)} km`;
    
    // 6. Generate GPX file from the coordinates
    const gpxContent = generateGpxFromCoordinates(routeCoordinates);

    // Return both the coordinates (for displaying on map) and GPX (for download)
    return {
      success: true,
      coordinates: routeCoordinates,
      gpxContent: gpxContent,
      distance: formattedDistance,
      startPoint: startPoint
    };
  } catch (error) {
    console.error('Error generating path:', error);
    return {
      statusCode: 500,
      body: { message: 'Failed to generate path', error: String(error) }
    };
  }
});

/**
 * Reduce the number of waypoints while preserving the shape
 */
function reduceWaypoints(waypoints: { lat: number; lng: number }[], maxPoints: number): { lat: number; lng: number }[] {
  if (waypoints.length <= maxPoints) return waypoints;
  
  // Simple implementation: take evenly spaced points including first and last
  const result = [waypoints[0]]; // Always include the first point
  
  const step = Math.max(1, Math.floor(waypoints.length / (maxPoints - 2)));
  for (let i = step; i < waypoints.length - 1; i += step) {
    result.push(waypoints[i]);
    if (result.length >= maxPoints - 1) break;
  }
  
  result.push(waypoints[waypoints.length - 1]); // Always include the last point
  return result;
}

/**
 * For testing purposes without external API
 */
function simulateRoadRoute(waypoints: {lat: number, lng: number}[]): {lat: number, lng: number}[] {
  if (waypoints.length <= 1) return waypoints;
  
  const result: {lat: number, lng: number}[] = [];
  
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

/**
 * Calculate distance between two points
 */
function calculateDistance(p1: {lat: number, lng: number}, p2: {lat: number, lng: number}): number {
  const R = 6371; // Earth's radius in km
  const dLat = (p2.lat - p1.lat) * Math.PI / 180;
  const dLon = (p2.lng - p1.lng) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(p1.lat * Math.PI / 180) * Math.cos(p2.lat * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}