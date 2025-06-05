import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository }   from '@nestjs/typeorm';
import { Repository }         from 'typeorm';

import { User }               from './entities/user.entity';
import { UserCacheService }   from './user-cache.service';
import { UserDTO }            from './dto/user.dto';
import { UserCreateDTO }      from './dto/user-create.dto';

import { RabbitmqService }    from '../rabbitmq/rabbitmq.service';  // ← сервис, а не модуль
import { MetricsService }     from '../metrics/metrics.service';    // ← наш обёрточный сервис над prom-client

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User) private readonly repo : Repository<User>,
    private readonly cache : UserCacheService,
    private readonly mq    : RabbitmqService,
    private readonly metrics: MetricsService,
  ) {}

  /* ======  GET  ====================================================== */
  async getById(id: string): Promise<UserDTO> {
    const timer = this.metrics.userReqDuration
      .labels({ method: 'get' })
      .startTimer();

    this.logger.log(`cache lookup ${id}`);
    const fromCache = await this.cache.get(id);
    if (fromCache) {
      this.logger.log(`cache hit ${id}`);
      timer();                               // остановили таймер
      return fromCache;
    }

    this.logger.log(`cache miss ${id} → DB`);
    const user = await this.repo.findOne({ where: { id } });
    if (!user) {
      timer();
      throw new NotFoundException(`User ${id} not found`);
    }

    const dto = new UserDTO(user);
    await this.cache.set(dto);
    this.logger.log(`cached ${id}`);

    timer();
    return dto;
  }

  async create(dto: UserCreateDTO): Promise<UserDTO> {
    const stop = this.metrics.userReqDuration
      .labels({ method: 'post' })
      .startTimer();

    const entity = this.repo.create(dto);
    const saved  = await this.repo.save(entity);
    const user   = new UserDTO(saved);

    this.logger.log(`created user ${user.id}`);

    /** 1. увеличиваем Counter */
    this.metrics.usersCreated
      .labels({ source: 'api' })
      .inc();

    /** 2. публикуем событие в RabbitMQ */
    this.mq.publishUserCreated({
      id:    user.id,
      name:  user.name,
      email: user.email,
    });

    stop();
    return user;
  }

  async update(id: string, dto: Partial<UserCreateDTO>): Promise<UserDTO> {
    await this.repo.update(id, dto);
    await this.cache.del(id);                    // инвалидация кэша
    this.logger.log(`user ${id} updated → cache evicted`);

    const updated = await this.repo.findOne({ where: { id } });
    if (!updated) throw new NotFoundException(`User ${id} not found`);

    const user = new UserDTO(updated);
    await this.cache.set(user);                  // актуализируем кэш
    return user;
  }

  async remove(id: string): Promise<void> {
    await this.repo.delete(id);
    await this.cache.del(id);
    this.logger.log(`user ${id} removed (DB + cache)`);
  }
}
