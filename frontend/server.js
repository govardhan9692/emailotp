
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBppBoZ8nmNQSRGXbfq6ed0kvCKP-tej6Q",
  authDomain: "lastmovements-6b3d1.firebaseapp.com",
  projectId: "lastmovements-6b3d1", 
  storageBucket: "lastmovements-6b3d1.firebasestorage.app",
  messagingSenderId: "1048340978110",
  appId: "1:1048340978110:web:ce159540e7eb27293c41ef",
  measurementId: "G-LW7VFWXC6H"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

// Nodemailer Configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'Govardhan5009@gmail.com',
    pass: process.env.EMAIL_PASS || 'boij zebp mviu njrb'
  }
});

// Send Email Endpoint
app.post('/send-email', async (req, res) => {
  const { to, subject, message } = req.body;

  if (!to || !subject || !message) {
    return res.status(400).json({ success: false, message: 'Please provide to, subject, and message fields' });
  }

  try {
    // Email Options
    const mailOptions = {
      from: process.env.EMAIL_USER || 'Govardhan5009@gmail.com',
      to,
      subject,
      text: message
    };

    // Send Email
    await transporter.sendMail(mailOptions);

    // Store in Firebase
    await addDoc(collection(db, 'emailsSent'), {
      to,
      subject,
      message,
      sentAt: serverTimestamp()
    });

    res.status(200).json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ success: false, message: 'Failed to send email', error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
