export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
      // Import dynamically to avoid loading during build relative to edge runtime etc (though cron usually nodejs only)
      const { startCronJob } = await import('@/lib/cron');
      startCronJob();
  }
}
