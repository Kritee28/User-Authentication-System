const { test } = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');

process.env.SESSION_SECRET = 'test-session-secret-that-is-at-least-32-characters';
process.env.DB_HOST = '127.0.0.1';
process.env.DB_USER = 'test-user';
process.env.DB_NAME = 'test-database';
process.env.ORIGIN_FRONTEND_SERVER = 'http://localhost:3000';

const app = require('../index');

test('password hashing uses bcrypt and verifies the original secret', async () => {
	const password = 'example-password-123';
	const hash = await bcrypt.hash(password, 4);
	assert.notEqual(hash, password);
	assert.equal(await bcrypt.compare(password, hash), true);
	assert.equal(await bcrypt.compare('incorrect-password', hash), false);
});

test('session status and authentication input limits', async (t) => {
	const server = app.listen(0);
	await new Promise((resolve) => server.once('listening', resolve));
	t.after(() => new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve())));
	const baseUrl = `http://127.0.0.1:${server.address().port}`;

	const statusResponse = await fetch(baseUrl);
	assert.equal(statusResponse.status, 200);
	assert.deepEqual(await statusResponse.json(), { loggedIn: false, user: null });

	const invalidLogin = await fetch(`${baseUrl}/auth/login`, {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({ email: '', password: '' }),
	});
	assert.equal(invalidLogin.status, 400);

	const invalidRegistration = await fetch(`${baseUrl}/auth/register`, {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({}),
	});
	assert.equal(invalidRegistration.status, 400);

	for (let attempt = 0; attempt < 8; attempt += 1) {
		const response = await fetch(`${baseUrl}/auth/login`, {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ email: '', password: '' }),
		});
		assert.equal(response.status, 400);
	}

	const limitedResponse = await fetch(`${baseUrl}/auth/login`, {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({ email: '', password: '' }),
	});
	assert.equal(limitedResponse.status, 429);
});
