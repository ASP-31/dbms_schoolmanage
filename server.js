const fs = require('fs');
const path = require('path');

// MANUALLY READ AND PARSE .ENV FILE
const envPath = path.join(__dirname, '.env');
console.log('Reading .env from:', envPath);

try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    console.log('✅ .env file found and read');
    
    // Parse the .env content
    envContent.split('\n').forEach(line => {
        line = line.trim();
        if (line && !line.startsWith('#')) {
            const firstEqual = line.indexOf('=');
            if (firstEqual > 0) {
                const key = line.substring(0, firstEqual).trim();
                const value = line.substring(firstEqual + 1).trim();
                process.env[key] = value;
                console.log(`Set ${key}=${key.includes('PASSWORD') ? '******' : value}`);
            }
        }
    });
} catch (err) {
    console.error('❌ Could not read .env file:', err.message);
    process.exit(1);
}

const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

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

// DATABASE CONNECTION USING ENV VARIABLES
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect(err => {
    if(err) {
        console.log("❌ Database connection failed");
        console.log("Error code:", err.code);
        console.log("Error message:", err.message);
    } else {
        console.log("✅ Connected to MySQL");
    }
});

// Test route
app.get("/test", (req, res) => {
    res.json({ message: "Server is working!" });
});

// Test database route
app.get("/test-db", (req, res) => {
    db.query("SELECT 1 + 1 AS solution", (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ message: "Database working!", result: result[0].solution });
        }
    });
});

/* =========================
   CLASS ROUTES
========================= */
app.get("/api/class", (req, res) => {
    db.query("SELECT * FROM class", (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: err.message });
        }
        res.json(result);
    });
});

app.post("/api/class", (req, res) => {
    const { ClassName } = req.body;
    
    if (!ClassName) {
        return res.status(400).json({ error: "ClassName is required" });
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

    db.query(
        "INSERT INTO classes (ClassName) VALUES (?)",
        [ClassName],
        (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: err.message });
            }
            res.json({ message: "Class added successfully", id: result.insertId });
        }
    );
});

app.delete("/api/class/:id", (req, res) => {
    const id = req.params.id;

    db.query(
        "DELETE FROM class WHERE ClassID=?",
        [id],
        (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: err.message });
            }
            res.json({ message: "Class deleted successfully" });
        }
    );
});

/* =========================
   STUDENTS ROUTES
========================= */
app.get("/api/student", (req, res) => {
    db.query("SELECT * FROM student", (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: err.message });
        }
        res.json(result);
    });
});

app.post("/api/student", (req, res) => {
    const { Name, Age, ClassID } = req.body;
    
    if (!Name || !Age || !ClassID) {
        return res.status(400).json({ error: "Name, Age, and ClassID are required" });
    }

    db.query(
        "INSERT INTO student (Name, Age, ClassID) VALUES (?, ?, ?)",
        [Name, Age, ClassID],
        (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: err.message });
            }
            res.json({ message: "Student added successfully", id: result.insertId });
        }
    );
});

app.delete("/api/student/:id", (req, res) => {
    const id = req.params.id;

    db.query(
        "DELETE FROM student WHERE StudentID=?",
        [id],
        (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: err.message });
            }
            res.json({ message: "Student deleted successfully" });
        }
    );
});

/* =========================
   TEACHERS ROUTES
========================= */
app.get("/api/teacher", (req, res) => {
    db.query("SELECT * FROM teacher", (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: err.message });
        }
        res.json(result);
    });
});

app.post("/api/teacher", (req, res) => {
    const { Name, Subject } = req.body;
    
    if (!Name || !Subject) {
        return res.status(400).json({ error: "Name and Subject are required" });
    }

    db.query(
        "INSERT INTO teacher (Name, Subject) VALUES (?, ?)",
        [Name, Subject],
        (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: err.message });
            }
            res.json({ message: "Teacher added successfully", id: result.insertId });
        }
    );
});

app.delete("/api/teacher/:id", (req, res) => {
    const id = req.params.id;

    db.query(
        "DELETE FROM teacher WHERE TeacherID=?",
        [id],
        (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: err.message });
            }
            res.json({ message: "Teacher deleted successfully" });
        }
    );
});

/* =========================
   SUBJECTS ROUTES
========================= */
app.get("/api/subject", (req, res) => {
    db.query("SELECT * FROM subject", (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: err.message });
        }
        res.json(result);
    });
});

app.post("/api/subject", (req, res) => {
    const { SubjectName, TeacherID } = req.body;
    
    if (!SubjectName || !TeacherID) {
        return res.status(400).json({ error: "SubjectName and TeacherID are required" });
    }

    db.query(
        "INSERT INTO subject (SubjectName, TeacherID) VALUES (?, ?)",
        [SubjectName, TeacherID],
        (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: err.message });
            }
            res.json({ message: "Subject added successfully", id: result.insertId });
        }
    );
});

app.delete("/api/subject/:id", (req, res) => {
    const id = req.params.id;

    db.query(
        "DELETE FROM subject WHERE SubjectID=?",
        [id],
        (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: err.message });
            }
            res.json({ message: "Subject deleted successfully" });
        }
    );
});

/* =========================
   MARKS ROUTES
========================= */
app.get("/api/marks", (req, res) => {
    db.query("SELECT * FROM marks", (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: err.message });
        }
        res.json(result);
    });
});

app.post("/api/marks", (req, res) => {
    const { StudentID, SubjectID, Score } = req.body;
    
    if (!StudentID || !SubjectID || !Score) {
        return res.status(400).json({ error: "StudentID, SubjectID, and Score are required" });
    }

    db.query(
        "INSERT INTO marks (StudentID, SubjectID, Score) VALUES (?, ?, ?)",
        [StudentID, SubjectID, Score],
        (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: err.message });
            }
            res.json({ message: "Marks added successfully", id: result.insertId });
        }
    );
});

app.delete("/api/marks/:id", (req, res) => {
    const id = req.params.id;

    db.query(
        "DELETE FROM marks WHERE MarkID=?",
        [id],
        (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: err.message });
            }
            res.json({ message: "Marks deleted successfully" });
        }
    );
});

/* START SERVER */
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`\n✅ Server running on port ${PORT}`);
    console.log(`📝 Test server: http://localhost:${PORT}/test`);
    console.log(`📝 Test database: http://localhost:${PORT}/test-db`);
});