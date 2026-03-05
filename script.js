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
          <button onclick="deleteStudent(${s.id})">Delete</button>
        </td>
      </tr>
    `;

    body.innerHTML += row;

  });

  document.getElementById("students-count").innerText =
    students.length + " total";
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
          <button onclick="deleteDepartment(${d.id})">Delete</button>
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
          <button onclick="deleteCourse(${c.id})">Delete</button>
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
          <button onclick="deleteMarks(${m.id})">Delete</button>
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
          <button onclick="deleteAttendance(${a.id})">Delete</button>
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

  body.innerHTML = `
    <p>Form for ${currentSection} will go here</p>
  `;

  document.getElementById("modalBackdrop").style.display = "flex";
}

function closeModal() {
  document.getElementById("modalBackdrop").style.display = "none";
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