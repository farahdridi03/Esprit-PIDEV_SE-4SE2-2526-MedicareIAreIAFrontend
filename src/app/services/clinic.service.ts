import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

export interface Clinic {
  id: number;
  name: string;
  address: string;
  verified: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ClinicService {
  private apiUrl = 'http://localhost:8081/springsecurity/api/clinics';

  constructor(private http: HttpClient) {}

  getAllClinics(): Observable<Clinic[]> {
    return this.http.get<Clinic[]>(this.apiUrl).pipe(
      tap((data: Clinic[]) => console.log('[DEBUG] Cliniques Angular:', data.length, data)),
      catchError((err: any) => {
        console.error('[ERROR] getClinics échoué:', err.status, err.message);
        return of([]);
      })
    );
  }
}
