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

// database connection
const db = require('./db/connection');

// routers
const classRouter = require('./routes/class');
const studentRouter = require('./routes/student');
const teacherRouter = require('./routes/teacher');
const subjectRouter = require('./routes/subject');
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
app.use('/api/class', classRouter);
app.use('/api/student', studentRouter);
app.use('/api/teacher', teacherRouter);
app.use('/api/subject', subjectRouter);
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
    await db.query('SELECT 1');
    console.log('Database connection successful.');

    const [tables] = await db.query(
      "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'class'",
      [process.env.DB_NAME || 'school']
    );

    if (tables.length === 0) {
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
    const queries = [
      `CREATE TABLE IF NOT EXISTS class (
        id INT AUTO_INCREMENT PRIMARY KEY,
        class_name VARCHAR(100) NOT NULL UNIQUE
      )`,
      `CREATE TABLE IF NOT EXISTS student (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        age INT,
        class_id INT,
        FOREIGN KEY (class_id) REFERENCES class(id) ON DELETE SET NULL
      )`,
      `CREATE TABLE IF NOT EXISTS teacher (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        subject VARCHAR(100)
      )`,
      `CREATE TABLE IF NOT EXISTS subject (
        id INT AUTO_INCREMENT PRIMARY KEY,
        subject_name VARCHAR(100) NOT NULL,
        teacher_id INT,
        FOREIGN KEY (teacher_id) REFERENCES teacher(id) ON DELETE SET NULL
      )`,
      `CREATE TABLE IF NOT EXISTS marks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        subject_id INT NOT NULL,
        score INT NOT NULL,
        FOREIGN KEY (student_id) REFERENCES student(id) ON DELETE CASCADE,
        FOREIGN KEY (subject_id) REFERENCES subject(id) ON DELETE CASCADE
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
  const validSections = ["class", "student", "teacher", "subject", "marks"];
  
  if (!validSections.includes(section)) {
    return res.status(400).json({ error: "Invalid section" });
  }

  const results = [];

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('headers', (headers) => {
      // Strip BOM from first header if present just to be absolutely safe
      if (headers.length > 0 && headers[0].charCodeAt(0) === 0xFEFF) {
        headers[0] = headers[0].substring(1);
      }
    })
    .on("data", (data) => results.push(data))
    .on("end", async () => {
      try {
        for (const row of results) {
          if (section === "class") {
            await db.query(
              `INSERT INTO class (class_name) VALUES (?)`,
              [row.class_name]
            );
          } else if (section === "student") {
            await db.query(
              `INSERT INTO student (name, age, class_id) VALUES (?, ?, ?)`,
              [row.name, row.age || null, row.class_id || null]
            );
          } else if (section === "teacher") {
            await db.query(
              `INSERT INTO teacher (name, subject) VALUES (?, ?)`,
              [row.name, row.subject || null]
            );
          } else if (section === "subject") {
            await db.query(
              `INSERT INTO subject (subject_name, teacher_id) VALUES (?, ?)`,
              [row.subject_name, row.teacher_id || null]
            );
          } else if (section === "marks") {
            await db.query(
              `INSERT INTO marks (student_id, subject_id, score) VALUES (?, ?, ?)`,
              [row.student_id, row.subject_id, row.score || 0]
            );
          }
        }
        res.json({ message: "CSV uploaded successfully" });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Upload failed" });
      } finally {
        fs.unlink(req.file.path, (e) => {}); // clean up
      }
    });
});

app.delete("/api/clear/:section", async (req, res) => {
  const section = req.params.section;
  const validSections = ["class", "student", "teacher", "subject", "marks"];
  
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