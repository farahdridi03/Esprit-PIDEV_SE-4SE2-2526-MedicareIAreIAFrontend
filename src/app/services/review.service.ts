import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Review } from '../models/review.model';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private baseUrl = 'http://localhost:8081/springsecurity/api/v1';

  constructor(private http: HttpClient) {}

  getReviews(doctorId: number): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.baseUrl}/doctors/${doctorId}/reviews`);
  }

  getReviewsByDoctor(doctorId: number): Observable<Review[]> {
    console.log(`[ReviewService] Fetching reviews for doctor ID: ${doctorId}`);
    return this.http.get<Review[]>(`${this.baseUrl}/doctors/${doctorId}/reviews`);
  }

  addReview(doctorId: number, rating: number, comment: string, isAnonymous: boolean): Observable<Review> {
    return this.http.post<Review>(`${this.baseUrl}/doctors/${doctorId}/reviews`, { rating, comment, isAnonymous });
  }

  deleteReview(doctorId: number, reviewId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/doctors/${doctorId}/reviews/${reviewId}`);
  }

  updateReview(doctorId: number, reviewId: number, rating: number, comment: string, isAnonymous: boolean): Observable<Review> {
    return this.http.put<Review>(`${this.baseUrl}/doctors/${doctorId}/reviews/${reviewId}`, { rating, comment, isAnonymous });
  }
}
