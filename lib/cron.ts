import cron from 'node-cron';
import dbConnect from './mongodb';
import Task from '@/models/Task';
import User from '@/models/User';
import { sendEmail } from './nodemailer';

export function startCronJob() {
  // schedule tasks to be run on the server.
  cron.schedule('* * * * *', async () => {
    console.log('Running cron job to check for due tasks...');
    await dbConnect();

    try {
      const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000);
      const now = new Date();

      const tasks = await Task.find({
        completed: false,
        reminderSent: false,
        dueDate: {
          $gte: now,
          $lte: oneHourFromNow,
        },
      }).populate('userId');

      for (const task of tasks) {
        if (task.userId && task.userId.email) {
          const subject = `Reminder: Task "${task.title}" is due soon!`;
          const text = `Hi ${task.userId.username},\n\nYour task "${task.title}" is due at ${new Date(task.dueDate).toLocaleString()}.\n\nPlease complete it soon!`;
          
          await sendEmail(task.userId.email, subject, text);

          task.reminderSent = true;
          await task.save();
        }
      }
    } catch (error) {
      console.error('Error in cron job:', error);
    }
  });
}
