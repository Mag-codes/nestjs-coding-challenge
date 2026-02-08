import { Processor, Process } from '@nestjs/bull';
import type { Job } from 'bull';
import { MailService } from '../../mail/mail.service';
import { Employee } from '../../employee/entities/employee.entity';
import { Attendance } from '../entities/attendance.entity';

@Processor('attendance-email')
export class AttendanceEmailProcessor {
  constructor(private readonly mailService: MailService) {}

  @Process('notify')
  async handleNotify(job: Job<{ employee: Employee; attendance: Attendance }>) {
    const { employee, attendance } = job.data;
    const dateStr =
      typeof attendance.date === 'string'
        ? attendance.date
        : attendance.date.toISOString().split('T')[0];
    await this.mailService.sendAttendanceNotification({
      employeeEmail: employee.email,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      date: dateStr,
      arrivalTime: attendance.arrivalTime,
      departureTime: attendance.departureTime ?? null,
    });
  }
}
