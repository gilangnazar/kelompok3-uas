const express = require('express');
const router = express.Router();
const db = require('../../db');
const authenticateToken = require('../../middleware/authMiddleware');

router.get('/', authenticateToken, async (req, res) => {
    const studentId = req.user.id;

    try {
        // 1. Stats: Active Courses
        const activeCoursesQuery = `
            SELECT COUNT(*) as count 
            FROM enrollments e 
            JOIN courses c ON e.course_id = c.id 
            WHERE e.student_id = ? AND c.status = 'active'
        `;

        // 2. Stats: Attendance (Present count & Total recorded sessions)
        const attendanceQuery = `
            SELECT 
                COUNT(*) as total_recorded,
                SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as total_present
            FROM attendances 
            WHERE student_id = ?
        `;

        // 3. Stats: Submission Ratio (Total Submitted / Total Assignments in enrolled courses)
        const totalAssignmentsQuery = `
            SELECT COUNT(*) as count
            FROM assignments a
            JOIN enrollments e ON a.course_id = e.course_id
            WHERE e.student_id = ?
        `;

        const totalSubmissionsQuery = `
            SELECT COUNT(*) as count FROM submissions WHERE student_id = ?
        `;

        // 4. Stats & List: Pending Assignments (Not submitted yet)
        // We also fetch the list here to avoid double querying if possible, but for clarity separate is fine.
        // Pending = Due date is future OR (Due date passed AND not submitted? Usually just not submitted)
        // Let's stick to "Not Submitted" regardless of due date for "Pending Tasks" count, 
        // or strictly "Active Pending" (Due date >= Now). 
        // Let's count ALL unsubmitted assignments for simplicity of "To Do".
        const pendingAssignmentsCountQuery = `
            SELECT COUNT(*) as count
            FROM assignments a
            JOIN enrollments e ON a.course_id = e.course_id
            LEFT JOIN submissions s ON a.id = s.assignment_id AND s.student_id = ?
            WHERE e.student_id = ? AND s.id IS NULL
        `;

        // 5. List: Upcoming Schedules (Next 7 days)
        const upcomingSchedulesQuery = `
            SELECT s.id, s.session_topic, s.session_date, s.location, c.title as course_title
            FROM schedules s
            JOIN courses c ON s.course_id = c.id
            JOIN enrollments e ON c.id = e.course_id
            WHERE e.student_id = ? 
            AND s.session_date >= NOW() 
            AND s.session_date <= DATE_ADD(NOW(), INTERVAL 7 DAY)
            ORDER BY s.session_date ASC
            LIMIT 5
        `;

        // 6. List: Pending Assignments Data (Top 3 nearest deadline)
        const pendingAssignmentsListQuery = `
            SELECT a.id, a.title, a.due_date, c.title as course_title, a.type
            FROM assignments a
            JOIN courses c ON a.course_id = c.id
            JOIN enrollments e ON c.id = e.course_id
            LEFT JOIN submissions s ON a.id = s.assignment_id AND s.student_id = ?
            WHERE e.student_id = ? AND s.id IS NULL
            ORDER BY a.due_date ASC
            LIMIT 3
        `;

        // Execute all promises
        const [
            [activeCourses],
            [attendance],
            [totalAssignments],
            [totalSubmissions],
            [pendingCount],
            upcomingSchedules,
            pendingList
        ] = await Promise.all([
            db.query(activeCoursesQuery, [studentId]),
            db.query(attendanceQuery, [studentId]),
            db.query(totalAssignmentsQuery, [studentId]),
            db.query(totalSubmissionsQuery, [studentId]),
            db.query(pendingAssignmentsCountQuery, [studentId, studentId]),
            db.query(upcomingSchedulesQuery, [studentId]),
            db.query(pendingAssignmentsListQuery, [studentId, studentId])
        ]);

        res.json({
            stats: {
                active_courses: activeCourses[0].count,
                attendance: {
                    present: attendance[0].total_present || 0,
                    total: attendance[0].total_recorded || 0
                },
                submissions: {
                    submitted: totalSubmissions[0].count,
                    total: totalAssignments[0].count
                },
                pending_tasks: pendingCount[0].count
            },
            upcoming_schedules: upcomingSchedules[0],
            pending_assignments: pendingList[0]
        });

    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
