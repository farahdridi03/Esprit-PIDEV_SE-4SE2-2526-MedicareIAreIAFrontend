export interface AuthResponse {
  token: string;
  type?: string;
  id?: number;
  email?: string;
  role?: string;
  fullName?: string;
}
