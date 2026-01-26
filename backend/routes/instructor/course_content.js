const express = require('express');
const router = express.Router();
const db = require('../../db');
const authenticateToken = require('../../middleware/authMiddleware');

// Middleware to check if user teaches the course (optional but recommended security)
const checkCourseOwnership = async (req, res, next) => {
    // Implementation can be added here, for now skipping to keep it simple as per prototype
    next();
};

// GET /:courseId/schedules
router.get('/:courseId/schedules', authenticateToken, async (req, res) => {
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
router.get('/:courseId/materials', authenticateToken, async (req, res) => {
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
router.get('/:courseId/assignments', authenticateToken, async (req, res) => {
    try {
        const { courseId } = req.params;
        // Fetch from assignments table
        const [rows] = await db.query(
            'SELECT * FROM assignments WHERE course_id = ? ORDER BY created_at ASC', 
            [courseId]
        );
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;