import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { PassengersService } from './passengers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class PassengersController {
  constructor(private readonly passengersService: PassengersService) {}

  /**
   * GET /users/passengers - لیست همه مسافران (با فیلتر)
   */
  @Get('passengers')
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('userId') userId?: string,
  ) {
    return this.passengersService.findAll({
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      search,
      userId,
    });
  }

  /**
   * GET /users/:id/passengers - مسافران یک کاربر
   */
  @Get(':id/passengers')
  findByUser(@Param('id') id: string) {
    return this.passengersService.findByUser(id);
  }

  /**
   * POST /users/:id/passengers - ایجاد مسافر
   */
  @Post(':id/passengers')
  create(@Param('id') id: string, @Body() data: any) {
    return this.passengersService.create(id, data);
  }

  /**
   * PATCH /users/passengers/:passengerId - بروزرسانی
   */
  @Patch('passengers/:passengerId')
  update(@Param('passengerId') passengerId: string, @Body() data: any) {
    return this.passengersService.update(passengerId, data);
  }

  /**
   * DELETE /users/passengers/:passengerId - حذف
   */
  @Delete('passengers/:passengerId')
  remove(@Param('passengerId') passengerId: string) {
    return this.passengersService.remove(passengerId);
  }
}
