# Exam Scheduler

Fast exam schedule search tool with calendar integration

At my university, the exam timetables are typically published as large Excel files that students must download and manually search through. This was also a problem myself and peers had where finding my exam would be challenging. This project creates a web interface where:
- **Students** can instantly search for their exams by course code
- **Real-time search** provides immediate results as you type
- **Calendar integration** - click any exam to add to Google/Apple Calendar
- **Mobile responsive** design works on all devices

## Key Features

**Real-time Search**: Instant filtering with case-insensitive matching  
**Calendar Integration**: One-click add to Google Calendar or Apple Calendar  
**Static Site**: Fast loading, no server maintenance, free hosting  
**Mobile Responsive**: Works perfectly on phones and tablets  
**Dark Theme**: Modern, accessible interface  

## How It Works

1. **Excel to JSON**: Python script converts university Excel files to JSON format
2. **Static Site**: Pure HTML/CSS/JS loads exam data from JSON file
3. **Real-time Search**: JavaScript filters exams as you type
4. **Calendar Integration**: Click any exam to generate calendar links

## University Integration

This project is currently specific to my university **Victoria University of Wellington VUW**. If you'd like integration for other universities or schools, feel free to reach out! The Excel parsing script can be adapted for different formats.

## Technical

- **JSON Data** - Easy to update exam schedules
- **Calendar APIs** - Google Calendar and Apple Calendar integration
- **Responsive Design** - Mobile-first approach

## Live Demo

[andrew-exam-app.netlify.app](https://andrew-exam-app.netlify.app)

## Usage

1. **Search exams** by course code (e.g., "AIML231")
2. **Click any exam row** to open calendar options
3. **Choose calendar** - Google Calendar, Apple Calendar, or copy details
4. **Add to calendar** with one click

## Update Exam Data

When you get a new Excel file:
```bash
python3 convert_excel.py new_schedule.xlsx
git add exams.json
git commit -m "Update exam schedule"
git push
```

## Future Features

- Calendar integration (Google/Apple) **Done**
- Email notifications
- User authentication (e.g. Google Login)
- Mobile app version  **Done**