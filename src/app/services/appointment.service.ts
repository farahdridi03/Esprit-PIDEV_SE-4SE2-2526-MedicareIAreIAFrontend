import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppointmentDTO } from '../models/appointment.model';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private baseUrl = 'http://localhost:8081/springsecurity/api/v1';

  constructor(private http: HttpClient) {}

  getAllAppointments(): Observable<AppointmentDTO[]> {
    return this.http.get<AppointmentDTO[]>(`${this.baseUrl}/appointments`);
  }

  getPatientAppointments(patientId: number): Observable<AppointmentDTO[]> {
    return this.http.get<AppointmentDTO[]>(
      `${this.baseUrl}/appointments/patients/${patientId}/appointments`
    );
  }

  getDoctorAppointments(doctorId: number, date?: string): Observable<any[]> {
    let params = new HttpParams();
    if (date) {
      params = params.set('date', date);
    }
    return this.http.get<any[]>(`${this.baseUrl}/appointments/doctors/${doctorId}`, { params });
  }

  bookAppointment(payload: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/appointments`, payload);
  }

  cancelAppointment(id: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/appointments/${id}/cancel`, {});
  }

  confirmAppointment(id: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/appointments/${id}/confirm`, {});
  }

  startTeleconsultation(id: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/appointments/${id}/start-live`, {});
  }

  deleteAppointment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/appointments/${id}`);
  }

  completeAppointment(id: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/appointments/${id}/complete`, null);
  }
}
