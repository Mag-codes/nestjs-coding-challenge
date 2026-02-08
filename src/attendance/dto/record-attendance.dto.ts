import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsUUID } from 'class-validator';

export enum AttendanceType {
  ARRIVAL = 'arrival',
  DEPARTURE = 'departure',
}

export class RecordAttendanceDto {
  @ApiProperty({ enum: AttendanceType })
  @IsEnum(AttendanceType)
  type: AttendanceType;

  @ApiProperty()
  @IsUUID()
  employeeId: string;
}
