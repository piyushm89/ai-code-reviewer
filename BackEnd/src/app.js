const express = require('express');
const aiRoutes = require('./routes/ai.routes');
const cors = require('cors');

const app = express();

// Allow all origins so the Vercel frontend (and local dev) can call the API.
app.use(cors());

app.use(express.json({ limit: '1mb' }));

app.get('/', (req, res) => {
    res.send('AI Code Reviewer API is running');
});

// Lightweight health check for Render / uptime monitors.
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.use('/ai', aiRoutes);

module.exports = app;
