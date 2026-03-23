import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Appointment {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  status: 'BOOKED' | 'CANCELLED' | 'COMPLETED' | 'RESCHEDULED';
  mode: 'ONLINE' | 'IN_PERSON';
  notes?: string;
  patientId: number;
  patientName: string;
  doctorId: number;
  doctorName: string;
  doctorSpecialty?: string;
  clinicName?: string;
  clinicAddress?: string;
  meetingLink?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private apiUrl = 'http://localhost:8081/springsecurity/api/v1/appointments';

  constructor(private http: HttpClient) {}

  getPatientAppointments(patientId: number): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`http://localhost:8081/springsecurity/api/v1/appointments/patients/${patientId}`);
  }

  getDoctorAppointments(doctorId: number, date?: string): Observable<Appointment[]> {
    let params = new HttpParams();
    if (date) {
      params = params.set('date', date);
    }
    return this.http.get<Appointment[]>(`http://localhost:8081/springsecurity/api/v1/appointments/doctors/${doctorId}`, { params });
  }

  cancelAppointment(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/cancel`, {});
  }
}
