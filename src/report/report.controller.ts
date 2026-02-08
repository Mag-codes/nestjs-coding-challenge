import {
  Controller,
  Get,
  Headers,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { ReportService } from './report.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('reports')
@Controller('reports/attendance')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get('pdf')
  @ApiResponse({ status: 200, description: 'PDF file' })
  async getPdf(@Query('date') date: string, @Res() res: Response) {
    const today = new Date().toISOString().split('T')[0];
    const dateParam = date || today;
    const buffer = await this.reportService.getPdf(dateParam);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="attendance-${dateParam}.pdf"`,
    });
    res.send(buffer);
  }

  @Get('excel')
  @ApiResponse({ status: 200, description: 'Excel file' })
  async getExcel(@Query('date') date: string, @Res() res: Response) {
    const today = new Date().toISOString().split('T')[0];
    const dateParam = date || today;
    const buffer = await this.reportService.getExcel(dateParam);
    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="attendance-${dateParam}.xlsx"`,
    });
    res.send(buffer);
  }
}
