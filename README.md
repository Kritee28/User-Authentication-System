# User Authentication System

A React interface and Express API for account registration, sign-in, and session-based authentication using MySQL.

## Problem and scope

The application provides a small example of registering an account, storing a bcrypt password hash, signing in with an email or username, maintaining a server-side session, and signing out. It does not currently implement password recovery, email verification, roles/permissions, or a production session store.

## Technology

- React 18, React Router, Formik, Yup, Axios
- Node.js, Express 4, express-session, bcrypt
- MySQL

## Verified application behavior

- Registration validates required fields and creates a bcrypt hash on the server.
- Duplicate usernames/emails are rejected.
- Login accepts an email address or username and establishes an HTTP-only session cookie.
- The home page checks the session; a signed-in user sees a dashboard with a sign-out action.
- Authentication endpoints apply a small in-memory attempt limit.

The default `express-session` MemoryStore is suitable for local development only. Configure a persistent session store before running multiple instances or deploying this application.

## Architecture

```text
Browser (React) ── credentialed HTTP requests ──> Express API ── parameterized SQL ──> MySQL
                                                    └── signed session cookie
```

## Project structure

```text
backend/
  database/index.js       MySQL connection pool
  routes/auth.js          Registration, login, logout
  schema.sql              Initial database and users table
  index.js                Express app, middleware, session configuration
Frontend/
  src/Pages/              Login, registration, dashboard, 404
  src/Routes/routes.js    Session check and page routes
  src/module/api.js       API base URL
```

## Requirements and setup

Install Node.js 20 or later and MySQL 8 or a compatible server. The backend and frontend have separate package manifests.

1. Create the database and users table by running `backend/schema.sql` with a MySQL account permitted to create databases and tables. For an existing database, back up the data and add unique indexes on `users.username` and `users.email` after resolving any duplicates; the schema file does not migrate existing tables.
2. Copy `backend/.env.example` to `backend/.env` and fill in local database settings. Generate a fresh session secret of at least 32 characters.
3. Install and start the backend:

   ```sh
   cd backend
   npm install
   npm run dev
   ```

4. In another terminal, install and start the frontend:

   ```sh
   cd Frontend
   npm install
   npm start
   ```

The frontend defaults to `http://localhost:4000`. Set `REACT_APP_API_URL` in `Frontend/.env` if the API uses another address. Set `ORIGIN_FRONTEND_SERVER` in the backend environment to the exact frontend origin (for example, `http://localhost:3000`). Keep both local origins on the same hostname (`localhost` or `127.0.0.1`) so the browser sends the session cookie consistently.

## Environment variables

Backend variables are listed in [`backend/.env.example`](backend/.env.example). `NODE_ENV=production` enables secure cookies and proxy trust; serve production traffic over HTTPS. The API requires `SESSION_SECRET`, `DB_HOST`, `DB_USER`, and `DB_NAME`. `DB_PASSWORD` can be empty only when that is how the local MySQL account is configured.

## API

All request and response bodies use JSON. Browser calls must include credentials and come from the configured origin.

| Method | Path | Request | Result |
| --- | --- | --- | --- |
| `GET` | `/` | — | `{ loggedIn, user }` session status |
| `POST` | `/auth/register` | `{ name, lastname, username, email, password }` | `201` on creation, `400` invalid input, `409` duplicate identity |
| `POST` | `/auth/login` | `{ email, password }` where `email` may contain a username | `200` with public user fields, `401` invalid credentials |
| `POST` | `/auth/logout` | — | `204` and session cookie cleared |

Registration and login are limited to 10 attempts per IP in a 15-minute window per backend process. This lightweight in-memory limit resets on restart and is not shared across instances.

## Checks

Run `npm test` in `backend` to verify bcrypt hash behavior, session status, malformed authentication requests, and request throttling. Run `npm run build` in `Frontend` to compile the React app. Database-backed registration, duplicate detection, and successful login still require a running, configured MySQL server and were not exercised here.

## Screenshots

No screenshots are included yet.

## Future enhancements

- Add automated route and UI tests with a disposable test database.
- Configure a persistent session store, CSRF protection for cross-site deployments, and a shared rate limiter for production.
- Add password recovery and email verification if those features are required.

## Ownership and license

**Sole current repository owner and maintainer:** Kritee (@Kritee28) · [GitHub profile](https://github.com/Kritee28) · [Repository](https://github.com/Kritee28/User-Authentication-System)

The repository retains its existing [`LICENSE`](LICENSE), including its original copyright attribution. Repository ownership and current maintenance do not alter that legal notice or claim authorship of third-party contributions.
