import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from parent directory's .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

app.post('/api/send', async (req, res) => {
  try {
    const { to, subject, text, html } = req.body;
    const info = await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to,
      subject,
      text,
      html
    });
    res.json({ message: 'Email sent', info });
  } catch (err) {
    console.error('Error sending email:', err);
    res.status(500).json({ message: 'Failed to send email.' });
  }
});

// Email sending endpoint
app.post('/send-email', async (req, res) => {
  try {
    console.log('Raw request body:', req.body); // Log entire request to debug
    
    // Extract fields with robust defaults
    const to = req.body.to;
    const subject = req.body.subject || 'No Subject';
    const body = req.body.body || req.body.message || req.body.content || req.body.html || '';
    const name = req.body.name || 'Govardhan From DTS';
    
    console.log('Processed request:', { to, subject, name, bodyLength: body?.length });
    
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('Email credentials not set in environment variables');
      return res.status(500).json({
        success: false,
        message: 'Email service not properly configured'
      });
    }
    
    // Configure nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Send email with fixed name and body
    const info = await transporter.sendMail({
      from: `"Govardhan From DTS" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: body || 'No content provided', // Ensure there's always some content
      text: body ? body.replace(/<[^>]*>/g, '') : 'No content provided' // Plain text fallback
    });

    console.log('Email sent successfully:', info.messageId);
    res.status(200).json({ 
      success: true, 
      message: 'Email sent successfully', 
      messageId: info.messageId 
    });
  } catch (error: unknown) {
    console.error('Error sending email:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send email', 
      error: errorMessage 
    });
  }
});

// Fix the catch-all handler - remove the condition that blocks the /send-email path
// since we already have a specific handler for that route
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});