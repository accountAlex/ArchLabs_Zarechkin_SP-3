import { Controller, Get, Header } from '@nestjs/common';
import { MetricsService } from './metrics.service';

@Controller('metrics')
export class MetricsController {
  constructor(private readonly metrics: MetricsService) {}

  @Get()
  @Header('Content-Type', 'text/plain')
  exposition() {
    return this.metrics.metrics();   // отдаём Prometheus-текст
  }
}
