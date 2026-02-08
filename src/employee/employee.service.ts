import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Employee } from './entities/employee.entity';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
  ) {}

  async create(dto: CreateEmployeeDto) {
    const existing = await this.employeeRepository.findOne({
      where: [
        { email: dto.email },
        { employeeIdentifier: dto.employeeIdentifier },
      ],
    });
    if (existing) {
      throw new ConflictException(
        'Employee with this email or identifier already exists',
      );
    }
    const employee = this.employeeRepository.create(dto);
    return this.employeeRepository.save(employee);
  }

  async findAll(page = 1, limit = 10) {
    const [data, total] = await this.employeeRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return { data, total, page, limit };
  }

  async findOne(id: string) {
    const employee = await this.employeeRepository.findOne({ where: { id } });
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }
    return employee;
  }

  async update(id: string, dto: UpdateEmployeeDto) {
    await this.findOne(id);
    if (dto.email || dto.employeeIdentifier) {
      if (dto.email) {
        const existingByEmail = await this.employeeRepository.findOne({
          where: { email: dto.email, id: Not(id) },
        });
        if (existingByEmail) {
          throw new ConflictException(
            'Employee with this email or identifier already exists',
          );
        }
      }
      if (dto.employeeIdentifier) {
        const existingByIdentifier = await this.employeeRepository.findOne({
          where: {
            employeeIdentifier: dto.employeeIdentifier,
            id: Not(id),
          },
        });
        if (existingByIdentifier) {
          throw new ConflictException(
            'Employee with this email or identifier already exists',
          );
        }
      }
    }
    await this.employeeRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.employeeRepository.delete(id);
    return { message: 'Employee deleted successfully' };
  }
}
