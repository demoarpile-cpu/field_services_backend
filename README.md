# Field Service Management Backend

This is the backend for the Field Service Management SaaS application, built with Node.js, Express, Prisma, and MySQL.

## Project Structure

- `src/`: Source code
  - `config/`: Database and environment configurations
  - `middlewares/`: Authentication, authorization, and error handling
  - `modules/`: Feature-based modules (auth, jobs, customers, etc.)
  - `utils/`: Utility functions (JWT, hash)
  - `app.js`: Express application setup
  - `server.js`: Server entry point
  - `routes.js`: Centralized API routes
- `prisma/`: Prisma schema and migrations

## Getting Started

### Prerequisites

- Node.js (v14+)
- MySQL database

### Installation

1. Clone the repository
2. Navigate to the `backend` folder: `cd backend`
3. Install dependencies: `npm install`
4. Set up the `.env` file (see `.env.example`)
5. Run Prisma migrations: `npx prisma migrate dev`
   - *Note: Ensure DATABASE_URL is correct in .env*

### Running the App

- Development mode: `npm run dev` (uses nodemon)
- Production mode: `npm start`

## Environment Variables

- `DATABASE_URL`: MySQL connection string
- `PORT`: Server port (default: 5000)
- `JWT_SECRET`: Secret key for JWT signing

## API Modules

- **Auth**: `/api/auth` (Login, Me)
- **Customers**: `/api/customers`
- **Employees**: `/api/employees`
- **Jobs**: `/api/jobs`
- **Estimates**: `/api/estimates`
- **Invoices**: `/api/invoices`
- **Payments**: `/api/payments`
- **Uploads**: `/api/uploads`
