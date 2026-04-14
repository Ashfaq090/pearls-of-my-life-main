import { Component, OnInit } from '@angular/core';
import { AdminService } from '../admin.service';
import { SharedService } from 'src/app/services/shared.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss'],
})
export class UserManagementComponent implements OnInit {
  users: any[] = [];
  currentPage = 1;
  limit = 10;
  totalItems = 0;
  editForm: FormGroup;
  selectedUser: any = null;

  constructor(
    private adminService: AdminService,
    private sharedService: SharedService,
    private modalService: NgbModal,
    private fb: FormBuilder
  ) {
    this.editForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone_number: [''],
      hashed_password: [''],
    });
  }

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.adminService.getUsers(this.currentPage, this.limit).subscribe({
      next: (response) => {
        this.users = response.rows;
        this.totalItems = response.count;
      },
      error: (error) => {
        this.sharedService.showToast({
          classname: 'error',
          text: error.error?.message || 'Failed to load users',
        });
      },
    });
  }

  updateRole(user: any) {
    this.adminService.updateUserRole(user.id, user.role).subscribe({
      next: (response) => {
        this.sharedService.showToast({
          classname: 'success',
          text: 'User role updated successfully',
        });
      },
      error: (error) => {
        this.sharedService.showToast({
          classname: 'error',
          text: error.error?.message || 'Failed to update user role',
        });
        this.loadUsers();
      },
    });
  }

  openEditModal(content: any, user: any) {
    //debugger;
    this.selectedUser = user;
    this.editForm.patchValue({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone_number: user.phone_number || '',
      hashed_password: user.hashed_password || '',
    });
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' });
  }

  updateUser() {
    if (this.editForm.valid && this.selectedUser) {
      this.adminService
        .updateUser(this.selectedUser.id, this.editForm.value)
        .subscribe({
          next: (response) => {
            this.sharedService.showToast({
              classname: 'success',
              text: 'User updated successfully',
            });
            this.modalService.dismissAll();
            this.loadUsers();
          },
          error: (error) => {
            this.sharedService.showToast({
              classname: 'error',
              text: error.error?.message || 'Failed to update user',
            });
          },
        });
    }
  }

  deleteUser(user: any) {
    if (confirm('Are you sure you want to delete this user?')) {
      this.adminService.deleteUser(user.id).subscribe({
        next: (response) => {
          this.sharedService.showToast({
            classname: 'success',
            text: 'User deleted successfully',
          });
          this.loadUsers();
        },
        error: (error) => {
          this.sharedService.showToast({
            classname: 'error',
            text: error.error?.message || 'Failed to delete user',
          });
        },
      });
    }
  }

  onLimitChange() {
    this.currentPage = 1;
    this.loadUsers();
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadUsers();
  }
}
