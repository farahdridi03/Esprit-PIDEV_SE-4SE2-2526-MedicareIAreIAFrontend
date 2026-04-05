import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Donation, AidRequest, DonationAssignment } from '../models/donation.model';

@Injectable({
  providedIn: 'root'
})
export class DonationService {
  private apiUrl = 'http://localhost:8081/springsecurity/api/donations';
  private aidApiUrl = 'http://localhost:8081/springsecurity/api/aid-requests';

  constructor(private http: HttpClient) { }

  getAllDonations(): Observable<Donation[]> {
    return this.http.get<Donation[]>(this.apiUrl).pipe(
      map(data => data ?? [])
    );
  }

  createDonation(donation: Partial<Donation>): Observable<Donation> {
    const payload = {
      donorName: donation.donorName,
      type: donation.type,
      amount: donation.amount ?? null,
      categorie: donation.categorie ?? null,
      description: donation.description ?? null,
      quantite: donation.quantite ?? null,
      imageData: donation.imageData ?? null,
      creatorId: donation.creatorId
    };
    return this.http.post<Donation>(this.apiUrl, payload);
  }

  updateDonation(id: number, donation: Partial<Donation>): Observable<Donation> {
    return this.http.put<Donation>(`${this.apiUrl}/${id}`, donation);
  }

  deleteDonation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getAidRequestsByPatient(patientId: number): Observable<AidRequest[]> {
    return this.http.get<AidRequest[]>(`${this.aidApiUrl}/patient/${patientId}`).pipe(
      map(data => data ?? [])
    );
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
}
