# Exam Scheduler

Fast exam schedule search tool

At my university, the exam timetables are typically published as large Excel files that students must download and manually search through. This project creates a web interface where:
- **Administrators** upload the official Excel file once
- **Students** can instantly search for their exams by course code
- **Real-time search** provides immediate results as you type in an easy to read way

## Key Features Implemented

**File Upload & Parsing**: Handles complex Excel structures with merged cells  
**Database Design**: SQLite schema for exam data persistence  
**Real-time Search**: Instant filtering with case-insensitive matching  
**RESTful API**: Clean endpoints for data retrieval and search  
**Responsive Design**: Works on desktop, tablet, and mobile  
**Error Handling**: Graceful handling of file uploads and parsing errors

## Technical

- **Data Parsing**: Automatically detects and handles various Excel column formats
- **Search Algorithm**: Efficient database queries with LIKE operators
- **State Management**: Persistent data storage across server restarts
- **User Experience**: Real-time search feedback and status messages
- **Code Organization**: Modular functions for maintainability

## Usage

## This project is basically finished. In the future I'd like to add:

- Calendar integration (Google/Apple)
- Email notifications
- User authentication (e.g. Google Login)
- Mobile app version