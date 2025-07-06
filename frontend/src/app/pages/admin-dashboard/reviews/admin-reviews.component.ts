import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../Services/admin.service';

@Component({
  selector: 'app-admin-reviews',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-reviews.component.html',
  styleUrls: ['./admin-reviews.component.css']
})
export class AdminReviewsComponent implements OnInit {
  reviews: any[] = [];
  loading = false;
  error: string | null = null;

  // Modal state
  showEditModal = false;
  showDeleteModal = false;
  selectedReview: any = null;
  editInProgress = false;
  editSuccess: string | null = null;
  editError: string | null = null;
  deleteInProgress = false;
  deleteSuccess: string | null = null;
  deleteError: string | null = null;

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.fetchReviews();
  }

  fetchReviews() {
    this.loading = true;
    this.adminService.getAllReviews().subscribe({
      next: (data) => {
        this.reviews = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load reviews.';
        this.loading = false;
      }
    });
  }

  openEditModal(review: any) {
    this.selectedReview = { ...review };
    this.showEditModal = true;
    this.editSuccess = null;
    this.editError = null;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.selectedReview = null;
    this.editSuccess = null;
    this.editError = null;
  }

  saveReviewEdit() {
    if (!this.selectedReview) return;
    this.editInProgress = true;
    this.editSuccess = null;
    this.editError = null;
    this.adminService.updateReview(this.selectedReview.id, {
      rating: this.selectedReview.rating,
      comment: this.selectedReview.comment
    }).subscribe({
      next: () => {
        this.editSuccess = 'Review updated successfully!';
        this.editInProgress = false;
        this.fetchReviews();
      },
      error: () => {
        this.editError = 'Failed to update review.';
        this.editInProgress = false;
      }
    });
  }

  openDeleteModal(review: any) {
    this.selectedReview = review;
    this.showDeleteModal = true;
    this.deleteSuccess = null;
    this.deleteError = null;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.selectedReview = null;
    this.deleteSuccess = null;
    this.deleteError = null;
  }

  confirmDeleteReview() {
    if (!this.selectedReview) return;
    this.deleteInProgress = true;
    this.deleteSuccess = null;
    this.deleteError = null;
    this.adminService.deleteReview(this.selectedReview.id).subscribe({
      next: () => {
        this.deleteSuccess = 'Review deleted successfully!';
        this.deleteInProgress = false;
        this.fetchReviews();
        this.closeDeleteModal();
      },
      error: () => {
        this.deleteError = 'Failed to delete review.';
        this.deleteInProgress = false;
      }
    });
  }
} 