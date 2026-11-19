import { Project } from '@/entities/project';
import { ProjectsController } from '@/modules/projects/project.controller';
import { ProjectsService } from '@/modules/projects/projects.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Project])],
  controllers: [ProjectsController],
  providers: [ProjectsService],
})
export class ProjectsModule {}
