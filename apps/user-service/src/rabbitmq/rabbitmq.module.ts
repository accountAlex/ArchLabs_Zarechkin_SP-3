// apps/user-service/src/rabbitmq/rabbitmq.module.ts
import { Global, Module } from '@nestjs/common';
import { ConfigModule }   from '@nestjs/config';
import { RabbitmqService } from './rabbitmq.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [RabbitmqService],
  exports: [RabbitmqService],
})
export class RabbitmqModule {}
