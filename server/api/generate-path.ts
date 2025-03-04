import { defineEventHandler, readBody } from 'h3';
//import { generateGPX } from '../utils/gpxGenerator'; // Assuming you have a utility to generate GPX

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    
    if (!body || !body.path) {
        return {
            statusCode: 400,
            body: { message: 'Path data is required' }
        };
    }

    const pathData = body.path;

    // Here you would implement your logic to process the path data
    // For example, you might save it to a database or perform some calculations

    // Generate GPX from the path data
    const gpxFile = "gpx"//generateGPX(pathData);

    return {
        statusCode: 200,
        body: { gpx: gpxFile }
    };
});