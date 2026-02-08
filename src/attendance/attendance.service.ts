import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { Repository } from 'typeorm';
import { Attendance } from './entities/attendance.entity';
import { Employee } from '../employee/entities/employee.entity';
import {
  RecordAttendanceDto,
  AttendanceType,
} from './dto/record-attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private readonly attendanceRepository: Repository<Attendance>,
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    @InjectQueue('attendance-email') private readonly emailQueue: Queue,
  ) {}

  async record(dto: RecordAttendanceDto) {
    const employee = await this.employeeRepository.findOne({
      where: { id: dto.employeeId },
    });
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    const today = new Date().toISOString().split('T')[0];

    if (dto.type === AttendanceType.ARRIVAL) {
      const existing = await this.attendanceRepository.findOne({
        where: { employeeId: dto.employeeId, date: new Date(today) },
      });
      if (existing) {
        throw new BadRequestException('Arrival already recorded for today');
      }
      const attendance = this.attendanceRepository.create({
        employeeId: dto.employeeId,
        date: new Date(today),
        arrivalTime: new Date().toTimeString().slice(0, 8),
      });
      const saved = await this.attendanceRepository.save(attendance);
      await this.emailQueue.add('notify', {
        employee,
        attendance: saved,
      });
      return saved;
    } else {
      const existing = await this.attendanceRepository.findOne({
        where: { employeeId: dto.employeeId, date: new Date(today) },
        relations: ['employee'],
      });
      if (!existing) {
        throw new BadRequestException('No arrival recorded for today');
      }
      if (existing.departureTime) {
        throw new BadRequestException('Departure already recorded for today');
      }
      existing.departureTime = new Date().toTimeString().slice(0, 8);
      const saved = await this.attendanceRepository.save(existing);
      await this.emailQueue.add('notify', {
        employee: existing.employee ?? employee,
        attendance: saved,
      });
      return saved;
    }
  }

  async findAll(date?: string, employeeId?: string) {
    const qb = this.attendanceRepository
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.employee', 'employee')
      .orderBy('a.date', 'DESC')
      .addOrderBy('a.arrivalTime', 'DESC');

    if (date) {
      qb.andWhere('a.date = :date', { date });
    }
    if (employeeId) {
      qb.andWhere('a.employeeId = :employeeId', { employeeId });
    }

    return qb.getMany();
  }

  async getDailyReport(date: string) {
    return this.attendanceRepository.find({
      where: { date: new Date(date) },
      relations: ['employee'],
      order: { arrivalTime: 'ASC' },
    });
  }
}
