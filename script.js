let examData = [
    // This will be populated from the JSON file
];
let searchTimeout;

// Load exam data from JSON file
async function loadExamData() {
    try {
        const response = await fetch('./exams.json');
        examData = await response.json();
        displayExams(examData);
    } catch (error) {
        console.error('Error loading exam data:', error);
        const noExamsDiv = document.getElementById('noExams');
        let errorMessage = '<p>Error loading exam data. Please try again later.</p>';
        // Check if the page is being viewed from the local filesystem, which can cause fetch errors.
        if (window.location.protocol === 'file:') {
            errorMessage = `<p><strong>Error:</strong> Exam data could not be loaded.</p>
                            <p>Try running <code>python3 -m http.server</code> in your project folder</p>`;
        }
        noExamsDiv.innerHTML = errorMessage;
    }
}

// Event listeners
document.getElementById('searchInput').addEventListener('input', () => {
    // Debounce search input
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        search();
    }, 100); // Wait 100ms after user stops typing
});
document.getElementById('searchInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') search();
});

document.getElementById('clearSearch').addEventListener('click', () => {
    document.getElementById('searchInput').value = '';
    document.getElementById('searchStatus').style.display = 'none';
    displayExams(examData);
});

// Calendar modal event listeners
document.getElementById('closeModalBtn').addEventListener('click', closeModal);
document.getElementById('copyBtn').addEventListener('click', copyToClipboard);

// Close modal when clicking overlay
document.getElementById('calendarModal').addEventListener('click', (e) => {
    if (e.target.id === 'calendarModal') {
        closeModal();
    }
});

// Search functionality
function search() {
    const query = document.getElementById('searchInput').value.trim().toLowerCase();
    
    if (query === '') {
        document.getElementById('searchStatus').style.display = 'none';
        displayExams(examData);
    } else {
        const filteredExams = examData.filter(exam => 
            exam.course_code.toLowerCase().includes(query)
        );
        
        displayExams(filteredExams);
        
        showSearchStatus(
            filteredExams.length === 0 ? 
                `No results for "${query}"` : 
                `Found ${filteredExams.length} result(s) for "${query}"`, 
            filteredExams.length === 0 ? 'warning' : 'success'
        );
    }
}

// Display exams
function displayExams(exams) {
    const tableBody = document.getElementById('examTableBody');
    const noExamsDiv = document.getElementById('noExams');
    const examCountDiv = document.getElementById('examCount');
    const table = document.getElementById('examTable');
    
    if (exams.length === 0) {
        table.style.display = 'none';
        noExamsDiv.style.display = 'block';
        examCountDiv.textContent = '';
    } else {
        table.style.display = 'table';
        noExamsDiv.style.display = 'none';
        examCountDiv.textContent = `Showing ${exams.length} exam(s)`;
        
        tableBody.innerHTML = exams.map((exam, index) => `
            <tr data-exam-index="${index}">
                <td>${exam.course_code || '-'}</td>
                <td>${exam.exam_date || '-'}</td>
                <td>${exam.start_time || '-'}</td>
                <td>${exam.duration || '-'}</td>
                <td>${exam.room || '-'}</td>
                <td>${exam.student_split || '-'}</td>
            </tr>
        `).join('');
        
        // Add click event listeners to rows
        const rows = tableBody.querySelectorAll('tr');
        rows.forEach(row => {
            row.addEventListener('click', () => {
                const examIndex = parseInt(row.getAttribute('data-exam-index'));
                openCalendarModal(exams[examIndex]);
            });
        });
    }
}

// Open calendar modal
function openCalendarModal(exam) {
    const modal = document.getElementById('calendarModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalDescription = document.getElementById('modalDescription');
    const googleBtn = document.getElementById('googleCalendarBtn');
    const appleBtn = document.getElementById('appleCalendarBtn');
    const copyBtn = document.getElementById('copyBtn');
    
    // Update modal content
    modalTitle.textContent = `Add ${exam.course_code} to Calendar`;
    modalDescription.textContent = `Choose how you'd like to add this exam to your calendar:`;
    
    // Generate calendar links
    const calendarData = generateCalendarData(exam);
    
    // Google Calendar link
    const googleUrl = generateGoogleCalendarUrl(calendarData);
    googleBtn.href = googleUrl;
    
    // Apple Calendar link
    const appleUrl = generateAppleCalendarUrl(calendarData);
    appleBtn.href = appleUrl;
    
    // Reset copy button
    copyBtn.textContent = 'Copy Details';
    copyBtn.classList.remove('copied');
    
    // Store calendar data for copy function
    copyBtn.setAttribute('data-calendar-text', generateCopyText(calendarData));
    
    // Show modal with animation
    modal.style.display = 'flex';
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
}

// Close modal
function closeModal() {
    const modal = document.getElementById('calendarModal');
    const copyBtn = document.getElementById('copyBtn');
    
    modal.classList.remove('show');
    setTimeout(() => {
        modal.style.display = 'none';
        copyBtn.classList.remove('copied');
    }, 300);
}

// Copy to clipboard
function copyToClipboard() {
    const copyBtn = document.getElementById('copyBtn');
    const calendarText = copyBtn.getAttribute('data-calendar-text');
    
    try {
        navigator.clipboard.writeText(calendarText).then(() => {
            // Update button text and style
            copyBtn.textContent = 'Copied!';
            copyBtn.classList.add('copied');
            
            // Reset after 2 seconds
            setTimeout(() => {
                copyBtn.textContent = 'Copy Details';
                copyBtn.classList.remove('copied');
            }, 2000);
        });
    } catch (err) {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = calendarText;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        
        // Update button text and style
        copyBtn.textContent = 'Copied!';
        copyBtn.classList.add('copied');
        
        // Reset after 2 seconds
        setTimeout(() => {
            copyBtn.textContent = 'Copy Details';
            copyBtn.classList.remove('copied');
        }, 2000);
    }
}

// Generate calendar data from exam
function generateCalendarData(exam) {
    const date = new Date(exam.exam_date);
    const startTime = exam.start_time;
    const duration = parseInt(exam.duration) || 120;
    
    // Parse start time
    const [hours, minutes] = startTime.split(':').map(Number);
    const startDateTime = new Date(date);
    startDateTime.setHours(hours, minutes, 0, 0);
    
    // Calculate end time
    const endDateTime = new Date(startDateTime);
    endDateTime.setMinutes(endDateTime.getMinutes() + duration);
    
    return {
        title: `${exam.course_code} Exam`,
        description: `Exam for ${exam.course_code}\nRoom: ${exam.room}\nStudent Split: ${exam.student_split}`,
        location: exam.room,
        start: startDateTime,
        end: endDateTime,
        duration: duration
    };
}

// Generate Google Calendar URL
function generateGoogleCalendarUrl(data) {
    const start = data.start.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const end = data.end.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(data.title)}&dates=${start}/${end}&details=${encodeURIComponent(data.description)}&location=${encodeURIComponent(data.location)}`;
}

// Generate Apple Calendar URL
function generateAppleCalendarUrl(data) {
    const start = data.start.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const end = data.end.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    
    return `data:text/calendar;charset=utf8,BEGIN:VCALENDAR%0D%0AVERSION:2.0%0D%0ABEGIN:VEVENT%0D%0ADTSTART:${start}%0D%0ADTEND:${end}%0D%0ASUMMARY:${encodeURIComponent(data.title)}%0D%0ADESCRIPTION:${encodeURIComponent(data.description)}%0D%0ALOCATION:${encodeURIComponent(data.location)}%0D%0AEND:VEVENT%0D%0AEND:VCALENDAR`;
}

// Generate copy text
function generateCopyText(data) {
    const formatDate = (date) => {
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };
    
    const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };
    
    return `Event: ${data.title}
Date: ${formatDate(data.start)}
Time: ${formatTime(data.start)} - ${formatTime(data.end)}
Location: ${data.location}
Details: ${data.description}`;
}

// Show search status
function showSearchStatus(message, type) {
    const div = document.getElementById('searchStatus');
    div.textContent = message;
    div.className = `search-status ${type}`;
    div.style.display = 'block';
}

// Load data when page loads
document.addEventListener('DOMContentLoaded', loadExamData); 