const nodemailer = require('nodemailer');

// Create reusable transporter
const createTransporter = () => {
  if (process.env.NODE_ENV === 'test') {
    // Use ethereal (fake SMTP) for tests
    return nodemailer.createTransport({ jsonTransport: true });
  }

  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER) {
    console.warn('[EmailService] Email env vars not set — emails will be skipped.');
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const FROM_ADDRESS = `"EduManage" <${process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@edumanage.app'}>`;

/**
 * Send a raw email. Returns silently if transporter is not configured.
 */
const sendMail = async (options) => {
  const transporter = createTransporter();
  if (!transporter) return;
  try {
    await transporter.sendMail({ from: FROM_ADDRESS, ...options });
  } catch (err) {
    console.error('[EmailService] Failed to send email:', err.message);
  }
};

// ─── Welcome Email ────────────────────────────────────────────────────────────
const sendWelcomeEmail = async ({ email, firstName, role }) => {
  const roleMessage =
    role === 'instructor'
      ? 'Please upload your verification documents to get your account approved and start creating courses.'
      : 'Browse available courses and enroll to begin learning today.';

  await sendMail({
    to: email,
    subject: '🎓 Welcome to EduManage!',
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:8px;">
        <h2 style="color:#2563eb;">Welcome to EduManage, ${firstName}!</h2>
        <p>Your <strong>${role}</strong> account has been created successfully.</p>
        <p>${roleMessage}</p>
        <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/login"
           style="display:inline-block;margin-top:16px;padding:10px 20px;background:#2563eb;color:#fff;border-radius:6px;text-decoration:none;">
          Go to Dashboard
        </a>
        <hr style="margin:24px 0;border:none;border-top:1px solid #e5e7eb;"/>
        <p style="font-size:12px;color:#6b7280;">EduManage · If you did not create this account, please ignore this email.</p>
      </div>
    `,
  });
};

// ─── Enrollment Confirmation ───────────────────────────────────────────────────
const sendEnrollmentConfirmation = async ({ email, firstName, courseTitle, instructorName }) => {
  await sendMail({
    to: email,
    subject: `✅ Enrolled in "${courseTitle}"`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:8px;">
        <h2 style="color:#2563eb;">Enrollment Confirmed!</h2>
        <p>Hi ${firstName},</p>
        <p>You have successfully enrolled in <strong>${courseTitle}</strong>${instructorName ? ` taught by <strong>${instructorName}</strong>` : ''}.</p>
        <p>Head to your dashboard to access course materials, assignments and more.</p>
        <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/my-courses"
           style="display:inline-block;margin-top:16px;padding:10px 20px;background:#2563eb;color:#fff;border-radius:6px;text-decoration:none;">
          View My Courses
        </a>
        <hr style="margin:24px 0;border:none;border-top:1px solid #e5e7eb;"/>
        <p style="font-size:12px;color:#6b7280;">EduManage</p>
      </div>
    `,
  });
};

// ─── Grade Notification ────────────────────────────────────────────────────────
const sendGradeNotification = async ({ email, firstName, courseTitle, grade, feedback }) => {
  await sendMail({
    to: email,
    subject: `📊 New Grade Posted — ${courseTitle}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:8px;">
        <h2 style="color:#2563eb;">A new grade has been posted</h2>
        <p>Hi ${firstName},</p>
        <p>Your grade for <strong>${courseTitle}</strong> has been updated:</p>
        <table style="border-collapse:collapse;width:100%;margin:16px 0;">
          <tr style="background:#f3f4f6;">
            <td style="padding:8px 12px;font-weight:600;">Final Grade</td>
            <td style="padding:8px 12px;">${grade !== undefined ? grade : 'N/A'}</td>
          </tr>
          ${feedback ? `<tr><td style="padding:8px 12px;font-weight:600;">Feedback</td><td style="padding:8px 12px;">${feedback}</td></tr>` : ''}
        </table>
        <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/grades"
           style="display:inline-block;margin-top:16px;padding:10px 20px;background:#2563eb;color:#fff;border-radius:6px;text-decoration:none;">
          View Grades
        </a>
        <hr style="margin:24px 0;border:none;border-top:1px solid #e5e7eb;"/>
        <p style="font-size:12px;color:#6b7280;">EduManage</p>
      </div>
    `,
  });
};

// ─── Password Reset ────────────────────────────────────────────────────────────
const sendPasswordResetEmail = async ({ email, firstName, resetToken }) => {
  const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
  await sendMail({
    to: email,
    subject: '🔐 Reset Your EduManage Password',
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:8px;">
        <h2 style="color:#2563eb;">Password Reset Request</h2>
        <p>Hi ${firstName},</p>
        <p>We received a request to reset your password. Click the button below — this link expires in <strong>1 hour</strong>.</p>
        <a href="${resetUrl}"
           style="display:inline-block;margin-top:16px;padding:10px 20px;background:#dc2626;color:#fff;border-radius:6px;text-decoration:none;">
          Reset Password
        </a>
        <p style="margin-top:16px;font-size:13px;color:#6b7280;">If you did not request a password reset, please ignore this email — your password will remain unchanged.</p>
        <hr style="margin:24px 0;border:none;border-top:1px solid #e5e7eb;"/>
        <p style="font-size:12px;color:#6b7280;">EduManage</p>
      </div>
    `,
  });
};

// ─── Instructor Approved ───────────────────────────────────────────────────────
const sendInstructorApprovedEmail = async ({ email, firstName }) => {
  await sendMail({
    to: email,
    subject: '🎉 Your Instructor Account Has Been Approved',
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:8px;">
        <h2 style="color:#16a34a;">Account Approved!</h2>
        <p>Hi ${firstName},</p>
        <p>Congratulations! Your instructor account has been verified and approved. You can now create and manage courses on EduManage.</p>
        <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/create-course"
           style="display:inline-block;margin-top:16px;padding:10px 20px;background:#16a34a;color:#fff;border-radius:6px;text-decoration:none;">
          Create Your First Course
        </a>
        <hr style="margin:24px 0;border:none;border-top:1px solid #e5e7eb;"/>
        <p style="font-size:12px;color:#6b7280;">EduManage</p>
      </div>
    `,
  });
};

module.exports = {
  sendWelcomeEmail,
  sendEnrollmentConfirmation,
  sendGradeNotification,
  sendPasswordResetEmail,
  sendInstructorApprovedEmail,
};
