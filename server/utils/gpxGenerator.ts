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
 * Transform canvas drawing points into a realistic-looking GPS route
 */
export function mockPathGeneration(points: Point[]): Coordinate[] {
  // Skip processing if too few points
  if (points.length < 2) {
    return [];
  }

  // Define a bounding box for our map (this would be configurable in a real app)
  // For this example, we'll use a region around Paris, France
  const MAP_BOUNDS = {
    minLat: 48.815, maxLat: 48.905, // Latitude range
    minLng: 2.25, maxLng: 2.42      // Longitude range
  };
  
  // Canvas dimensions
  const CANVAS_WIDTH = 800;  // Should match your canvas width
  const CANVAS_HEIGHT = 600; // Should match your canvas height

  // Select key points to reduce density (every 10th point)
  const keyPoints = points.filter((_, index) => index % 10 === 0 || index === points.length - 1);

  // Convert drawing points to geographic coordinates
  return keyPoints.map(point => {
    // Scale X,Y from canvas to latitude,longitude
    const lat = MAP_BOUNDS.maxLat - (point.y / CANVAS_HEIGHT) * (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat);
    const lng = MAP_BOUNDS.minLng + (point.x / CANVAS_WIDTH) * (MAP_BOUNDS.maxLng - MAP_BOUNDS.minLng);
    
    return { lat, lng };
  });
}