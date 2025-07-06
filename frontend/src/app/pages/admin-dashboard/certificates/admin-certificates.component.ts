import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../Services/admin.service';

@Component({
  selector: 'app-admin-certificates',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-certificates.component.html',
  styleUrls: ['./admin-certificates.component.css']
})
export class AdminCertificatesComponent implements OnInit {
  certificateStats: any = null;
  loading = false;
  error: string | null = null;

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.fetchCertificateStats();
  }

  fetchCertificateStats() {
    this.loading = true;
    this.adminService.getCertificateStats('').subscribe({ // Pass instructorId if needed
      next: (data) => {
        this.certificateStats = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load certificate stats.';
        this.loading = false;
      }
    });
  }
} 