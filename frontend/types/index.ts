export type PinStatus = 'available' | 'claimed' | 'picked_up' | 'completed';

export interface ILocation
{
    lat: number;
    lng: number;
    address?: string;
}

export interface IPin
{
    pinId: string;
    submissionId?: string;
    creatorId: string;
    collectorId?: string;
    location: ILocation;
    bottleCount: number;
    estimatedValue: number;
    imageUrl?: string;
    status: PinStatus;
    claimExpiry?: number;
    createdAt: number;
    completedAt?: number;
}

export interface IUser
{
    userId: string;
    name: string;
    phoneNumber?: string;
    reputation: number;
    totalPickups: number;
    createdAt: number;
}

export interface ICreatePinRequest
{
    bottleCount: number;
    location: ILocation;
    imageUrl?: string;
}

export interface INearbyPinsRequest
{
    lat: number;
    lng: number;
    radius: number;
}

export interface IAPIResponse<T>
{
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}
