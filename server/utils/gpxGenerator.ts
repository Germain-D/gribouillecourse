/**
 * Utility to generate GPX files and transform canvas points to GPS coordinates
 */

interface Coordinate {
  lat: number;
  lng: number;
}

interface Point {
  x: number;
  y: number;
}

/**
 * Generate GPX XML content from an array of coordinates
 */
export function generateGpxFromCoordinates(coordinates: Coordinate[]): string {
  // GPX header with metadata
  let gpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx creator="Map Drawing App" version="1.1" xmlns="http://www.topografix.com/GPX/1/1" 
     xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
     xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">
  <metadata>
    <name>Route generated from hand drawing</name>
    <time>${new Date().toISOString()}</time>
  </metadata>
  <trk>
    <name>Generated Route</name>
    <trkseg>
`;

  // Add each point as a trackpoint
  coordinates.forEach(coord => {
    gpx += `      <trkpt lat="${coord.lat}" lon="${coord.lng}"></trkpt>\n`;
  });

  // Close GPX file
  gpx += `    </trkseg>
  </trk>
</gpx>`;

  return gpx;
}

/**
 * Calculate the distance between two points using the Haversine formula
 * @returns Distance in kilometers
 */
function calculateDistance(p1: Coordinate, p2: Coordinate): number {
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

/**
 * Calculate the total distance of a path
 * @returns Distance in kilometers
 */
export function calculatePathDistance(coordinates: Coordinate[]): number {
  let distance = 0;
  for (let i = 0; i < coordinates.length - 1; i++) {
    distance += calculateDistance(coordinates[i], coordinates[i + 1]);
  }
  return distance;
}

/**
 * Transform canvas drawing points into a realistic-looking GPS route
 * with respect to maxDistance constraint and starting from userLocation if provided
 */
export function mockPathGeneration(
  points: Point[], 
  maxDistance: number = 10,
  userLocation?: Coordinate
): Coordinate[] {
  // Skip processing if too few points
  if (points.length < 2) {
    return [];
  }

  // Define a bounding box for our map (this would be configurable in a real app)
  // For this example, we'll use a region around Paris, France
  let MAP_BOUNDS = {
    minLat: 48.815, maxLat: 48.905, // Latitude range
    minLng: 2.25, maxLng: 2.42      // Longitude range
  };
  
  // If user location is provided, center the map around it
  if (userLocation) {
    const halfLatSpan = 0.045; // About 5km north-south
    const halfLngSpan = 0.085; // About 5km east-west at this latitude
    
    MAP_BOUNDS = {
      minLat: userLocation.lat - halfLatSpan,
      maxLat: userLocation.lat + halfLatSpan,
      minLng: userLocation.lng - halfLngSpan,
      maxLng: userLocation.lng + halfLngSpan
    };
  }
  
  // Canvas dimensions
  const CANVAS_WIDTH = 800;  // Should match your canvas width
  const CANVAS_HEIGHT = 600; // Should match your canvas height

  // Convert drawing points to geographic coordinates
  let geoPoints: Coordinate[] = [];
  
  // If user location is provided, use it as starting point
  if (userLocation) {
    geoPoints.push(userLocation);
  }
  
  // Add the converted points from the canvas drawing
  // We'll take every nth point to control density
  const densityFactor = points.length > 100 ? Math.floor(points.length / 50) : 1;
  
  points.forEach((point, index) => {
    if (index % densityFactor === 0 || index === points.length - 1) {
      const lat = MAP_BOUNDS.maxLat - (point.y / CANVAS_HEIGHT) * (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat);
      const lng = MAP_BOUNDS.minLng + (point.x / CANVAS_WIDTH) * (MAP_BOUNDS.maxLng - MAP_BOUNDS.minLng);
      geoPoints.push({ lat, lng });
    }
  });

  // Now enforce the maximum distance constraint by trimming points
  if (maxDistance > 0) {
    let totalDistance = 0;
    const limitedPoints: Coordinate[] = [];
    
    // Always include the first point (user location or first drawn point)
    limitedPoints.push(geoPoints[0]);
    
    for (let i = 1; i < geoPoints.length; i++) {
      const segmentDistance = calculateDistance(geoPoints[i-1], geoPoints[i]);
      
      // If adding this segment would exceed the max distance, stop here
      if (totalDistance + segmentDistance > maxDistance) {
        // Optionally, add a point at exactly the maximum distance
        // This creates a more natural endpoint rather than just cutting off
        const ratio = (maxDistance - totalDistance) / segmentDistance;
        if (ratio > 0) {
          const lastLat = geoPoints[i-1].lat + (geoPoints[i].lat - geoPoints[i-1].lat) * ratio;
          const lastLng = geoPoints[i-1].lng + (geoPoints[i].lng - geoPoints[i-1].lng) * ratio;
          limitedPoints.push({ lat: lastLat, lng: lastLng });
        }
        break;
      }
      
      limitedPoints.push(geoPoints[i]);
      totalDistance += segmentDistance;
    }
    
    return limitedPoints;
  }
  
  return geoPoints;
}