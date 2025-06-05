import {
  Global,
  Module,
  Injectable,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';
import { NotificationModule } from '../notification/notification.module';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class RabbitmqService implements OnModuleInit {
  private readonly logger = new Logger(RabbitmqService.name);
  private channel!: amqp.Channel;                // канал будет создан позднее

  constructor(
    private readonly cfg: ConfigService,
    private readonly notifications: NotificationService,
  ) {}

  /** Устанавливаем соединение, объявляем exchange/queue и запускаем consumer */
  async onModuleInit(): Promise<void> {
    const user  = this.cfg.get<string>('RABBITMQ_USER');
    const pass  = this.cfg.get<string>('RABBITMQ_PASS');
    const host  = this.cfg.get<string>('RABBITMQ_HOST');
    const port  = this.cfg.get<number>('RABBITMQ_PORT');
    const queue = this.cfg.get<string>('RABBITMQ_QUEUE');
    const url   = `amqp://${user}:${pass}@${host}:${port}`;

    let conn: amqp.Connection | null = null;

    /* Подключаемся с ретраями, пока RabbitMQ не станет доступным */
    while (!conn) {
      try {
        this.logger.log(`⏳  Подключаюсь к RabbitMQ → ${url}`);
        conn = await amqp.connect(url);
      } catch (err) {
        this.logger.error('❌  RabbitMQ недоступен, новая попытка через 5 с');
        await new Promise(res => setTimeout(res, 5000));
      }
    }

    /* Базовая настройка */
    this.channel = await conn.createChannel();
    await this.channel.assertExchange('user.exchange', 'topic', {
      durable: true,
    });

    await this.channel.assertQueue(queue, { durable: true });
    await this.channel.bindQueue(queue, 'user.exchange', 'user.created');

    /* Консьюмер */
    await this.channel.consume(
      queue,
      msg => {
        if (!msg) return;
        const payload = JSON.parse(msg.content.toString());
        this.logger.log(`🔔  Получено событие user.created: ${JSON.stringify(payload)}`);
        this.notifications.handleUserCreated(payload);
        this.channel.ack(msg);
      },
      { noAck: false },
    );

    this.logger.log(`✅  Consumer запущен, очередь «${queue}»`);
  }

 
  publishUserCreated(payload: unknown): void {
    const buf = Buffer.from(JSON.stringify(payload));
    this.channel.publish('user.exchange', 'user.created', buf, {
      persistent: true,
    });
    this.logger.log(`📤  Отправлено событие user.created: ${JSON.stringify(payload)}`);
  }
}

@Global()
@Module({
  imports: [
    ConfigModule,    
    NotificationModule, 
  ],
  providers: [RabbitmqService],
  exports:   [RabbitmqService],
})
export class RabbitmqModule {}
