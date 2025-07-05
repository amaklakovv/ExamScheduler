# - Excel file upload and parsing with pandas
# - SQLite database for persistent storage
# - Real-time search functionality
# - RESTful API endpoints
# - Separate admin and student views

from flask import Flask, render_template, request, jsonify
import pandas as pd
import sqlite3
import os

# Initialize Flask application
app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-here'  # Change this when in inproduction

# Database setup and initialization
def init_db():
    # Initialize the SQLite database with the exams table.
    # Creates the table if it doesn't exist with columns for exam details.
    conn = sqlite3.connect('exams.db')
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS exams (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            course_code TEXT NOT NULL,      -- Course code (e.g. "AIML231")
            exam_date TEXT NOT NULL,        -- Exam date
            start_time TEXT NOT NULL,       -- Start time
            duration TEXT NOT NULL,         -- Duration (e.g. "120 minutes")
            room TEXT NOT NULL,             -- Room number/location
            student_split TEXT NOT NULL     -- Student group/split information
        )
    ''')
    conn.commit()
    conn.close()

def get_exams_from_db():
    # Retrieve all exams from the database and return as a list of dictionaries.
    conn = sqlite3.connect('exams.db')
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM exams')
    rows = cursor.fetchall()
    conn.close()
    
    # Convert database rows to dictionary format for JSON response
    return [{
        'id': row[0],
        'course_code': row[1],
        'exam_date': row[2],
        'start_time': row[3],
        'duration': row[4],
        'room': row[5],
        'student_split': row[6]
    } for row in rows]

def parse_excel_file(file):
    # Parse uploaded Excel file and extract exam data.
    # This function handles complex Excel structures with merged cells and varying formats.
    # It automatically detects the header row and cleans column names for consistency.
    
    # First read without headers to find the actual header row
    df = pd.read_excel(file, header=None)
    
    # Find the header row by looking for key columns
    header_row = None
    for i, row in df.iterrows():
        if 'Exam' in str(row.values) and 'Duration' in str(row.values):
            header_row = i
            break
    
    if header_row is not None:
        # Re-read with the found header row
        df = pd.read_excel(file, header=header_row)
        df = df.dropna(how='all')  # Remove completely empty rows
        
        # Clean column names - take first word of each column name
        df.columns = [str(col).split()[0] if pd.notna(col) and str(col).strip() else f'col_{i}' 
                     for i, col in enumerate(df.columns)]
    else:
        # Fallback: use second row as header (common in university timetables)
        df = pd.read_excel(file, header=1)
    
    return df

def save_exams_to_db(df):
    # Save parsed exam data from DataFrame to SQLite database.
    # This function clears existing data and inserts new exam records.
    # It filters out empty course codes and formats data consistently.
    
    conn = sqlite3.connect('exams.db')
    cursor = conn.cursor()
    
    # Clear existing data to avoid duplicates
    cursor.execute('DELETE FROM exams')
    
    exam_count = 0
    for _, row in df.iterrows():
        course_code = str(row.get('Exam', '')).strip()
        
        # Only save rows with valid course codes
        if course_code and course_code != 'nan':
            cursor.execute('''
                INSERT INTO exams (course_code, exam_date, start_time, duration, room, student_split)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                course_code,
                str(row.get('Date', '')).strip(),
                str(row.get('Start', '')).strip(),
                str(row.get('Duration', '')).strip() + ' minutes',  # Add "minutes" suffix
                str(row.get('Room', '')).strip(),
                str(row.get('Student', '')).strip()
            ))
            exam_count += 1
    
    conn.commit()
    conn.close()
    return exam_count

# Initialize database on startup
init_db()

# Flask Routes

@app.route('/')
def index():
    # Admin view - displays upload form and exam schedule.
    # This is the main page where administrators can upload new exam schedules.
    return render_template('index.html')

@app.route('/student')
def student_view():
    # Student view - displays only the search interface without upload functionality.
    # This provides a clean interface for students to search their exams.
    return render_template('student.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    # Handle file upload from admin interface.
    # Validates the uploaded file and processes it to extract exam data.
    # Supports Excel (.xlsx) files only.
    
    # Check if file was uploaded
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    # Validate file type
    if not file.filename.endswith('.xlsx'):
        return jsonify({'error': 'Please upload an Excel (.xlsx) file'}), 400
    
    try:
        # Parse and save the uploaded file
        df = parse_excel_file(file)
        exam_count = save_exams_to_db(df)
        
        return jsonify({
            'success': True,
            'message': f'Successfully uploaded {exam_count} exams',
            'exam_count': exam_count
        })
    except Exception as e:
        return jsonify({'error': f'Error parsing file: {str(e)}'}), 400

@app.route('/api/exams')
def get_exams():
    # API endpoint to retrieve all exams.
    # Used by the frontend to display the complete exam schedule.
    return jsonify(get_exams_from_db())

@app.route('/api/exams/search')
def search_exams():
    # API endpoint for searching exams by course code.
    # Performs case-insensitive search using SQL LIKE operator.
    # Returns all exams if no search query is provided.
    
    query = request.args.get('q', '').strip()
    
    # If no query, return all exams
    if not query:
        return jsonify(get_exams_from_db())
    
    # Perform case-insensitive search
    conn = sqlite3.connect('exams.db')
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM exams WHERE LOWER(course_code) LIKE LOWER(?)', (f'%{query}%',))
    rows = cursor.fetchall()
    conn.close()
    
    # Convert results to dictionary format
    results = [{
        'id': row[0],
        'course_code': row[1],
        'exam_date': row[2],
        'start_time': row[3],
        'duration': row[4],
        'room': row[5],
        'student_split': row[6]
    } for row in rows]
    
    return jsonify(results)

# Application entry point
if __name__ == '__main__':
    # Get port from environment variable (for deployment) or use default
    port = int(os.environ.get('PORT', 5002))
    app.run(debug=False, host='0.0.0.0', port=port) 