# Project notes

Use [README.md](README.md) for setup instructions, environment variables, API routes, and application behavior.

## Authentication flow

1. The browser sends registration fields or login credentials to the Express API over the configured origin.
2. The server validates input and stores only a bcrypt hash of each new password.
3. On successful login, Express creates a session and sends a signed, HTTP-only cookie.
4. The browser sends that cookie on subsequent credentialed requests. Sign-out destroys the session.

Passwords are not encrypted with custom browser code. Transport encryption should be provided by HTTPS outside local development.

## Local checks

- Backend: `npm test` (runs the Node test suite in `backend/test/auth.test.js`).
- Frontend: `npm run build`.
- Manual registration/login checks require MySQL configured as described in the README.

## Current sole project maintainer

Kritika (@Kritee28): https://github.com/Kritee28
