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
          ${complaint.location?.address ? `<p><strong>📍 Location:</strong> ${complaint.location.address}</p>` : ''}
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
        <p>The status of your complaint has been updated by the administration team.</p>
        
        <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p><strong>📌 Title:</strong> ${complaint.title}</p>
          <p><strong>● New Status:</strong> <span style="color: #10b981; font-weight: bold;">${complaint.status}</span></p>
          <p><strong>🏷️ Category:</strong> ${complaint.category}</p>
        </div>

        <p style="color: #64748b; font-size: 14px;">You can view the full progress and resolution history on your user dashboard.</p>
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

    console.log('📧 Status Updated Email sent:', info.messageId);
  } catch (error) {
    console.error('Failed to send status update email:', error.message);
  }
};

// 3. Discord & Slack Webhook Dispatcher
const sendWebhookAlert = async (webhookUrl, complaint) => {
  if (!webhookUrl) return;

  const isDiscord = webhookUrl.includes('discord.com') || webhookUrl.includes('discordapp.com');
  const isCritical = complaint.priority === 'Critical';

  try {
    if (isDiscord) {
      const payload = {
        username: 'SmartIssue AI Bot',
        avatar_url: 'https://cdn-icons-png.flaticon.com/512/4712/4712038.png',
        embeds: [
          {
            title: `🚨 ${isCritical ? '[CRITICAL SURGE ALERT]' : '[NEW ISSUE DISPATCHED]'} ${complaint.title}`,
            description: complaint.aiSummary || complaint.description,
            color: isCritical ? 15548997 : complaint.priority === 'High' ? 15105570 : 5793266,
            fields: [
              { name: '📂 Department', value: complaint.category || 'General', inline: true },
              { name: '⚡ Priority', value: complaint.priority || 'Medium', inline: true },
              { name: '👤 Assigned Lead', value: complaint.assignedTo || 'Support Desk', inline: true },
              { name: '🤖 AI Confidence', value: `${complaint.aiConfidence || 95}%`, inline: true },
              { name: '● Status', value: complaint.status || 'Pending', inline: true }
            ],
            footer: { text: 'SmartIssue AI • Autonomous Incident Routing' },
            timestamp: new Date().toISOString()
          }
        ]
      };
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      console.log('✅ Discord webhook alert dispatched successfully');
    } else {
      // Slack Webhook Format
      const payload = {
        text: `🚨 *${isCritical ? '[CRITICAL ALERT]' : '[NEW TICKET]'}* *${complaint.title}*\n*Category:* ${complaint.category} | *Priority:* ${complaint.priority} | *Assigned:* ${complaint.assignedTo}\n*AI Summary:* ${complaint.aiSummary || complaint.description}`
      };
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      console.log('✅ Slack webhook alert dispatched successfully');
    }
  } catch (err) {
    console.warn('Webhook dispatch failed (non-blocking):', err.message);
  }
};

module.exports = {
  sendComplaintCreatedEmail,
  sendStatusUpdatedEmail,
  sendWebhookAlert
};