import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  // Navigation items for admin sections
  navItems = [
    { label: 'Users', route: 'users', icon: 'people' },
    { label: 'Courses', route: 'courses', icon: 'menu_book' },
    { label: 'Analytics', route: 'analytics', icon: 'analytics' },
    { label: 'Enrollments', route: 'enrollments', icon: 'assignment_turned_in' },
    { label: 'Reviews', route: 'reviews', icon: 'rate_review' },
    { label: 'Certificates', route: 'certificates', icon: 'verified' }
  ];

  ngOnInit() {
    console.log('Admin Dashboard Component initialized');
  }
} 