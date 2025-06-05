// apps/user-service/src/user/user.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from './entities/user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserCacheService } from './user-cache.service';

import { RabbitmqModule } from '../rabbitmq/rabbitmq.module';  
import { RabbitmqService } from '../rabbitmq/rabbitmq.service';
import { MetricsModule } from 'src/metrics/metrics.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    MetricsModule,
    RabbitmqModule,            
  ],
  providers: [UserService, UserCacheService],
  controllers: [UserController],
  exports:   [UserService],           
})
export class UserModule {}
