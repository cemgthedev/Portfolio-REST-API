import { ProjectsModule } from '@/modules/projects/project.module';
import { SimpleMiddleware } from '@/study/middlewares/simple.middleware';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      database: 'portfolio',
      username: 'postgres',
      password: '12345678',
      autoLoadEntities: true,
      synchronize: true, // Don't use synchronize: true in production; otherwise, you can lose production data.
    }),
    ProjectsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})

// Ex.: configuration for middlewares
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SimpleMiddleware).forRoutes('*');
  }
}
