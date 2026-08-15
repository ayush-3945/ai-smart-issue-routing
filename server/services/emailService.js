const nodemailer = require('nodemailer');

// Ethereal / Gmail SMTP Transporter
// (Agar .env me EMAIL_USER nahi hai toh yeh safe mock transporter use karega)
const createTransporter = async () => {
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  // Automatic Testing Account (Ethereal) for local development
  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
};

// 1. Complaint Created Email
const sendComplaintCreatedEmail = async (userEmail, userName, complaint) => {
  try {
    const transporter = await createTransporter();

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; borderRadius: 12px;">
        <h2 style="color: #2563eb;">🚀 Complaint Registered Successfully</h2>
        <p>Hi <strong>${userName}</strong>,</p>
        <p>Your complaint has been received and automatically analyzed by our AI system.</p>
        
        <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p><strong>📌 Title:</strong> ${complaint.title}</p>
          <p><strong>🏷️ Category (AI):</strong> ${complaint.category}</p>
          <p><strong>⚡ Priority:</strong> <span style="color: ${complaint.priority === 'Critical' ? '#dc2626' : '#2563eb'}; font-weight: bold;">${complaint.priority}</span></p>
          <p><strong>🤖 AI Summary:</strong> ${complaint.aiSummary || 'Under review'}</p>
        </div>

        <p style="color: #64748b; font-size: 14px;">We are actively routing this to the relevant department and will notify you as soon as the status changes.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #94a3b8;">AI Smart Issue Routing System</p>
      </div>
    `;

    const info = await transporter.sendMail({
      from: '"AI Issue Router" <noreply@smartissue.ai>',
      to: userEmail,
      subject: `✅ Complaint Received: ${complaint.title}`,
      html: htmlContent,
    });

    console.log('📧 Confirmation Email sent:', info.messageId);
    if (nodemailer.getTestMessageUrl(info)) {
      console.log('🔗 Preview Email URL:', nodemailer.getTestMessageUrl(info));
    }
  } catch (error) {
    console.error('Email sending failed:', error.message);
  }
};

// 2. Status Updated Email
const sendStatusUpdatedEmail = async (userEmail, userName, complaint) => {
  try {
    const transporter = await createTransporter();

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; borderRadius: 12px;">
        <h2 style="color: #10b981;">🔄 Complaint Status Updated</h2>
        <p>Hi <strong>${userName}</strong>,</p>
        <p>Your complaint status has been updated by our admin team.</p>
        
        <div style="background-color: #f0fdf4; padding: 16px; border-radius: 8px; margin: 16px 0; border: 1px solid #dcfce7;">
          <p><strong>📌 Issue:</strong> ${complaint.title}</p>
          <p><strong>🚦 New Status:</strong> <span style="color: #15803d; font-weight: bold; font-size: 16px;">${complaint.status}</span></p>
        </div>

        <p style="color: #64748b; font-size: 14px;">You can view the full live tracking on your dashboard.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #94a3b8;">AI Smart Issue Routing System</p>
      </div>
    `;

    const info = await transporter.sendMail({
      from: '"AI Issue Router" <noreply@smartissue.ai>',
      to: userEmail,
      subject: `🔔 Status Update: ${complaint.title} is now ${complaint.status}`,
      html: htmlContent,
    });

    console.log('📧 Status Email sent:', info.messageId);
    if (nodemailer.getTestMessageUrl(info)) {
      console.log('🔗 Preview Email URL:', nodemailer.getTestMessageUrl(info));
    }
  } catch (error) {
    console.error('Status Email sending failed:', error.message);
  }
};

module.exports = { sendComplaintCreatedEmail, sendStatusUpdatedEmail };