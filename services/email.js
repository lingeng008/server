const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT || 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

async function sendEmergencyEmail(emergencyEmail, userInfo) {
  const { nickname, lastCheckinDate, daysSinceCheckin } = userInfo;

  const mailOptions = {
    from: process.env.SMTP_USER,
    to: emergencyEmail,
    subject: '【活着么】紧急提醒：用户已连续多天未签到',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #ff6b6b;">紧急提醒</h2>
        <p>您好，</p>
        <p>您的紧急联系人 <strong>${nickname || '用户'}</strong> 在"活着么"小程序中已经连续 <strong>${daysSinceCheckin}</strong> 天未签到。</p>
        <p>最后签到时间：<strong>${lastCheckinDate || '从未签到'}</strong></p>
        <p>请尽快联系该用户，确认其安全状况。</p>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #999; font-size: 12px;">此邮件由"活着么"小程序自动发送，请勿回复。</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Emergency email sent to ${emergencyEmail}`);
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
}

module.exports = { sendEmergencyEmail };
