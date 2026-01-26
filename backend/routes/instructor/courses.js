const express = require('express');
const router = express.Router();
const db = require('../../db');
const authenticateToken = require('../../middleware/authMiddleware');

// GET /api/instructor/courses - Get all courses for the logged-in instructor
router.get('/', authenticateToken, async (req, res) => {
    try {
        // Ensure the user is a teacher
        if (req.user.role !== 'teacher') {
            return res.status(403).json({ message: 'Access denied. Only teachers can view this.' });
        }

        const teacherId = req.user.id;

        const query = `
            SELECT 
                c.id, 
                c.title as name, 
                c.description, 
                c.status, 
                c.start_date, 
                c.end_date,
                'CS101' as code, -- Placeholder code, you might want to add a code column to DB
                'Fall 2025' as semester, -- Placeholder semester
                (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id) as studentsCount
            FROM courses c
            WHERE c.teacher_id = ?
            ORDER BY c.start_date DESC
        `;

        const [rows] = await db.query(query, [teacherId]);

        res.json(rows);
    } catch (error) {
        console.error('Error fetching instructor courses:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;