export interface UserResponseDTO {
    id: number;
    fullName: string;
    email: string;
    role: string;
    enabled: boolean;
    phone?: string;
    birthDate?: string;
    pharmacyId?: number;
    pharmacyName?: string;
}


export interface UserRequestDTO {
    fullName: string;
    email: string;
    password?: string;
    role: string;
    phone?: string;
    birthDate?: string;
}
