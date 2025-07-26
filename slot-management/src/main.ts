import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { SeedsService } from './seed/seed.service';

/**
 * Main function

 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.setGlobalPrefix('api');

  const seedService = app.get(SeedsService);
  app.enableCors();
  await seedService.seedUserAndAdmin();

  await app.listen(process.env.PORT);
}
void bootstrap();
