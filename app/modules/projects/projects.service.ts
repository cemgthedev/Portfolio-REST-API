import { Project } from '@/entities/project';
import { CreateProjectDto } from '@/modules/projects/dtos/create-project.dto';
import { QueryProjectDto } from '@/modules/projects/dtos/query-project.dto';
import { UpdateProjectDto } from '@/modules/projects/dtos/update-project.dto';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectsRepository: Repository<Project>,
  ) {}

  async create(project: CreateProjectDto) {
    const existProject = await this.projectsRepository.findOne({
      where: { title: project.title },
    });

    if (existProject) {
      throw new ConflictException(`O projeto já foi cadastrado`);
    }

    const newProject = this.projectsRepository.create(project);

    const response = await this.projectsRepository.save(newProject);

    return response;
  }

  async query(query: QueryProjectDto): Promise<Project[] | null> {
    const { title, platformType, projectStatus, status } = query;
    const queryBuilder = this.projectsRepository.createQueryBuilder('project');

    if (title) {
      queryBuilder.andWhere('project.title ILIKE :title', {
        title: `%${title}%`,
      });
    }

    if (platformType) {
      queryBuilder.andWhere('project.platformType = :platformType', {
        platformType,
      });
    }

    if (projectStatus) {
      queryBuilder.andWhere('project.projectStatus = :projectStatus', {
        projectStatus,
      });
    }

    if (status) {
      queryBuilder.andWhere('project.status = :status', {
        status,
      });
    }

    const response = await queryBuilder.getMany();

    return response;
  }

  async findOne(id: number): Promise<Project | null> {
    const response = await this.projectsRepository.findOne({ where: { id } });

    if (!response) {
      throw new NotFoundException(`O projeto não foi encontrado`);
    }

    return response;
  }

  async update(id: number, project: UpdateProjectDto) {
    const existProject = await this.findOne(id);

    if (!existProject) return;

    Object.assign(existProject, project);

    const response = await this.projectsRepository.save(existProject);

    return response;
  }

  async delete(id: number): Promise<void> {
    const existProject = await this.findOne(id);

    if (!existProject) return;

    const response = await this.projectsRepository.delete(id);

    if (!response.affected) {
      throw new ConflictException(`Falha ao remover produto`);
    }

    return;
  }
}
