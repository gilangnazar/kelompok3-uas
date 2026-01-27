const express = require('express');
const router = express.Router();
const db = require('../../db');
const authenticateToken = require('../../middleware/authMiddleware');

// GET /api/student/assignments - List assignments & quizzes for enrolled courses
router.get('/', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'student') {
            return res.status(403).json({ message: 'Access denied. Only students can view this.' });
        }

        const studentId = req.user.id;

        const query = `
            SELECT 
                a.id,
                a.title,
                a.description,
                a.due_date,
                a.type,
                c.id as course_id,
                c.title as course_title,
                q.id as quiz_id,
                (SELECT COUNT(*) FROM quiz_attempts qa WHERE qa.quiz_id = q.id AND qa.student_id = ? AND qa.status = 'finished') as attempt_count
            FROM assignments a
            JOIN courses c ON a.course_id = c.id
            JOIN enrollments e ON c.id = e.course_id
            LEFT JOIN quizzes q ON q.assignment_id = a.id
            WHERE e.student_id = ?
            ORDER BY a.due_date ASC
        `;

        const [rows] = await db.query(query, [studentId, studentId]);

        const formatted = rows.map(row => ({
            id: row.id,
            title: row.title,
            description: row.description,
            due_date: row.due_date,
            type: row.type,
            course_id: row.course_id,
            course_title: row.course_title,
            quiz_id: row.quiz_id,
            has_attempted: (row.attempt_count || 0) > 0
        }));

        res.json(formatted);
    } catch (error) {
        console.error('Error fetching student assignments:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
