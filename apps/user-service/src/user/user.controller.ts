import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserDTO } from './dto/user.dto';
import { UserCreateDTO } from './dto/user-create.dto';

@Controller('users')
export class UserController {
  constructor(private readonly service: UserService) {}

  @Get(':id')
  getById(@Param('id') id: string): Promise<UserDTO> {
    return this.service.getById(id);
  }

  @Post()
  create(@Body() dto: UserCreateDTO): Promise<UserDTO> {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: Partial<UserCreateDTO>,
  ): Promise<UserDTO> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }
}
