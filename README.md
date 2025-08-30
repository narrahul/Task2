# Task List Web Application

A modern task management system built with **Python Flask** backend and **Angular 17** frontend.

## 🚀 Features

- **Create Tasks**: Add new tasks with all required fields
- **Edit Tasks**: Modify existing task details
- **Delete Tasks**: Remove tasks from the system
- **Status Management**: Toggle between open/closed status
- **Advanced Filtering**: Filter by entity name, task type, status, contact person, and date range
- **Sorting**: Sort tasks by any field in ascending or descending order
- **Responsive Design**: Works on desktop and mobile devices

## 📋 Task Attributes

- **Date Created**: Automatically set when task is created
- **Entity Name**: Customer/entity name (required)
- **Task Type**: Type of task (required)
- **Task Time**: When the task is to be done (required)
- **Contact Person**: Person assigned to the task (required)
- **Note**: Optional additional information
- **Status**: Open/Closed (defaults to open)

## 🛠️ Tech Stack

- **Backend**: Python 3.12+ with Flask 3.0
- **Frontend**: Angular 17 with TypeScript
- **Database**: SQLite (for simplicity)
- **API**: RESTful API with CORS support

## 📁 Project Structure

```
Task2/
├── backend/
│   ├── app.py              # Flask backend application
│   └── requirements.txt    # Python dependencies
├── frontend/
│   ├── src/                # Angular source code
│   ├── package.json        # Node.js dependencies
│   ├── angular.json        # Angular configuration
│   ├── tsconfig.json       # TypeScript configuration
│   ├── tsconfig.app.json   # TypeScript app config
│   └── tsconfig.spec.json  # TypeScript test config
└── README.md
```

## 🚀 Setup Instructions

### Prerequisites

- **Python 3.12** or higher
- **Node.js 18** or higher
- **npm** or **yarn**

### Backend Setup

1. Navigate to backend folder:
   ```bash
   cd backend
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run the Flask backend:
   ```bash
   python app.py
   ```

   The backend will start on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend folder:
   ```bash
   cd frontend
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```

3. Start the Angular development server:
   ```bash
   npm start
   ```

   The frontend will start on `http://localhost:4200`

## 🔌 API Endpoints

### Tasks
- `GET /api/tasks` - Get all tasks with optional filters
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/{id}` - Update an existing task
- `DELETE /api/tasks/{id}` - Delete a task

### Task Status
- `PATCH /api/tasks/{id}/status` - Update task status

### Metadata
- `GET /api/task-types` - Get all unique task types
- `GET /api/contact-persons` - Get all unique contact persons

## 💻 Usage

1. **Creating Tasks**: Click "Create New Task" button and fill in the required fields
2. **Editing Tasks**: Click "Edit" button on any task row
3. **Changing Status**: Use "Open" or "Close" buttons to toggle task status
4. **Filtering**: Use the filter section to narrow down tasks by various criteria
5. **Sorting**: Select sort field and order from the filter section
6. **Deleting**: Click "Delete" button and confirm the action

## 🗄️ Database

The application uses SQLite database (`tasks.db`) which is automatically created when the Flask app starts. The database includes a single `task` table with all the required fields.

## 🔧 Development

- **Backend**: Runs on port 5000
- **Frontend**: Runs on port 4200
- **CORS**: Enabled for cross-origin requests
- **Database**: Automatically created and migrated

## ✅ Testing

The application includes comprehensive error handling and validation:
- Required field validation
- Date format validation
- Status value validation
- API error handling with user-friendly messages

## 📝 Notes

- **TypeScript**: Used as it's the standard for Angular 2+ development
- **Modern Versions**: Latest stable versions of all dependencies
- **Separate Folders**: Clean separation between backend and frontend
- **Best Practices**: Follows modern development standards
