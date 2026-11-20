jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import { STATUS } from '@/common/enums/status.enum';
import { Project } from '@/entities/project';
import { PROJECT_STATUS } from '@/entities/project/enums/project-status.enum';
import { PLATFORM_TYPE } from '@/entities/project/enums/type.enum';
import { CreateProjectDto } from '@/modules/projects/dtos/create-project.dto';
import { QueryProjectDto } from '@/modules/projects/dtos/query-project.dto';
import { ProjectsController } from '@/modules/projects/project.controller';
import { ProjectsService } from '@/modules/projects/projects.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';

type ProjectsServiceMock = jest.Mocked<
  Pick<ProjectsService, 'create' | 'query' | 'findOne' | 'update' | 'delete'>
>;

describe('ProjectsController', () => {
  let controller: ProjectsController;
  let projectsService: ProjectsServiceMock;

  const projectDto: CreateProjectDto = {
    title: 'Portfolio',
    description: 'Portfolio REST API',
    platformType: PLATFORM_TYPE.WEB,
    projectStatus: PROJECT_STATUS.IN_PROGRESS,
    status: STATUS.ACTIVE,
  };

  const project: Project = {
    id: 1,
    ...projectDto,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  };

  beforeEach(async () => {
    projectsService = {
      create: jest.fn(),
      query: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      controllers: [ProjectsController],
      providers: [{ provide: ProjectsService, useValue: projectsService }],
    }).compile();

    controller = moduleRef.get(ProjectsController);
  });

  describe('create', () => {
    it('should pass the project data to the service and return the created project', async () => {
      projectsService.create.mockResolvedValue(project);

      await expect(controller.create(projectDto)).resolves.toEqual(project);
      expect(projectsService.create).toHaveBeenCalledWith(projectDto);
    });

    it('should propagate a conflict when the project already exists', async () => {
      const error = new ConflictException('O projeto já foi cadastrado');
      projectsService.create.mockRejectedValue(error);

      await expect(controller.create(projectDto)).rejects.toBe(error);
    });
  });

  describe('query', () => {
    it('should pass the filters to the service and return matching projects', async () => {
      const filters: QueryProjectDto = {
        title: 'Port',
        platformType: PLATFORM_TYPE.WEB,
        projectStatus: PROJECT_STATUS.IN_PROGRESS,
        status: STATUS.ACTIVE,
      };
      projectsService.query.mockResolvedValue([project]);

      await expect(controller.query(filters)).resolves.toEqual([project]);
      expect(projectsService.query).toHaveBeenCalledWith(filters);
    });

    it('should propagate errors from the service', async () => {
      const error = new Error('Falha ao consultar projetos');
      projectsService.query.mockRejectedValue(error);

      await expect(controller.query({})).rejects.toBe(error);
    });
  });

  describe('findOne', () => {
    it('should pass the project id to the service and return the project', async () => {
      projectsService.findOne.mockResolvedValue(project);

      await expect(controller.findOne(project.id)).resolves.toEqual(project);
      expect(projectsService.findOne).toHaveBeenCalledWith(project.id);
    });

    it('should propagate not found when the project does not exist', async () => {
      const error = new NotFoundException('O projeto não foi encontrado');
      projectsService.findOne.mockRejectedValue(error);

      await expect(controller.findOne(99)).rejects.toBe(error);
    });
  });

  describe('update', () => {
    it('should pass the project id and data to the service and return the updated project', async () => {
      const updatedProject = { ...project, title: 'Portfolio v2' };
      projectsService.update.mockResolvedValue(updatedProject);

      await expect(
        controller.update(project.id, { ...projectDto, title: 'Portfolio v2' }),
      ).resolves.toEqual(updatedProject);
      expect(projectsService.update).toHaveBeenCalledWith(project.id, {
        ...projectDto,
        title: 'Portfolio v2',
      });
    });

    it('should propagate not found when the project does not exist', async () => {
      const error = new NotFoundException('O projeto não foi encontrado');
      projectsService.update.mockRejectedValue(error);

      await expect(controller.update(99, projectDto)).rejects.toBe(error);
    });
  });

  describe('delete', () => {
    it('should pass the project id to the service', async () => {
      projectsService.delete.mockResolvedValue(undefined);

      await expect(controller.delete(project.id)).resolves.toBeUndefined();
      expect(projectsService.delete).toHaveBeenCalledWith(project.id);
    });

    it('should propagate not found when the project does not exist', async () => {
      const error = new NotFoundException('O projeto não foi encontrado');
      projectsService.delete.mockRejectedValue(error);

      await expect(controller.delete(99)).rejects.toBe(error);
    });

    it('should propagate a conflict when the project cannot be deleted', async () => {
      const error = new ConflictException('Falha ao remover produto');
      projectsService.delete.mockRejectedValue(error);

      await expect(controller.delete(project.id)).rejects.toBe(error);
    });
  });
});
