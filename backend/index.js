const express = require('express');
const cors = require('cors');
const authRoutes = require('./auth');
const studentDashboardRoutes = require('./routes/student/dashboard');
const studentCourseRoutes = require('./routes/student/courses');
const studentContentRoutes = require('./routes/student/course_content');
const studentQuizRoutes = require('./routes/student/quizzes');
const studentAssignmentRoutes = require('./routes/student/assignments');
const studentScheduleRoutes = require('./routes/student/schedules');
const instructorDashboardRoutes = require('./routes/instructor/dashboard');
const instructorCourseRoutes = require('./routes/instructor/courses');
const instructorContentRoutes = require('./routes/instructor/course_content');
const instructorAssignmentRoutes = require('./routes/instructor/assignments');
const instructorScoreRoutes = require('./routes/instructor/scores');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/student/dashboard', studentDashboardRoutes);
app.use('/api/student/courses', studentCourseRoutes);
app.use('/api/student/course-content', studentContentRoutes);
app.use('/api/student/quizzes', studentQuizRoutes);
app.use('/api/student/assignments', studentAssignmentRoutes);
app.use('/api/student/schedules', studentScheduleRoutes);
app.use('/api/instructor/dashboard', instructorDashboardRoutes);
app.use('/api/instructor/courses', instructorCourseRoutes);
app.use('/api/instructor/course-content', instructorContentRoutes);
app.use('/api/instructor/assignments', instructorAssignmentRoutes);
app.use('/api/instructor/scores', instructorScoreRoutes);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
