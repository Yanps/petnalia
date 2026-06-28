import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

export const QUEUE_EMAIL = 'email' as const;
export const QUEUE_REMINDERS = 'reminders' as const;
export const QUEUE_SUBSCRIPTION = 'subscription' as const;
export const QUEUE_CRMV_VERIFICATION = 'crmv-verification' as const;

@Global()
@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: 'localhost',
        port: 6379,
      },
    }),
    BullModule.registerQueue(
      { name: QUEUE_EMAIL },
      { name: QUEUE_REMINDERS },
      { name: QUEUE_SUBSCRIPTION },
      { name: QUEUE_CRMV_VERIFICATION },
    ),
  ],
  exports: [BullModule],
})
export class QueueModule {}
