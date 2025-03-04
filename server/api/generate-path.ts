import { defineEventHandler, readBody } from 'h3';
import { mockPathGeneration, generateGpxFromCoordinates, calculatePathDistance } from '../utils/gpxGenerator';

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
    }
    
    // Convert drawing points to a geographically plausible route
    const coordinates = mockPathGeneration(drawingPoints, maxDistance, userLocation);
    
    // Calculate the actual distance of the generated path
    const distance = calculatePathDistance(coordinates);
    const formattedDistance = `${distance.toFixed(2)} km`;
    
    // Generate GPX file from the coordinates
    const gpxContent = generateGpxFromCoordinates(coordinates);

    // Return both the coordinates (for displaying on map) and GPX (for download)
    return {
      success: true,
      coordinates: coordinates,
      gpxContent: gpxContent,
      distance: formattedDistance
    };
  } catch (error) {
    console.error('Error generating path:', error);
    return {
      statusCode: 500,
      body: { message: 'Failed to generate path', error: String(error) }
    };
  }
});