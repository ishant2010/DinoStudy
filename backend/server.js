require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Temporary store for OTPs (Format: { "email@example.com": { otp: "123456", expiresAt: 1234567890 } })
const tempOtpStore = {};

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Route 1: Send OTP
app.post('/send-otp', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ success: false, message: "Email is required." });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store it with a 5-minute expiration
    tempOtpStore[email] = {
        otp: otp,
        expiresAt: Date.now() + 5 * 60 * 1000
    };

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'DinoStudy - Your Login OTP',
        text: `Your One-Time Password for DinoStudy is: ${otp}. This code expires in 5 minutes.`
    };

    try {
        await transporter.sendMail(mailOptions);
        res.json({ success: true, message: "OTP sent successfully!" });
    } catch (error) {
        console.error("Email Error:", error);
        res.status(500).json({ success: false, message: "Failed to send email. Check your app password." });
    }
});

// Route 2: Verify OTP
app.post('/verify-otp', (req, res) => {
    const { email, otp } = req.body;

    // 1. Check if an OTP even exists for this email
    if (!tempOtpStore[email]) {
        return res.status(400).json({ success: false, message: "OTP not requested or expired." });
    }

    const record = tempOtpStore[email];

    // 2. Check if the OTP has expired
    if (Date.now() > record.expiresAt) {
        delete tempOtpStore[email]; // Clean up expired data
        return res.status(400).json({ success: false, message: "OTP has expired. Please request a new one." });
    }

    // 3. Verify the OTP match
    if (record.otp === otp) {
        delete tempOtpStore[email]; // Clear OTP once used successfully
        return res.json({ success: true, message: "Authentication successful!" });
    } else {
        return res.status(400).json({ success: false, message: "Invalid OTP code. Please try again." });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});