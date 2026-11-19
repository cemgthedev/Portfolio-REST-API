import { CreateProjectDto } from '@/modules/projects/dtos/create-project.dto';
import { QueryProjectDto } from '@/modules/projects/dtos/query-project.dto';
import { ProjectsService } from '@/modules/projects/projects.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

@Controller('projects')
// Ex.: @UseInterceptors(AddHeaderInterceptor)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  async create(@Body() project: CreateProjectDto) {
    return this.projectsService.create(project);
  }

  @Get()
  async query(@Query() query: QueryProjectDto) {
    return this.projectsService.query(query);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.projectsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() project: CreateProjectDto,
  ) {
    return this.projectsService.update(id, project);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.projectsService.delete(id);
  }
}
