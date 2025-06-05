// apps/user-service/src/rabbitmq/rabbitmq.service.ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService }                    from '@nestjs/config';
import * as amqp                            from 'amqplib';

@Injectable()
export class RabbitmqService implements OnModuleInit {
  private readonly logger = new Logger(RabbitmqService.name);
  private channel!: amqp.Channel;

  constructor(private readonly cfg: ConfigService) {}

  async onModuleInit() {
    const user     = this.cfg.get<string>('RABBITMQ_USER');
    const pass     = this.cfg.get<string>('RABBITMQ_PASS');
    const host     = this.cfg.get<string>('RABBITMQ_HOST');
    const port     = this.cfg.get<number>('RABBITMQ_PORT');
    const exchange = this.cfg.get<string>('RABBITMQ_EXCHANGE', 'user.exchange');
    const url      = `amqp://${user}:${pass}@${host}:${port}`;

    let conn: amqp.Connection | null = null;
    while (!conn) {
      try {
        this.logger.log(`⏳ Connecting to RabbitMQ at ${url}…`);
        conn = await amqp.connect(url);
      } catch {
        this.logger.warn(`RabbitMQ unavailable, retry in 5s…`);
        await new Promise(r => setTimeout(r, 5000));
      }
    }

    this.channel = await conn.createChannel();
    await this.channel.assertExchange(exchange, 'topic', { durable: true });
    this.logger.log(`✅ RabbitMQ exchange "${exchange}" ready`);
  }

  publishUserCreated(payload: any) {
    const exchange   = this.cfg.get<string>('RABBITMQ_EXCHANGE', 'user.exchange');
    const routingKey = 'user.created';
    const buf        = Buffer.from(JSON.stringify(payload));
    this.channel.publish(exchange, routingKey, buf, { persistent: true });
    this.logger.log(`📤 Published to ${exchange}/${routingKey}: ${JSON.stringify(payload)}`);
  }
}
