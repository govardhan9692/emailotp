
# Email Scribe with Firebase

A beautiful email sending application that uses NodeMailer for sending emails and Firebase Firestore for storing sent email records.

## Features

- Clean, modern UI for composing emails
- Send emails through Gmail SMTP
- Store sent emails in Firebase Firestore
- Form validation
- Loading indicators
- Success/error notifications

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Express, NodeMailer
- **Database**: Firebase Firestore

## Getting Started

### Prerequisites

- Node.js and npm installed
- Gmail account (or update the SMTP settings for a different provider)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Configuration

1. Make sure the `.env` file is set up with your email credentials:
   ```
   EMAIL_USER=Govardhan5009@gmail.com
   EMAIL_PASS=boij zebp mviu njrb
   PORT=5000
   ```

### Running the Application

1. Start the backend server:
   ```bash
   node server.js
   ```

2. In a separate terminal, start the frontend:
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:8080`

## Usage

1. Fill in the recipient email, subject, and message
2. Click "Send Email"
3. You will see a success notification when the email is sent
4. The email details are stored in Firebase Firestore in the `emailsSent` collection

## Security Notes

- The app is currently configured to use environment variables for email credentials
- The Firebase configuration is public, but Firestore security rules should be set up to restrict access
