export const MAPS_CONFIG = {
    provider: 'google' as 'google',

    google: {
		apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY || '',
    },
};

export const getMapConfig = () =>
{
    return {
        provider: MAPS_CONFIG.provider,
        apiKey: MAPS_CONFIG.google.apiKey,
    };
};
