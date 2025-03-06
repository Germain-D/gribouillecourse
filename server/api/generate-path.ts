import { defineEventHandler, readBody } from 'h3';
import { generateGpxFromCoordinates, calculatePathDistance } from '../utils/gpxGenerator';
import { 
  fetchRouteFromAPI, 
  simulateRoadRoute,
  detectCriticalPoints,
  smoothRoute
} from '../utils/routingService';

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
    const routeProfile = body.profile || 'foot'; // The type of routing (foot, bike, car)
    
    if (drawingPoints.length < 2) {
      return {
        statusCode: 400,
        body: { message: 'At least two points are required to generate a path' }
      };
    }

    console.log(`Received ${drawingPoints.length} points for path generation with max distance: ${maxDistance}km`);
    console.log(`Using profile: ${routeProfile}`);
    
    // The points are already geographic coordinates (lat/lng) from the map
    // No need to find optimal starting point or transform canvas points
    
    // Reduce waypoints but preserve critical shape points
    const reducedWaypoints = intelligentReduceWaypoints(drawingPoints);
    console.log(`Reduced waypoints from ${drawingPoints.length} to ${reducedWaypoints.length} for API call`);
    
    // Generate a route that follows actual roads using the external routing API
    let routeCoordinates;
    try {
      // First, try to use the external API for real roads
      routeCoordinates = await fetchRouteFromAPI(reducedWaypoints, routeProfile);
      console.log(`Successfully fetched route using API with ${routeCoordinates.length} points`);
    } catch (routeError) {
      // Fall back to simulation if API fails
      console.error('API route fetching failed, falling back to simulation:', routeError);
      routeCoordinates = simulateRoadRoute(drawingPoints, routeProfile);
      console.log(`Generated simulated route with ${routeCoordinates.length} points`);
    }
    
    // Ensure the distance doesn't exceed the max limit
    const currentDistance = calculatePathDistance(routeCoordinates);
    if (currentDistance > maxDistance) {
      console.log(`Route distance (${currentDistance.toFixed(2)}km) exceeds max (${maxDistance}km), adjusting...`);
      routeCoordinates = trimRouteToMaxDistance(routeCoordinates, maxDistance);
    }
    
    // Apply final smoothing for realism
    routeCoordinates = await smoothRoute(routeCoordinates, routeProfile);
    
    // Calculate the actual distance of the generated path
    const distance = calculatePathDistance(routeCoordinates);
    const formattedDistance = `${distance.toFixed(2)} km`;
    
    // Generate GPX file from the coordinates
    const gpxContent = generateGpxFromCoordinates(routeCoordinates);

    // Return both the coordinates (for displaying on map) and GPX (for download)
    return {
      success: true,
      coordinates: routeCoordinates,
      gpxContent: gpxContent,
      distance: formattedDistance,
      startPoint: drawingPoints[0] // The first drawing point is our start point
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
 * Intelligent waypoint reduction that preserves critical shape points
 */
function intelligentReduceWaypoints(waypoints: { lat: number; lng: number }[]): { lat: number; lng: number }[] {
  if (waypoints.length <= 10) return waypoints;
  
  // Identify critical points based on curvature and shape characteristics
  const criticalIndices = detectCriticalPoints(waypoints);
  
  // Ensure we don't exceed API limits (25 is a typical value for many routing APIs)
  const MAX_WAYPOINTS = 25;
  
  // If we have fewer critical points than our limit, add more evenly distributed points
  if (criticalIndices.length < MAX_WAYPOINTS) {
    const remainingSlots = MAX_WAYPOINTS - criticalIndices.length;
    
    // Add evenly spaced points that aren't already marked as critical
    const step = Math.max(1, Math.floor(waypoints.length / remainingSlots));
    for (let i = 0; i < waypoints.length; i += step) {
      if (!criticalIndices.includes(i) && criticalIndices.length < MAX_WAYPOINTS) {
        criticalIndices.push(i);
      }
    }
  } 
  // If we have too many critical points, prioritize the most significant ones
  else if (criticalIndices.length > MAX_WAYPOINTS) {
    // Sort by significance (implementation would depend on how detectCriticalPoints works)
    criticalIndices.sort((a, b) => {
      const curvatureA = calculateCurvature(waypoints, a);
      const curvatureB = calculateCurvature(waypoints, b);
      return curvatureB - curvatureA; // Higher curvature = more important
    });
    
    // Keep only the most significant points
    criticalIndices.splice(MAX_WAYPOINTS);
  }
  
  // Always include first and last points
  if (!criticalIndices.includes(0)) criticalIndices.push(0);
  if (!criticalIndices.includes(waypoints.length - 1)) criticalIndices.push(waypoints.length - 1);
  
  // Sort indices to maintain original order
  criticalIndices.sort((a, b) => a - b);
  
  // Return the waypoints at the critical indices
  return criticalIndices.map(idx => waypoints[idx]);
}

/**
 * Calculate curvature at a specific point
 */
function calculateCurvature(points: { lat: number; lng: number }[], index: number): number {
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
 * Trim a route to ensure it doesn't exceed the maximum distance
 * This preserves the exact shape of the route, just shortens it
 */
function trimRouteToMaxDistance(
  coordinates: { lat: number; lng: number }[], 
  maxDistanceKm: number
): { lat: number; lng: number }[] {
  if (coordinates.length < 2) return coordinates;
  
  let totalDistance = 0;
  const result: typeof coordinates = [coordinates[0]];
  
  for (let i = 1; i < coordinates.length; i++) {
    const prev = coordinates[i-1];
    const current = coordinates[i];
    
    // Calculate distance between these two points
    const segmentDistance = calculateSegmentDistance(prev, current);
    
    // If adding this segment would exceed the limit
    if (totalDistance + segmentDistance > maxDistanceKm) {
      // Calculate how far along this segment we can go
      const remainingDistance = maxDistanceKm - totalDistance;
      const ratio = remainingDistance / segmentDistance;
      
      // Interpolate a point along the segment
      const lastPoint = {
        lat: prev.lat + (current.lat - prev.lat) * ratio,
        lng: prev.lng + (current.lng - prev.lng) * ratio
      };
      
      result.push(lastPoint);
      break;
    }
    
    // Otherwise add the current point and continue
    result.push(current);
    totalDistance += segmentDistance;
  }
  
  return result;
}

/**
 * Calculate distance between two coordinate points in kilometers
 */
function calculateSegmentDistance(p1: { lat: number; lng: number }, p2: { lat: number; lng: number }): number {
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