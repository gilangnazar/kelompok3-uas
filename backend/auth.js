const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_change_me';

const authenticateToken = require('./middleware/authMiddleware'); // Import middleware

// GET /me (Get Current User Profile)
router.get('/me', authenticateToken, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT id, name, email, role FROM users WHERE id = ?', [req.user.id]);
        if (rows.length === 0) return res.status(404).json({ message: 'User not found' });
        res.json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Register (Hanya untuk Student)
router.post('/register', async (req, res) => {
    console.log('Register Request Body:', req.body);
    const { name, email, password } = req.body; 
    
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    // Selalu set sebagai 'student' untuk registrasi mandiri
    const userRole = 'student';

    try {
        // Check if user exists
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length > 0) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        await db.query('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', 
            [name, email, hashedPassword, userRole]);

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Login
router.post('/login', async (req, res) => {
    console.log('Login Request Body:', req.body); // Debug log
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });

        res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;