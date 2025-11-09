import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View } from 'react-native';

export default function IndexScreen()
{
    const router = useRouter();

    useEffect(() =>
    {
        const timeout = setTimeout(() =>
        {
            router.replace('/splash');
        }, 0);

        return () => clearTimeout(timeout);
    }, []);

    return <View style={{ flex: 1 }} />;
}
