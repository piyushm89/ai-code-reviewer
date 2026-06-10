require('dotenv').config();
const app = require('./src/app');
const http = require('http');

// Start server with port fallback so EADDRINUSE doesn't crash the process.
// Tries PORT env or 3000, then increments up to 10 times to find a free port.
function startServer(port, attemptsLeft = 10) {
    const server = http.createServer(app);

    server.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
    });

    server.on('error', (err) => {
        if (err && err.code === 'EADDRINUSE') {
            console.error(`Port ${port} in use. ${attemptsLeft > 0 ? 'Trying next port...' : 'No more attempts left.'}`);
            server.close();
            if (attemptsLeft > 0) {
                startServer(port + 1, attemptsLeft - 1);
            } else {
                console.error('Failed to bind to a port. Exiting.');
                process.exit(1);
            }
        } else {
            console.error('Server error:', err);
            process.exit(1);
        }
    });
}

const defaultPort = parseInt(process.env.PORT, 10) || 3000;
startServer(defaultPort);

// Optional: handle unhandled rejections and uncaught exceptions gracefully
process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason);
});
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});