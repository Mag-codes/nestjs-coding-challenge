import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Employee } from '../../employee/entities/employee.entity';

@Entity('attendances')
@Unique(['employeeId', 'date'])
export class Attendance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  employeeId: string;

  @ManyToOne(() => Employee, (employee) => employee.attendances, {
    onDelete: 'CASCADE',
  })
  employee: Employee;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'time' })
  arrivalTime: string;

  @Column({ type: 'time', nullable: true })
  departureTime: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
