import { BadRequestException, Injectable } from '@nestjs/common';
import { AttendanceService } from '../attendance/attendance.service';
import { PdfGenerator } from './generators/pdf.generator';
import { ExcelGenerator } from './generators/excel.generator';

@Injectable()
export class ReportService {
  constructor(
    private readonly attendanceService: AttendanceService,
    private readonly pdfGenerator: PdfGenerator,
    private readonly excelGenerator: ExcelGenerator,
  ) {}

  private validateDate(dateStr: string): string {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateStr)) {
      throw new BadRequestException('Invalid date format. Use YYYY-MM-DD');
    }
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      throw new BadRequestException('Invalid date format. Use YYYY-MM-DD');
    }
    return dateStr;
  }

  async getPdf(date: string) {
    const validDate = this.validateDate(date);
    const attendances = await this.attendanceService.getDailyReport(validDate);
    return this.pdfGenerator.generate(attendances, validDate);
  }

  async getExcel(date: string) {
    const validDate = this.validateDate(date);
    const attendances = await this.attendanceService.getDailyReport(validDate);
    return this.excelGenerator.generate(attendances, validDate);
  }
}
