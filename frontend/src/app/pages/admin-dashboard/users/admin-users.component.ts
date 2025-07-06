import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../Services/admin.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.css']
})
export class AdminUsersComponent implements OnInit {
  users: any[] = [];
  loading = false;
  error: string | null = null;

  editingUser: any = null;
  showCreateInstructor = false;
  newInstructor = { name: '', email: '', password: '' };

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.fetchUsers();
  }

  fetchUsers() {
    this.loading = true;
    this.adminService.getAllUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load users.';
        this.loading = false;
      }
    });
  }

  openEditUser(user: any) {
    this.editingUser = { ...user };
  }

  saveUserEdit() {
    if (!this.editingUser) return;
    this.adminService.updateUser(this.editingUser.id, { name: this.editingUser.name }).subscribe({
      next: () => {
        this.editingUser = null;
        this.fetchUsers();
      },
      error: () => {
        this.error = 'Failed to update user.';
      }
    });
  }

  cancelEditUser() {
    this.editingUser = null;
  }

  confirmDeleteUser(user: any) {
    if (confirm(`Are you sure you want to delete user ${user.name}?`)) {
      this.adminService.deleteUser(user.id).subscribe({
        next: () => this.fetchUsers(),
        error: () => { this.error = 'Failed to delete user.'; }
      });
    }
  }

  openCreateInstructor() {
    this.showCreateInstructor = true;
    this.newInstructor = { name: '', email: '', password: '' };
  }

  createInstructor() {
    const data = { ...this.newInstructor, role: 'INSTRUCTOR' };
    this.adminService.createInstructor(data).subscribe({
      next: () => {
        this.showCreateInstructor = false;
        this.fetchUsers();
      },
      error: () => {
        this.error = 'Failed to create instructor.';
      }
    });
  }

  cancelCreateInstructor() {
    this.showCreateInstructor = false;
  }
} 