# Exam Schedule Web App

A full-stack web application that solves a problem: converting complex Excel exam timetables into a searchable, student-friendly interface.

## Problem Solved

At my university, the exam timetables are typically published as large Excel files that students must download and manually search through. This project creates a web interface where:
- **Administrators** upload the official Excel file once
- **Students** can instantly search for their exams by course code
- **Real-time search** provides immediate results as you type in an easy to read way

## Tech Stack

### Backend
- **Python 3.9+** - Core application logic
- **Flask** - Web framework for API and routing
- **SQLite** - Database for persistent data storage
- **Pandas** - Excel file parsing and data manipulation

### Frontend
- **HTML5/CSS3** - Responsive, mobile-first design
- **JavaScript** - Real-time search and dynamic UI
- **Dark Theme** - Modern, accessible interface

### DevOps
- **Git** - Version control
- **Virtual Environment** - Dependency management
- **Requirements.txt** - Package management
- **Procfile** - Deployment configuration

## Key Features Implemented

**File Upload & Parsing**: Handles complex Excel structures with merged cells  
**Database Design**: SQLite schema for exam data persistence  
**Real-time Search**: Instant filtering with case-insensitive matching  
**RESTful API**: Clean endpoints for data retrieval and search  
**Responsive Design**: Works on desktop, tablet, and mobile  
**Error Handling**: Graceful handling of file uploads and parsing errors

## Technical Achievements

- **Data Parsing**: Automatically detects and handles various Excel column formats
- **Search Algorithm**: Efficient database queries with LIKE operators
- **State Management**: Persistent data storage across server restarts
- **User Experience**: Real-time search feedback and status messages
- **Code Organization**: Modular functions for maintainability

## Quick Start

```bash
# Clone and setup
git clone <repo-url>
cd exam-schedule
python3 -m venv venv
source venv/bin/activate  # `venv\Scripts\activate` on Windows
pip install -r requirements.txt

# Run locally
python app.py
# Visit http://127.0.0.1:5002
```

## Usage

**Admin View** (`/`): Upload Excel exam timetable  
**Student View** (`/student`): Search exams by course code (e.g., "AIML231")

## This project is basically finished. In the future I'd like to add:

- Calendar integration (Google/Apple)
- Email notifications
- User authentication (e.g. Google Login)
- Mobile app version