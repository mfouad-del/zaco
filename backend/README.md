# ArchivX Backend

This is the backend for the ArchivX Correspondence Management System.

## Prerequisites

- Node.js (v18+)
- Docker & Docker Compose

## Setup

1.  Install dependencies:
    ```bash
    npm install
    ```

2.  Start the database:
    ```bash
    docker-compose up -d postgres
    ```

3.  Run Prisma migrations:
    ```bash
    npx prisma migrate dev --name init
    ```

4.  Start the application:
    ```bash
    npm run start:dev
    ```

## API Documentation

Once the server is running, visit `http://localhost:3001/api` to see the Swagger documentation.

## Environment Variables

See `.env` file for configuration.
