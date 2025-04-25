import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

// Load environment variables from parent directory's .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBppBoZ8nmNQSRGXbfq6ed0kvCKP-tej6Q",
  authDomain: "lastmovements-6b3d1.firebaseapp.com",
  projectId: "lastmovements-6b3d1",
  storageBucket: "lastmovements-6b3d1.firebasestorage.app",
  messagingSenderId: "1048340978110",
  appId: "1:1048340978110:web:ce159540e7eb27293c41ef",
  measurementId: "G-LW7VFWXC6H"
};
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

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

// Generate a random 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP endpoint
app.post('/api/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const expiryTime = Date.now() + 10 * 60 * 1000; // 10 minutes expiry
    
    // Store OTP in Firebase
    await setDoc(doc(db, 'otps', email), {
      otp,
      expires: expiryTime,
      createdAt: serverTimestamp(),
      used: false
    });
    
    console.log(`Generated OTP for ${email}: ${otp} (stored in Firebase)`);
    
    // Send OTP via email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const info = await transporter.sendMail({
      from: `"Auth Service" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #6366f1; text-align: center;">Email Verification</h2>
          <p>Your verification code is:</p>
          <div style="margin: 20px 0; padding: 15px; background-color: #f3f4f6; border-radius: 5px; text-align: center;">
            <span style="font-size: 24px; font-weight: bold; letter-spacing: 5px;">${otp}</span>
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
        </div>
      `,
      text: `Your verification code is: ${otp}. This code will expire in 10 minutes.`
    });

    res.json({ 
      success: true, 
      message: 'OTP sent successfully',
      email 
    });
  } catch (error: any) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send OTP',
      error: error.message
    });
  }
});

// Verify OTP endpoint
app.post('/api/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and OTP are required' 
      });
    }
    
    // Retrieve OTP from Firebase
    const otpDoc = await getDoc(doc(db, 'otps', email));
    
    if (!otpDoc.exists()) {
      return res.status(400).json({ 
        success: false, 
        message: 'No OTP was generated for this email' 
      });
    }
    
    const otpData = otpDoc.data();
    
    // Check if OTP is already used
    if (otpData.used) {
      return res.status(400).json({
        success: false,
        message: 'This OTP has already been used'
      });
    }
    
    // Check if OTP is expired
    if (Date.now() > otpData.expires) {
      // Mark as expired in Firebase
      await updateDoc(doc(db, 'otps', email), {
        used: true,
        invalidReason: 'expired'
      });
      
      return res.status(400).json({ 
        success: false, 
        message: 'OTP has expired' 
      });
    }
    
    // Verify OTP
    if (otpData.otp !== otp) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid OTP' 
      });
    }
    
    // Mark OTP as used in Firebase (nullify it for security)
    await updateDoc(doc(db, 'otps', email), {
      used: true,
      usedAt: serverTimestamp(),
      otp: null // Nullify the OTP for security
    });
    
    res.json({ 
      success: true, 
      message: 'OTP verified successfully' 
    });
  } catch (error: any) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify OTP',
      error: error.message
    });
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

// Add a health check route at the root path
app.get('/', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    message: 'API is running',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Add an explicit handler for API endpoints
app.get('/api', (req, res) => {
  res.status(200).json({ 
    message: 'Email-Scribe API',
    version: '1.0.0',
    endpoints: [
      '/api/send-otp',
      '/api/verify-otp',
      '/api/send',
      '/send-email'
    ]
  });
});

// Move the catch-all handler to the end of all routes
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Endpoint not found',
    path: req.originalUrl
  });
});

// Keep the server listening only in development, not needed for Vercel
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Add this export for Vercel serverless functions
export default app;