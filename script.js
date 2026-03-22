const API = "http://localhost:3000/api";

let currentSection = "dashboard";

let classData = [];
let teacherData = [];
let subjectData = [];
let studentData = [];
let marksData = [];

/* ---------------- NAVIGATION ---------------- */

function navigate(section) {
  document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
  const sectionEl = document.getElementById(`section-${section}`);
  if(sectionEl) sectionEl.classList.add("active");

  document.querySelectorAll(".nav-item").forEach(i => i.classList.remove("active"));
  if (event && event.target) {
    const tgt = event.target.closest('.nav-item');
    if (tgt) tgt.classList.add("active");
  }

  currentSection = section;

  document.getElementById("pageTitle").innerText = section.charAt(0).toUpperCase() + section.slice(1);

  loadSectionData();
}

/* ---------------- LOAD DATA ---------------- */

async function loadSectionData() {
  try {
    if (currentSection === "class") {
      const res = await fetch(`${API}/class`);
      classData = await res.json();
      renderClasses();
    }
    if (currentSection === "teacher") {
      const res = await fetch(`${API}/teacher`);
      teacherData = await res.json();
      renderTeachers();
    }
    if (currentSection === "subject") {
      const res = await fetch(`${API}/subject`);
      subjectData = await res.json();
      renderSubjects();
    }
    if (currentSection === "student") {
      const res = await fetch(`${API}/student`);
      studentData = await res.json();
      renderStudents();
    }
    if (currentSection === "marks") {
      const res = await fetch(`${API}/marks`);
      marksData = await res.json();
      renderMarks();
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
  try {
    const c = await fetch(`${API}/class`).then(r => r.json());
    const s = await fetch(`${API}/student`).then(r => r.json());
    const t = await fetch(`${API}/teacher`).then(r => r.json());
    const sub = await fetch(`${API}/subject`).then(r => r.json());

    document.getElementById("stat-classes").innerText = c.length || 0;
    document.getElementById("stat-students").innerText = s.length || 0;
    document.getElementById("stat-teachers").innerText = t.length || 0;
    document.getElementById("stat-subjects").innerText = sub.length || 0;

    // Render tiny recent tables
    const dashStudents = document.getElementById("dash-students-body");
    dashStudents.innerHTML = s.slice(-5).map(x => `
      <tr>
        <td>${x.name || "-"}</td>
        <td>${x.class_name || "-"}</td>
        <td>${x.age || "-"}</td>
      </tr>
    `).join("");

  } catch(e) {
    console.error(e);
  }
}

/* ---------------- RENDERS ---------------- */

function renderClasses() {
  const body = document.getElementById("class-body");
  body.innerHTML = classData.map(c => `
    <tr>
      <td>${c.id}</td>
      <td>${c.class_name}</td>
      <td>${c.students || 0}</td>
      <td>
        <button class="btn btn-danger btn-sm" onclick="deleteRecord('class', ${c.id})">Delete</button>
      </td>
    </tr>
  `).join("");
  document.getElementById("class-count").innerText = classData.length + " total";
}

function renderTeachers() {
  const body = document.getElementById("teacher-body");
  body.innerHTML = teacherData.map(t => `
    <tr>
      <td>${t.id}</td>
      <td>${t.name}</td>
      <td>${t.subject || "-"}</td>
      <td>${t.subjects || 0}</td>
      <td>
        <button class="btn btn-danger btn-sm" onclick="deleteRecord('teacher', ${t.id})">Delete</button>
      </td>
    </tr>
  `).join("");
  document.getElementById("teacher-count").innerText = teacherData.length + " total";
}

function renderSubjects() {
  const body = document.getElementById("subject-body");
  body.innerHTML = subjectData.map(s => `
    <tr>
      <td>${s.id}</td>
      <td>${s.subject_name}</td>
      <td>${s.teacher_name || "-"}</td>
      <td>
        <button class="btn btn-danger btn-sm" onclick="deleteRecord('subject', ${s.id})">Delete</button>
      </td>
    </tr>
  `).join("");
  document.getElementById("subject-count").innerText = subjectData.length + " total";
}

function renderStudents() {
  const body = document.getElementById("student-body");
  body.innerHTML = studentData.map(s => `
    <tr>
      <td>${s.id}</td>
      <td>${s.name}</td>
      <td>${s.age || "-"}</td>
      <td>${s.class_name || "-"}</td>
      <td>${s.avg_score || "-"}</td>
      <td>
        <button class="btn btn-danger btn-sm" onclick="deleteRecord('student', ${s.id})">Delete</button>
      </td>
    </tr>
  `).join("");
  document.getElementById("student-count").innerText = studentData.length + " total";
}

function renderMarks() {
  const body = document.getElementById("marks-body");
  body.innerHTML = marksData.map(m => {
    const grade = m.score >= 90 ? "A" : m.score >= 75 ? "B" : m.score >= 60 ? "C" : m.score >= 40 ? "D" : "F";
    return `
    <tr>
      <td>${m.student_name || "-"}</td>
      <td>${m.subject_name || "-"}</td>
      <td>${m.score}</td>
      <td>${grade}</td>
      <td>
        <button class="btn btn-danger btn-sm" onclick="deleteRecord('marks', ${m.id})">Delete</button>
      </td>
    </tr>
  `}).join("");
  document.getElementById("marks-count").innerText = marksData.length + " entries";
}

/* ---------------- ACTIONS & CLEAR ---------------- */

async function deleteRecord(section, id) {
  if (!confirm(`Delete this record from ${section}?`)) return;
  await fetch(`${API}/${section}/${id}`, { method: "DELETE" });
  loadSectionData();
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

/* ---------------- MODAL / UPLOADS ---------------- */

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
          <option value="class">Classes</option>
          <option value="teacher">Teachers</option>
          <option value="subject">Subjects</option>
          <option value="student">Students</option>
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
    <p style="font-size: 0.85em; color: #666; margin-top: 0.5rem;">Make sure your CSV header matches the section's expected fields.</p>
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
  setTimeout(() => { el.remove(); }, 3000);
}

/* ---------------- EXPORT CSV ---------------- */

function exportData() {
  let data = [];

  if (currentSection === "class") data = classData;
  if (currentSection === "teacher") data = teacherData;
  if (currentSection === "subject") data = subjectData;
  if (currentSection === "student") data = studentData;
  if (currentSection === "marks") data = marksData;

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