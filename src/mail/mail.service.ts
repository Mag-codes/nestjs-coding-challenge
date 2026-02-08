import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

export interface AttendanceEmailPayload {
  employeeEmail: string;
  employeeName: string;
  date: string;
  arrivalTime: string;
  departureTime: string | null;
}

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendPasswordReset(email: string, resetLink: string): Promise<void> {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Password Reset',
      html: `<p>Click the link to reset your password: <a href="${resetLink}">${resetLink}</a></p><p>This link expires in 1 hour.</p>`,
    });
  }

  async sendAttendanceNotification(
    payload: AttendanceEmailPayload,
  ): Promise<void> {
    const departureText = payload.departureTime
      ? `Departure: ${payload.departureTime}`
      : 'Departure: Not yet recorded';
    await this.mailerService.sendMail({
      to: payload.employeeEmail,
      subject: 'Attendance Record',
      html: `<p>Hello ${payload.employeeName},</p><p>Your attendance has been recorded:</p><p>Date: ${payload.date}</p><p>Arrival: ${payload.arrivalTime}</p><p>${departureText}</p>`,
    });
  }
}
