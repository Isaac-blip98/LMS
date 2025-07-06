import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../Services/admin.service';

@Component({
  selector: 'app-admin-analytics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-analytics.component.html',
  styleUrls: ['./admin-analytics.component.css']
})
export class AdminAnalyticsComponent implements OnInit {
  popularCourses: any[] = [];
  dashboardStats: any = null;
  loading = false;
  error: string | null = null;

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.fetchAnalytics();
  }

  fetchAnalytics() {
    this.loading = true;
    this.error = null;
    // Fetch both in parallel
    this.adminService.getPopularCourses().subscribe({
      next: (data) => { this.popularCourses = data; },
      error: () => { this.error = 'Failed to load popular courses.'; }
    });
    this.adminService.getDashboardStats().subscribe({
      next: (data) => { this.dashboardStats = data; this.loading = false; },
      error: () => { this.error = 'Failed to load dashboard stats.'; this.loading = false; }
    });
  }
} 