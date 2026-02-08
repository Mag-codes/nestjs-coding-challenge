import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { RecordAttendanceDto } from './dto/record-attendance.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('attendance')
@Controller('attendance')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  @ApiResponse({ status: 201, description: 'Attendance recorded' })
  record(@Body() dto: RecordAttendanceDto) {
    return this.attendanceService.record(dto);
  }

  @Get()
  @ApiResponse({ status: 200, description: 'List of attendance records' })
  findAll(
    @Query('date') date?: string,
    @Query('employeeId') employeeId?: string,
  ) {
    return this.attendanceService.findAll(date, employeeId);
  }
}
