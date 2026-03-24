-- School Teacher Management System Schema
CREATE DATABASE IF NOT EXISTS school;
USE school;

DROP TABLE IF EXISTS marks;
DROP TABLE IF EXISTS subject;
DROP TABLE IF EXISTS student;
DROP TABLE IF EXISTS teacher;
DROP TABLE IF EXISTS class;

-- CLASS TABLE
CREATE TABLE class (
    id INT AUTO_INCREMENT PRIMARY KEY,
    class_name VARCHAR(50) NOT NULL UNIQUE
);

-- TEACHER TABLE
CREATE TABLE teacher (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    subject VARCHAR(50)
);

-- STUDENT TABLE
CREATE TABLE student (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    age INT,
    class_id INT,
    FOREIGN KEY (class_id) REFERENCES class(id)
    ON DELETE SET NULL
);

-- SUBJECT TABLE
CREATE TABLE subject (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subject_name VARCHAR(50) NOT NULL,
    teacher_id INT,
    FOREIGN KEY (teacher_id) REFERENCES teacher(id)
    ON DELETE SET NULL
);

-- MARKS TABLE
CREATE TABLE marks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT,
    subject_id INT,
    score INT CHECK (score BETWEEN 0 AND 100),
    FOREIGN KEY (student_id) REFERENCES student(id)
    ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subject(id)
    ON DELETE CASCADE
);