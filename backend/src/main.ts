import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const config = new DocumentBuilder()
    .setTitle('ArchivX API')
    .setDescription('The ArchivX Enterprise API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Serve uploaded files publicly
  app.use('/uploads', express.static(join(__dirname, '..', '..', 'uploads')));

  // Log existing companies at startup to verify seed ran
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    const companies = await prisma.company.findMany();
    console.log('Existing companies on DB:', companies);

    // Backfill missing docDate in correspondences to createdAt to avoid 'undefined' in PDFs/reports
    try {
      const rows = await prisma.$executeRaw`UPDATE "Correspondence" SET "docDate" = "createdAt" WHERE "docDate" IS NULL`;
      console.log('Backfilled correspondences missing docDate, rows affected:', rows);
    } catch (err) {
      console.error('Failed to backfill docDate', err?.message || err);
    }

    await prisma.$disconnect();
  } catch (err) {
    console.error('Failed to list companies on startup', err?.message || err);
  }

  await app.listen(process.env.PORT || 3005);
}
bootstrap();
