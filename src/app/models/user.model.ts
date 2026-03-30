export interface UserResponseDTO {
    id: number;
    fullName: string;
    email: string;
    role: string;
    enabled: boolean;
    phone?: string;
    birthDate?: string;
    photo?: string;
    profileImage?: string;
}

export interface UserRequestDTO {
    fullName: string;
    email: string;
    password?: string;
    role: string;
    phone?: string;
    birthDate?: string;
    photo?: string;
}
