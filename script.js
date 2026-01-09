let examData = [];
let currentSort = { column: null, direction: "none" };
let searchTimeout;

// Event Listeners

// Run on page load
document.addEventListener("DOMContentLoaded", loadExamData);

// Search and filter listeners
document.getElementById("searchInput").addEventListener("input", () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(applyFiltersAndSort, 100);
});
document.getElementById("searchInput").addEventListener("keypress", (e) => {
  if (e.key === "Enter") applyFiltersAndSort();
});
document
  .getElementById("dateFilter")
  .addEventListener("change", applyFiltersAndSort);
document
  .getElementById("roomFilter")
  .addEventListener("change", applyFiltersAndSort);
document.getElementById("resetFilters").addEventListener("click", () => {
  document.getElementById("searchInput").value = "";
  document.getElementById("dateFilter").value = "";
  document.getElementById("roomFilter").value = "";
  currentSort = { column: null, direction: "none" };
  applyFiltersAndSort();
});

// Sorting listener
document.getElementById("tableHeader").addEventListener("click", (e) => {
  if (e.target.matches("th[data-sort]")) {
    handleSort(e.target.dataset.sort);
  }
});

// Modal listeners
document.getElementById("closeModalBtn").addEventListener("click", closeModal);
document.getElementById("copyBtn").addEventListener("click", copyToClipboard);
document.getElementById("calendarModal").addEventListener("click", (e) => {
  if (e.target.id === "calendarModal") closeModal();
});

// Back to top button listeners
const backToTopBtn = document.getElementById("backToTopBtn");
window.onscroll = () => {
  if (
    document.body.scrollTop > 100 ||
    document.documentElement.scrollTop > 100
  ) {
    backToTopBtn.style.display = "block";
  } else {
    backToTopBtn.style.display = "none";
  }
};
backToTopBtn.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// Core Functions

// Load initial data
async function loadExamData() {
  try {
    const response = await fetch("./exams.json");
    examData = await response.json();
    populateFilters(examData);
    applyFiltersAndSort();
  } catch (error) {
    console.error("Error loading exam data:", error);
    const noExamsDiv = document.getElementById("noExams");
    let errorMessage =
      "<p>Error loading exam data. Please try again later.</p>";
    if (window.location.protocol === "file:") {
      errorMessage = `<p><strong>Error:</strong> Exam data could not be loaded.</p>
                            <p>Try running <code>python3 -m http.server</code> in your project folder.</p>`;
    }
    noExamsDiv.innerHTML = errorMessage;
  }
}

// Populate filter dropdowns
function populateFilters(exams) {
  const dateFilter = document.getElementById("dateFilter");
  const roomFilter = document.getElementById("roomFilter");

  const uniqueDates = [
    ...new Set(exams.map((e) => e.exam_date).filter(Boolean)),
  ].sort();
  const uniqueRooms = [
    ...new Set(exams.map((e) => e.room).filter(Boolean)),
  ].sort();

  uniqueDates.forEach((date) => {
    const option = document.createElement("option");
    option.value = date;
    option.textContent = date;
    dateFilter.appendChild(option);
  });

  uniqueRooms.forEach((room) => {
    const option = document.createElement("option");
    option.value = room;
    option.textContent = room;
    roomFilter.appendChild(option);
  });
}

// Main function to filter, sort, and display data
function applyFiltersAndSort() {
  const searchQuery = document
    .getElementById("searchInput")
    .value.trim()
    .toLowerCase();
  const dateQuery = document.getElementById("dateFilter").value;
  const roomQuery = document.getElementById("roomFilter").value;

  // Filter
  let filteredExams = examData.filter((exam) => {
    const searchMatch = exam.course_code.toLowerCase().includes(searchQuery);
    const dateMatch = !dateQuery || exam.exam_date === dateQuery;
    const roomMatch = !roomQuery || exam.room === roomQuery;
    return searchMatch && dateMatch && roomMatch;
  });

  // Sort
  if (currentSort.column && currentSort.direction !== "none") {
    filteredExams.sort((a, b) => {
      const valA = a[currentSort.column];
      const valB = b[currentSort.column];

      let comparison = 0;
      if (
        currentSort.column === "exam_date" ||
        currentSort.column === "start_time"
      ) {
        const dateTimeA = new Date(`${a.exam_date}T${a.start_time || "00:00"}`);
        const dateTimeB = new Date(`${b.exam_date}T${b.start_time || "00:00"}`);
        comparison = dateTimeA - dateTimeB;
      } else {
        if (String(valA) > String(valB)) comparison = 1;
        else if (String(valA) < String(valB)) comparison = -1;
      }

      return currentSort.direction === "desc" ? comparison * -1 : comparison;
    });
  }

  // Display
  displayExams(filteredExams);
  updateSortIndicators();

  // Update Status
  if (searchQuery) {
    showSearchStatus(
      filteredExams.length === 0
        ? `No results for "${searchQuery}"`
        : `Found ${filteredExams.length} result(s) for "${searchQuery}"`,
      filteredExams.length === 0 ? "warning" : "success"
    );
  } else {
    document.getElementById("searchStatus").style.display = "none";
  }
}

// Handle sort state changes
function handleSort(column) {
  if (currentSort.column === column) {
    if (currentSort.direction === "asc") currentSort.direction = "desc";
    else if (currentSort.direction === "desc") currentSort.direction = "none";
    else currentSort.direction = "asc";
  } else {
    currentSort.column = column;
    currentSort.direction = "asc";
  }
  applyFiltersAndSort();
}

function updateSortIndicators() {
  document.querySelectorAll("th[data-sort]").forEach((th) => {
    th.classList.remove("sort-asc", "sort-desc");
    if (th.dataset.sort === currentSort.column) {
      if (currentSort.direction === "asc") th.classList.add("sort-asc");
      else if (currentSort.direction === "desc") th.classList.add("sort-desc");
    }
  });
}

// Display Function

function displayExams(exams) {
  const tableBody = document.getElementById("examTableBody");
  const noExamsDiv = document.getElementById("noExams");
  const examCountDiv = document.getElementById("examCount");
  const table = document.getElementById("examTable");

  if (exams.length === 0) {
    table.style.display = "none";
    noExamsDiv.style.display = "block";
    examCountDiv.textContent = "";
  } else {
    table.style.display = "table";
    noExamsDiv.style.display = "none";
    examCountDiv.textContent = `Showing ${exams.length} exam(s)`;

    tableBody.innerHTML = exams
      .map(
        (exam) => `
            <tr>
                <td>${exam.course_code || "-"}</td>
                <td>${exam.exam_date || "-"}</td>
                <td>${exam.start_time || "-"}</td>
                <td>${exam.duration || "-"}</td>
                <td>${exam.room || "-"}</td>
                <td>${exam.student_split || "-"}</td>
            </tr>
        `
      )
      .join("");

    const rows = tableBody.querySelectorAll("tr");
    rows.forEach((row, index) => {
      row.addEventListener("click", () => {
        openCalendarModal(exams[index]);
      });
    });
  }
}

// Modal and Calendar Functions

// Open calendar modal
function openCalendarModal(exam) {
  const modal = document.getElementById("calendarModal");
  const modalTitle = document.getElementById("modalTitle");
  const modalDescription = document.getElementById("modalDescription");
  const googleBtn = document.getElementById("googleCalendarBtn");
  const appleBtn = document.getElementById("appleCalendarBtn");
  const outlookBtn = document.getElementById("outlookCalendarBtn");
  const copyBtn = document.getElementById("copyBtn");

  // Update modal content
  modalTitle.textContent = `Add ${exam.course_code} to Calendar`;
  modalDescription.textContent = `Choose how you'd like to add this exam to your calendar:`;

  // Generate calendar links
  const calendarData = generateCalendarData(exam);
  const fileName = `${exam.course_code}_exam.ics`;

  // Google Calendar link
  const googleUrl = generateGoogleCalendarUrl(calendarData);
  googleBtn.href = googleUrl;

  // Apple Calendar link
  const iCalUrl = generateICalUrl(calendarData);
  appleBtn.href = iCalUrl;
  appleBtn.setAttribute("download", fileName);

  // Outlook Calendar link (for Work/School accounts)
  const outlookUrl = generateOutlookOfficeCalendarUrl(calendarData);
  outlookBtn.href = outlookUrl;

  // Reset copy button
  copyBtn.textContent = "Copy Details";
  copyBtn.classList.remove("copied");

  // Store calendar data for copy function
  copyBtn.setAttribute("data-calendar-text", generateCopyText(calendarData));

  // Show modal with animation
  modal.style.display = "flex";
  setTimeout(() => {
    modal.classList.add("show");
  }, 10);
}

// Close modal
function closeModal() {
  const modal = document.getElementById("calendarModal");
  const copyBtn = document.getElementById("copyBtn");

  modal.classList.remove("show");
  setTimeout(() => {
    modal.style.display = "none";
    copyBtn.classList.remove("copied");
  }, 300);
}

// Copy to clipboard
function copyToClipboard() {
  const copyBtn = document.getElementById("copyBtn");
  const calendarText = copyBtn.getAttribute("data-calendar-text");

  try {
    navigator.clipboard.writeText(calendarText).then(() => {
      // Update button text and style
      copyBtn.textContent = "Copied!";
      copyBtn.classList.add("copied");

      // Reset after 2 seconds
      setTimeout(() => {
        copyBtn.textContent = "Copy Details";
        copyBtn.classList.remove("copied");
      }, 2000);
    });
  } catch (err) {
    // Fallback for older browsers
    const textarea = document.createElement("textarea");
    textarea.value = calendarText;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);

    // Update button text and style
    copyBtn.textContent = "Copied!";
    copyBtn.classList.add("copied");

    // Reset after 2 seconds
    setTimeout(() => {
      copyBtn.textContent = "Copy Details";
      copyBtn.classList.remove("copied");
    }, 2000);
  }
}

// Generate calendar data from exam
function generateCalendarData(exam) {
  const date = new Date(exam.exam_date);
  const startTime = exam.start_time;
  const duration = parseInt(exam.duration) || 120;

  // Parse start time
  const [hours, minutes] = startTime.split(":").map(Number);
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
    duration: duration,
  };
}

// Generate Google Calendar URL
function generateGoogleCalendarUrl(data) {
  const start = data.start
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
  const end = data.end
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    data.title
  )}&dates=${start}/${end}&details=${encodeURIComponent(
    data.description
  )}&location=${encodeURIComponent(data.location)}`;
}

// Generate Outlook Calendar URL for Work/School (Office 365) accounts
function generateOutlookOfficeCalendarUrl(data) {
  const formatOutlookDate = (date) => date.toISOString().slice(0, 19);

  const params = new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    subject: data.title,
    startdt: formatOutlookDate(data.start),
    enddt: formatOutlookDate(data.end),
    body: data.description.replace(/\n/g, "<br>"),
    location: data.location,
  });

  return `https://outlook.office.com/calendar/0/deeplink/compose?${params.toString()}`;
}

// Generate a universal .ics file as a data URI
function generateICalUrl(data) {
  const icalContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "BEGIN:VEVENT",
    `DTSTART:${data.start
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "")}`,
    `DTEND:${data.end
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "")}`,
    `SUMMARY:${data.title}`,
    `DESCRIPTION:${data.description.replace(/\n/g, "\\n")}`,
    `LOCATION:${data.location}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return `data:text/calendar;charset=utf-8,${encodeURIComponent(icalContent)}`;
}

function generateCopyText(data) {
  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return `Event: ${data.title}
Date: ${formatDate(data.start)}
Time: ${formatTime(data.start)} - ${formatTime(data.end)}
Location: ${data.location}
Details: ${data.description}`;
}

function showSearchStatus(message, type) {
  const div = document.getElementById("searchStatus");
  div.textContent = message;
  div.className = `search-status ${type}`;
  div.style.display = "block";
}

document.addEventListener("DOMContentLoaded", loadExamData);
