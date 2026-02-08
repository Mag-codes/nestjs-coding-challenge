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
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      throw new BadRequestException('Invalid date format. Use YYYY-MM-DD');
    }
    return date.toISOString().split('T')[0];
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
