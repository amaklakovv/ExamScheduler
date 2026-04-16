import pandas as pd
import json
import sys
import os

# If spreadsheet changes update these index numbers
COL_MAP = {
    0: 'course_code',   # Column A
    1: 'duration',      # Column B
    2: 'exam_date',     # Column C
    3: 'start_time',    # Column D
    4: 'student_split', # Column E
    5: 'room',          # Column F
}

def clean_value(val, key):
    """Generic cleaning for all values"""
    val = str(val).strip()
    if val.lower() in ['nan', 'none', '']:
        return ""

    if key == 'course_code':
        # e.g. ACCY130-23001 to ACCY130
        return val.split('-')[0].split('/')[0].strip()
    
    if key == 'duration':
        # If number add minutes otherwise leave (e.g. all day)
        return f"{val} minutes" if val.isdigit() else val

    if key == 'exam_date':
        # Remove timestamp if present (2025-06-19 00:00:00 to 2025-06-19)
        return val.split(' ')[0]

    if key == 'start_time':
        # Make 14:30:00 become 14:30
        if ':' in val:
            parts = val.split(':')
            return f"{parts[0]}:{parts[1]}"
            
    return val

def process_excel(file_path):
    try:
        df = pd.read_excel(file_path, header=None)
        
        # Find the starting row
        start_row = 0
        for i, row in df.iterrows():
            cell_val = str(row[0])
            # Check if row 0 looks like a course code (usually letters followed by numbers)
            if any(char.isdigit() for char in cell_val) and len(cell_val) > 3:
                start_row = i
                break
        
        df = df.iloc[start_row:]
        
        exams = []
        for _, row in df.iterrows():        
            if pd.isna(row[0]):
                continue
                
            exam_data = {}
            for col_idx, key in COL_MAP.items():
                try:
                    raw_val = row[col_idx]
                    exam_data[key] = clean_value(raw_val, key)
                except IndexError:
                    exam_data[key] = ""
            
            exams.append(exam_data)
            
        return exams

    except Exception as e:
        print(f"Error: {e}")
        return None

def main():
    if len(sys.argv) != 2:
        print("Usage: python convert.py <file.xlsx>")
        sys.exit(1)
    
    input_file = sys.argv[1]
    print(f"Reading columns in order: {list(COL_MAP.values())}...")
    
    data = process_excel(input_file)
    
    if data:
        output_file = 'exams.json'
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print(f"Successfully converted {len(data)} rows to {output_file}")
    else:
        print("No data found.")

if __name__ == "__main__":
    main()