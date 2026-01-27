const express = require('express');
const router = express.Router();
const db = require('../../db');
const authenticateToken = require('../../middleware/authMiddleware');

const checkEnrollment = async (req, res, next) => {
    try {
        if (req.user.role !== 'student') {
            return res.status(403).json({ message: 'Access denied. Only students can view this.' });
        }

        const { courseId } = req.params;
        const studentId = req.user.id;

        const [rows] = await db.query(
            'SELECT id FROM enrollments WHERE student_id = ? AND course_id = ? LIMIT 1',
            [studentId, courseId]
        );

        if (rows.length === 0) {
            return res.status(403).json({ message: 'Access denied. Not enrolled in this course.' });
        }

        next();
    } catch (error) {
        console.error('Error checking enrollment:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// GET /:courseId/schedules
router.get('/:courseId/schedules', authenticateToken, checkEnrollment, async (req, res) => {
    try {
        const { courseId } = req.params;
        const [rows] = await db.query(
            'SELECT * FROM schedules WHERE course_id = ? ORDER BY session_date ASC',
            [courseId]
        );
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /:courseId/materials
router.get('/:courseId/materials', authenticateToken, checkEnrollment, async (req, res) => {
    try {
        const { courseId } = req.params;
        const [rows] = await db.query(
            'SELECT * FROM materials WHERE course_id = ? ORDER BY uploaded_at DESC',
            [courseId]
        );
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /:courseId/assignments
router.get('/:courseId/assignments', authenticateToken, checkEnrollment, async (req, res) => {
    try {
        const { courseId } = req.params;
        const studentId = req.user.id;
        const [rows] = await db.query(
            `
            SELECT 
                a.*,
                s.id as submission_id,
                s.submitted_at,
                q.id as quiz_id,
                qa.id as attempt_id,
                qa.completed_at as attempt_completed_at
            FROM assignments a
            LEFT JOIN submissions s ON s.assignment_id = a.id AND s.student_id = ?
            LEFT JOIN quizzes q ON q.assignment_id = a.id
            LEFT JOIN quiz_attempts qa ON qa.quiz_id = q.id AND qa.student_id = ? AND qa.status = 'finished'
            WHERE a.course_id = ?
            ORDER BY a.created_at ASC
            `,
            [studentId, studentId, courseId]
        );
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
