import { checkAllExpiredSubscriptions } from './subscription-expiration.service';

// Simple cron-like scheduler for checking expired subscriptions
export class SubscriptionCronService {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;

  // Start the cron service to check expired subscriptions daily at 2 AM
  start() {
    if (this.isRunning) {
      console.log('Subscription cron service is already running');
      return;
    }

    console.log('Starting subscription expiration cron service...');
    this.isRunning = true;

    // Calculate time until next 2 AM
    const now = new Date();
    const nextRun = new Date();
    nextRun.setHours(2, 0, 0, 0);
    
    if (nextRun <= now) {
      nextRun.setDate(nextRun.getDate() + 1);
    }

    const timeUntilNextRun = nextRun.getTime() - now.getTime();
    
    // Schedule first run
    setTimeout(() => {
      this.runExpirationCheck();
      // Then schedule daily runs
      this.intervalId = setInterval(() => {
        this.runExpirationCheck();
      }, 24 * 60 * 60 * 1000); // 24 hours
    }, timeUntilNextRun);

    console.log(`Next subscription expiration check scheduled for: ${nextRun.toISOString()}`);
  }

  // Stop the cron service
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('Subscription cron service stopped');
  }

  // Run the expiration check
  private async runExpirationCheck() {
    try {
      console.log('Running scheduled subscription expiration check...');
      const result = await checkAllExpiredSubscriptions();
      console.log('Scheduled expiration check completed:', result);
    } catch (error) {
      console.error('Error in scheduled expiration check:', error);
    }
  }

  // Manual trigger for testing
  async triggerManualCheck() {
    console.log('Manual subscription expiration check triggered...');
    await this.runExpirationCheck();
  }

  // Get service status
  getStatus() {
    return {
      isRunning: this.isRunning,
      hasInterval: this.intervalId !== null
    };
  }
}

// Create singleton instance
export const subscriptionCronService = new SubscriptionCronService(); 