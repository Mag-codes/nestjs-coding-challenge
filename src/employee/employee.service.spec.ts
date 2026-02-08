import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { Employee } from './entities/employee.entity';

describe('EmployeeService', () => {
  let service: EmployeeService;
  const mockRepo = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockEmployee = {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    employeeIdentifier: 'EMP-001',
    phoneNumber: '+123',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeeService,
        {
          provide: getRepositoryToken(Employee),
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<EmployeeService>(EmployeeService);
    jest.clearAllMocks();
  });

  it('creates employee', async () => {
    mockRepo.findOne.mockResolvedValue(null);
    mockRepo.create.mockReturnValue(mockEmployee);
    mockRepo.save.mockResolvedValue(mockEmployee);

    const result = await service.create({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      employeeIdentifier: 'EMP-001',
      phoneNumber: '+123',
    });

    expect(result).toEqual(mockEmployee);
  });

  it('throws ConflictException when email exists', async () => {
    mockRepo.findOne.mockResolvedValue(mockEmployee);

    await expect(
      service.create({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        employeeIdentifier: 'EMP-002',
        phoneNumber: '+123',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('findOne throws NotFoundException when not found', async () => {
    mockRepo.findOne.mockResolvedValue(null);

    await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
  });

  it('findAll returns paginated list', async () => {
    mockRepo.findAndCount.mockResolvedValue([[mockEmployee], 1]);

    const result = await service.findAll(1, 10);

    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
  });
});
