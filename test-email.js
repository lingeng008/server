const { sendEmergencyEmail } = require('./services/email');
require('dotenv').config();

// 测试邮件发送
async function testEmail() {
  console.log('开始测试邮件发送...');
  console.log('SMTP配置:');
  console.log('- Host:', process.env.SMTP_HOST);
  console.log('- Port:', process.env.SMTP_PORT);
  console.log('- User:', process.env.SMTP_USER);
  console.log('- Pass:', process.env.SMTP_PASS ? '已配置' : '未配置');

  const testEmail = process.env.SMTP_USER; // 发送给自己测试
  const userInfo = {
    nickname: '测试用户',
    lastCheckinDate: '2026-01-08',
    daysSinceCheckin: 3
  };

  try {
    const result = await sendEmergencyEmail(testEmail, userInfo);
    if (result) {
      console.log('✅ 邮件发送成功！请检查邮箱:', testEmail);
    } else {
      console.log('❌ 邮件发送失败');
    }
  } catch (error) {
    console.error('❌ 邮件发送出错:', error);
  }
}

testEmail();
