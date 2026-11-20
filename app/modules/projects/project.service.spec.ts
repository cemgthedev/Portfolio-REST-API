jest.mock('@nestjs/typeorm', () => ({
  // O decorador InjectRepository não precisa interagir com o TypeORM neste unit test.
  InjectRepository: () => () => undefined,
}));

import { STATUS } from '@/common/enums/status.enum';
import { Project } from '@/entities/project';
import { PROJECT_STATUS } from '@/entities/project/enums/project-status.enum';
import { PLATFORM_TYPE } from '@/entities/project/enums/type.enum';
import { CreateProjectDto } from '@/modules/projects/dtos/create-project.dto';
import { QueryProjectDto } from '@/modules/projects/dtos/query-project.dto';
import { UpdateProjectDto } from '@/modules/projects/dtos/update-project.dto';
import { ProjectsService } from '@/modules/projects/projects.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Repository, DeleteResult, SelectQueryBuilder } from 'typeorm';

type ProjectsRepositoryMock = Pick<
  jest.Mocked<Repository<Project>>,
  | 'findOne'
  | 'create'
  | 'save'
  | 'delete'
  | 'createQueryBuilder'
>;

describe('ProjectsService', () => {
  // Mantém a instância real do serviço que será testada em cada caso.
  let service: ProjectsService;

  // Substitui o repositório real por um objeto mockado.
  // Use jest.Mocked<T> para que o TypeScript reconheça os métodos jest.fn().
  let repository: jest.Mocked<Repository<Project>>;

  // Representa o QueryBuilder usado para montar consultas com filtros.
  let queryBuilder: jest.Mocked<SelectQueryBuilder<Project>>;

  // Dados de entrada válidos reutilizados pelos testes de criação e entidade.
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

  // beforeEach roda antes de cada it().
  // É útil para recriar mocks vazios e impedir que dados de um teste afetem os próximos.
  beforeEach(() => {
    queryBuilder = {
      // Retorna o próprio QueryBuilder para permitir encadeamento como andWhere().andWhere().
      andWhere: jest.fn().mockReturnThis(),
      // Simula o resultado final da consulta executada pelo banco.
      getMany: jest.fn(),
    } as unknown as jest.Mocked<SelectQueryBuilder<Project>>;

    repository = {
      // jest.fn() cria um método falso que permite definir retornos e verificar chamadas.
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      // createQueryBuilder deve retornar o mock do QueryBuilder configurado acima.
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
    } as unknown as jest.Mocked<Repository<Project>>;

    // Instancia o serviço passando o repositório mockado em vez de uma conexão real.
    service = new ProjectsService(repository);
  });

  describe('create', () => {
    it('should create a project', async () => {
      // mockResolvedValue define o resultado assíncrono de findOne().
      // null informa ao serviço que não existe um projeto com o título pesquisado.
      repository.findOne.mockResolvedValue(null);
      // Simula a criação da entidade a partir do DTO.
      repository.create.mockReturnValue(project);
      // mockResolvedValue simula uma resposta bem-sucedida do método save().
      repository.save.mockResolvedValue(project);

      // resolves verifica que a Promise foi concluída sem erro e contém o valor esperado.
      await expect(service.create(projectDto)).resolves.toEqual(project);
      // toHaveBeenCalledWith confirma quais argumentos foram enviados ao repositório.
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { title: projectDto.title },
      });
      expect(repository.create).toHaveBeenCalledWith(projectDto);
      expect(repository.save).toHaveBeenCalledWith(project);
    });

    it('should throw an exception when exists a project with same title', async () => {
      // Retorna uma entidade existente para que o serviço detecte o conflito.
      repository.findOne.mockResolvedValue(project);

      // rejects verifica que a Promise lançou uma exceção.
      // toThrow compara o tipo e a mensagem da exceção recebida.
      await expect(service.create(projectDto)).rejects.toThrow(
        new ConflictException('O projeto já foi cadastrado'),
      );
      // not + toHaveBeenCalled confirma que não houve operações posteriores indevidas.
      expect(repository.create).not.toHaveBeenCalled();
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('query', () => {
    it('should filter projects', async () => {
      const filters: QueryProjectDto = {
        title: 'Port',
        platformType: PLATFORM_TYPE.WEB,
        projectStatus: PROJECT_STATUS.IN_PROGRESS,
        status: STATUS.ACTIVE,
      };
      // Simula a lista retornada por getMany() após todos os filtros serem aplicados.
      queryBuilder.getMany.mockResolvedValue([project]);

      await expect(service.query(filters)).resolves.toEqual([project]);

      // Cada toHaveBeenCalledWith verifica uma condição SQL e seus parâmetros.
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'project.title ILIKE :title',
        { title: '%Port%' },
      );
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'project.platformType = :platformType',
        { platformType: PLATFORM_TYPE.WEB },
      );
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'project.projectStatus = :projectStatus',
        { projectStatus: PROJECT_STATUS.IN_PROGRESS },
      );
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'project.status = :status',
        { status: STATUS.ACTIVE },
      );
    });

    it('should query without filters', async () => {
      queryBuilder.getMany.mockResolvedValue([]);

      await expect(service.query({})).resolves.toEqual([]);
      // Quando não há filtros, nenhum andWhere() deve ser chamado.
      expect(queryBuilder.andWhere).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should find a project by id', async () => {
      // Simula que o banco encontrou a entidade pelo id informado.
      repository.findOne.mockResolvedValue(project);

      await expect(service.findOne(project.id)).resolves.toEqual(project);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: project.id },
      });
    });

    it('should throw an exception when dont find project', async () => {
      // null representa que nenhum registro correspondeu ao id pesquisado.
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne(99)).rejects.toThrow(
        new NotFoundException('O projeto não foi encontrado'),
      );
    });
  });

  describe('update', () => {
    it('should update a project', async () => {
      const updateDto: UpdateProjectDto = { title: 'Portfolio v2' };
      // O spread cria uma nova entidade combinando os dados antigos e os campos alterados.
      const updatedProject = { ...project, ...updateDto };
      repository.findOne.mockResolvedValue(project);
      repository.save.mockResolvedValue(updatedProject);

      await expect(service.update(project.id, updateDto)).resolves.toEqual(
        updatedProject,
      );
      // Confirma que save() recebeu a entidade já modificada.
      expect(repository.save).toHaveBeenCalledWith(updatedProject);
    });

    it('should throw an exception when dont find project', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(
        service.update(99, { title: 'Inexistente' }),
      ).rejects.toThrow(
        new NotFoundException('O projeto não foi encontrado'),
      );
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete a project', async () => {
      repository.findOne.mockResolvedValue(project);
      // DeleteResult de TypeORM informa quantos registros foram afetados.
      // affected: 1 representa uma remoção bem-sucedida.
      repository.delete.mockResolvedValue({ affected: 1 } as DeleteResult);

      await expect(service.delete(project.id)).resolves.toBeUndefined();
      expect(repository.delete).toHaveBeenCalledWith(project.id);
    });

    it('should throw an exception when dont find project', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.delete(99)).rejects.toThrow(
        new NotFoundException('O projeto não foi encontrado'),
      );
      expect(repository.delete).not.toHaveBeenCalled();
    });

    it('should throw an exception when fail on delete project', async () => {
      repository.findOne.mockResolvedValue(project);
      // affected: 0 representa que o delete não removeu nenhum registro.
      repository.delete.mockResolvedValue({ affected: 0 } as DeleteResult);

      await expect(service.delete(project.id)).rejects.toThrow(
        new ConflictException('Falha ao remover produto'),
      );
    });
  });
});
