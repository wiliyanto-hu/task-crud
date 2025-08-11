# NestJS App with PostgreSQL

This is a NestJS application using PostgreSQL as the database.

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v20 and up)
- [PostgreSQL](https://www.postgresql.org/) installed and running
- [Docker](https://www.docker.com/) (For Docker-based setup)

---

## 📦 Installation & Running Locally

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file in the root directory. You can reference the values from `.env.example`.

3. Run database migrations:

   ```bash
   npm run migration:run
   ```

4. Start the application:
   ```bash
   npm start
   ```
   Or, for watch mode:
   ```bash
   npm run start:dev
   ```

---

## 🧪 Running Tests

Run unit tests:

```bash
npm run test
```

Run end-to-end (E2E) tests:

```bash
npm run test:e2e
```

---

## 🐳 Running with Docker

To run the app using Docker:

```bash
docker compose up --build
```

---

## 🌐 Accessing the App

- Application: `http://localhost:3000`
- API Documentation (Not available on production environment):
  - `http://localhost:3000/api`
  - `http://127.0.0.1:3000/api`

---

## 📄 Notes

- Default app port: **3000**
- Make sure PostgreSQL credentials in `.env` match your database setup.
