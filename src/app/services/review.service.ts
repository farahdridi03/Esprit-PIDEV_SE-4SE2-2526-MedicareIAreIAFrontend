import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Review } from '../models/review.model';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private apiUrl = 'http://localhost:8081/springsecurity/api/v1/doctors';

  constructor(private http: HttpClient) {}

  getReviews(doctorId: number): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/${doctorId}/reviews`);
  }

  addReview(doctorId: number, rating: number, comment: string): Observable<Review> {
    return this.http.post<Review>(`${this.apiUrl}/${doctorId}/reviews`, { rating, comment });
  }
}
