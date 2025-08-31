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
      <!-- Card Header (Sales Log title, New Task button, Search Bar) -->
      <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
        <h2 class="card-title">SALES LOG</h2>
        <div style="display: flex; align-items: center; gap: 1rem;">
          
          <button class="btn btn-success" (click)="showCreateModal()">+ New Task</button>
        </div>
      </div>

      <!-- Active Filters Display (e.g., Task Type: Call) -->
      <div class="active-filters">
        <span *ngIf="filters.entity_name" class="active-filter-badge">Entity Name: {{ filters.entity_name }} <span class="clear-filter" (click)="clearFilters('entity_name')">x</span></span>
        <span *ngIf="filters.task_type" class="active-filter-badge">Task Type: {{ filters.task_type }} <span class="clear-filter" (click)="clearFilters('task_type')">x</span></span>
        <span *ngIf="filters.status" class="active-filter-badge">Status: {{ filters.status }} <span class="clear-filter" (click)="clearFilters('status')">x</span></span>
        <span *ngIf="filters.contact_person" class="active-filter-badge">Contact Person: {{ filters.contact_person }} <span class="clear-filter" (click)="clearFilters('contact_person')">x</span></span>
        <span *ngIf="filters.task_date" class="active-filter-badge">Task Date: {{ formatDate(filters.task_date) }} <span class="clear-filter" (click)="clearFilters('task_date')">x</span></span>
      </div>

      <!-- Original Filters Section (hidden for now, will be replaced by integrated filtering) -->
      <div class="filters">
        <div class="form-group">
          <label class="form-label">Entity Name</label>
          <input type="text" class="form-control" [(ngModel)]="filters.entity_name" placeholder="Filter by entity name" (ngModelChange)="loadTasks()">
        </div>

        <div class="form-group">
          <label class="form-label">Task Type</label>
          <select class="form-control" [(ngModel)]="filters.task_type" (ngModelChange)="loadTasks()">
            <option value="">All Types</option>
            <option *ngFor="let type of taskTypes" [value]="type">{{ type }}</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Status</label>
          <select class="form-control" [(ngModel)]="filters.status" (ngModelChange)="loadTasks()">
            <option value="">All Status</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Contact Person</label>
          <select class="form-control" [(ngModel)]="filters.contact_person" (ngModelChange)="loadTasks()">
            <option value="">All Persons</option>
            <option *ngFor="let person of contactPersons" [value]="person">{{ person }}</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Task Due Date</label>
          <input type="date" class="form-control" [(ngModel)]="filters.task_date" (ngModelChange)="loadTasks()">
        </div>

        <div class="form-group">
          <label class="form-label">Sort By</label>
          <select class="form-control" [(ngModel)]="filters.sort_by" (ngModelChange)="loadTasks()">
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
          <select class="form-control" [(ngModel)]="filters.sort_order" (ngModelChange)="loadTasks()">
            <option value="" disabled selected>Select Order</option>
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
      </div>

      <!-- Actions (Moved into card-header or will be part of table actions) -->
      <div class="actions" style="display: none;">
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
            <th>Date Created <span class="filter-icon">📅</span></th>
            <th>Entity Name <span class="filter-icon">▼</span></th>
            <th>Task Type <span class="filter-icon">▼</span></th>
            <th>Task Time <span class="filter-icon">▼</span></th>
            <th>Contact Person <span class="filter-icon">▼</span></th>
            <th>Notes <span class="filter-icon">▼</span></th>
            <th>Status <span class="filter-icon">▼</span></th>
            <th>Options</th>
          </tr>
        </thead>
        <tbody>
          <!-- We will need to implement date grouping here later -->
          <tr *ngFor="let task of tasks">
            <td>{{ formatDate(task.date_created) }}</td>
            <td>{{ task.entity_name }}</td>
            <td>
              <span class="task-type-icon" [ngClass]="'task-type-' + task.task_type.toLowerCase()"></span>
              {{ task.task_type }}
            </td>
            <td>{{ formatFullDateTime(task.task_time) }}</td>
            <td>{{ task.contact_person }}</td>
            <td>{{ task.note || '-' }}</td>
            <td>
              <span class="status-badge" [ngClass]="'status-' + task.status">
                {{ task.status }}
              </span>
            </td>
            <td>
              <div style="display: flex; gap: 0.5rem;">
                <button class="btn btn-primary btn-sm" (click)="editTask(task)">Edit</button>
                <button class="btn btn-info btn-sm" (click)="toggleStatus(task)">Change Status to {{ task.status === 'open' ? 'Closed' : 'Open' }}</button>
                <button class="btn btn-danger btn-sm" (click)="deleteTask(task)">Delete</button>
              </div>
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
          <h3 class="modal-title">NEW TASK</h3>
          <div class="status-toggle">
            <button [ngClass]="{'active': taskForm.status === 'open'}" (click)="taskForm.status = 'open'">Open</button>
            <button [ngClass]="{'active': taskForm.status === 'closed'}" (click)="taskForm.status = 'closed'">Closed</button>
          </div>
          <button class="close" (click)="closeModal()">&times;</button>
        </div>
        
        <form (ngSubmit)="saveTask()">
          <div class="form-group">
            <label class="form-label">Entity name</label>
            <input type="text" class="form-control" [(ngModel)]="taskForm.entity_name" name="entity_name" required>
          </div>
          
          <div class="form-group date-time-group">
            <label class="form-label">Date</label>
            <input type="date" class="form-control" [(ngModel)]="taskForm.task_date" name="task_date" required>
            <label class="form-label">Time</label>
            <select class="form-control" [(ngModel)]="taskForm.task_time_hour" name="task_time_hour" required>
              <option *ngFor="let hour of hours" [value]="hour">{{ hour }}</option>
            </select>
            <select class="form-control" [(ngModel)]="taskForm.task_time_minute" name="task_time_minute" required>
              <option *ngFor="let minute of minutes" [value]="minute">{{ minute }}</option>
            </select>
            <select class="form-control" [(ngModel)]="taskForm.task_time_ampm" name="task_time_ampm" required>
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
          </div>
          
          <div class="form-group">
            <label class="form-label">Task type</label>
            <input list="taskTypesList" class="form-control" [(ngModel)]="taskForm.task_type" name="task_type" required>
            <datalist id="taskTypesList">
              <option *ngFor="let type of taskTypes" [value]="type"></option>
            </datalist>
          </div>

          <!-- Removed Phone number field as per JD -->
          
          <div class="form-group">
            <label class="form-label">Contact person</label>
            <input type="text" class="form-control" [(ngModel)]="taskForm.contact_person" name="contact_person" required>
          </div>
          
          <div class="form-group">
            <label class="form-label">Note (optional)</label>
            <textarea class="form-control" [(ngModel)]="taskForm.note" name="note" rows="3"></textarea>
          </div>
          
          <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 2rem;">
            <button type="button" class="btn btn-cancel" (click)="closeModal()">CANCEL</button>
            <button type="submit" class="btn btn-save">SAVE</button>
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
    sort_order: '',
  };
  
  taskForm: any = {
    entity_name: '',
    task_type: '',
    task_date: '', // Separate date field
    task_time_hour: '12', // Separate hour field for time picker
    task_time_minute: '00', // Separate minute field for time picker
    task_time_ampm: 'PM', // Separate AM/PM field for time picker
    contact_person: '',
    note: '',
    status: 'open'
    // Removed phone_number from taskForm
  };

  hours: string[] = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  minutes: string[] = ['00', '15', '30', '45'];
  
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
    console.log('Calling loadTaskTypes...');
    this.taskService.getTaskTypes().subscribe({
      next: (types) => {
        this.taskTypes = types;
        console.log('Task types loaded:', this.taskTypes);
      },
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
      task_date: '', // Reset to empty
      task_time_hour: '12',
      task_time_minute: '00',
      task_time_ampm: 'PM',
      contact_person: '',
      note: '',
      status: 'open'
      // Removed phone_number
    };
    this.showModal = true;
  }

  editTask(task: Task) {
    this.editingTask = task;
    const taskDateTime = new Date(task.task_time);
    this.taskForm = {
      entity_name: task.entity_name,
      task_type: task.task_type,
      task_date: taskDateTime.toISOString().slice(0, 10), // Extract date
      task_time_hour: this.formatHourForInput(taskDateTime), // Extract hour
      task_time_minute: this.formatMinuteForInput(taskDateTime), // Extract minute
      task_time_ampm: this.formatAmPmForInput(taskDateTime), // Extract AM/PM
      contact_person: task.contact_person,
      note: task.note || '',
      status: task.status
      // Removed phone_number from task population
    };
    this.showModal = true;
  }

  duplicateTask(task: Task) {
    this.editingTask = null; // Treat as a new task for duplication
    const taskDateTime = new Date(task.task_time);
    this.taskForm = {
      entity_name: task.entity_name,
      task_type: task.task_type,
      task_date: taskDateTime.toISOString().slice(0, 10),
      task_time_hour: this.formatHourForInput(taskDateTime),
      task_time_minute: this.formatMinuteForInput(taskDateTime),
      task_time_ampm: this.formatAmPmForInput(taskDateTime),
      contact_person: task.contact_person,
      note: task.note || '',
      status: 'open' // Default to open for duplicated tasks
      // Removed phone_number
    };
    this.showModal = true;
  }

  saveTask() {
    // Client-side validation
    if (!this.taskForm.entity_name?.trim()) { this.showAlert('error', 'Entity name is required'); return; }
    if (!this.taskForm.task_type?.trim()) { this.showAlert('error', 'Task type is required'); return; }
    if (!this.taskForm.task_date) { this.showAlert('error', 'Date is required'); return; }
    if (!this.taskForm.task_time_hour || !this.taskForm.task_time_minute || !this.taskForm.task_time_ampm) { this.showAlert('error', 'Time is required'); return; }
    if (!this.taskForm.contact_person?.trim()) { this.showAlert('error', 'Contact person is required'); return; }

    // Construct full task_time from separate date and time components
    let hour = parseInt(this.taskForm.task_time_hour, 10);
    if (this.taskForm.task_time_ampm === 'PM' && hour !== 12) {
      hour += 12;
    } else if (this.taskForm.task_time_ampm === 'AM' && hour === 12) {
      hour = 0; // Midnight
    }
    const fullTaskTime = new Date(`${this.taskForm.task_date}T${hour.toString().padStart(2, '0')}:${this.taskForm.task_time_minute}:00`);

    // Past date validation
    const now = new Date();
    if (fullTaskTime < now) {
      this.showAlert('error', 'Task due time cannot be in the past');
      return;
    }

    const taskToSend = {
      entity_name: this.taskForm.entity_name.trim(),
      task_type: this.taskForm.task_type.trim(),
      task_time: fullTaskTime.toISOString(),
      contact_person: this.taskForm.contact_person.trim(),
      note: this.taskForm.note?.trim() || '',
      status: this.taskForm.status
      // Removed phone_number from taskToSend
    };

    if (this.editingTask) {
      this.taskService.updateTask(this.editingTask.id!, taskToSend).subscribe({
        next: () => {
          this.showAlert('success', 'Task updated successfully');
          this.closeModal();
          this.loadTasks();
        },
        error: (error) => this.showAlert('error', 'Error updating task: ' + error.message)
      });
    } else {
      this.taskService.createTask(taskToSend).subscribe({
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
        this.showAlert('success', `Task status changed to ${newStatus}`);
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

  clearFilters(filterKey?: keyof TaskFilters) {
    if (filterKey) {
      if (filterKey === 'sort_order') {
        this.filters[filterKey] = undefined;
      } else {
        this.filters[filterKey] = '';
      }
    } else {
      this.filters = {
        entity_name: '',
        task_type: '',
        status: '',
        contact_person: '',
        task_date: '',
        sort_by: 'date_created',
        sort_order: undefined,
      };
    }
    this.loadTasks();
  }

  showAlert(type: 'success' | 'error', message: string) {
    this.alert = { type, message };
    setTimeout(() => this.alert = null, 5000);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  formatTime(dateString: string): string {
    return new Date(dateString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  }

  formatFullDateTime(dateString: string): string {
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const formattedTime = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    return `${formattedDate} ${formattedTime}`;
  }

  private formatHourForInput(date: Date): string {
    let hour = date.getHours();
    hour = hour % 12;
    hour = hour ? hour : 12; // the hour '0' should be '12'
    return hour.toString().padStart(2, '0');
  }

  private formatMinuteForInput(date: Date): string {
    return date.getMinutes().toString().padStart(2, '0');
  }

  private formatAmPmForInput(date: Date): string {
    return date.getHours() >= 12 ? 'PM' : 'AM';
  }
}
