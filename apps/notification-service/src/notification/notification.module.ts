import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';

@Module({
  providers: [NotificationService],
  exports:   [NotificationService],   //  ← обязательно экспортируем!
})
export class NotificationModule {}
