import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Enable CORS
  app.enableCors({
    origin: 'http://localhost:3000', // Allow all origins, adjust as needed for production
    methods: 'GET,PUT,POST,DELETE',
    credentials: true, // Allow credentials if needed
  });

  await app.listen(process.env.PORT ?? 8000);
}
bootstrap();
