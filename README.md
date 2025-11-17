# Task Management Backend (Express + Prisma + PostgreSQL)

A backend built using Express, Prisma ORM, and PostgreSQL.

## Tech Stack
- Node.js
- Express.js
- PostgreSQL
- Prisma ORM
- dotenv


## Environment Variables (.env)
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/DATABASE_NAME?schema=public"
PORT=5000

## Installation
```bash
git clone git@github.com:786Ayush/task-management-backend.git
cd task-management-backend
npm install
```

## Prisma Setup
```bash
npx prisma generate
npx prisma migrate dev --name init
```
## Start Server
```bash
npm run dev
# or
npm run build
npm start
```
