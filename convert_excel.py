#!/usr/bin/env python3
"""
Excel to JSON Converter for Exam Schedule
Converts Excel files to JSON format for static website deployment
"""

import pandas as pd
import json
import sys
import os

def parse_excel_file(file_path):
    """Parse Excel file and extract exam data"""
    try:
        # Read Excel file
        df = pd.read_excel(file_path, header=None)
        
        # Find the header row by looking for key columns
        header_row = None
        for i, row in df.iterrows():
            if 'Exam' in str(row.values) and 'Duration' in str(row.values):
                header_row = i
                break
        
        if header_row is not None:
            # Re-read with the found header row
            df = pd.read_excel(file_path, header=header_row)
            df = df.dropna(how='all')  # Remove completely empty rows
            
            # Clean column names - take first word of each column name
            df.columns = [str(col).split()[0] if pd.notna(col) and str(col).strip() else f'col_{i}' 
                         for i, col in enumerate(df.columns)]
        else:
            # Fallback uses second row as header
            df = pd.read_excel(file_path, header=1)
        
        return df
    except Exception as e:
        print(f"Error parsing Excel file: {e}")
        return None

def convert_to_json(df):
    """Convert DataFrame to JSON format"""
    exams = []
    
    for _, row in df.iterrows():
        course_code = str(row.get('Exam', '')).strip()
        
        # Only include rows with valid course codes
        if course_code and course_code != 'nan':
            exam = {
                'course_code': course_code,
                'exam_date': str(row.get('Date', '')).strip(),
                'start_time': str(row.get('Start', '')).strip(),
                'duration': str(row.get('Duration', '')).strip() + ' minutes',
                'room': str(row.get('Room', '')).strip(),
                'student_split': str(row.get('Student', '')).strip()
            }
            exams.append(exam)
    
    return exams

def main():
    if len(sys.argv) != 2:
        print("Usage: python convert_excel.py <excel_file.xlsx>")
        print("Example: python convert_excel.py exam_schedule.xlsx")
        sys.exit(1)
    
    excel_file = sys.argv[1]
    
    if not os.path.exists(excel_file):
        print(f"Error: File '{excel_file}' not found")
        sys.exit(1)
    
    print(f"Converting {excel_file} to JSON...")
    
    # Parse Excel file
    df = parse_excel_file(excel_file)
    if df is None:
        print("Failed to parse Excel file")
        sys.exit(1)
    
    # Convert to JSON
    exams = convert_to_json(df)
    
    if not exams:
        print("No valid exam data found in the Excel file")
        sys.exit(1)
    
    # Save to JSON file
    output_file = 'exams.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(exams, f, indent=2, ensure_ascii=False)
    
    print(f"Successfully converted {len(exams)} exams to {output_file}")
    print(f"File size: {os.path.getsize(output_file)} bytes")
    
    # Show sample data
    print("\nSample data:")
    for i, exam in enumerate(exams[:3]):
        print(f"  {i+1}. {exam['course_code']} - {exam['exam_date']} at {exam['start_time']}")
    
    if len(exams) > 3:
        print(f"  ... and {len(exams) - 3} more exams")

if __name__ == "__main__":
    main() 