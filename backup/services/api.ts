import { IAPIResponse } from '../types';


const API_BASE_URL = 'http://98.92.69.158:5000';

interface ILocationData
{
    lat: number;
    lng: number;
    submission_id?: string;
}

interface IUploadResponse
{
    message: string;
    submission_id: string;
    s3_key: string;
    ip: string;
}

interface ILocationResponse
{
    message: string;
    count: number;
    locations: ILocationData[];
}

interface IS3InfoResponse
{
    message: string;
    submission_id: string;
    s3_key: string;
    location: string;
    user_id: number;
}

export const apiService = {
    async uploadPin(imageUri: string, location: ILocationData, userId?: number): Promise<IAPIResponse<IUploadResponse>>
    {
        console.log('[API] uploadPin - Request started', {
            location,
            userId,
            imageUri: imageUri.substring(0, 50) + '...',
        });

        try
        {
            const formData = new FormData();

            const filename = imageUri.split('/').pop() || 'photo.jpg';
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : 'image/jpeg';

            formData.append('image', {
                uri: imageUri,
                name: filename,
                type: type,
            } as any);

            formData.append('location', `${location.lat},${location.lng}`);

            if (userId)
            {
                formData.append('user_id', userId.toString());
            }

            console.log('[API] uploadPin - Sending to', `${API_BASE_URL}/upload`);

            const response = await fetch(`${API_BASE_URL}/upload`, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            console.log('[API] uploadPin - Response:', {
                status: response.status,
                ok: response.ok,
                data,
            });

            if (!response.ok)
            {
                console.error('[API] uploadPin - Failed:', data.error);
                return {
                    success: false,
                    error: data.error || 'Upload failed',
                };
            }

            console.log('[API] uploadPin - Success');
            return {
                success: true,
                data: data,
            };
        }
        catch (error)
        {
            console.error('[API] uploadPin - Error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Network error',
            };
        }
    },

    async getActiveLocations(): Promise<IAPIResponse<ILocationResponse>>
    {
        console.log('[API] getActiveLocations - Request started');

        try
        {
            console.log('[API] getActiveLocations - Sending to', `${API_BASE_URL}/locations`);

            const response = await fetch(`${API_BASE_URL}/locations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            console.log('[API] getActiveLocations - Response status:', response.status);

            // Check if response is JSON
            const contentType = response.headers.get('content-type');
            console.log('[API] getActiveLocations - Content-Type:', contentType);

            if (!contentType || !contentType.includes('application/json'))
            {
                const text = await response.text();
                console.error('[API] getActiveLocations - Non-JSON response:', text.substring(0, 500));
                return {
                    success: false,
                    error: `Server returned non-JSON response (${response.status}). Check backend logs.`,
                };
            }

            const data = await response.json();

            console.log('[API] getActiveLocations - Response:', {
                status: response.status,
                ok: response.ok,
                count: data.count,
                locations: data.locations,
            });

            if (!response.ok)
            {
                console.error('[API] getActiveLocations - Failed:', data.error);
                return {
                    success: false,
                    error: data.error || 'Failed to fetch locations',
                };
            }

            console.log('[API] getActiveLocations - Success:', data.count, 'locations');
            return {
                success: true,
                data: data,
            };
        }
        catch (error)
        {
            console.error('[API] getActiveLocations - Error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Network error',
            };
        }
    },

    async getS3Info(submissionId: string): Promise<IAPIResponse<IS3InfoResponse>>
    {
        console.log('[API] getS3Info - Request started', { submissionId });

        try
        {
            console.log('[API] getS3Info - Sending to', `${API_BASE_URL}/s3info`);

            const response = await fetch(`${API_BASE_URL}/s3info`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    submission_id: submissionId,
                }),
            });

            const data = await response.json();

            console.log('[API] getS3Info - Response:', {
                status: response.status,
                ok: response.ok,
                data,
            });

            if (!response.ok)
            {
                console.error('[API] getS3Info - Failed:', data.error);
                return {
                    success: false,
                    error: data.error || 'Failed to fetch S3 info',
                };
            }

            console.log('[API] getS3Info - Success');
            return {
                success: true,
                data: data,
            };
        }
        catch (error)
        {
            console.error('[API] getS3Info - Error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Network error',
            };
        }
    },

    async checkDatabase(): Promise<IAPIResponse<any>>
    {
        console.log('[API] checkDatabase - Request started');

        try
        {
            console.log('[API] checkDatabase - Sending to', `${API_BASE_URL}/dbcheck`);

            const response = await fetch(`${API_BASE_URL}/dbcheck`);
            const data = await response.json();

            console.log('[API] checkDatabase - Response:', {
                status: response.status,
                ok: response.ok,
                data,
            });

            if (!response.ok)
            {
                console.error('[API] checkDatabase - Failed:', data.error);
                return {
                    success: false,
                    error: data.error || 'Database check failed',
                };
            }

            console.log('[API] checkDatabase - Success');
            return {
                success: true,
                data: data,
            };
        }
        catch (error)
        {
            console.error('[API] checkDatabase - Error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Network error',
            };
        }
    },

    async signup(name: string, email: string, password: string): Promise<IAPIResponse<{ message: string }>>
    {
        console.log('[API] signup - Request started', { name, email });

        try
        {
            console.log('[API] signup - Sending to', `${API_BASE_URL}/add_user`);

            const requestBody: any = {
                name,
                email,
                "": password,
            };

            const response = await fetch(`${API_BASE_URL}/add_user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            const data = await response.json();

            console.log('[API] signup - Response:', {
                status: response.status,
                ok: response.ok,
                data,
            });

            if (!response.ok)
            {
                console.error('[API] signup - Failed:', data.error);
                return {
                    success: false,
                    error: data.error || 'Signup failed',
                };
            }

            console.log('[API] signup - Success');
            return {
                success: true,
                data: data,
            };
        }
        catch (error)
        {
            console.error('[API] signup - Error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Network error',
            };
        }
    },

    async getUserSubmissions(userId: number): Promise<IAPIResponse<any>>
    {
        console.log('[API] getUserSubmissions - Request started', { userId });

        try
        {
            const allLocationsResponse = await this.getActiveLocations();

            if (!allLocationsResponse.success || !allLocationsResponse.data)
            {
                return allLocationsResponse;
            }

            const userSubmissions = [];
            for (const location of allLocationsResponse.data.locations)
            {
                if (location.submission_id)
                {
                    const s3InfoResponse = await this.getS3Info(location.submission_id);
                    console.log('[API] getUserSubmissions - Checking submission:', {
                        submission_id: location.submission_id,
                        s3_user_id: s3InfoResponse.data?.user_id,
                        requested_userId: userId,
                        match: s3InfoResponse.data?.user_id === userId,
                    });
                    if (s3InfoResponse.success && s3InfoResponse.data && s3InfoResponse.data.user_id === userId)
                    {
                        userSubmissions.push({
                            ...location,
                            ...s3InfoResponse.data,
                        });
                    }
                }
            }

            console.log('[API] getUserSubmissions - Success:', userSubmissions.length, 'submissions');
            return {
                success: true,
                data: {
                    submissions: userSubmissions,
                    count: userSubmissions.length,
                },
            };
        }
        catch (error)
        {
            console.error('[API] getUserSubmissions - Error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to fetch user submissions',
            };
        }
    },

    async markPinComplete(submissionId: string): Promise<IAPIResponse<{ message: string }>>
    {
        console.log('[API] markPinComplete - Request started', { submissionId });

        try
        {
            console.log('[API] markPinComplete - Sending to', `${API_BASE_URL}/set_active_status`);

            const response = await fetch(`${API_BASE_URL}/set_active_status`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    submission_id: submissionId,
                    is_active: false,
                }),
            });

            const data = await response.json();

            console.log('[API] markPinComplete - Response:', {
                status: response.status,
                ok: response.ok,
                data,
            });

            if (!response.ok)
            {
                console.error('[API] markPinComplete - Failed:', data.error);
                return {
                    success: false,
                    error: data.error || 'Failed to mark pin as complete',
                };
            }

            console.log('[API] markPinComplete - Success');
            return {
                success: true,
                data: data,
            };
        }
        catch (error)
        {
            console.error('[API] markPinComplete - Error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Network error',
            };
        }
    },

    async login(email: string, password: string): Promise<IAPIResponse<{ message: string; user_id: number; name: string; email: string }>>
    {
        console.log('[API] login - Request started', { email });

        try
        {
            console.log('[API] login - Sending to', `${API_BASE_URL}/check_user`);

            const response = await fetch(`${API_BASE_URL}/check_user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password,
                }),
            });

            const data = await response.json();

            console.log('[API] login - Response:', {
                status: response.status,
                ok: response.ok,
                data,
            });

            if (!response.ok)
            {
                console.error('[API] login - Failed:', data.error);
                return {
                    success: false,
                    error: data.error || 'Login failed',
                };
            }

            console.log('[API] login - Success');
            return {
                success: true,
                data: data,
            };
        }
        catch (error)
        {
            console.error('[API] login - Error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Network error',
            };
        }
    },
};
