import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('employees')
@Controller('employees')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post()
  @ApiResponse({ status: 201, description: 'Employee created' })
  create(@Body() dto: CreateEmployeeDto) {
    return this.employeeService.create(dto);
  }

  @Get()
  @ApiResponse({ status: 200, description: 'List of employees' })
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    const safePage = Number.isNaN(pageNum) || pageNum < 1 ? 1 : pageNum;
    const safeLimit =
      Number.isNaN(limitNum) || limitNum < 1 ? 10 : Math.min(limitNum, 100);
    return this.employeeService.findAll(safePage, safeLimit);
  }

  @Get(':id')
  @ApiResponse({ status: 200, description: 'Employee found' })
  findOne(@Param('id') id: string) {
    return this.employeeService.findOne(id);
  }

  @Patch(':id')
  @ApiResponse({ status: 200, description: 'Employee updated' })
  update(@Param('id') id: string, @Body() dto: UpdateEmployeeDto) {
    return this.employeeService.update(id, dto);
  }

  @Delete(':id')
  @ApiResponse({ status: 200, description: 'Employee deleted' })
  remove(@Param('id') id: string) {
    return this.employeeService.remove(id);
  }
}
