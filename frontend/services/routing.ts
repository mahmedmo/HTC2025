import { MAPS_CONFIG } from '../config/maps';

export type TravelMode = 'driving' | 'walking' | 'bicycling';

interface IRoutePoint
{
    latitude: number;
    longitude: number;
}

interface INavigationStep
{
    instruction: string;
    distance: number;
    duration: number;
    startLocation: IRoutePoint;
    endLocation: IRoutePoint;
    maneuver?: string;
}

interface IRouteResult
{
    distance: number;
    duration: number;
    coordinates: IRoutePoint[];
    steps?: INavigationStep[];
}

// Cache for route requests
const routeCache = new Map<string, { result: IRouteResult; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const pendingRequests = new Map<string, Promise<IRouteResult | null>>();

const getCacheKey = (origin: IRoutePoint, destination: IRoutePoint, mode: TravelMode): string =>
{
    return `${mode}-${origin.latitude.toFixed(4)},${origin.longitude.toFixed(4)}-${destination.latitude.toFixed(4)},${destination.longitude.toFixed(4)}`;
};

export const getRoute = async (
    origin: IRoutePoint,
    destination: IRoutePoint,
    mode: TravelMode = 'driving'
): Promise<IRouteResult | null> =>
{
    const cacheKey = getCacheKey(origin, destination, mode);

    // Check cache first
    const cached = routeCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION)
    {
        return cached.result;
    }

    // Check if request is already in progress
    const pending = pendingRequests.get(cacheKey);
    if (pending)
    {
        return pending;
    }

    // Create new request
    const requestPromise = (async () =>
    {
        try
        {
            const result = await getGoogleRoute(origin, destination, mode);

            // Cache successful result
            if (result)
            {
                routeCache.set(cacheKey, { result, timestamp: Date.now() });
            }

            return result;
        }
        catch (error)
        {
            console.error('Routing error:', error);

            // Provide helpful error messages
            if (error instanceof Error)
            {
                if (error.message.includes('REQUEST_DENIED'))
                {
                    console.error('Google Maps API Key issue: Make sure Directions API is enabled in Google Cloud Console');
                }
                else if (error.message.includes('OVER_QUERY_LIMIT'))
                {
                    console.error('API quota exceeded: Too many requests');
                }
            }

            return null;
        }
        finally
        {
            pendingRequests.delete(cacheKey);
        }
    })();

    pendingRequests.set(cacheKey, requestPromise);
    return requestPromise;
};

const getGoogleRoute = async (
    origin: IRoutePoint,
    destination: IRoutePoint,
    mode: TravelMode
): Promise<IRouteResult> =>
{
    const apiKey = MAPS_CONFIG.google.apiKey;

    if (!apiKey)
    {
        throw new Error('Google Maps API key not configured. Add EXPO_PUBLIC_GOOGLE_MAPS_KEY to your .env file');
    }

    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&mode=${mode}&key=${apiKey}`;

    const response = await fetch(url);

    if (!response.ok)
    {
        throw new Error(`Google Maps API HTTP error: ${response.status}`);
    }

    const data = await response.json();

    if (data.status !== 'OK')
    {
        throw new Error(`Google Directions API error: ${data.status}${data.error_message ? ' - ' + data.error_message : ''}`);
    }

    if (!data.routes || data.routes.length === 0)
    {
        throw new Error('No route found between origin and destination');
    }

    const route = data.routes[0];
    const leg = route.legs[0];

    // Decode polyline from overview_polyline
    const polyline = route.overview_polyline.points;
    const coordinates = decodePolyline(polyline);

    // Parse navigation steps
    const steps: INavigationStep[] = leg.steps.map((step: any) => ({
        instruction: step.html_instructions.replace(/<[^>]*>/g, ''),
        distance: step.distance.value,
        duration: step.duration.value,
        startLocation: {
            latitude: step.start_location.lat,
            longitude: step.start_location.lng,
        },
        endLocation: {
            latitude: step.end_location.lat,
            longitude: step.end_location.lng,
        },
        maneuver: step.maneuver,
    }));

    return {
        distance: leg.distance.value,
        duration: leg.duration.value / 60,
        coordinates,
        steps,
    };
};

// Decode Google Maps encoded polyline
const decodePolyline = (encoded: string): IRoutePoint[] =>
{
    const points: IRoutePoint[] = [];
    let index = 0;
    let lat = 0;
    let lng = 0;

    while (index < encoded.length)
    {
        let result = 0;
        let shift = 0;
        let byte;

        do
        {
            byte = encoded.charCodeAt(index++) - 63;
            result |= (byte & 0x1f) << shift;
            shift += 5;
        } while (byte >= 0x20);

        const deltaLat = ((result & 1) ? ~(result >> 1) : (result >> 1));
        lat += deltaLat;

        result = 0;
        shift = 0;

        do
        {
            byte = encoded.charCodeAt(index++) - 63;
            result |= (byte & 0x1f) << shift;
            shift += 5;
        } while (byte >= 0x20);

        const deltaLng = ((result & 1) ? ~(result >> 1) : (result >> 1));
        lng += deltaLng;

        points.push({
            latitude: lat / 1e5,
            longitude: lng / 1e5,
        });
    }

    return points;
};
