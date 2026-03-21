import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class EmergencyService {
    private base = 'http://localhost:8081/springsecurity/api';

    constructor(private http: HttpClient) { }

    getAllAlerts(): Observable<any[]> {
        return this.http.get<any[]>(`${this.base}/emergency-alerts`);
    }

    cancelAlert(id: number): Observable<any> {
        return this.http.put<any>(`${this.base}/emergency-alerts/${id}/cancel`, {});
    }
}
