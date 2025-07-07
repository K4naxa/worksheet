import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());
  // Enable CORS
  app.enableCors({
    origin: [process.env.FRONTEND_URL as string], // Allow frontend origins
    methods: 'GET,PUT,POST,DELETE,PATCH,OPTIONS',
    credentials: true, // Essential for cookies
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    exposedHeaders: ['Set-Cookie'],
  });

  await app.listen(process.env.PORT ?? 8000);
}
void bootstrap();
