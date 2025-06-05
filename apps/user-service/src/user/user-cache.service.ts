import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';
import { UserDTO } from './dto/user.dto';

@Injectable()
export class UserCacheService {
  private readonly prefix = 'user:v1:';
  private readonly ttl: number;

  constructor(
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    cfg: ConfigService,
  ) {
    this.ttl = cfg.get<number>('CACHE_TTL', 60);
  }

  async get(id: string): Promise<UserDTO | null> {
    const json = await this.redis.get(this.prefix + id);
    return json ? JSON.parse(json) : null;
  }

  async set(user: UserDTO): Promise<void> {
    await this.redis.set(
      this.prefix + user.id,
      JSON.stringify(user),
      'EX',
      this.ttl,
    );
  }

  async del(id: string): Promise<void> {
    await this.redis.del(this.prefix + id);
  }
}
