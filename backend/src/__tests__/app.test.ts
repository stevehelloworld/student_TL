import { buildApp } from '../app';

// Mock PrismaClient to prevent DB connection during app tests
jest.mock('@prisma/client', () => {
  const mPrisma = {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mPrisma) };
});

describe('App', () => {
  it('should return hello world', async () => {
    const app = buildApp();
    const response = await app.inject({
      method: 'GET',
      url: '/'
    });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ hello: 'world' });
  });
});
