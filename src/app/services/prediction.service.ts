import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PredictionService {
  private readonly baseUrl = 'https://medicareaipi-cpb5b9gmfmgbaeg7.swedencentral-01.azurewebsites.net/springsecurity/api/predict';

  constructor(private http: HttpClient) { }

  predict(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl, data);
  }
}
