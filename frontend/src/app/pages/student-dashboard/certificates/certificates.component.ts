import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Sidebar } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../../../core/layout/header/header.component';
import { StudentService, Certificate } from '../../../Services/student.service';
import { AuthService } from '../../../Services/auth.service';

@Component({
  selector: 'app-student-certificates',
  standalone: true,
  imports: [CommonModule, RouterModule, Sidebar, HeaderComponent],
  templateUrl: './certificates.component.html',
})
export class StudentCertificatesComponent implements OnInit {
  certificates: Certificate[] = [];
  isLoading = true;
  error: string | null = null;

  constructor(
    private studentService: StudentService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadCertificates();
  }

  // Computed properties for template
  get averageGrade(): number {
    if (this.certificates.length === 0) return 0;
    const totalGrade = this.certificates.reduce((sum, cert) => sum + cert.grade, 0);
    return Number((totalGrade / this.certificates.length).toFixed(1));
  }

  get latestCertificateDate(): string {
    if (this.certificates.length === 0) return 'N/A';
    return this.formatDate(this.certificates[0].issuedAt);
  }

  loadCertificates() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser?.id) {
      this.error = 'User not authenticated';
      this.isLoading = false;
      return;
    }

    this.studentService.getMyCertificates(currentUser.id).subscribe({
      next: (certificates: Certificate[]) => {
        this.certificates = certificates || [];
        this.error = null; // Clear any previous errors
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading certificates:', error);
        // Only show error for actual API failures, not for empty data
        if (error.status === 404 || error.status === 0) {
          // No certificates found - this is normal for new students
          this.certificates = [];
          this.error = null;
        } else {
          this.error = 'Failed to load certificates. Please try again later.';
        }
        this.isLoading = false;
      }
    });
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getGradeColor(grade: number): string {
    if (grade >= 90) return 'text-green-600';
    if (grade >= 80) return 'text-blue-600';
    if (grade >= 70) return 'text-yellow-600';
    return 'text-red-600';
  }

  getGradeBadgeColor(grade: number): string {
    if (grade >= 90) return 'bg-green-100 text-green-800';
    if (grade >= 80) return 'bg-blue-100 text-blue-800';
    if (grade >= 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  }

  downloadCertificate(certificate: Certificate) {
    // In a real implementation, this would trigger a download
    console.log('Downloading certificate:', certificate.certificateUrl);
    // You could use window.open(certificate.certificateUrl) or create a download link
  }

  shareCertificate(certificate: Certificate) {
    // In a real implementation, this would open sharing options
    console.log('Sharing certificate:', certificate.id);
    // You could implement social media sharing or copy link functionality
  }
} 