import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../services/task.service';
import { Task, TaskFilters } from '../models/task.model';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card">
      <!-- Card Header -->
      <div class="card-header">
        <h2 class="card-title">TASK LIST</h2>
      </div>

      <!-- Filters -->
      <div class="filters">
        <div class="form-group">
          <label class="form-label">Entity Name</label>
          <input type="text" class="form-control" [(ngModel)]="filters.entity_name" placeholder="Filter by entity name">
        </div>

        <div class="form-group">
          <label class="form-label">Task Type</label>
          <select class="form-control" [(ngModel)]="filters.task_type">
            <option value="">All Types</option>
            <option *ngFor="let type of taskTypes" [value]="type">{{ type }}</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Status</label>
          <select class="form-control" [(ngModel)]="filters.status">
            <option value="">All Status</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Contact Person</label>
          <select class="form-control" [(ngModel)]="filters.contact_person">
            <option value="">All Persons</option>
            <option *ngFor="let person of contactPersons" [value]="person">{{ person }}</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Task Due Date</label>
          <input type="date" class="form-control" [(ngModel)]="filters.task_date">
        </div>

        <div class="form-group">
          <label class="form-label">Sort By</label>
          <select class="form-control" [(ngModel)]="filters.sort_by">
            <option value="date_created">Date Created</option>
            <option value="entity_name">Entity Name</option>
            <option value="task_type">Task Type</option>
            <option value="task_time">Task Time</option>
            <option value="contact_person">Contact Person</option>
            <option value="status">Status</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Sort Order</label>
          <select class="form-control" [(ngModel)]="filters.sort_order">
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
      </div>

      <!-- Actions -->
      <div class="actions">
        <button class="btn btn-primary" (click)="loadTasks()">Apply Filters</button>
        <button class="btn btn-success" (click)="showCreateModal()">Create New Task</button>
        <button class="btn btn-warning" (click)="clearFilters()">Clear Filters</button>
      </div>

      <!-- Alerts -->
      <div *ngIf="alert" class="alert" [ngClass]="alert.type === 'success' ? 'alert-success' : 'alert-error'">
        {{ alert.message }}
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="loading">Loading tasks...</div>

      <!-- Task Table -->
      <table *ngIf="!loading && tasks.length > 0" class="table">
        <thead>
          <tr>
            <th>Date Created</th>
            <th>Entity Name</th>
            <th>Task Type</th>
            <th>Task Time</th>
            <th>Contact Person</th>
            <th>Note</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let task of tasks">
            <td>{{ formatDate(task.date_created) }}</td>
            <td>{{ task.entity_name }}</td>
            <td>{{ task.task_type }}</td>
            <td>{{ formatDateTime(task.task_time) }}</td>
            <td>{{ task.contact_person }}</td>
            <td>{{ task.note || '-' }}</td>
            <td>
              <span class="status-badge" [ngClass]="'status-' + task.status">
                {{ task.status }}
              </span>
            </td>
            <td>
              <button class="btn btn-warning" (click)="editTask(task)">Edit</button>
              <button class="btn btn-success" (click)="toggleStatus(task)" *ngIf="task.status === 'open'">Close</button>
              <button class="btn btn-primary" (click)="toggleStatus(task)" *ngIf="task.status === 'closed'">Open</button>
              <button class="btn btn-danger" (click)="deleteTask(task)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- No Tasks Message -->
      <div *ngIf="!loading && tasks.length === 0" class="loading">
        No tasks found. Create a new task to get started.
      </div>
    </div>

    <!-- Create/Edit Task Modal -->
    <div *ngIf="showModal" class="modal" (click)="closeModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3 class="modal-title">{{ editingTask ? 'Edit Task' : 'Create New Task' }}</h3>
          <button class="close" (click)="closeModal()">&times;</button>
        </div>
        
        <form (ngSubmit)="saveTask()">
          <div class="form-group">
            <label class="form-label">Entity Name *</label>
            <input type="text" class="form-control" [(ngModel)]="taskForm.entity_name" name="entity_name" required>
          </div>
          
          <div class="form-group">
            <label class="form-label">Task Type *</label>
            <input type="text" class="form-control" [(ngModel)]="taskForm.task_type" name="task_type" required>
          </div>
          
          <div class="form-group">
            <label class="form-label">Task Time *</label>
            <input type="datetime-local" class="form-control" [(ngModel)]="taskForm.task_time" name="task_time" required>
          </div>
          
          <div class="form-group">
            <label class="form-label">Contact Person *</label>
            <input type="text" class="form-control" [(ngModel)]="taskForm.contact_person" name="contact_person" required>
          </div>
          
          <div class="form-group">
            <label class="form-label">Note</label>
            <textarea class="form-control" [(ngModel)]="taskForm.note" name="note" rows="3"></textarea>
          </div>
          
          <div class="form-group" *ngIf="editingTask">
            <label class="form-label">Status</label>
            <select class="form-control" [(ngModel)]="taskForm.status" name="status">
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          
          <div style="display: flex; gap: 10px; justify-content: flex-end;">
            <button type="button" class="btn btn-warning" (click)="closeModal()">Cancel</button>
            <button type="submit" class="btn btn-primary">{{ editingTask ? 'Update' : 'Create' }}</button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class TaskListComponent implements OnInit {
  tasks: Task[] = [];
  taskTypes: string[] = [];
  contactPersons: string[] = [];
  loading = false;
  showModal = false;
  editingTask: Task | null = null;
  
  filters: TaskFilters = {
    entity_name: '',
    task_type: '',
    status: '',
    contact_person: '',
    task_date: '',
    sort_by: 'date_created',
    sort_order: 'desc'
  };
  
  taskForm: any = {
    entity_name: '',
    task_type: '',
    task_time: '',
    contact_person: '',
    note: '',
    status: 'open'
  };
  
  alert: { type: 'success' | 'error', message: string } | null = null;

  constructor(private taskService: TaskService) {}

  ngOnInit() {
    this.loadTasks();
    this.loadTaskTypes();
    this.loadContactPersons();
  }

  loadTasks() {
    this.loading = true;
    this.taskService.getTasks(this.filters).subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.loading = false;
      },
      error: (error) => {
        this.showAlert('error', 'Error loading tasks: ' + error.message);
        this.loading = false;
      }
    });
  }

  loadTaskTypes() {
    this.taskService.getTaskTypes().subscribe({
      next: (types) => this.taskTypes = types,
      error: (error) => console.error('Error loading task types:', error)
    });
  }

  loadContactPersons() {
    this.taskService.getContactPersons().subscribe({
      next: (persons) => this.contactPersons = persons,
      error: (error) => console.error('Error loading contact persons:', error)
    });
  }

  showCreateModal() {
    this.editingTask = null;
    this.taskForm = {
      entity_name: '',
      task_type: '',
      task_time: '',
      contact_person: '',
      note: '',
      status: 'open'
    };
    this.showModal = true;
  }

  editTask(task: Task) {
    this.editingTask = task;
    this.taskForm = {
      entity_name: task.entity_name,
      task_type: task.task_type,
      task_time: this.formatDateTimeForInput(task.task_time),
      contact_person: task.contact_person,
      note: task.note || '',
      status: task.status
    };
    this.showModal = true;
  }

  saveTask() {
    if (!this.taskForm.entity_name?.trim()) {
      this.showAlert('error', 'Entity Name is required');
      return;
    }
    if (!this.taskForm.task_type?.trim()) {
      this.showAlert('error', 'Task Type is required');
      return;
    }
    if (!this.taskForm.task_time) {
      this.showAlert('error', 'Task Time is required');
      return;
    }
    if (!this.taskForm.contact_person?.trim()) {
      this.showAlert('error', 'Contact Person is required');
      return;
    }

    const selectedTime = new Date(this.taskForm.task_time);
    const now = new Date();
    if (selectedTime < now) {
      this.showAlert('error', 'Task completion time cannot be in the past');
      return;
    }

    if (this.editingTask) {
      this.taskService.updateTask(this.editingTask.id!, this.taskForm).subscribe({
        next: () => {
          this.showAlert('success', 'Task updated successfully');
          this.closeModal();
          this.loadTasks();
        },
        error: (error) => this.showAlert('error', 'Error updating task: ' + error.message)
      });
    } else {
      this.taskService.createTask(this.taskForm).subscribe({
        next: () => {
          this.showAlert('success', 'Task created successfully');
          this.closeModal();
          this.loadTasks();
          this.loadTaskTypes();
          this.loadContactPersons();
        },
        error: (error) => this.showAlert('error', 'Error creating task: ' + error.message)
      });
    }
  }

  toggleStatus(task: Task) {
    const newStatus = task.status === 'open' ? 'closed' : 'open';
    this.taskService.updateTaskStatus(task.id!, newStatus).subscribe({
      next: () => {
        this.showAlert('success', `Task ${newStatus} successfully`);
        this.loadTasks();
      },
      error: (error) => this.showAlert('error', 'Error updating task status: ' + error.message)
    });
  }

  deleteTask(task: Task) {
    if (confirm('Are you sure you want to delete this task?')) {
      this.taskService.deleteTask(task.id!).subscribe({
        next: () => {
          this.showAlert('success', 'Task deleted successfully');
          this.loadTasks();
        },
        error: (error) => this.showAlert('error', 'Error deleting task: ' + error.message)
      });
    }
  }

  closeModal() {
    this.showModal = false;
    this.editingTask = null;
  }

  clearFilters() {
    this.filters = {
      entity_name: '',
      task_type: '',
      status: '',
      contact_person: '',
      task_date: '',
      sort_by: 'date_created',
      sort_order: 'desc'
    };
    this.loadTasks();
  }

  showAlert(type: 'success' | 'error', message: string) {
    this.alert = { type, message };
    setTimeout(() => this.alert = null, 5000);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString();
  }

  formatDateTimeForInput(dateString: string): string {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  }
}
