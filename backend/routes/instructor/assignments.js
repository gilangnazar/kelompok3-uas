const express = require('express');
const router = express.Router();
const db = require('../../db');
const authenticateToken = require('../../middleware/authMiddleware');

// POST /create - Create a new assignment (Quiz or Assignment)
router.post('/create', authenticateToken, async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const { classId, type, title, description, duration, dueDate, questions } = req.body;
        
        // 1. Insert into assignments table
        const [assignResult] = await connection.query(
            'INSERT INTO assignments (course_id, title, description, due_date, type) VALUES (?, ?, ?, ?, ?)',
            [classId, title, description, dueDate, type]
        );
        const assignmentId = assignResult.insertId;

        // 2. If type is quiz, insert into quizzes table
        if (type === 'quiz') {
            const [quizResult] = await connection.query(
                'INSERT INTO quizzes (assignment_id, title, description, time_limit_minutes) VALUES (?, ?, ?, ?)',
                [assignmentId, title, description, duration]
            );
            const quizId = quizResult.insertId;

            // 3. Insert questions and options
            if (questions && questions.length > 0) {
                for (const q of questions) {
                    const [qResult] = await connection.query(
                        'INSERT INTO questions (quiz_id, question_text, points) VALUES (?, ?, ?)',
                        [quizId, q.text, 1] // Default 1 point per question for now
                    );
                    const questionId = qResult.insertId;

                    // Insert options
                    if (q.options && q.options.length > 0) {
                        for (let i = 0; i < q.options.length; i++) {
                            const isCorrect = (i === q.correctAnswerIndex);
                            await connection.query(
                                'INSERT INTO options (question_id, option_text, is_correct) VALUES (?, ?, ?)',
                                [questionId, q.options[i], isCorrect]
                            );
                        }
                    }
                }
            }
        }

        await connection.commit();
        res.status(201).json({ message: 'Assignment created successfully', assignmentId });

    } catch (error) {
        await connection.rollback();
        console.error('Error creating assignment:', error);
        res.status(500).json({ message: 'Server error' });
    } finally {
        connection.release();
    }
});

// GET /:id - Get assignment details
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Get Assignment Details
        const [assignments] = await db.query('SELECT * FROM assignments WHERE id = ?', [id]);
        if (assignments.length === 0) return res.status(404).json({ message: 'Assignment not found' });
        const assignment = assignments[0];

        // 2. Get Stats
        const [stats] = await db.query(
            'SELECT COUNT(*) as submitted_count, AVG(score) as avg_score FROM submissions WHERE assignment_id = ?',
            [id]
        );
        
        // Get total enrolled students for this course
        const [enrollment] = await db.query(
            'SELECT COUNT(*) as total_students FROM enrollments WHERE course_id = ?',
            [assignment.course_id]
        );

        const totalStudents = enrollment[0].total_students || 0;
        const submittedCount = stats[0].submitted_count || 0;

        assignment.stats = {
            submitted: submittedCount,
            pending: Math.max(0, totalStudents - submittedCount),
            avg_score: Math.round(stats[0].avg_score || 0)
        };

        // 3. If Quiz, get Quiz Details + Questions
        if (assignment.type === 'quiz') {
            const [quizzes] = await db.query('SELECT * FROM quizzes WHERE assignment_id = ?', [id]);
            if (quizzes.length > 0) {
                const quiz = quizzes[0];
                assignment.quiz = quiz;

                // Get Questions
                const [questions] = await db.query('SELECT * FROM questions WHERE quiz_id = ?', [quiz.id]);
                
                // Get Options for all questions
                for (const q of questions) {
                    const [options] = await db.query('SELECT id, option_text, is_correct FROM options WHERE question_id = ?', [q.id]);
                    q.options = options;
                }
                assignment.questions = questions;
            }
        }

        res.json(assignment);
    } catch (error) {
        console.error('Error fetching assignment details:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// DELETE /:id - Delete assignment
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM assignments WHERE id = ?', [id]);
        res.json({ message: 'Assignment deleted successfully' });
    } catch (error) {
        console.error('Error deleting assignment:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// PUT /:id - Update assignment (and quiz details if applicable)
router.put('/:id', authenticateToken, async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const { id } = req.params;
        const { title, description, duration, dueDate, questions, type } = req.body;

        // 1. Update assignments table
        await connection.query(
            'UPDATE assignments SET title = ?, description = ?, due_date = ? WHERE id = ?',
            [title, description, dueDate, id]
        );

        // 2. If quiz, update quiz details
        if (type === 'quiz') {
            // Get quiz_id
            const [quizzes] = await connection.query('SELECT id FROM quizzes WHERE assignment_id = ?', [id]);
            
            if (quizzes.length > 0) {
                const quizId = quizzes[0].id;

                // Update quizzes table
                await connection.query(
                    'UPDATE quizzes SET title = ?, description = ?, time_limit_minutes = ? WHERE id = ?',
                    [title, description, duration, quizId]
                );

                // 3. Update Questions (Strategy: Delete all old questions and insert new ones)
                // Note: This will fail if students have already attempted the quiz (Foreign Key Constraint)
                // We handle this gracefully in the catch block
                
                if (questions && questions.length > 0) {
                     // Delete old questions
                    await connection.query('DELETE FROM questions WHERE quiz_id = ?', [quizId]);

                    // Insert new questions
                    for (const q of questions) {
                        const [qResult] = await connection.query(
                            'INSERT INTO questions (quiz_id, question_text, points) VALUES (?, ?, ?)',
                            [quizId, q.text, 1]
                        );
                        const questionId = qResult.insertId;

                        if (q.options && q.options.length > 0) {
                            for (let i = 0; i < q.options.length; i++) {
                                const isCorrect = (i === q.correctAnswerIndex);
                                await connection.query(
                                    'INSERT INTO options (question_id, option_text, is_correct) VALUES (?, ?, ?)',
                                    [questionId, q.options[i], isCorrect]
                                );
                            }
                        }
                    }
                }
            }
        }

        await connection.commit();
        res.json({ message: 'Assignment updated successfully' });

    } catch (error) {
        await connection.rollback();
        console.error('Error updating assignment:', error);
        
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
             return res.status(400).json({ message: 'Cannot update questions because students have already attempted this quiz.' });
        }

        res.status(500).json({ message: 'Server error' });
    } finally {
        connection.release();
    }
});

module.exports = router;