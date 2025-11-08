export const MAPS_CONFIG = {
    provider: 'geoapify' as 'geoapify' | 'osrm',

    geoapify: {
        apiKey: 'e8229c46cabe4b3bb15e4d6e6f07f3bc',
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
