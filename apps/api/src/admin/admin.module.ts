import { Module } from '@nestjs/common';
import { AdminToursController } from './admin-tours.controller';
import { AdminToursService } from './services/admin-tours.service';
import { AdminController } from './admin.controller';
import { AdminService } from './services/admin.service';
import { ReportsService } from '../reports/services/reports.service';
import { QueueModule } from '../queue/queue.module';

@Module({
  imports: [QueueModule],
  controllers: [AdminToursController, AdminController],
  providers: [AdminToursService, AdminService, ReportsService],
})
export class AdminModule {}
