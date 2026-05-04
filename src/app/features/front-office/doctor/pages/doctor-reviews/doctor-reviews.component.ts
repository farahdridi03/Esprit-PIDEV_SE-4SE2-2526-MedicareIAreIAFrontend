import { Component, OnInit, Input } from '@angular/core';
import { ReviewService } from '../../../../../services/review.service';
import { AuthService } from '../../../../../services/auth.service';
import { Review } from '../../../../../models/review.model';

export interface ReviewDTO extends Review {
  initials: string;
}

@Component({
  selector: 'app-doctor-reviews',
  templateUrl: './doctor-reviews.component.html',
  styleUrls: ['./doctor-reviews.component.scss']
})
export class DoctorReviewsComponent implements OnInit {
  @Input() isEmbedded: boolean = false;
  doctorId!: number;
  reviews: ReviewDTO[] = [];
  filteredReviews: ReviewDTO[] = [];
  averageRating: number = 0;
  loading: boolean = true;
  selectedFilter: number | 'all' = 'all';

  // Stats for the top cards
  stats = {
    total: 0,
    recommendRate: 100,
    thisMonthCount: 0,
    ratingDiff: '+0.2'
  };

  // Rating breakdown for the sidebar
  ratingDistribution = [
    { stars: 5, count: 0, percentage: 0 },
    { stars: 4, count: 0, percentage: 0 },
    { stars: 3, count: 0, percentage: 0 },
    { stars: 2, count: 0, percentage: 0 },
    { stars: 1, count: 0, percentage: 0 },
  ];

  constructor(
    private reviewService: ReviewService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.doctorId = this.authService.getUserId();
    
    if (this.doctorId) {
      this.loadReviews();
    } else {
      this.loading = false;
    }
  }

  loadReviews(): void {
    this.loading = true;
    this.reviewService.getReviewsByDoctor(this.doctorId).subscribe({
      next: (data) => {
        this.reviews = (data || []).map(r => ({
          ...r,
          initials: this.getInitials(r.patientName)
        }));
        
        this.applyFilter('all');
        this.calculateAnalytics();
        this.loading = false;
      },
      error: (err) => {
        console.error('[Reviews] API Error:', err);
        this.loading = false;
      }
    });
  }

  calculateAnalytics(): void {
    if (this.reviews.length === 0) {
      this.averageRating = 0;
      this.stats.total = 0;
      return;
    }

    this.stats.total = this.reviews.length;
    
    // Average
    const total = this.reviews.reduce((sum, r) => sum + r.rating, 0);
    this.averageRating = total / this.reviews.length;

    // Distribution
    this.ratingDistribution.forEach(dist => {
      dist.count = this.reviews.filter(r => Math.round(r.rating) === dist.stars).length;
      dist.percentage = (dist.count / this.reviews.length) * 100;
    });

    // This month count
    const now = new Date();
    this.stats.thisMonthCount = this.reviews.filter(r => {
      const d = new Date(r.createdAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;

    // Recommendation rate (mock: based on rating > 3)
    const positive = this.reviews.filter(r => r.rating >= 4).length;
    this.stats.recommendRate = Math.round((positive / this.reviews.length) * 100);
  }

  applyFilter(filter: number | 'all'): void {
    this.selectedFilter = filter;
    if (filter === 'all') {
      this.filteredReviews = [...this.reviews];
    } else {
      this.filteredReviews = this.reviews.filter(r => Math.round(r.rating) === filter);
    }
  }

  private getInitials(name: string): string {
    if (!name) return '??';
    return name.split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  getStars(rating: number): number[] {
    return [1, 2, 3, 4, 5];
  }

  timeAgo(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }
}
