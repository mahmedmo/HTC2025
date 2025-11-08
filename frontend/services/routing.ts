import { MAPS_CONFIG } from '../config/maps';

interface IRoutePoint
{
    latitude: number;
    longitude: number;
}

interface IRouteResult
{
    distance: number;
    duration: number;
    coordinates: IRoutePoint[];
}

export const getRoute = async (
    origin: IRoutePoint,
    destination: IRoutePoint
): Promise<IRouteResult | null> =>
{
    try
    {
        if (MAPS_CONFIG.provider === 'geoapify')
        {
            return await getGeoapifyRoute(origin, destination);
        }
        else
        {
            return await getOSRMRoute(origin, destination);
        }
    }
    catch (error)
    {
        console.error('Routing error:', error);
        return null;
    }
};

const getGeoapifyRoute = async (
    origin: IRoutePoint,
    destination: IRoutePoint
): Promise<IRouteResult> =>
{
    const url = `https://api.geoapify.com/v1/routing?waypoints=${origin.latitude},${origin.longitude}|${destination.latitude},${destination.longitude}&mode=drive&apiKey=${MAPS_CONFIG.geoapify.apiKey}`;

    const response = await fetch(url);

    if (!response.ok)
    {
        throw new Error(`Geoapify API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.features || data.features.length === 0)
    {
        throw new Error('No route found');
    }

    const route = data.features[0];

    if (!route.geometry || !route.geometry.coordinates)
    {
        throw new Error('Invalid route geometry');
    }

    let coordsList = route.geometry.coordinates;

    if (Array.isArray(coordsList[0]) && Array.isArray(coordsList[0][0]))
    {
        coordsList = coordsList[0];
    }

    const coordinates = coordsList.map((coord: number[]) => ({
        latitude: coord[1],
        longitude: coord[0],
    }));

    return {
        distance: route.properties.distance,
        duration: route.properties.time / 60,
        coordinates,
    };
};

const getOSRMRoute = async (
    origin: IRoutePoint,
    destination: IRoutePoint
): Promise<IRouteResult> =>
{
    const url = `https://router.project-osrm.org/route/v1/driving/${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}?geometries=geojson&overview=full`;

    const response = await fetch(url);

    if (!response.ok)
    {
        throw new Error(`OSRM API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.routes || data.routes.length === 0)
    {
        throw new Error('No route found');
    }

    const route = data.routes[0];
    const coordinates = route.geometry.coordinates.map((coord: number[]) => ({
        latitude: coord[1],
        longitude: coord[0],
    }));

    return {
        distance: route.distance,
        duration: route.duration / 60,
        coordinates,
    };
};
