import { Module } from '@nestjs/common';
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
