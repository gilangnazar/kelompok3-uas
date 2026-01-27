const express = require('express');
const router = express.Router();
const db = require('../../db');
const authenticateToken = require('../../middleware/authMiddleware');

// GET /api/student/schedules - List schedules for enrolled courses
router.get('/', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'student') {
            return res.status(403).json({ message: 'Access denied. Only students can view this.' });
        }

        const studentId = req.user.id;

        const query = `
            SELECT 
                s.id,
                s.session_topic,
                s.session_date,
                s.location,
                c.id as course_id,
                c.title as course_title
            FROM schedules s
            JOIN courses c ON s.course_id = c.id
            JOIN enrollments e ON c.id = e.course_id
            WHERE e.student_id = ?
            ORDER BY s.session_date ASC
        `;

        const [rows] = await db.query(query, [studentId]);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching student schedules:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
