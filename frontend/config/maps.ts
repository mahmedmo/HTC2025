export const MAPS_CONFIG = {
    provider: 'geoapify' as 'geoapify' | 'osrm',

    geoapify: {
		apiKey: process.env.EXPO_PUBLIC_GEOAPIFY_KEY || '',
        tileUrl: 'https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=',
    },

    osrm: {
        routingUrl: 'https://router.project-osrm.org/route/v1/driving',
    },
};

export const getMapConfig = () =>
{
    return {
        provider: MAPS_CONFIG.provider,
        apiKey: MAPS_CONFIG.geoapify.apiKey,
        tileUrl: MAPS_CONFIG.geoapify.tileUrl,
        routingUrl: MAPS_CONFIG.provider === 'geoapify'
            ? 'https://api.geoapify.com/v1/routing'
            : MAPS_CONFIG.osrm.routingUrl,
    };
};
