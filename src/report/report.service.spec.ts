import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ReportService } from './report.service';
import { AttendanceService } from '../attendance/attendance.service';
import { PdfGenerator } from './generators/pdf.generator';
import { ExcelGenerator } from './generators/excel.generator';

describe('ReportService', () => {
  let service: ReportService;

  const mockAttendanceService = {
    getDailyReport: jest.fn(),
  };

  const mockPdfGenerator = {
    generate: jest.fn().mockReturnValue(Buffer.from('pdf')),
  };

  const mockExcelGenerator = {
    generate: jest.fn().mockResolvedValue(Buffer.from('excel')),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportService,
        { provide: AttendanceService, useValue: mockAttendanceService },
        { provide: PdfGenerator, useValue: mockPdfGenerator },
        { provide: ExcelGenerator, useValue: mockExcelGenerator },
      ],
    }).compile();

    service = module.get<ReportService>(ReportService);
    jest.clearAllMocks();
    mockAttendanceService.getDailyReport.mockResolvedValue([]);
  });

  it('getPdf returns buffer', async () => {
    const result = await service.getPdf('2025-02-08');
    expect(result).toBeInstanceOf(Buffer);
    expect(mockPdfGenerator.generate).toHaveBeenCalled();
  });

  it('getPdf throws for invalid date', async () => {
    await expect(service.getPdf('invalid')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('getExcel returns buffer', async () => {
    const result = await service.getExcel('2025-02-08');
    expect(result).toBeInstanceOf(Buffer);
    expect(mockExcelGenerator.generate).toHaveBeenCalled();
  });
});
