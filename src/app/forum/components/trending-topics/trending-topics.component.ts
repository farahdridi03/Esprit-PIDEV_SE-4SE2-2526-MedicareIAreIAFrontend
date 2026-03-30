import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ForumService } from '../../services/forum.service';

@Component({
  selector: 'app-trending-topics',
  templateUrl: './trending-topics.component.html',
  styleUrls: ['./trending-topics.component.scss']
})
export class TrendingTopicsComponent implements OnInit {
  trendingCategories: any[] = [];
  loading = true;

  @Output() categorySelected = new EventEmitter<string>();

  constructor(private forumService: ForumService) {}

  ngOnInit(): void {
    this.loadTrendingCategories();
  }

  loadTrendingCategories(): void {
    this.loading = true;
    this.forumService.getTrendingCategories().subscribe({
      next: (data) => {
        this.trendingCategories = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading trending categories', err);
        this.loading = false;
      }
    });
  }

  onCategoryClick(category: string): void {
    this.categorySelected.emit(category);
  }

  getCategoryIcon(category: string): string {
    switch (category) {
      case 'General Health': return 'fa-heartbeat';
      case 'Medications': return 'fa-pills';
      case 'Nutrition': return 'fa-apple-alt';
      case 'Treatments': return 'fa-stethoscope';
      default: return 'fa-tag';
    }
  }
}
