import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  // Check that the application accepts correct login credentials
  // and returns a JWT token
  it('/auth/login (POST) - success', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'user1@example.com', password: 'password' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('access_token');
  });

  // Check that the application rejects incorrect login credentials
  it('/auth/login (POST) - failure', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'invalid@example.com', password: 'wrongpassword' });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty(
      'message',
      'Väärä sähköposti tai salasana',
    );
  });
});
