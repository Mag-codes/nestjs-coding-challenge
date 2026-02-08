import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { Attendance } from '../../attendance/entities/attendance.entity';

@Injectable()
export class ExcelGenerator {
  async generate(attendances: Attendance[], date: string): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(`Attendance ${date}`);

    sheet.columns = [
      { header: 'Employee', key: 'name', width: 25 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Arrival', key: 'arrival', width: 12 },
      { header: 'Departure', key: 'departure', width: 12 },
    ];

    sheet.getRow(1).font = { bold: true };

    for (const a of attendances) {
      const emp = a.employee;
      sheet.addRow({
        name: emp ? `${emp.firstName} ${emp.lastName}` : a.employeeId,
        email: emp?.email ?? '-',
        arrival: a.arrivalTime,
        departure: a.departureTime ?? '-',
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
