import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

export interface AttendanceEmailPayload {
  employeeEmail: string;
  employeeName: string;
  date: string;
  arrivalTime: string;
  departureTime: string | null;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Validates URL is http(s) for safe use in email HTML. Returns the URL if safe. */
function validateResetLink(url: string): string {
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error('Invalid protocol');
    }
    return parsed.toString();
  } catch {
    throw new Error('Invalid reset link URL');
  }
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly mailerService: MailerService) {}

  async sendPasswordReset(email: string, resetLink: string): Promise<void> {
    const safeUrl = validateResetLink(resetLink);
    const safeDisplayText = escapeHtml(safeUrl);
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Password Reset',
        html: `<p>Click the link to reset your password: <a href="${safeUrl}">${safeDisplayText}</a></p><p>This link expires in 1 hour.</p>`,
      });
    } catch (error) {
      this.logger.error(
        `Failed to send password reset email to ${email}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  async sendAttendanceNotification(
    payload: AttendanceEmailPayload,
  ): Promise<void> {
    const safeName = escapeHtml(payload.employeeName);
    const departureText = payload.departureTime
      ? `Departure: ${payload.departureTime}`
      : 'Departure: Not yet recorded';
    try {
      await this.mailerService.sendMail({
        to: payload.employeeEmail,
        subject: 'Attendance Record',
        html: `<p>Hello ${safeName},</p><p>Your attendance has been recorded:</p><p>Date: ${payload.date}</p><p>Arrival: ${payload.arrivalTime}</p><p>${departureText}</p>`,
      });
    } catch (error) {
      this.logger.error(
        `Failed to send attendance notification to ${payload.employeeEmail}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }
}
