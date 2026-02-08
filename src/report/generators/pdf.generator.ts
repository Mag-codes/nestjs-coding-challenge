import { Injectable } from '@nestjs/common';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Attendance } from '../../attendance/entities/attendance.entity';

@Injectable()
export class PdfGenerator {
  generate(attendances: Attendance[], date: string): Buffer {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`Attendance Report - ${date}`, 14, 22);
    doc.setFontSize(11);

    const rows = attendances.map((a) => {
      const emp = a.employee;
      const name = emp ? `${emp.firstName} ${emp.lastName}` : a.employeeId;
      return [name, emp?.email ?? '-', a.arrivalTime, a.departureTime ?? '-'];
    });

    autoTable(doc, {
      head: [['Employee', 'Email', 'Arrival', 'Departure']],
      body: rows,
      startY: 30,
    });

    return Buffer.from(doc.output('arraybuffer'));
  }
}
