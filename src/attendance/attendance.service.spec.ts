import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { getQueueToken } from '@nestjs/bull';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { Attendance } from './entities/attendance.entity';
import { Employee } from '../employee/entities/employee.entity';
import { AttendanceType } from './dto/record-attendance.dto';

describe('AttendanceService', () => {
  let service: AttendanceService;
  const mockAttendanceRepo = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(),
  };
  const mockEmployeeRepo = {
    findOne: jest.fn(),
  };
  const mockQueue = { add: jest.fn() };

  const mockEmployee = {
    id: 'emp-1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
  };

  beforeEach(async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-02-08T09:00:00Z'));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttendanceService,
        {
          provide: getRepositoryToken(Attendance),
          useValue: mockAttendanceRepo,
        },
        { provide: getRepositoryToken(Employee), useValue: mockEmployeeRepo },
        { provide: getQueueToken('attendance-email'), useValue: mockQueue },
      ],
    }).compile();

    service = module.get<AttendanceService>(AttendanceService);
    jest.clearAllMocks();
    mockEmployeeRepo.findOne.mockResolvedValue(mockEmployee);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('records arrival', async () => {
    mockAttendanceRepo.findOne.mockResolvedValue(null);
    const created = {
      id: '1',
      employeeId: 'emp-1',
      date: new Date('2025-02-08'),
      arrivalTime: '09:00:00',
      departureTime: null,
    };
    mockAttendanceRepo.create.mockReturnValue(created);
    mockAttendanceRepo.save.mockResolvedValue(created);

    const result = await service.record({
      type: AttendanceType.ARRIVAL,
      employeeId: 'emp-1',
    });

    expect(result.arrivalTime).toBeDefined();
    expect(mockQueue.add).toHaveBeenCalled();
  });

  it('throws NotFoundException when employee not found', async () => {
    mockEmployeeRepo.findOne.mockResolvedValue(null);

    await expect(
      service.record({ type: AttendanceType.ARRIVAL, employeeId: 'invalid' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('throws BadRequestException when arrival already recorded', async () => {
    mockAttendanceRepo.findOne.mockResolvedValue({ id: '1' });

    await expect(
      service.record({ type: AttendanceType.ARRIVAL, employeeId: 'emp-1' }),
    ).rejects.toThrow(BadRequestException);
  });
});
