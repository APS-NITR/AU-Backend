const transporter = require('../config/email');

exports.sendOTP = async (email, otp, teamName) => {
  const mailOptions = {
    from: `"Team Coding Event" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Verify your registration for Team "${teamName}"`,
    html: `
      <p>Hello,</p>
      <p>You’ve been invited to join team <strong>${teamName}</strong>.</p>
      <p>Your OTP is: <strong>${otp}</strong></p>
      <p>This OTP is valid for 10 minutes.</p>
    `
  };

  await transporter.sendMail(mailOptions);
};

exports.sendTeamInvite = async (email, teamName, leaderName) => {
  const mailOptions = {
    from: `"Team Coding Event" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `You're invited to join "${teamName}" by ${leaderName}`,
    html: `
      <p>Hello,</p>
      <p><strong>${leaderName}</strong> has invited you to join the coding team <strong>${teamName}</strong>.</p>
      <p>Please check your inbox for an OTP and verify your participation on the platform.</p>
      <p>If you did not expect this invitation, you may ignore this email.</p>
    `
  };

  await transporter.sendMail(mailOptions);
};
exports.sendWelcomeEmail = async (email, name) => {
  const mailOptions = {
    from: `"Team Coding Event" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Welcome to the Team, ${name}!`,
    html: `
      <p>Hello ${name},</p>
      <p>Thank you for registering with us. We are excited to have you on board!</p>
      <p>Feel free to explore our platform and connect with your team.</p>
      <p>Best regards,<br/>Team Coding Event</p>
    `
  };

  await transporter.sendMail(mailOptions);
};
exports.sendPasswordResetEmail = async (email, resetLink) => {
  const mailOptions = {
    from: `"Team Coding Event" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Password Reset Request',
    html: `
      <p>Hello,</p>
      <p>We received a request to reset your password. Click the link below to reset it:</p>
      <p><a href="${resetLink}">Reset Password</a></p>
      <p>If you did not request this, please ignore this email.</p>
    `
  };

  await transporter.sendMail(mailOptions);
};
exports.sendVerificationEmail = async (email, verificationLink) => {
  const mailOptions = {
    from: `"Team Coding Event" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Email Verification',
    html: `
      <p>Hello,</p>
      <p>Thank you for registering. Please verify your email by clicking the link below:</p>
      <p><a href="${verificationLink}">Verify Email</a></p>
      <p>If you did not register, please ignore this email.</p>
    `
  };

  await transporter.sendMail(mailOptions);
};

//notification service
exports.sendNotification = async (email, subject, message) => {
  const mailOptions = {
    from: `"Team Coding Event" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: subject,
    html: `<p>${message}</p>`
  };

  await transporter.sendMail(mailOptions);
};