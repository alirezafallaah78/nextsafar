import { Controller, Get, Post, Body, Patch, Param, Query, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateAvatarDto } from './dto/update-avatar.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('role') role?: string,
  ) {
    return this.usersService.findAll({
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      search,
      role,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.usersService.update(id, data);
  }

  @Patch(':id/toggle-active')
  toggleActive(@Param('id') id: string) {
    return this.usersService.toggleActive(id);
  }


  /**
   * PATCH /users/me/avatar
   * آپلود/حذف آواتار کاربر فعلی
   */
  @Patch('me/avatar')
  async updateMyAvatar(@Request() req, @Body() dto: UpdateAvatarDto) {
    // گرفتن userId از JWT (ممکن است sub یا userId باشد)
    const userId = req.user?.sub || req.user?.userId;
    
    console.log('📷 Avatar update request:', {
      userId,
      user: req.user,
      hasAvatar: !!dto.avatar,
      avatarLength: dto.avatar?.length || 0,
    });
    
    if (!userId) {
      throw new Error('User ID not found in JWT token');
    }
    
    const result = await this.usersService.updateAvatar(userId, dto.avatar);
    console.log('✅ Avatar updated successfully for user:', userId);
    return result;
  }
}
