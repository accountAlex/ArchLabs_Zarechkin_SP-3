import { Injectable } from '@nestjs/common';
import * as client from 'prom-client';

@Injectable()
export class MetricsService {
  // Регистр, общий для всего приложения
  private readonly register = new client.Registry();

  // ----- Counter -----
  public readonly usersCreated = new client.Counter({
    name: 'users_created_total',
    help: 'Сколько пользователей создано',
    labelNames: ['source'] as const,
    registers: [this.register],
  });

  // ----- Summary -----
  public readonly userReqDuration = new client.Summary({
    name: 'api_user_request_duration_seconds',
    help: 'Длительность обработки запросов пользователей',
    labelNames: ['method'] as const,
    percentiles: [0.5, 0.9, 0.95],
    registers: [this.register],
  });

  /** даём контроллеру полный набор метрик */
  metrics() {
    return this.register.metrics();
  }
}
