import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface NutritionistProfile {
  id: number;
  fullName: string;
  email: string;
  specialty?: string;
  licenseNumber: string;
  yearsOfExperience?: number;
  consultationFee?: number;
  consultationMode?: 'ONLINE' | 'IN_PERSON' | 'BOTH';
  clinicAddress?: string;
  clinicId?: number;
  clinicName?: string;
  isProfileComplete: boolean;
  bio?: string;
  patientCount?: number;
  rating?: number;
  profilePicture?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NutritionistService {
  private apiUrl = 'http://localhost:8081/springsecurity/api/nutritionists';

  constructor(private http: HttpClient) {}

  getProfile(id: number): Observable<NutritionistProfile> {
    return this.http.get<NutritionistProfile>(`${this.apiUrl}/${id}/profile`);
  }

  getMe(): Observable<NutritionistProfile> {
    return this.http.get<NutritionistProfile>(`${this.apiUrl}/me`);
  }

  updateProfile(profile: any): Observable<NutritionistProfile> {
    return this.http.put<NutritionistProfile>(`${this.apiUrl}/profile`, profile);
  }

  updateProfileById(id: number, profile: any): Observable<NutritionistProfile> {
    return this.http.put<NutritionistProfile>(`${this.apiUrl}/${id}/profile`, profile);
  }

  getNutritionists(): Observable<NutritionistProfile[]> {
    return this.http.get<NutritionistProfile[]>(this.apiUrl);
  }

  getNutritionist(id: number): Observable<NutritionistProfile> {
    return this.http.get<NutritionistProfile>(`${this.apiUrl}/${id}`);
  }

  getAvailableSlots(NutritionistId: number, date: string): Observable<any[]> {
    // date should be 'YYYY-MM-DD'
    const from = `${date}T00:00:00`;
    const to = `${date}T23:59:59`;
    return this.http.get<any[]>(`http://localhost:8081/springsecurity/api/v1/providers/${NutritionistId}/availabilities?from=${from}&to=${to}`);
  }

  getMonthAvailabilities(NutritionistId: number, fromDate: string, toDate: string): Observable<any[]> {
    const from = `${fromDate}T00:00:00`;
    const to = `${toDate}T23:59:59`;
    return this.http.get<any[]>(`http://localhost:8081/springsecurity/api/v1/providers/${NutritionistId}/availabilities?from=${from}&to=${to}`);
  }
}
