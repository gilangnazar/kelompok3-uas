const express = require('express');
const cors = require('cors');
const authRoutes = require('./auth');
const authenticateToken = require('./middleware/authMiddleware');
const dotenv = require('dotenv');
const path = require('path');

// Student Routes
const studentDashboard = require('./routes/student/dashboard');
const studentCourses = require('./routes/student/courses');
const studentAssignments = require('./routes/student/assignments');
const studentMaterials = require('./routes/student/materials');
const studentDiscussions = require('./routes/student/discussions');

// Instructor Routes
const instructorDashboard = require('./routes/instructor/dashboard');
const instructorCourses = require('./routes/instructor/courses');
const instructorAssignments = require('./routes/instructor/assignments');
const instructorMaterials = require('./routes/instructor/materials');
const instructorSchedules = require('./routes/instructor/schedules');
const instructorDiscussions = require('./routes/instructor/discussions');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve uploads at root (e.g. /materials/file.pdf) AND at /uploads (e.g. /uploads/materials/file.pdf)
const staticConfig = {
    setHeaders: (res, filePath) => {
        res.setHeader('Content-Disposition', 'inline');
        // Paksa browser untuk tidak menggunakan cache agar perubahan header terbaca
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        
        if (filePath.toLowerCase().endsWith('.pdf')) {
            res.setHeader('Content-Type', 'application/pdf');
        }
    }
};

app.use(express.static(path.join(__dirname, 'uploads'), staticConfig));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), staticConfig));

app.use('/api/auth', authRoutes);

// Student API
app.use('/api/student/dashboard', authenticateToken, studentDashboard);
app.use('/api/student/courses', authenticateToken, studentCourses);
app.use('/api/student/assignments', authenticateToken, studentAssignments);
app.use('/api/student/materials', authenticateToken, studentMaterials);
app.use('/api/student/discussions', authenticateToken, studentDiscussions);

// Instructor API
app.use('/api/instructor/dashboard', authenticateToken, instructorDashboard);
app.use('/api/instructor/courses', authenticateToken, instructorCourses);
app.use('/api/instructor/assignments', authenticateToken, instructorAssignments);
app.use('/api/instructor/materials', authenticateToken, instructorMaterials);
app.use('/api/instructor/schedules', authenticateToken, instructorSchedules);
app.use('/api/instructor/discussions', authenticateToken, instructorDiscussions);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
