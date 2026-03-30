import { AuthResponse } from '../../models/auth-response.model';

export const MOCK_AUTH_RESPONSE: AuthResponse = {
    token: 'fake-jwt-token',
    email: 'test@example.com',
    role: 'PATIENT'
};

// A simulated Base64 encoded JWT payload for Patient role
// {"sub":"test@example.com","role":"PATIENT","exp":2524608000} (Year 2050)
export const MOCK_TOKEN_PATIENT = 'header.' + btoa(JSON.stringify({ 
    sub: 'test@example.com', 
    role: 'PATIENT', 
    id: 101,
    exp: 2524608000 
})) + '.signature';

// A simulated Base64 encoded JWT payload for Nutritionist role
export const MOCK_TOKEN_NUTRITIONIST = 'header.' + btoa(JSON.stringify({ 
    sub: 'nutri@example.com', 
    role: 'NUTRITIONIST', 
    id: 202,
    exp: 2524608000 
})) + '.signature';

// A simulated expired token
export const MOCK_TOKEN_EXPIRED = 'header.' + btoa(JSON.stringify({ 
    sub: 'test@example.com', 
    role: 'PATIENT', 
    id: 101,
    exp: Math.floor(Date.now() / 1000) - 3600 // 1 hour ago
})) + '.signature';
