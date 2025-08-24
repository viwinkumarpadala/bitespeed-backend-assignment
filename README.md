# Bitespeed-Backend-Assignment

## Tech Stack

- **Backend Framework:** Node.js, Express, TypeScript  
- **Database & ORM:** PostgreSQL, Prisma  
- **Containerization:** Docker  
- **API Documentation:** Swagger  
- **Validation:** Zod
- **Testing:** Jest, Supertest (Unit & API tests)  

---

## Running with Docker

```bash
docker-compose up --build
```

---

## Running without Docker

1. **Clone the repository**

   ```bash
   git clone https://github.com/viwinkumarpadala/bitespeed-backend-assignment.git
   cd bitespeed-backend-assignment
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Setup .env**

     ```env
     PORT=5000
     DATABASE_URL=postgresql://<username>:<password>@localhost:5432/<dbname>
     ```

4. **Run database migrations**

   ```bash
   npx prisma migrate dev
   ```

5. **Start the application**

   ```bash
   npm start
   ```

---
## Relevant Links
- **Exposed endpoint link**: [Link](https://bitespeed-backend-assignment-vsje.onrender.com/identify)
- **Swagger Documentation link**: [Link](https://bitespeed-backend-assignment-vsje.onrender.com/api-docs/)
