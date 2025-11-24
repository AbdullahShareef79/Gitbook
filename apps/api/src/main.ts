import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Security headers
  app.use(helmet());
  
  // Cookie parser for secure cookies
  app.use(cookieParser());
  
  // Global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());
  
  // Production-ready CORS
  const webOrigin = process.env.WEB_ORIGIN || 'http://localhost:3000';
  const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',')
    : [webOrigin];
  
  app.enableCors({ 
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  
  app.useGlobalPipes(
    new ValidationPipe({ 
      whitelist: true, 
      transform: true,
      forbidNonWhitelisted: true,
    })
  );
  
  // Set secure cookie options in production
  if (process.env.NODE_ENV === 'production') {
    app.use((req: any, res: any, next: any) => {
      res.cookie = ((name: string, value: any, options: any = {}) => {
        res.cookie(name, value, {
          ...options,
          secure: true,
          httpOnly: true,
          sameSite: 'lax',
        });
      });
      next();
    });
  }
  
  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`API server running on http://localhost:${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Allowed origins: ${allowedOrigins.join(', ')}`);
}
bootstrap();

// Rebuild trigger
