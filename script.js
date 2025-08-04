// Sample exam data
let examData = [
    // This will be populated from the JSON file
];

// Load exam data from JSON file
async function loadExamData() {
    try {
        const response = await fetch('./exams.json');
        examData = await response.json();
        displayExams(examData);
    } catch (error) {
        console.error('Error loading exam data:', error);
        document.getElementById('noExams').innerHTML = 
            '<p>Error loading exam data. Please check back later.</p>';
    }
}

// Event listeners
document.getElementById('searchBtn').addEventListener('click', () => search());
document.getElementById('searchInput').addEventListener('input', () => search());
document.getElementById('searchInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') search();
});

document.getElementById('clearSearch').addEventListener('click', () => {
    document.getElementById('searchInput').value = '';
    document.getElementById('searchStatus').style.display = 'none';
    displayExams(examData);
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
        
        tableBody.innerHTML = exams.map(exam => `
            <tr>
                <td>${exam.course_code || '-'}</td>
                <td>${exam.exam_date || '-'}</td>
                <td>${exam.start_time || '-'}</td>
                <td>${exam.duration || '-'}</td>
                <td>${exam.room || '-'}</td>
                <td>${exam.student_split || '-'}</td>
            </tr>
        `).join('');
    }
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