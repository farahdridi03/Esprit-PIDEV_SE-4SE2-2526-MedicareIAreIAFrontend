import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Donation, AidRequest, DonationAssignment } from '../models/donation.model';

@Injectable({
  providedIn: 'root'
})
export class DonationService {
  private apiUrl = 'http://localhost:8081/springsecurity/api/donations';
  private aidApiUrl = 'http://localhost:8081/springsecurity/api/aid-requests';

  constructor(private http: HttpClient) { }

  getAllDonations(): Observable<Donation[]> {
    return this.http.get<Donation[]>(this.apiUrl);
  }

  createDonation(donation: Donation): Observable<Donation> {
    // La chaîne Base64 est déjà présente dans donation.imageData
    return this.http.post<Donation>(this.apiUrl, donation);
  }

  updateDonation(id: number, donation: Partial<Donation>): Observable<Donation> {
    return this.http.put<Donation>(`${this.apiUrl}/${id}`, donation);
  }

  deleteDonation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getAidRequestsByPatient(patientId: number): Observable<AidRequest[]> {
    return this.http.get<AidRequest[]>(`${this.aidApiUrl}/patient/${patientId}`);
  }

  getAllAidRequests(): Observable<AidRequest[]> {
    return this.http.get<AidRequest[]>(this.aidApiUrl);
  }

  createAidRequest(request: Partial<AidRequest>): Observable<AidRequest> {
    return this.http.post<AidRequest>(this.aidApiUrl, request);
  }

  deleteAidRequest(id: number): Observable<void> {
    return this.http.delete<void>(`${this.aidApiUrl}/${id}`);
  }

  updateAidRequest(id: number, request: Partial<AidRequest>): Observable<AidRequest> {
    return this.http.put<AidRequest>(`${this.aidApiUrl}/${id}`, request);
  }

  updateAidRequestStatus(id: number, status: string): Observable<AidRequest> {
    // backend: PUT /api/aid-requests/{id}/status?status=REJECTED
    return this.http.put<AidRequest>(`${this.aidApiUrl}/${id}/status`, null, {
      params: { status }
    });
  }

  assignDonation(assignment: { donationId: number; aidRequestId: number }): Observable<DonationAssignment> {
    // backend endpoint: POST /api/donations/assign
    return this.http.post<DonationAssignment>(`${this.apiUrl}/assign`, assignment);
  }

  // GET /api/aid-requests/status/{status}  ← AidRequestRepository.findByStatus
  getAidRequestsByStatus(status: string): Observable<AidRequest[]> {
    return this.http.get<AidRequest[]>(`${this.aidApiUrl}/status/${status}`);
  }

  // GET /api/donations/{donationId}/assignments  ← DonationAssignmentRepository.findByDonationId
  getAssignmentsByDonationId(donationId: number): Observable<DonationAssignment[]> {
    return this.http.get<DonationAssignment[]>(`${this.apiUrl}/${donationId}/assignments`);
  }

  // GET /api/donations/assignments/aid-request/{aidRequestId}  ← DonationAssignmentRepository.findByAidRequestId
  getAssignmentsByAidRequestId(aidRequestId: number): Observable<DonationAssignment[]> {
    return this.http.get<DonationAssignment[]>(`${this.apiUrl}/assignments/aid-request/${aidRequestId}`);
  }

  // GET /api/donations/patient/{patientId}/assigned  ← DonationAssignmentRepository.findDonationsByPatientIdAndStatus
  getDonationsByPatientAndStatus(patientId: number, status: string): Observable<Donation[]> {
    return this.http.get<Donation[]>(`${this.apiUrl}/patient/${patientId}/assigned`, {
      params: { status }
    });
  }
}
