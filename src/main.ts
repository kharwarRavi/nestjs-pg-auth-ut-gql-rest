import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const port = Number(config.get<string>('PORT') || 3000);
  const host = config.get<string>('HOST') || 'localhost';

  app.useGlobalPipes(new ValidationPipe());
  await app.listen(port, host);
}
void bootstrap();
