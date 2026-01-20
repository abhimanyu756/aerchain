const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'RFP Management System API is running',
        timestamp: new Date().toISOString(),
    });
});

// API Routes
app.use('/api/rfps', require('./routes/rfpRoutes'));
app.use('/api/vendors', require('./routes/vendorRoutes'));
app.use('/api/proposals', require('./routes/proposalRoutes'));

// Manual email check endpoint (checks ALL recent emails with debug logging)
app.post('/api/emails/check', async (req, res) => {
    try {
        const emailReceiver = require('./services/emailReceiverService');
        console.log('\n🔍 MANUAL EMAIL CHECK TRIGGERED');
        const results = await emailReceiver.checkForNewEmails(true); // Check ALL recent emails
        res.json({
            message: 'Email check completed',
            processed: results.length,
            results
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.path} not found`,
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
});

// Start server
const server = app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);

    // Start email polling if IMAP is configured
    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
        const emailReceiver = require('./services/emailReceiverService');
        const pollInterval = parseInt(process.env.EMAIL_POLL_INTERVAL) || 60000;
        emailReceiver.startEmailPolling(pollInterval);
    } else {
        console.log('⚠️ Email credentials not configured, email polling disabled');
    }
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    const emailReceiver = require('./services/emailReceiverService');
    emailReceiver.stopEmailPolling();
    server.close(() => {
        console.log('HTTP server closed');
    });
});

module.exports = app;

