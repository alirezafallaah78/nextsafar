import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminToursService } from './services/admin-tours.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CreateAdminTourDto,
  UpdateAdminTourDto,
  AdminTourQueryDto,
  ChangeTourStatusDto,
  AdminTourStatus,
} from './dto/admin-tour.dto';

@Controller('admin/tours')
@UseGuards(JwtAuthGuard)
export class AdminToursController {
  constructor(private readonly adminToursService: AdminToursService) {}

  @Get()
  findAll(@Query() query: AdminTourQueryDto) {
    return this.adminToursService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.adminToursService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateAdminTourDto) {
    return this.adminToursService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAdminTourDto) {
    return this.adminToursService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.adminToursService.remove(id);
  }

  @Patch(':id/status')
  changeStatus(@Param('id') id: string, @Body() body: ChangeTourStatusDto) {
    return this.adminToursService.changeStatus(id, body.status);
  }
}
