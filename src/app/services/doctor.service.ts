import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DoctorProfile {
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
export class DoctorService {
  private apiUrl = 'http://localhost:8081/springsecurity/api/v1/doctors';

  constructor(private http: HttpClient) {}

  getProfile(id: number): Observable<DoctorProfile> {
    return this.http.get<DoctorProfile>(`${this.apiUrl}/${id}/profile`);
  }

  updateProfile(id: number, profile: any): Observable<DoctorProfile> {
    return this.http.put<DoctorProfile>(`${this.apiUrl}/${id}/profile`, profile);
  }

  getDoctors(): Observable<DoctorProfile[]> {
    return this.http.get<DoctorProfile[]>(this.apiUrl);
  }

  getDoctor(id: number): Observable<DoctorProfile> {
    return this.http.get<DoctorProfile>(`${this.apiUrl}/${id}`);
  }

  getAvailableSlots(doctorId: number, date: string): Observable<any[]> {
    // date should be 'YYYY-MM-DD'
    const from = `${date}T00:00:00`;
    const to = `${date}T23:59:59`;
    return this.http.get<any[]>(`http://localhost:8081/springsecurity/api/v1/providers/${doctorId}/availabilities?from=${from}&to=${to}`);
  }

  getMonthAvailabilities(doctorId: number, fromDate: string, toDate: string): Observable<any[]> {
    const from = `${fromDate}T00:00:00`;
    const to = `${toDate}T23:59:59`;
    return this.http.get<any[]>(`http://localhost:8081/springsecurity/api/v1/providers/${doctorId}/availabilities?from=${from}&to=${to}`);
  }
}
