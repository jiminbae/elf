-- KNU Grading System — Supabase Database Schema
-- Place this schema in the Supabase SQL Editor to define all required tables and disable RLS.

-- Cleanup existing tables if they exist
DROP TABLE IF EXISTS submission_contents CASCADE;
DROP TABLE IF EXISTS submissions CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS assignments CASCADE;

-- 1. Assignments Table
CREATE TABLE assignments (
    id TEXT PRIMARY KEY,
    course TEXT NOT NULL,
    course_short TEXT NOT NULL,
    title TEXT NOT NULL,
    deadline TEXT NOT NULL,
    avg NUMERIC,
    ai_avg NUMERIC,
    graded INTEGER DEFAULT 0,
    total INTEGER DEFAULT 0,
    type TEXT NOT NULL CHECK (type IN ('essay', 'code', 'math')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Students Table
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    student_no TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Submissions Table
CREATE TABLE submissions (
    id SERIAL PRIMARY KEY,
    assignment_id TEXT REFERENCES assignments(id) ON DELETE CASCADE,
    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
    submitted_at TEXT,
    graded_at TEXT,
    ai_score NUMERIC,
    final_score NUMERIC,
    status TEXT NOT NULL CHECK (status IN ('graded', 'ready', 'pending')),
    suspicion INTEGER,
    similarity INTEGER,
    has_warning BOOLEAN DEFAULT FALSE,
    has_sim_warning BOOLEAN DEFAULT FALSE,
    is_focus BOOLEAN DEFAULT FALSE,
    tests TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Submission Contents Table (Holds essay document paragraph trees or code token lines)
CREATE TABLE submission_contents (
    id SERIAL PRIMARY KEY,
    submission_id INTEGER REFERENCES submissions(id) ON DELETE CASCADE UNIQUE,
    filename TEXT,
    lines INTEGER,
    bytes INTEGER,
    essay_title TEXT,
    essay_author TEXT,
    essay_course TEXT,
    paragraphs JSONB, -- For essay paragraphs array
    tokens JSONB,     -- For code tokens array
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Disable Row Level Security (RLS) for all tables to allow anonymous client read/write access.
ALTER TABLE assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE students DISABLE ROW LEVEL SECURITY;
ALTER TABLE submissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE submission_contents DISABLE ROW LEVEL SECURITY;
