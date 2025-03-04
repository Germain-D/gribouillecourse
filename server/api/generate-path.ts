import { defineEventHandler, readBody } from 'h3';
import { mockPathGeneration, generateGpxFromCoordinates } from '../utils/gpxGenerator';

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
    
    if (drawingPoints.length < 2) {
      return {
        statusCode: 400,
        body: { message: 'At least two points are required to generate a path' }
      };
    }

    // Log the received points to help debugging
    console.log(`Received ${drawingPoints.length} points for path generation`);
    
    // Convert drawing points to a geographically plausible route
    // This would normally call an external API like MapBox or Google Maps Directions
    // For now, we'll use our mock implementation
    const coordinates = mockPathGeneration(drawingPoints);
    
    // Generate GPX file from the coordinates
    const gpxContent = generateGpxFromCoordinates(coordinates);

    // Return both the coordinates (for displaying on map) and GPX (for download)
    return {
      success: true,
      coordinates: coordinates,
      gpxContent: gpxContent
    };
  } catch (error) {
    console.error('Error generating path:', error);
    return {
      statusCode: 500,
      body: { message: 'Failed to generate path', error: String(error) }
    };
  }
});