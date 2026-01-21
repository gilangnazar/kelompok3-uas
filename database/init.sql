DROP DATABASE IF EXISTS lms;
CREATE DATABASE lms;
USE lms;

CREATE TABLE users ( 
    id INT AUTO_INCREMENT PRIMARY KEY, 
    name VARCHAR(100), 
    email VARCHAR(100) UNIQUE, 
    password VARCHAR(255), 
    role ENUM('admin', 'student', 'teacher', 'manager') NOT NULL, 
    status ENUM('active', 'inactive') DEFAULT 'active', 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
);

CREATE TABLE courses ( 
    id INT AUTO_INCREMENT PRIMARY KEY, 
    title VARCHAR(200), 
    description TEXT, 
    teacher_id INT, 
    status ENUM('active', 'archived') DEFAULT 'active', 
    start_date DATE, 
    end_date DATE, 
    FOREIGN KEY (teacher_id) REFERENCES users(id) 
);

CREATE TABLE enrollments ( 
    id INT AUTO_INCREMENT PRIMARY KEY, 
    student_id INT, 
    course_id INT, 
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    FOREIGN KEY (student_id) REFERENCES users(id), 
    FOREIGN KEY (course_id) REFERENCES courses(id) 
); 

CREATE TABLE materials ( 
    id INT AUTO_INCREMENT PRIMARY KEY, 
    course_id INT, 
    title VARCHAR(255), 
    content TEXT, 
    file_path VARCHAR(255), 
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    FOREIGN KEY (course_id) REFERENCES courses(id) 
);

CREATE TABLE assignments ( 
    id INT AUTO_INCREMENT PRIMARY KEY, 
    course_id INT, 
    title VARCHAR(255), 
    description TEXT, 
    due_date DATETIME, 
    type ENUM('quiz', 'assignment'), 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    FOREIGN KEY (course_id) REFERENCES courses(id) 
);

CREATE TABLE submissions ( 
    id INT AUTO_INCREMENT PRIMARY KEY, 
    assignment_id INT, 
    student_id INT, 
    content TEXT, 
    file_path VARCHAR(255), 
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    score DECIMAL(5,2), 
    feedback TEXT, 
    FOREIGN KEY (assignment_id) REFERENCES assignments(id), 
    FOREIGN KEY (student_id) REFERENCES users(id) 
);

CREATE TABLE quizzes ( 
    id INT AUTO_INCREMENT PRIMARY KEY, 
    course_id INT, 
    title VARCHAR(255) NOT NULL, 
    description TEXT, 
    time_limit_minutes INT DEFAULT 30, -- Batas waktu pengerjaan 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    FOREIGN KEY (course_id) REFERENCES courses(id) 

);

CREATE TABLE questions ( 
    id INT AUTO_INCREMENT PRIMARY KEY, 
    quiz_id INT, 
    question_text TEXT NOT NULL, 
    points INT DEFAULT 1,         -- Bobot nilai per soal 
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE 
); 

CREATE TABLE options ( 
    id INT AUTO_INCREMENT PRIMARY KEY, 
    question_id INT, 
    option_text TEXT NOT NULL, 
    is_correct BOOLEAN DEFAULT FALSE, -- Penanda jawaban benar 
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE 
);

CREATE TABLE quiz_attempts ( 
    id INT AUTO_INCREMENT PRIMARY KEY, 
    student_id INT NOT NULL, 
    quiz_id INT NOT NULL, 
    score DECIMAL(5,2) DEFAULT 0, 
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    completed_at TIMESTAMP NULL, 
    status ENUM('ongoing', 'finished') DEFAULT 'ongoing', 
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE, 
    FOREIGN KEY (student_id) REFERENCES users(id) 
);

CREATE TABLE attempt_answers ( 
    id INT AUTO_INCREMENT PRIMARY KEY, 
    attempt_id INT, 
    question_id INT, 
    selected_option_id INT, -- ID dari tabel options yang dipilih siswa 
    is_correct_at_time BOOLEAN, -- Denormalisasi untuk mempermudah laporan
    FOREIGN KEY (attempt_id) REFERENCES quiz_attempts(id) ON DELETE 
CASCADE, 
    FOREIGN KEY (question_id) REFERENCES questions(id), 
    FOREIGN KEY (selected_option_id) REFERENCES options(id) 
);

CREATE TABLE discussions ( 
    id INT AUTO_INCREMENT PRIMARY KEY, 
    course_id INT, 
    user_id INT, 
    message TEXT, 
    posted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    FOREIGN KEY (course_id) REFERENCES courses(id), 
    FOREIGN KEY (user_id) REFERENCES users(id) 
);

CREATE TABLE schedules ( 
    id INT AUTO_INCREMENT PRIMARY KEY, 
    course_id INT, 
    session_topic VARCHAR(255), 
    session_date DATETIME, 
    location VARCHAR(100), 
    FOREIGN KEY (course_id) REFERENCES courses(id) 
);

CREATE TABLE attendances ( 
    id INT AUTO_INCREMENT PRIMARY KEY, 
    schedule_id INT, 
    student_id INT, 
    status ENUM('present', 'absent', 'late'), 
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    FOREIGN KEY (schedule_id) REFERENCES schedules(id), 
    FOREIGN KEY (student_id) REFERENCES users(id) 
);

CREATE TABLE user_logs ( 
    id INT AUTO_INCREMENT PRIMARY KEY, 
    user_id INT, 
    activity TEXT, 
    activity_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    FOREIGN KEY (user_id) REFERENCES users(id) 
); 

DELIMITER $$ 
 
CREATE PROCEDURE EnrollStudent(IN studentId INT, IN courseId INT) 
BEGIN 
    DECLARE existing INT; 
    SELECT COUNT(*) INTO existing FROM enrollments WHERE student_id = studentId 
AND course_id = courseId; 
     
    IF existing = 0 THEN 
        INSERT INTO enrollments (student_id, course_id) VALUES (studentId, courseId); 
    END IF; 
END$$ 
 
DELIMITER ;

DELIMITER $$ 
CREATE TRIGGER after_submission_insert 
AFTER INSERT ON submissions 
FOR EACH ROW 
BEGIN 
INSERT INTO user_logs (user_id, activity) 
VALUES (NEW.student_id, CONCAT('Submitted assignment ID: ', 
NEW.assignment_id)); 
END$$ 
DELIMITER ;

CREATE VIEW student_scores AS 
SELECT  
u.id AS student_id, 
u.name AS student_name, 
c.id AS course_id, 
c.title AS course_title, 
AVG(s.score) AS average_score 
FROM submissions s 
JOIN users u ON u.id = s.student_id 
JOIN assignments a ON a.id = s.assignment_id 
JOIN courses c ON c.id = a.course_id 
GROUP BY u.id, c.id;

INSERT INTO users (name, email, password, role, status) VALUES 
('Admin LMS', 'admin@lms.test', '$2b$10$xNdp9JdmT7FR56FEOsBnAuwQRL/jCahp0KIYZNXfAEqw8pRJxe3q.', 'admin', 'active'), /*admin123*/
('Budi Guru', 'budi@lms.test', '$2b$10$gnI2X2ViKTwNBLIyn6xVKeW3yaOLlPXVrJAOt7ys/reCHfeRDmpHG', 'teacher', 'active'), /*password123*/
('Siti Mahasiswa', 'siti@lms.test', '$2b$10$gnI2X2ViKTwNBLIyn6xVKeW3yaOLlPXVrJAOt7ys/reCHfeRDmpHG', 'student', 'active'), /*password123*/
('Joko Mahasiswa', 'joko@lms.test', '$2b$10$gnI2X2ViKTwNBLIyn6xVKeW3yaOLlPXVrJAOt7ys/reCHfeRDmpHG', 'student', 'active'), /*password123*/
('Manager LMS', 'manager@lms.test', '$2a$10$ztxUHTku6rISgx0/WSLXpeVmwumo/bshTKbT1o/L3PH5pSu9FNvXO', 'manager', 'active'); /*manager123*/

INSERT INTO courses (title, description, teacher_id, status, start_date, end_date) 
VALUES 
('Pemrograman Web', 'Dasar-dasar HTML, CSS, JS dan backend.', 2, 'active', 
'2025-07-01', '2025-09-30'), 
('Basis Data', 'Konsep ERD dan implementasi MySQL.', 2, 'active', '2025-07-01', 
'2025-09-30');

INSERT INTO enrollments (student_id, course_id) VALUES 
(3, 1), 
(3, 2), 
(4, 1);

INSERT INTO materials (course_id, title, content, file_path) VALUES 
(1, 'HTML Dasar', 'Pengantar HTML .', '/uploads/materials/html_dasar.pdf'), 
(1, 'CSS Layout', 'Grid dan Flexbox .', '/uploads/materials/css_layout.pdf'), 
(2, 'ERD Diagram', 'Entity Relationship Diagram .', '/uploads/materials/erd_diagram.pdf');

INSERT INTO assignments (course_id, title, description, due_date, type) VALUES 
(1, 'Tugas 1: Buat halaman HTML', 'Buat halaman profil pribadi.', '2025-07-10 23:59:00', 
'assignment'), 
(1, 'Quiz 1: HTML & CSS', 'Jawab soal pilihan ganda.', '2025-07-15 23:59:00', 'quiz'), 
(2, 'Tugas 1: Desain ERD', 'Buat ERD dari studi kasus toko.', '2025-07-12 23:59:00', 
'assignment');

INSERT INTO submissions (assignment_id, student_id, content, file_path, score, 
feedback) VALUES 
(1, 3, 'File HTML sudah saya buat', '/uploads/submissions/siti_html.zip', 85, 'Bagus, perbaiki 
struktur tag'), 
(1, 4, 'HTML saya masih error', '/uploads/submissions/joko_html.zip', 70, 'Cek kembali struktur'), 
(3, 3, 'ERD sesuai studi kasus', '/uploads/submissions/siti_erd.pdf', 90, 'Sangat baik');

INSERT INTO discussions (course_id, user_id, message) VALUES 
(1, 3, 'Pak, kapan materi CSS dibahas?'), 
(1, 2, 'Besok kita bahas CSS, silakan baca dulu materi.'), 
(2, 3, 'Saya bingung dengan cardinality di ERD.');

INSERT INTO schedules (course_id, session_topic, session_date, location) VALUES 
(1, 'Pengantar HTML', '2025-07-02 08:00:00', 'Zoom 01'), 
(1, 'CSS Dasar', '2025-07-05 08:00:00', 'Zoom 01'), 
(2, 'Pengenalan ERD', '2025-07-03 08:00:00', 'Zoom 02');

INSERT INTO attendances (schedule_id, student_id, status) VALUES 
(1, 3, 'present'), 
(1, 4, 'late'), 
(2, 3, 'present'), 
(3, 3, 'present');

INSERT INTO user_logs (user_id, activity) VALUES 
(3, 'Login ke LMS'), 
(3, 'Mengunduh materi HTML'), 
(4, 'Mengumpulkan tugas HTML');