/*
    File only created for testing purposes to check the functionality. Final changes will be made 



*/






const API = "http://localhost:3000/api";

let currentSection = "dashboard";

let students = [];
let departments = [];
let courses = [];
let marks = [];
let attendance = [];

/* ---------------- NAVIGATION ---------------- */

function navigate(section) {

  document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
  document.getElementById(`section-${section}`).classList.add("active");

  document.querySelectorAll(".nav-item").forEach(i => i.classList.remove("active"));
  event.target.classList.add("active");

  currentSection = section;

  document.getElementById("pageTitle").innerText =
    section.charAt(0).toUpperCase() + section.slice(1);

  loadSectionData();
}

/* ---------------- LOAD DATA ---------------- */

async function loadSectionData() {

  try {

    if (currentSection === "students") {
      const res = await fetch(`${API}/students`);
      students = await res.json();
      renderStudents();
    }

    if (currentSection === "departments") {
      const res = await fetch(`${API}/departments`);
      departments = await res.json();
      renderDepartments();
    }

    if (currentSection === "courses") {
      const res = await fetch(`${API}/courses`);
      courses = await res.json();
      renderCourses();
    }

    if (currentSection === "marks") {
      const res = await fetch(`${API}/marks`);
      marks = await res.json();
      renderMarks();
    }

    if (currentSection === "attendance") {
      const res = await fetch(`${API}/attendance`);
      attendance = await res.json();
      renderAttendance();
    }

    if (currentSection === "dashboard") {
      loadDashboard();
    }

  } catch (err) {
    toast("Error loading data");
  }
}

/* ---------------- DASHBOARD ---------------- */

async function loadDashboard() {

  const s = await fetch(`${API}/students`).then(r => r.json());
  const d = await fetch(`${API}/departments`).then(r => r.json());
  const c = await fetch(`${API}/courses`).then(r => r.json());
  const a = await fetch(`${API}/attendance`).then(r => r.json());

  document.getElementById("stat-students").innerText = s.length;
  document.getElementById("stat-depts").innerText = d.length;
  document.getElementById("stat-courses").innerText = c.length;

  let present = a.filter(x => x.status === "present").length;
  let avg = a.length ? Math.round((present / a.length) * 100) : 0;

  document.getElementById("stat-attendance").innerText = avg + "%";
}

/* ---------------- STUDENTS ---------------- */

function renderStudents() {

  const body = document.getElementById("students-body");
  body.innerHTML = "";

  students.forEach(s => {

    const row = `
      <tr>
        <td>${s.id}</td>
        <td>${s.first_name} ${s.last_name}</td>
        <td>${s.department_name || "-"}</td>
        <td>${s.avg_marks || "-"}</td>
        <td>${s.attendance || "-"}</td>
        <td>
          <button class="btn btn-danger btn-sm" onclick="deleteStudent(${s.id})">Delete</button>
        </td>
      </tr>
    `;

    body.innerHTML += row;

  });

  document.getElementById("students-count").innerText =
    students.length + " total";
}

async function clearSectionData() {
  if (currentSection === "dashboard") {
    toast("Cannot clear data directly from dashboard.");
    return;
  }
  if (!confirm(`Are you sure you want to permanently delete ALL data in the ${currentSection} section?`)) return;

  try {
    const res = await fetch(`${API}/clear/${currentSection}`, {
      method: "DELETE"
    });
    if (res.ok) {
      toast(`${currentSection} data cleared!`);
      loadSectionData();
    } else {
      toast("Failed to clear data.");
    }
  } catch (err) {
    toast("Error clearing data");
  }
}

async function deleteStudent(id) {

  if (!confirm("Delete student?")) return;

  await fetch(`${API}/students/${id}`, {
    method: "DELETE"
  });

  loadSectionData();
}

/* ---------------- DEPARTMENTS ---------------- */

function renderDepartments() {

  const body = document.getElementById("depts-body");
  body.innerHTML = "";

  departments.forEach(d => {

    body.innerHTML += `
      <tr>
        <td>${d.id}</td>
        <td>${d.name}</td>
        <td>${d.courses || 0}</td>
        <td>${d.students || 0}</td>
        <td>
          <button class="btn btn-danger btn-sm" onclick="deleteDepartment(${d.id})">Delete</button>
        </td>
      </tr>
    `;

  });

  document.getElementById("depts-count").innerText =
    departments.length + " total";
}

/* ---------------- COURSES ---------------- */

function renderCourses() {

  const body = document.getElementById("courses-body");
  body.innerHTML = "";

  courses.forEach(c => {

    body.innerHTML += `
      <tr>
        <td>${c.id}</td>
        <td>${c.name}</td>
        <td>${c.department_name || "-"}</td>
        <td>${c.enrolled || 0}</td>
        <td>${c.avg_score || "-"}</td>
        <td>
          <button class="btn btn-danger btn-sm" onclick="deleteCourse(${c.id})">Delete</button>
        </td>
      </tr>
    `;

  });

  document.getElementById("courses-count").innerText =
    courses.length + " total";
}

/* ---------------- MARKS ---------------- */

function renderMarks() {

  const body = document.getElementById("marks-body");
  body.innerHTML = "";

  marks.forEach(m => {

    const grade =
      m.marks >= 90 ? "A" :
      m.marks >= 75 ? "B" :
      m.marks >= 60 ? "C" :
      m.marks >= 40 ? "D" : "F";

    body.innerHTML += `
      <tr>
        <td>${m.student_name}</td>
        <td>${m.course_name}</td>
        <td>${m.marks}</td>
        <td>${grade}</td>
        <td>${m.marks}%</td>
        <td>
          <button class="btn btn-danger btn-sm" onclick="deleteMarks(${m.id})">Delete</button>
        </td>
      </tr>
    `;

  });

  document.getElementById("marks-count").innerText =
    marks.length + " entries";
}

/* ---------------- ATTENDANCE ---------------- */

function renderAttendance() {

  const body = document.getElementById("att-body");
  body.innerHTML = "";

  attendance.forEach(a => {

    body.innerHTML += `
      <tr>
        <td>${a.student_name}</td>
        <td>${a.attended_date}</td>
        <td>${a.status}</td>
        <td>
          <button class="btn btn-danger btn-sm" onclick="deleteAttendance(${a.id})">Delete</button>
        </td>
      </tr>
    `;

  });

  document.getElementById("att-count").innerText =
    attendance.length + " entries";
}

/* ---------------- MODAL ---------------- */

function openAddModal() {
  const body = document.getElementById("modalBody");

  let sectionSelectHtml = '';
  let targetName = currentSection.charAt(0).toUpperCase() + currentSection.slice(1);
  
  if (currentSection === "dashboard") {
    targetName = "Selected Section";
    sectionSelectHtml = `
      <div style="margin-bottom: 1rem;">
        <label style="display:block; margin-bottom:0.5rem; font-weight: 500;">Select Section to Upload to</label>
        <select id="uploadSectionSelect" class="form-control" style="width: 100%; padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px;">
          <option value="students">Students</option>
          <option value="departments">Departments</option>
          <option value="courses">Courses</option>
          <option value="attendance">Attendance</option>
          <option value="marks">Marks</option>
        </select>
      </div>
    `;
  }

  body.innerHTML = `
    ${sectionSelectHtml}
    <div style="margin-bottom: 1.5rem;">
      <label style="display:block; margin-bottom:0.5rem; font-weight: 500;">
        Upload CSV Data for ${targetName}
      </label>
      <input type="file" id="csvFileInput" accept=".csv" class="form-control" style="width: 100%; padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px;" />
    </div>
    <button class="btn btn-primary" onclick="uploadCSV()" style="width: 100%;">Upload CSV</button>
    <hr style="margin: 1.5rem 0; border: none; border-top: 1px solid #eee;" />
    <p style="font-size: 0.85em; color: #666; margin-top: 0.5rem;">Make sure your CSV header matches the database fields.</p>
  `;

  document.getElementById("modalBackdrop").classList.add("open");
}

async function uploadCSV() {
  const fileInput = document.getElementById("csvFileInput");
  if (!fileInput || !fileInput.files.length) {
    toast("Please select a file to upload.");
    return;
  }
  
  let targetSection = currentSection;
  if (currentSection === "dashboard") {
    const select = document.getElementById("uploadSectionSelect");
    if(select) targetSection = select.value;
  }

  const file = fileInput.files[0];
  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await fetch(`${API}/upload/${targetSection}`, {
      method: "POST",
      body: formData
    });

    if (res.ok) {
      toast("CSV uploaded successfully");
      closeModal();
      loadSectionData();
    } else {
      const data = await res.json();
      toast(data.error || "Upload failed");
    }
  } catch (err) {
    toast("Error uploading CSV");
  }
}

function closeModal() {
  document.getElementById("modalBackdrop").classList.remove("open");
}

function closeModalOnBackdrop(e) {
  if (e.target.id === "modalBackdrop") closeModal();
}

/* ---------------- TOAST ---------------- */

function toast(msg) {

  const container = document.getElementById("toastContainer");

  const el = document.createElement("div");
  el.className = "toast";
  el.innerText = msg;

  container.appendChild(el);

  setTimeout(() => {
    el.remove();
  }, 3000);
}

/* ---------------- EXPORT CSV ---------------- */

function exportData() {

  let data = [];

  if (currentSection === "students") data = students;
  if (currentSection === "departments") data = departments;
  if (currentSection === "courses") data = courses;
  if (currentSection === "marks") data = marks;
  if (currentSection === "attendance") data = attendance;

  if (!data.length) {
    toast("No data to export");
    return;
  }

  const keys = Object.keys(data[0]);

  const csv =
    keys.join(",") +
    "\n" +
    data.map(row =>
      keys.map(k => row[k]).join(",")
    ).join("\n");

  const blob = new Blob([csv]);

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = currentSection + ".csv";

  a.click();
}

/* ---------------- INIT ---------------- */

loadSectionData();