const API = "http://localhost:3000/api";

let currentSection = "students";

let student = [];
let classes = [];
let teachers = [];
let subjects = [];
let marks = [];


/* ---------------- NAVIGATION ---------------- */

function navigate(section, event) {

  document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
  document.getElementById(`section-${section}`).classList.add("active");

  document.querySelectorAll(".nav-item").forEach(i => i.classList.remove("active"));
  event.target.classList.add("active");

  currentSection = section;

  loadSectionData();
}


/* ---------------- LOAD DATA ---------------- */

async function loadSectionData() {

  try {

    if (currentSection === "student") {
      const res = await fetch(`${API}/student`);
      student = await res.json();
      renderStudents();
    }

    if (currentSection === "class") {
      const res = await fetch(`${API}/class`);
      classes = await res.json();
      renderClasses();
    }

    if (currentSection === "teacher") {
      const res = await fetch(`${API}/teacher`);
      teachers = await res.json();
      renderTeachers();
    }

    if (currentSection === "subject") {
      const res = await fetch(`${API}/subject`);
      subjects = await res.json();
      renderSubjects();
    }

    if (currentSection === "marks") {
      const res = await fetch(`${API}/marks`);
      marks = await res.json();
      renderMarks();
    }

  } catch (err) {
    toast("Error loading data");
  }
}


/* ---------------- STUDENTS ---------------- */

function renderStudents() {

  const body = document.getElementById("students-body");
  body.innerHTML = "";

  student.forEach(s => {

    body.innerHTML += `
      <tr>
        <td>${s.StudentID}</td>
        <td>${s.Name}</td>
        <td>${s.Age}</td>
        <td>${s.ClassID}</td>
        <td>
          <button class="btn btn-danger btn-sm" onclick="deleteStudent(${s.id})">Delete</button>
        </td>
      </tr>
    `;
  });
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

  await fetch(`${API}/student/${id}`, {
    method: "DELETE"
  });

  loadSectionData();
}


/* ---------------- CLASSES ---------------- */

function renderClasses() {

  const body = document.getElementById("classes-body");
  body.innerHTML = "";

  classes.forEach(c => {

    body.innerHTML += `
      <tr>
        <td>${c.ClassID}</td>
        <td>${c.ClassName}</td>
        <td>
          <button class="btn btn-danger btn-sm" onclick="deleteDepartment(${d.id})">Delete</button>
        </td>
      </tr>
    `;
  });
}

async function deleteClass(id) {

  await fetch(`${API}/class/${id}`, {
    method: "DELETE"
  });

  loadSectionData();
}


/* ---------------- TEACHERS ---------------- */

function renderTeachers() {

  const body = document.getElementById("teachers-body");
  body.innerHTML = "";

  teachers.forEach(t => {

    body.innerHTML += `
      <tr>
        <td>${t.TeacherID}</td>
        <td>${t.Name}</td>
        <td>${t.Subject}</td>
        <td>
          <button class="btn btn-danger btn-sm" onclick="deleteCourse(${c.id})">Delete</button>
        </td>
      </tr>
    `;
  });
}

async function deleteTeacher(id) {

  await fetch(`${API}/teacher/${id}`, {
    method: "DELETE"
  });

  loadSectionData();
}


/* ---------------- SUBJECTS ---------------- */

function renderSubjects() {

  const body = document.getElementById("subject-body");
  body.innerHTML = "";

  subjects.forEach(s => {

    body.innerHTML += `
      <tr>
        <td>${s.SubjectID}</td>
        <td>${s.SubjectName}</td>
        <td>${s.TeacherID}</td>
        <td>
          <button onclick="deleteSubject(${s.SubjectID})">Delete</button>
        </td>
      </tr>
    `;
  });
}

async function deleteSubject(id) {

  await fetch(`${API}/subject/${id}`, {
    method: "DELETE"
  });

  loadSectionData();
}


/* ---------------- MARKS ---------------- */

function renderMarks() {

  const body = document.getElementById("marks-body");
  body.innerHTML = "";

  marks.forEach(m => {

    body.innerHTML += `
      <tr>
        <td>${m.MarkID}</td>
        <td>${m.StudentID}</td>
        <td>${m.SubjectID}</td>
        <td>${m.Score}</td>
        <td>
          <button class="btn btn-danger btn-sm" onclick="deleteMarks(${m.id})">Delete</button>
        </td>
      </tr>
    `;
  });
}

async function deleteMarks(id) {

  await fetch(`${API}/marks/${id}`, {
    method: "DELETE"
  });

  loadSectionData();
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
  },3000);
}


/* ---------------- INIT ---------------- */

loadSectionData();