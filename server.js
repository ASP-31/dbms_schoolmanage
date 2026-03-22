// basic Express server for school management system

// load environment variables from .env; fall back to .env.example when the primary file doesn't exist
const fs = require('fs');
const dotenv = require('dotenv');

if (fs.existsSync('.env')) {
  dotenv.config(); // load real environment settings
} else if (fs.existsSync('.env.example')) {
  console.warn('WARNING: .env not found, loading variables from .env.example');
  dotenv.config({ path: '.env.example' });
} else {
  console.warn('No environment file found; relying entirely on process environment');
}

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

// database connection (pool or client)
const db = require('./db/connection');

// routers
const studentsRouter = require('./routes/students');
const departmentsRouter = require('./routes/departments');
const coursesRouter = require('./routes/courses');
const attendanceRouter = require('./routes/attendance');
const marksRouter = require('./routes/marks');

const app = express();
const PORT = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const path = require("path");

app.use(express.static(path.join(__dirname, )));
// mount route handlers
app.use('/api/students', studentsRouter);
app.use('/api/departments', departmentsRouter);
app.use('/api/courses', coursesRouter);
app.use('/api/attendance', attendanceRouter);
app.use('/api/marks', marksRouter);
const multer = require("multer");
const csv = require("csv-parser");

// store uploaded files
const upload = multer({ dest: "uploads/" });

// simple health check
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// start server after ensuring database connectivity
async function startServer() {
  try {
    // promise pool returns [rows, fields] but we only need to execute a simple check
    await db.query('SELECT 1');
    console.log('Database connection successful.');

    // check if schema already exists by looking for the departments table
    const [tables] = await db.query(
      "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'departments'",
      [process.env.DB_NAME || 'school']
    );

    if (tables.length === 0) {
      // schema does not exist; create it
      console.log('Schema not found. Creating schema...');
      await initializeSchema();
    } else {
      console.log('Schema already exists. Accessing database...');
    }
  } catch (err) {
    console.error('Unable to reach database:', err);
    process.exit(1);
  }

  app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
}

async function initializeSchema() {
  try {
    // Create tables without DROP statements (idempotent)
    const queries = [
      `CREATE TABLE IF NOT EXISTS departments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS students (
        id INT AUTO_INCREMENT PRIMARY KEY,
        first_name VARCHAR(50) NOT NULL,
        last_name VARCHAR(50) NOT NULL,
        department_id INT,
        year INT,
        dob DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
      )`,
      `CREATE TABLE IF NOT EXISTS courses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        department_id INT,
        credits INT DEFAULT 3,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
      )`,
      `CREATE TABLE IF NOT EXISTS attendance (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        course_id INT,
        attended_date DATE NOT NULL,
        status ENUM('present','absent','late','excused') DEFAULT 'present',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL
      )`,
      `CREATE TABLE IF NOT EXISTS marks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        course_id INT NOT NULL,
        marks INT CHECK (marks >= 0 AND marks <= 100),
        term VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
      )`
    ];

    for (const query of queries) {
      await db.query(query);
    }
    console.log('Schema created successfully.');
  } catch (err) {
    console.error('Error initializing schema:', err);
    process.exit(1);
  }
}
app.post("/api/upload/:section", upload.single("file"), (req, res) => {
  const section = req.params.section;
  const validSections = ["students", "departments", "courses", "attendance", "marks"];
  
  if (!validSections.includes(section)) {
    return res.status(400).json({ error: "Invalid section" });
  }

  const results = [];

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on("data", (data) => results.push(data))
    .on("end", async () => {
      try {
        for (const row of results) {
          if (section === "students") {
            await db.query(
              `INSERT INTO students (first_name, last_name, department_id, year, dob) VALUES (?, ?, ?, ?, ?)`,
              [row.first_name, row.last_name, row.department_id || null, row.year || null, row.dob || null]
            );
          } else if (section === "departments") {
            await db.query(
              `INSERT INTO departments (name) VALUES (?)`,
              [row.name]
            );
          } else if (section === "courses") {
            await db.query(
              `INSERT INTO courses (name, department_id, credits) VALUES (?, ?, ?)`,
              [row.name, row.department_id || null, row.credits || 3]
            );
          } else if (section === "attendance") {
            await db.query(
              `INSERT INTO attendance (student_id, course_id, attended_date, status) VALUES (?, ?, ?, ?)`,
              [row.student_id, row.course_id || null, row.attended_date, row.status || 'present']
            );
          } else if (section === "marks") {
            await db.query(
              `INSERT INTO marks (student_id, course_id, marks, term) VALUES (?, ?, ?, ?)`,
              [row.student_id, row.course_id, row.marks, row.term || null]
            );
          }
        }
        res.json({ message: "CSV uploaded successfully" });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Upload failed" });
      } finally {
        fs.unlink(req.file.path, (e) => {}); // clean up uploaded file
      }
    });
});
app.delete("/api/clear/:section", async (req, res) => {
  const section = req.params.section;
  const validSections = ["students", "departments", "courses", "attendance", "marks"];
  
  if (!validSections.includes(section)) {
    return res.status(400).json({ error: "Invalid section" });
  }

  try {
    await db.query('SET FOREIGN_KEY_CHECKS = 0');
    await db.query(`TRUNCATE TABLE ${section}`);
    await db.query('SET FOREIGN_KEY_CHECKS = 1');
    res.json({ message: `${section} data cleared successfully` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Clear failed" });
  }
});

startServer();
