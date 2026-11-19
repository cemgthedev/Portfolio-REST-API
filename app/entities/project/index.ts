import { STATUS } from '@/common/enums/status.enum';
import { PROJECT_STATUS } from '@/entities/project/enums/project-status.enum';
import { PLATFORM_TYPE } from '@/entities/project/enums/type.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('project')
export class Project {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 100 })
  title!: string;

  @Column({ type: 'varchar', length: 2000 })
  description!: string;

  @Column({ type: 'enum', enum: PLATFORM_TYPE })
  platformType!: PLATFORM_TYPE;

  @Column({ type: 'enum', enum: PROJECT_STATUS })
  projectStatus!: PROJECT_STATUS;

  @Column({ type: 'enum', enum: STATUS, default: STATUS.ACTIVE })
  status!: STATUS;

  @CreateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt!: Date;
}
