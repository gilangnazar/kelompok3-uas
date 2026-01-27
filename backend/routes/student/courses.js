const express = require('express');
const router = express.Router();
const db = require('../../db');
const authenticateToken = require('../../middleware/authMiddleware');

// GET /api/student/courses - Get all courses for the logged-in student
router.get('/', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'student') {
            return res.status(403).json({ message: 'Access denied. Only students can view this.' });
        }

        const studentId = req.user.id;

        const query = `
            SELECT 
                c.id,
                c.title as name,
                c.description,
                c.status,
                c.start_date,
                c.end_date,
                'CS101' as code,
                'Fall 2025' as semester,
                (SELECT COUNT(*) FROM enrollments e2 WHERE e2.course_id = c.id) as studentsCount
            FROM enrollments e
            JOIN courses c ON c.id = e.course_id
            WHERE e.student_id = ?
            ORDER BY c.start_date DESC
        `;

        const [rows] = await db.query(query, [studentId]);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching student courses:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
