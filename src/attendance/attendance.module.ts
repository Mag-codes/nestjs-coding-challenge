import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { Attendance } from './entities/attendance.entity';
import { Employee } from '../employee/entities/employee.entity';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { AttendanceEmailProcessor } from './processors/attendance-email.processor';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Attendance, Employee]),
    BullModule.registerQueue({ name: 'attendance-email' }),
    MailModule,
  ],
  controllers: [AttendanceController],
  providers: [AttendanceService, AttendanceEmailProcessor],
  exports: [AttendanceService],
})
export class AttendanceModule {}
