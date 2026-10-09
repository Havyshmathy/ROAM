# ROAM — Personal Travel Companion

**Live application:** https://roam-murex-phi.vercel.app/
**GitHub repository:** https://github.com/Havyshmathy/ROAM

ROAM is a full-stack travel application that brings trip planning, saved places, and travel diaries together in one place. It is designed to help users organize their travel plans and keep track of places and experiences they want to remember.

## Features

* **User authentication** — Sign in and access account-specific features.
* **Trip management** — Create and manage travel plans.
* **Places** — Work with place information within the application.
* **Saved places** — Save locations for future reference.
* **Travel diaries** — Store and revisit travel memories.
* **Persistent data storage** — Keep application data in a PostgreSQL database.

## Tech Stack

| Layer               | Technologies            |
| ------------------- | ----------------------- |
| Frontend            | React, JavaScript, Vite |
| Backend             | Node.js, Express.js     |
| Database            | PostgreSQL              |
| ORM                 | Prisma                  |
| Frontend deployment | Vercel                  |
| Backend deployment  | Render                  |
| Database hosting    | Neon                    |
| Version control     | Git, GitHub             |
| CI                  | GitHub Actions          |

## Architecture

```text
                  User's Browser
                        |
                        v
               React + Vite Frontend
                     (Vercel)
                        |
                  HTTPS API calls
                        |
                        v
                 Express REST API
                     (Render)
                        |
                      Prisma
                        |
                        v
                PostgreSQL Database
                      (Neon)
```

The frontend communicates with the backend through HTTP API requests. The backend uses Prisma to interact with the PostgreSQL database.

## Live Deployment

| Component       | URL                                    |
| --------------- | -------------------------------------- |
| Web application | https://roam-murex-phi.vercel.app/     |
| Backend service | https://roam-backend-0k1n.onrender.com |
| Source code     | https://github.com/Havyshmathy/ROAM    |

The frontend uses the `VITE_API_URL` environment variable to determine the API base URL.

## Running Locally

### Prerequisites

* Node.js and npm
* Git
* PostgreSQL, if using a local database

### 1. Clone the repository

```bash
git clone https://github.com/Havyshmathy/ROAM.git
cd ROAM
```

### 2. Install frontend dependencies

From the repository root:

```bash
npm install
```

Create a `.env.local` file in the repository root:

```env
VITE_API_URL=http://localhost:5000/api
```

This example assumes your local backend runs on port `5000` and uses the `/api` prefix.

### 3. Install backend dependencies

```bash
cd backend
npm install
```

Create a `backend/.env` file:

```env
PORT=5000
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/roam"
JWT_SECRET="replace-with-a-long-random-secret"
NODE_ENV=development
```

Replace the database placeholders with your own local PostgreSQL credentials. Use a private, randomly generated JWT secret.

### 4. Configure the database

From the `backend` directory, run:

```bash
npx prisma generate
npx prisma migrate deploy
```

These commands generate the Prisma client and apply the migrations included in the repository. Ensure the database URL points to the intended database before running migrations.

**Do not run database reset commands against a database containing data you want to keep.**

### 5. Start the backend

From the `backend` directory:

```bash
npm run dev
```

### 6. Start the frontend

Open a second terminal in the repository root:

```bash
npm run dev
```

Open the local URL printed by Vite in the terminal.

## Environment Variables

### Frontend

| Variable       | Purpose                           |
| -------------- | --------------------------------- |
| `VITE_API_URL` | Base URL for backend API requests |

Local example:

```env
VITE_API_URL=http://localhost:5000/api
```

Production example:

```env
VITE_API_URL=https://roam-backend-0k1n.onrender.com/api
```

### Backend

| Variable       | Purpose                                                                              |
| -------------- | ------------------------------------------------------------------------------------ |
| `PORT`         | Port used by the Express server; the hosting platform may provide this automatically |
| `DATABASE_URL` | PostgreSQL connection string                                                         |
| `JWT_SECRET`   | Secret used for authentication tokens                                                |
| `NODE_ENV`     | Runtime environment, such as `development` or `production`                           |

Configure frontend variables in Vercel and backend variables in Render. Vite reads `VITE_API_URL` during the build, so frontend environment-variable changes require a new deployment.

**Never commit real `.env` files, database credentials, or authentication secrets.** The `VITE_` prefix is intended for browser-visible configuration, not private credentials.

## Testing and Build

Run the frontend checks from the repository root:

```bash
npm run lint
npm run build
```

Run the backend tests from the backend directory:

```bash
cd backend
npm test
```

The project uses GitHub Actions to run automated checks. Review the Actions tab in the repository to confirm that the checks pass for each relevant commit.

## CI/CD Workflow

The deployment workflow uses GitHub as the source repository, GitHub Actions for automated checks, Vercel for the frontend, and Render for the backend.

1. Make a code change locally.
2. Run the relevant tests and build checks.
3. Commit and push the change to GitHub.
4. Check GitHub Actions for the workflow result.
5. Check Vercel and Render for the corresponding deployment status.
6. Open the live application and verify the changed functionality.

Automated checks and deployments are separate stages unless explicitly connected in the workflow configuration. A successful test run alone does not prove that production was deployed successfully.

## Security and Data Safety

* Keep `.env` and `.env.local` files out of Git.
* Never publish database connection strings or JWT secrets.
* Use separate development and production credentials.
* Back up important data before making database changes.
* Avoid destructive database commands on databases containing data you need.
* Rotate any secret that is accidentally exposed.

## Project Status

ROAM is deployed with a React frontend, an Express backend, and a hosted PostgreSQL database. The live application can be accessed using the production link above.

For future updates, use Git for version control, GitHub Actions for automated checks, and the hosting dashboards to verify successful deployments.
