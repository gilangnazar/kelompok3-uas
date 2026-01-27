const express = require('express');
const router = express.Router();
const db = require('../../db');
const authenticateToken = require('../../middleware/authMiddleware');

const ensureStudent = (req, res, next) => {
    if (req.user.role !== 'student') {
        return res.status(403).json({ message: 'Access denied. Only students can view this.' });
    }
    next();
};

const ensureEnrollmentByQuiz = async (studentId, quizId) => {
    const [rows] = await db.query(
        `SELECT a.course_id
         FROM quizzes q
         JOIN assignments a ON a.id = q.assignment_id
         JOIN enrollments e ON e.course_id = a.course_id AND e.student_id = ?
         WHERE q.id = ?
         LIMIT 1`,
        [studentId, quizId]
    );
    return rows.length > 0 ? rows[0].course_id : null;
};

const ensureEnrollmentByAssignment = async (studentId, assignmentId) => {
    const [rows] = await db.query(
        `SELECT a.course_id
         FROM assignments a
         JOIN enrollments e ON e.course_id = a.course_id AND e.student_id = ?
         WHERE a.id = ? AND a.type = 'quiz'
         LIMIT 1`,
        [studentId, assignmentId]
    );
    return rows.length > 0 ? rows[0].course_id : null;
};

// GET /api/student/quizzes/assignment/:assignmentId - Quiz detail for student
router.get('/assignment/:assignmentId', authenticateToken, ensureStudent, async (req, res) => {
    try {
        const studentId = req.user.id;
        const { assignmentId } = req.params;

        const courseId = await ensureEnrollmentByAssignment(studentId, assignmentId);
        if (!courseId) {
            return res.status(403).json({ message: 'Access denied. Not enrolled in this course.' });
        }

        const query = `
            SELECT 
                a.id as assignment_id,
                a.course_id,
                a.title,
                a.description,
                a.due_date,
                q.id as quiz_id,
                q.time_limit_minutes,
                (SELECT COUNT(*) FROM questions WHERE quiz_id = q.id) as question_count,
                (SELECT COUNT(*) FROM quiz_attempts qa WHERE qa.quiz_id = q.id AND qa.student_id = ?) as attempt_count,
                (SELECT qa.id FROM quiz_attempts qa WHERE qa.quiz_id = q.id AND qa.student_id = ? ORDER BY qa.id DESC LIMIT 1) as attempt_id,
                (SELECT qa.status FROM quiz_attempts qa WHERE qa.quiz_id = q.id AND qa.student_id = ? ORDER BY qa.id DESC LIMIT 1) as attempt_status,
                (SELECT qa.score FROM quiz_attempts qa WHERE qa.quiz_id = q.id AND qa.student_id = ? ORDER BY qa.id DESC LIMIT 1) as score,
                (SELECT qa.completed_at FROM quiz_attempts qa WHERE qa.quiz_id = q.id AND qa.student_id = ? ORDER BY qa.id DESC LIMIT 1) as completed_at
            FROM assignments a
            JOIN quizzes q ON q.assignment_id = a.id
            WHERE a.id = ? AND a.type = 'quiz'
            LIMIT 1
        `;

        const [rows] = await db.query(query, [
            studentId,
            studentId,
            studentId,
            studentId,
            studentId,
            assignmentId
        ]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Quiz not found.' });
        }

        const row = rows[0];
        res.json({
            assignment_id: row.assignment_id,
            course_id: row.course_id,
            title: row.title,
            description: row.description,
            due_date: row.due_date,
            quiz_id: row.quiz_id,
            time_limit_minutes: row.time_limit_minutes,
            question_count: row.question_count,
            has_attempted: (row.attempt_count || 0) > 0,
            attempt_id: row.attempt_id,
            attempt_status: row.attempt_status,
            score: row.score,
            completed_at: row.completed_at
        });
    } catch (error) {
        console.error('Error fetching student quiz detail:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/student/quizzes/:quizId/questions - Quiz questions for student
router.get('/:quizId/questions', authenticateToken, ensureStudent, async (req, res) => {
    try {
        const studentId = req.user.id;
        const { quizId } = req.params;

        const courseId = await ensureEnrollmentByQuiz(studentId, quizId);
        if (!courseId) {
            return res.status(403).json({ message: 'Access denied. Not enrolled in this course.' });
        }

        const [questions] = await db.query(
            'SELECT id, question_text FROM questions WHERE quiz_id = ? ORDER BY id ASC',
            [quizId]
        );

        if (questions.length === 0) {
            return res.json({ quiz_id: Number(quizId), questions: [] });
        }

        const questionIds = questions.map(q => q.id);
        const [options] = await db.query(
            'SELECT id, question_id, option_text FROM options WHERE question_id IN (?) ORDER BY id ASC',
            [questionIds]
        );

        const optionMap = new Map();
        options.forEach(opt => {
            if (!optionMap.has(opt.question_id)) {
                optionMap.set(opt.question_id, []);
            }
            optionMap.get(opt.question_id).push({
                id: opt.id,
                option_text: opt.option_text
            });
        });

        const formatted = questions.map(q => ({
            id: q.id,
            question_text: q.question_text,
            options: optionMap.get(q.id) || []
        }));

        res.json({ quiz_id: Number(quizId), questions: formatted });
    } catch (error) {
        console.error('Error fetching quiz questions:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/student/quizzes/:quizId/attempt - Submit quiz answers
router.post('/:quizId/attempt', authenticateToken, ensureStudent, async (req, res) => {
    const connection = await db.getConnection();
    try {
        const studentId = req.user.id;
        const { quizId } = req.params;
        const answers = Array.isArray(req.body?.answers) ? req.body.answers : [];

        const courseId = await ensureEnrollmentByQuiz(studentId, quizId);
        if (!courseId) {
            return res.status(403).json({ message: 'Access denied. Not enrolled in this course.' });
        }

        const [existingAttempt] = await db.query(
            'SELECT id, status FROM quiz_attempts WHERE quiz_id = ? AND student_id = ? ORDER BY id DESC LIMIT 1',
            [quizId, studentId]
        );
        if (existingAttempt.length > 0 && existingAttempt[0].status === 'finished') {
            return res.status(400).json({ message: 'Quiz has already been submitted.' });
        }

        const [questionRows] = await db.query(
            'SELECT id FROM questions WHERE quiz_id = ?',
            [quizId]
        );
        const totalQuestions = questionRows.length;
        if (totalQuestions === 0) {
            return res.status(400).json({ message: 'No questions found for this quiz.' });
        }

        const [optionRows] = await db.query(
            `SELECT q.id as question_id, o.id as option_id, o.is_correct
             FROM questions q
             JOIN options o ON o.question_id = q.id
             WHERE q.quiz_id = ?`,
            [quizId]
        );

        const correctOptionByQuestion = new Map();
        optionRows.forEach(row => {
            if (row.is_correct === 1) {
                correctOptionByQuestion.set(row.question_id, row.option_id);
            }
        });

        let correctCount = 0;
        answers.forEach(ans => {
            const correctOption = correctOptionByQuestion.get(ans.question_id);
            if (correctOption && Number(correctOption) === Number(ans.selected_option_id)) {
                correctCount += 1;
            }
        });

        const score = Math.round((correctCount / totalQuestions) * 100);

        await connection.beginTransaction();

        const [assignmentRows] = await connection.query(
            'SELECT assignment_id FROM quizzes WHERE id = ?',
            [quizId]
        );
        const assignmentId = assignmentRows.length > 0 ? assignmentRows[0].assignment_id : null;

        const [attemptResult] = await connection.query(
            'INSERT INTO quiz_attempts (student_id, quiz_id, score, status, completed_at) VALUES (?, ?, ?, ?, NOW())',
            [studentId, quizId, score, 'finished']
        );

        const attemptId = attemptResult.insertId;

        for (const ans of answers) {
            await connection.query(
                'INSERT INTO attempt_answers (student_id, question_id, selected_option_id) VALUES (?, ?, ?)',
                [studentId, ans.question_id, ans.selected_option_id]
            );
        }

        if (assignmentId) {
            const [existingSubmission] = await connection.query(
                'SELECT id FROM submissions WHERE assignment_id = ? AND student_id = ? LIMIT 1',
                [assignmentId, studentId]
            );

            if (existingSubmission.length === 0) {
                await connection.query(
                    'INSERT INTO submissions (assignment_id, student_id, content, score, submitted_at) VALUES (?, ?, ?, ?, NOW())',
                    [assignmentId, studentId, 'Quiz Attempt', score]
                );
            }
        }

        await connection.commit();

        res.json({
            attempt_id: attemptId,
            quiz_id: Number(quizId),
            score,
            correctCount,
            totalQuestions
        });
    } catch (error) {
        await connection.rollback();
        console.error('Error submitting quiz attempt:', error);
        res.status(500).json({ message: 'Server error' });
    } finally {
        connection.release();
    }
});

// GET /api/student/quizzes/:quizId/result - Latest quiz result for student
router.get('/:quizId/result', authenticateToken, ensureStudent, async (req, res) => {
    try {
        const studentId = req.user.id;
        const { quizId } = req.params;

        const courseId = await ensureEnrollmentByQuiz(studentId, quizId);
        if (!courseId) {
            return res.status(403).json({ message: 'Access denied. Not enrolled in this course.' });
        }

        const [attemptRows] = await db.query(
            `SELECT qa.id, qa.score, qa.completed_at, a.id as assignment_id
             FROM quiz_attempts qa
             JOIN quizzes q ON q.id = qa.quiz_id
             JOIN assignments a ON a.id = q.assignment_id
             WHERE qa.quiz_id = ? AND qa.student_id = ?
             ORDER BY qa.id DESC
             LIMIT 1`,
            [quizId, studentId]
        );

        if (attemptRows.length === 0) {
            return res.status(404).json({ message: 'No quiz attempt found.' });
        }

        const attempt = attemptRows[0];

        const [totalRows] = await db.query(
            'SELECT COUNT(*) as total FROM questions WHERE quiz_id = ?',
            [quizId]
        );
        const totalQuestions = totalRows[0]?.total || 0;

        const [correctRows] = await db.query(
            `SELECT COUNT(*) as correctCount
             FROM attempt_answers aa
             JOIN options o ON o.id = aa.selected_option_id
             WHERE aa.student_id = ? AND aa.question_id IN (SELECT id FROM questions WHERE quiz_id = ?) AND o.is_correct = 1`,
            [studentId, quizId]
        );
        const correctCount = correctRows[0]?.correctCount || 0;

        res.json({
            attempt_id: attempt.id,
            quiz_id: Number(quizId),
            assignment_id: attempt.assignment_id,
            score: attempt.score,
            correctCount,
            totalQuestions,
            completed_at: attempt.completed_at
        });
    } catch (error) {
        console.error('Error fetching quiz result:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/student/quizzes/attempt/:attemptId - Detailed attempt review for student
router.get('/attempt/:attemptId', authenticateToken, ensureStudent, async (req, res) => {
    try {
        const studentId = req.user.id;
        const { attemptId } = req.params;

        const [attempts] = await db.query(`
            SELECT 
                qa.id as attempt_id,
                u.name as student_name,
                qa.score,
                qa.completed_at,
                q.id as quiz_id,
                q.title as quiz_title,
                a.id as assignment_id,
                a.course_id
            FROM quiz_attempts qa
            JOIN users u ON qa.student_id = u.id
            JOIN quizzes q ON qa.quiz_id = q.id
            JOIN assignments a ON a.id = q.assignment_id
            WHERE qa.id = ? AND qa.student_id = ?
        `, [attemptId, studentId]);

        if (attempts.length === 0) return res.status(404).json({ message: 'Attempt not found' });
        const summary = attempts[0];

        const [questions] = await db.query(`
            SELECT 
                q.id as question_id,
                q.question_text,
                q.points,
                aa.selected_option_id
            FROM questions q
            LEFT JOIN attempt_answers aa 
                ON q.id = aa.question_id AND aa.student_id = ?
            WHERE q.quiz_id = ?
        `, [studentId, summary.quiz_id]);

        for (const q of questions) {
            const [options] = await db.query(
                'SELECT id, option_text, is_correct FROM options WHERE question_id = ?',
                [q.question_id]
            );
            q.options = options;
            const selectedOpt = options.find(o => o.id === q.selected_option_id);
            q.isCorrect = selectedOpt ? selectedOpt.is_correct === 1 : false;
        }

        res.json({
            ...summary,
            questions
        });
    } catch (error) {
        console.error('Error fetching attempt details:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/student/quizzes/attempt/:attemptId/export - Export student attempt (PDF)
router.get('/attempt/:attemptId/export', authenticateToken, ensureStudent, async (req, res) => {
    try {
        const { attemptId } = req.params;
        const { format } = req.query;
        const studentId = req.user.id;

        if (format !== 'pdf') {
            return res.status(400).json({ message: 'Only PDF format is supported currently.' });
        }

        const PDFDocument = require('pdfkit');

        const [attempts] = await db.query(`
            SELECT qa.id, u.name as student_name, qa.score, qa.completed_at, q.title as quiz_title, qa.student_id, qa.quiz_id
            FROM quiz_attempts qa
            JOIN users u ON qa.student_id = u.id
            JOIN quizzes q ON qa.quiz_id = q.id
            WHERE qa.id = ? AND qa.student_id = ?
        `, [attemptId, studentId]);

        if (attempts.length === 0) return res.status(404).json({ message: 'Attempt not found' });
        const summary = attempts[0];

        const [questions] = await db.query(`
            SELECT 
                q.id as question_id,
                q.question_text, 
                aa.selected_option_id
            FROM questions q
            LEFT JOIN attempt_answers aa ON q.id = aa.question_id AND aa.student_id = ?
            WHERE q.quiz_id = ?
        `, [summary.student_id, summary.quiz_id]);

        for (const q of questions) {
            const [options] = await db.query('SELECT id, option_text, is_correct FROM options WHERE question_id = ?', [q.question_id]);
            q.options = options;
            const selectedOpt = options.find(o => o.id === q.selected_option_id);
            q.isCorrect = selectedOpt ? selectedOpt.is_correct === 1 : false;
        }

        const doc = new PDFDocument({ margin: 50 });

        const studentSlug = String(summary.student_name || 'student').replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const quizSlug = String(summary.quiz_title || 'quiz').replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const dateObj = new Date(summary.completed_at || Date.now());
        const pad2 = (n) => String(n).padStart(2, '0');
        const timestamp = `${dateObj.getFullYear()}-${pad2(dateObj.getMonth() + 1)}-${pad2(dateObj.getDate())}_${pad2(dateObj.getHours())}-${pad2(dateObj.getMinutes())}-${pad2(dateObj.getSeconds())}`;

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${studentSlug}_${quizSlug}_${timestamp}.pdf`);

        doc.pipe(res);

        doc.fontSize(20).text('Student Result Report', { align: 'center', underline: true });
        doc.moveDown();

        doc.fontSize(12).font('Helvetica-Bold');
        doc.text(`Student Name: ${summary.student_name}`);
        doc.text(`Quiz Title: ${summary.quiz_title}`);
        doc.text(`Submitted At: ${new Date(summary.completed_at).toLocaleString()}`);
        doc.moveDown(0.5);
        doc.text(`Final Score: ${summary.score} / 100`, { align: 'right' });
        if (summary.score >= 60) {
            doc.fillColor('green').text('[ PASSED ]', { align: 'right' });
        } else {
            doc.fillColor('red').text('[ FAILED ]', { align: 'right' });
        }
        doc.fillColor('black');
        doc.moveDown();

        doc.fontSize(14).text('Detailed Answers', { underline: true });
        doc.moveDown();

        const leftX = 50;
        const rightX = 550;
        const colGap = 20;
        const colWidth = (rightX - leftX - colGap) / 2;
        const optionRowHeight = 18;

        questions.forEach((q, i) => {
            const optionRows = Math.ceil(q.options.length / 2);
            const needsCorrectLine = !q.isCorrect;
            const estimatedHeight = 24 + (optionRows * optionRowHeight) + (needsCorrectLine ? 18 : 0) + 18;

            if (doc.y + estimatedHeight > doc.page.height - 70) {
                doc.addPage();
            }

            doc.moveTo(leftX, doc.y).lineTo(rightX, doc.y).strokeColor('#ccc').stroke();
            doc.moveDown(0.5);

            const qLineY = doc.y;
            doc.fontSize(12).font('Helvetica-Bold').fillColor('black')
               .text(`Q${i + 1}. ${q.question_text}`, leftX, qLineY, { width: rightX - leftX - 80 });

            const statusText = q.isCorrect ? 'CORRECT' : 'INCORRECT';
            doc.fontSize(10).font('Helvetica-Bold')
               .fillColor(q.isCorrect ? '#28A745' : '#DC3545')
               .text(statusText, rightX - 60, qLineY, { width: 60, align: 'right' });
            doc.fillColor('black');
            doc.moveDown(0.8);

            const optionsStartY = doc.y;
            let maxOptionY = optionsStartY;

            q.options.forEach((opt, idx) => {
                const isSelected = opt.id === q.selected_option_id;
                const isCorrect = opt.is_correct === 1;
                const label = String.fromCharCode(65 + idx);

                const row = Math.floor(idx / 2);
                const col = idx % 2;
                const x = col === 0 ? leftX : leftX + colWidth + colGap;
                const y = optionsStartY + (row * optionRowHeight);
                maxOptionY = Math.max(maxOptionY, y);

                let optionColor = 'black';
                if (isSelected && isCorrect) optionColor = '#28A745';
                if (isSelected && !isCorrect) optionColor = '#DC3545';

                doc.fontSize(11).font('Helvetica').fillColor(optionColor)
                   .text(`${label}. ${opt.option_text}`, x, y, { width: colWidth });

                if (isSelected) {
                    const markX = x - 1;
                    const markY = y - 1;
                    doc.save();
                    doc.strokeColor(optionColor).lineWidth(1.5);
                    doc.moveTo(markX - 1, markY).lineTo(markX + 9, markY + 10).stroke();
                    doc.moveTo(markX + 9, markY).lineTo(markX - 1, markY + 10).stroke();
                    doc.restore();
                }
            });

            doc.y = maxOptionY + optionRowHeight;

            if (!q.isCorrect) {
                const correctIndex = q.options.findIndex(o => o.is_correct === 1);
                const correctOpt = correctIndex >= 0 ? q.options[correctIndex] : null;
                const correctLabel = correctIndex >= 0 ? String.fromCharCode(65 + correctIndex) : '?';
                doc.moveDown(0.2);
                doc.fontSize(10).font('Helvetica-Bold').fillColor('#DC3545')
                   .text(`Correct answer: ${correctLabel}. ${correctOpt ? correctOpt.option_text : '-'}`, leftX);
                doc.fillColor('black');
            }

            doc.moveDown(1);
        });

        doc.moveDown();
        doc.fontSize(10).fillColor('gray').text('Generated by LMS System', { align: 'center' });

        doc.end();
    } catch (error) {
        console.error('Error generating report:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
