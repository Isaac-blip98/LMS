import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../Services/admin.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin-enrollments',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-enrollments.component.html',
  styleUrls: ['./admin-enrollments.component.css']
})
export class AdminEnrollmentsComponent implements OnInit {
  enrollments: any[] = [];
  loading = false;
  error: string | null = null;

  // Modal state
  showViewModal = false;
  showIssueModal = false;
  selectedEnrollment: any = null;
  issueInProgress = false;
  issueSuccess: string | null = null;
  issueError: string | null = null;

  // Certificate file upload state
  selectedCertificateFile: File | null = null;
  certificateUploadInProgress = false;
  certificateUploadUrl: string | null = null;
  certificateUploadError: string | null = null;

  constructor(private adminService: AdminService, private http: HttpClient) {}

  ngOnInit() {
    this.fetchEnrollments();
  }

  fetchEnrollments() {
    this.loading = true;
    this.adminService.getAllEnrollments().subscribe({
      next: (data) => {
        this.enrollments = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load enrollments.';
        this.loading = false;
      }
    });
  }

  viewEnrollment(enrollment: any) {
    this.selectedEnrollment = enrollment;
    this.showViewModal = true;
  }

  closeViewModal() {
    this.showViewModal = false;
    this.selectedEnrollment = null;
  }

  openIssueCertificateModal(enrollment: any) {
    this.selectedEnrollment = enrollment;
    this.showIssueModal = true;
    this.issueSuccess = null;
    this.issueError = null;
    this.selectedCertificateFile = null;
    this.certificateUploadUrl = null;
    this.certificateUploadError = null;
    this.certificateUploadInProgress = false;
  }

  closeIssueModal() {
    this.showIssueModal = false;
    this.selectedEnrollment = null;
    this.issueSuccess = null;
    this.issueError = null;
    this.selectedCertificateFile = null;
    this.certificateUploadUrl = null;
    this.certificateUploadError = null;
    this.certificateUploadInProgress = false;
  }

  onCertificateFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    this.selectedCertificateFile = file;
    this.certificateUploadInProgress = true;
    this.certificateUploadError = null;
    this.certificateUploadUrl = null;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'certificates');

    this.http.post('http://localhost:3000/cloudinary/upload', formData).subscribe({
      next: (res: any) => {
        this.certificateUploadUrl = res.url;
        this.certificateUploadInProgress = false;
      },
      error: (err) => {
        this.certificateUploadError = 'Failed to upload certificate file.';
        this.certificateUploadInProgress = false;
      }
    });
  }

  issueCertificate() {
    if (!this.selectedEnrollment || !this.certificateUploadUrl) return;
    this.issueInProgress = true;
    this.issueSuccess = null;
    this.issueError = null;
    this.adminService.issueCertificate({
      userId: this.selectedEnrollment.userId,
      courseId: this.selectedEnrollment.courseId,
      certificateUrl: this.certificateUploadUrl
    }).subscribe({
      next: () => {
        this.issueSuccess = 'Certificate issued successfully!';
        this.issueInProgress = false;
        this.fetchEnrollments();
      },
      error: () => {
        this.issueError = 'Failed to issue certificate.';
        this.issueInProgress = false;
      }
    });
  }
} 