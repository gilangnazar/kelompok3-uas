const express = require('express');
const cors = require('cors');
const authRoutes = require('./auth');
const studentDashboardRoutes = require('./routes/student/dashboard');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/student/dashboard', studentDashboardRoutes);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
