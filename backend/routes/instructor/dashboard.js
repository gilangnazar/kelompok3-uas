const express = require('express');
const router = express.Router();
const db = require('../../db');
const authenticateToken = require('../../middleware/authMiddleware');

router.get('/', authenticateToken, async (req, res) => {
    const teacherId = req.user.id;

    if (req.user.role !== 'teacher' && req.user.role !== 'instructor' && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
    }

    try {
        // 1. Stats: Active Courses
        const activeCoursesQuery = `
            SELECT COUNT(*) as count 
            FROM courses 
            WHERE teacher_id = ? AND status = 'active'
        `;

        // 2. Stats: Average Attendance Rate (%)
        const avgAttendanceQuery = `
            SELECT 
                ROUND(IFNULL(
                    SUM(CASE WHEN att.status IN ('present', 'late') THEN 1 ELSE 0 END) / COUNT(*) * 100, 
                0), 1) as rate
            FROM attendances att
            JOIN schedules s ON att.schedule_id = s.id
            JOIN courses c ON s.course_id = c.id
            WHERE c.teacher_id = ?
        `;

        // 3. Stats: Global Average Score
        const avgScoreQuery = `
            SELECT ROUND(IFNULL(AVG(score), 0), 1) as avg
            FROM submissions s
            JOIN assignments a ON s.assignment_id = a.id
            JOIN courses c ON a.course_id = c.id
            WHERE c.teacher_id = ? AND s.score IS NOT NULL
        `;

        // 4. List: Upcoming Teaching Schedule (Next 7 days)
        const upcomingSchedulesQuery = `
            SELECT s.id, s.session_topic, s.session_date, s.location, c.title as course_title
            FROM schedules s
            JOIN courses c ON s.course_id = c.id
            WHERE c.teacher_id = ? 
            AND s.session_date >= NOW() 
            AND s.session_date <= DATE_ADD(NOW(), INTERVAL 7 DAY)
            ORDER BY s.session_date ASC
            LIMIT 5
        `;

        // 5. List: Grading Queue (Oldest submissions first)
        const gradingQueueQuery = `
            SELECT s.id as submission_id, s.submitted_at, 
                   a.title as assignment_title, 
                   c.title as course_title,
                   u.name as student_name
            FROM submissions s
            JOIN assignments a ON s.assignment_id = a.id
            JOIN courses c ON a.course_id = c.id
            JOIN users u ON s.student_id = u.id
            WHERE c.teacher_id = ? 
            AND s.score IS NULL 
            AND a.type = 'assignment'
            ORDER BY s.submitted_at ASC
            LIMIT 5
        `;

        // Count for "Needs Grading" badge
        const needsGradingCountQuery = `
            SELECT COUNT(*) as count
            FROM submissions s
            JOIN assignments a ON s.assignment_id = a.id
            JOIN courses c ON a.course_id = c.id
            WHERE c.teacher_id = ? AND s.score IS NULL AND a.type = 'assignment'
        `;

        const [
            [activeCourses],
            [avgAttendance],
            [avgScore],
            [needsGradingCount],
            upcomingSchedules,
            gradingQueue
        ] = await Promise.all([
            db.query(activeCoursesQuery, [teacherId]),
            db.query(avgAttendanceQuery, [teacherId]),
            db.query(avgScoreQuery, [teacherId]),
            db.query(needsGradingCountQuery, [teacherId]),
            db.query(upcomingSchedulesQuery, [teacherId]),
            db.query(gradingQueueQuery, [teacherId])
        ]);

        res.json({
            stats: {
                active_courses: activeCourses[0].count,
                attendance_rate: avgAttendance[0].rate,
                average_score: avgScore[0].avg,
                needs_grading: needsGradingCount[0].count
            },
            upcoming_schedules: upcomingSchedules[0],
            grading_queue: gradingQueue[0]
        });

    } catch (error) {
        console.error('Instructor Dashboard error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;