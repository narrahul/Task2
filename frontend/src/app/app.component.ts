import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <!-- Header -->
    <header class="header">
      <div class="header-content">
        <div class="logo">
          TASK MANAGER
          <div style="font-size: 0.75rem; font-weight: normal; opacity: 0.8;">
            MANAGE. TRACK. COMPLETE
          </div>
        </div>
        <nav>
          <ul class="nav-links">
            <li><a href="#">Dashboard</a></li>
            <li><a href="#">Tasks</a></li>
            <li><a href="#">Reports</a></li>
            <li><a href="#">Settings</a></li>
          </ul>
        </nav>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container">
      <router-outlet></router-outlet>
    </main>
  `
})
export class AppComponent {
  title = 'task-manager';
}
