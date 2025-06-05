// apps/notification-service/src/notification/notification.service.ts
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  /**
   * Метод вызывается RabbitmqService-ом, когда приходит событие user.created
   */
  handleUserCreated(event: { id: string; name: string; email: string }) {
    // пока просто логируем – здесь могла бы быть отправка e-mail / push и т.д.
    this.logger.log(
      `✅ Отправляем уведомление для нового пользователя: ${JSON.stringify(
        event,
      )}`,
    );
  }
}
