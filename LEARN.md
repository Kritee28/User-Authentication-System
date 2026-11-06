# Project notes

This file replaces the upstream template guide. For setup, environment variables, API routes, and verified behavior, see [README.md](README.md).

## Authentication flow

1. The browser sends registration fields or login credentials to the Express API over the configured origin.
2. The server validates input and stores only a bcrypt hash of each new password.
3. On successful login, Express creates a session and sends a signed, HTTP-only cookie.
4. The browser sends that cookie on subsequent credentialed requests. Sign-out destroys the session.

Passwords are not encrypted with custom browser code. Transport encryption should be provided by HTTPS outside local development.

## Local checks

- Backend: `npm test` (Node test runner; currently no test files are included).
- Frontend: `npm run build`.
- Manual registration/login checks require MySQL configured as described in the README.

## Current sole project maintainer

Kritee (@Kritee28): https://github.com/Kritee28
