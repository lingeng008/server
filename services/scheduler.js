const cron = require('node-cron');
const db = require('../db/mysql');
const { sendEmergencyEmail } = require('./email');

function startScheduler() {
  // 每天凌晨0点执行
  cron.schedule('0 0 * * *', async () => {
    console.log('Running daily check for inactive users...');

    try {
      const [users] = await db.query(`
        SELECT id, nickname, emergency_email, last_checkin_date,
               CAST((julianday('now') - julianday(last_checkin_date)) AS INTEGER) as days_since_checkin
        FROM users
        WHERE emergency_email IS NOT NULL
          AND emergency_email != ''
          AND last_checkin_date IS NOT NULL
          AND CAST((julianday('now') - julianday(last_checkin_date)) AS INTEGER) >= 3
      `);

      console.log(`Found ${users.length} inactive users`);

      for (const user of users) {
        console.log(`Sending email to ${user.emergency_email} for user ${user.id}`);
        await sendEmergencyEmail(user.emergency_email, {
          nickname: user.nickname || '用户',
          lastCheckinDate: user.last_checkin_date,
          daysSinceCheckin: user.days_since_checkin
        });
      }

      console.log(`Checked ${users.length} inactive users`);
    } catch (error) {
      console.error('Scheduler error:', error);
    }
  });

  console.log('Scheduler started - will run daily at midnight');
}

module.exports = { startScheduler };
