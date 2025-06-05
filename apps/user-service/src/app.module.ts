import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RedisModule }      from './redis/redis.module';
import { RabbitmqModule }   from './rabbitmq/rabbitmq.module';
import { UserModule }       from './user/user.module';

import { AppController } from './app.controller';
import { AppService }    from './app.service';

import { User } from './user/entities/user.entity';
import { MetricsModule } from './metrics/metrics.module';

@Module({
  imports: [

    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    RedisModule,
    MetricsModule,
    RabbitmqModule,          
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule, MetricsModule],
      inject : [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        type      : 'postgres',
        host      : cfg.get('DB_HOST'),
        port      : cfg.get<number>('DB_PORT'),
        username  : cfg.get('DB_USER'),
        password  : cfg.get('DB_PASS'),
        database  : cfg.get('DB_NAME'),
        entities  : [User],
        synchronize: true,       
      }),
    }),


    UserModule,
  ],
  controllers: [AppController],
  providers  : [AppService],
})
export class AppModule {}
