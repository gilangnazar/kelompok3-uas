const express = require('express');
const router = express.Router();
const db = require('../../db');
const authenticateToken = require('../../middleware/authMiddleware');

// GET /api/instructor/scores/quiz/:quizId - Get all student scores for a specific quiz
router.get('/quiz/:quizId', authenticateToken, async (req, res) => {
    try {
        const { quizId } = req.params;

        const query = `
            SELECT 
                qa.id as attempt_id,
                u.id as student_id,
                u.name as student_name,
                qa.score,
                qa.completed_at as submitted_at,
                qa.status
            FROM quiz_attempts qa
            JOIN users u ON qa.student_id = u.id
            WHERE qa.quiz_id = ? AND qa.status = 'finished'
            ORDER BY qa.score DESC, qa.completed_at ASC
        `;

        const [rows] = await db.query(query, [quizId]);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching student scores:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /attempt/:attemptId - Get detailed results for a specific attempt
router.get('/attempt/:attemptId', authenticateToken, async (req, res) => {
    try {
        const { attemptId } = req.params;

        // 1. Get Attempt Summary
        const [attempts] = await db.query(`
            SELECT 
                qa.id as attempt_id,
                u.name as student_name,
                qa.score,
                qa.completed_at,
                q.id as quiz_id,
                q.title as quiz_title
            FROM quiz_attempts qa
            JOIN users u ON qa.student_id = u.id
            JOIN quizzes q ON qa.quiz_id = q.id
            WHERE qa.id = ?
        `, [attemptId]);

        if (attempts.length === 0) return res.status(404).json({ message: 'Attempt not found' });
        const summary = attempts[0];

        // 2. Get Questions and Student's Answers
        // We join questions with attempt_answers to see what the student selected
        const [questions] = await db.query(`
            SELECT 
                q.id as question_id,
                q.question_text,
                q.points,
                aa.selected_option_id
            FROM questions q
            LEFT JOIN attempt_answers aa ON q.id = aa.question_id AND aa.student_id = (SELECT student_id FROM quiz_attempts WHERE id = ?)
            WHERE q.quiz_id = ?
        `, [attemptId, summary.quiz_id]);

        // 3. For each question, get all options
        for (const q of questions) {
            const [options] = await db.query(
                'SELECT id, option_text, is_correct FROM options WHERE question_id = ?', 
                [q.question_id]
            );
            q.options = options;
            
            // Check if selected answer was correct
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

// GET /attempt/:attemptId/export - Export detailed result
router.get('/attempt/:attemptId/export', authenticateToken, async (req, res) => {
    try {
        const { attemptId } = req.params;
        const { format } = req.query;

        if (format !== 'pdf') {
            return res.status(400).json({ message: 'Only PDF format is supported currently.' });
        }

        const PDFDocument = require('pdfkit');
        
        // 1. Fetch Attempt & Summary
        const [attempts] = await db.query(`
            SELECT qa.id, u.name as student_name, qa.score, qa.completed_at, q.title as quiz_title, qa.student_id, qa.quiz_id
            FROM quiz_attempts qa
            JOIN users u ON qa.student_id = u.id
            JOIN quizzes q ON qa.quiz_id = q.id
            WHERE qa.id = ?
        `, [attemptId]);
        
        if (attempts.length === 0) return res.status(404).json({ message: 'Attempt not found' });
        const summary = attempts[0];

        // 2. Fetch Questions with Student Answers and Correct Answers
        const [questions] = await db.query(`
            SELECT 
                q.id as question_id,
                q.question_text, 
                aa.selected_option_id
            FROM questions q
            LEFT JOIN attempt_answers aa ON q.id = aa.question_id AND aa.student_id = ?
            WHERE q.quiz_id = ?
        `, [summary.student_id, summary.quiz_id]);

        // Fetch options for each question to display all choices
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

        // --- HEADER ---
        doc.fontSize(20).text('Student Result Report', { align: 'center', underline: true });
        doc.moveDown();
        
        doc.fontSize(12).font('Helvetica-Bold');
        doc.text(`Student Name: ${summary.student_name}`);
        doc.text(`Quiz Title: ${summary.quiz_title}`);
        doc.text(`Submitted At: ${new Date(summary.completed_at).toLocaleString()}`);
        
        // Score Box
        doc.moveDown(0.5);
        doc.text(`Final Score: ${summary.score} / 100`, { align: 'right' });
        if (summary.score >= 60) {
            doc.fillColor('green').text('[ PASSED ]', { align: 'right' });
        } else {
            doc.fillColor('red').text('[ FAILED ]', { align: 'right' });
        }
        doc.fillColor('black'); // Reset color
        doc.moveDown();
        
        // --- QUESTIONS LOOP ---
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

            // Draw separator line
            doc.moveTo(leftX, doc.y).lineTo(rightX, doc.y).strokeColor('#ccc').stroke();
            doc.moveDown(0.5);

            // Question Text + Status (right aligned)
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

            // Display options in 2 columns like exam paper
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
                    // X overlay on selected label (nudged up-left)
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

        // Footer
        doc.moveDown();
        doc.fontSize(10).fillColor('gray').text('Generated by LMS System', { align: 'center' });

        doc.end();

    } catch (error) {
        console.error('Error generating report:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /quiz/:quizId/export - Export all scores as Table
router.get('/quiz/:quizId/export', authenticateToken, async (req, res) => {
    try {
        const { quizId } = req.params;
        const { format } = req.query;

        if (format !== 'pdf' && format !== 'xlsx') {
             return res.status(400).json({ message: 'Only PDF or XLSX format is supported.' });
        }

        const PDFDocument = require('pdfkit');
        const ExcelJS = require('exceljs');

        // 1. Get Quiz Details for Filename
        const [quizInfo] = await db.query('SELECT title FROM quizzes WHERE id = ?', [quizId]);
        const quizTitle = quizInfo.length > 0 ? quizInfo[0].title : 'Quiz';
        const sanitizedTitle = quizTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const now = new Date();
        const pad2 = (n) => String(n).padStart(2, '0');
        const timestamp = `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}_${pad2(now.getHours())}-${pad2(now.getMinutes())}-${pad2(now.getSeconds())}`;

        // 2. Get Scores
        const [rows] = await db.query(`
            SELECT u.name, qa.score, qa.completed_at
            FROM quiz_attempts qa
            JOIN users u ON qa.student_id = u.id
            WHERE qa.quiz_id = ? AND qa.status = 'finished'
            ORDER BY qa.score DESC
        `, [quizId]);

        if (format === 'xlsx') {
            const workbook = new ExcelJS.Workbook();
            const sheet = workbook.addWorksheet('Scores');

            sheet.columns = [
                { header: 'No', key: 'no', width: 6 },
                { header: 'Student Name', key: 'name', width: 30 },
                { header: 'Submitted Date', key: 'submitted_at', width: 22 },
                { header: 'Score', key: 'score', width: 10 }
            ];

            rows.forEach((row, i) => {
                const submitted = row.completed_at ? new Date(row.completed_at) : null;
                const submittedText = submitted
                    ? `${submitted.getFullYear()}-${pad2(submitted.getMonth() + 1)}-${pad2(submitted.getDate())} ${pad2(submitted.getHours())}:${pad2(submitted.getMinutes())}:${pad2(submitted.getSeconds())}`
                    : '-';

                sheet.addRow({
                    no: i + 1,
                    name: row.name,
                    submitted_at: submittedText,
                    score: row.score
                });
            });

            sheet.getRow(1).font = { bold: true };

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename=${sanitizedTitle}_${timestamp}.xlsx`);

            await workbook.xlsx.write(res);
            return res.end();
        }

        const doc = new PDFDocument({ margin: 50 });
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${sanitizedTitle}_${timestamp}.pdf`);

        doc.pipe(res);

        // Header
        doc.fontSize(18).font('Helvetica-Bold').text(quizTitle, { align: 'center' });
        doc.fontSize(14).font('Helvetica').text('Student Score Report', { align: 'center' });
        doc.fontSize(10).text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
        doc.moveDown(2);

        // Table Constants
        const tableTop = 150;
        const col1X = 50;  // No
        const col2X = 100; // Name
        const col3X = 300; // Date
        const col4X = 480; // Score
        
        let y = tableTop;

        // Draw Table Header
        doc.font('Helvetica-Bold');
        doc.text('No', col1X, y);
        doc.text('Student Name', col2X, y);
        doc.text('Submitted Date', col3X, y);
        doc.text('Score', col4X, y);
        
        // Header Line
        y += 20;
        doc.moveTo(50, y).lineTo(550, y).stroke();
        y += 10;

        // Draw Table Rows
        doc.font('Helvetica');
        rows.forEach((row, i) => {
            // Striped row background (optional)
            if (i % 2 === 0) {
                doc.save();
                doc.fillColor('#f5f5f5');
                doc.rect(50, y - 5, 500, 25).fill();
                doc.restore();
            }

            doc.fillColor('black');
            doc.text(`${i + 1}`, col1X, y);
            doc.text(row.name, col2X, y);
            doc.text(new Date(row.completed_at).toLocaleString(), col3X, y);
            
            // Color score based on pass/fail
            if (row.score >= 60) {
                doc.fillColor('green').text(`${row.score}`, col4X, y);
            } else {
                doc.fillColor('red').text(`${row.score}`, col4X, y);
            }
            
            y += 30; // Row height
        });

        doc.end();

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
module.exports = router;
