const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../database');
const { isEmail, checkUsername } = require('../module/check_userOrEmail');

const router = express.Router();
const attempts = new Map();
const limitAuthAttempts = (req, res, next) => {
	const now = Date.now();
	const key = req.ip;
	const entry = attempts.get(key);
	if (!entry || now - entry.startedAt >= 15 * 60 * 1000) {
		if (!entry && attempts.size >= 10000) attempts.delete(attempts.keys().next().value);
		attempts.set(key, { startedAt: now, count: 1 });
		return next();
	}
	if (entry.count >= 10) return publicError(res, 429, 'Too many authentication attempts. Try again later.');
	entry.count += 1;
	return next();
};
const query = (sql, values) => new Promise((resolve, reject) => {
	db.query(sql, values, (error, rows) => (error ? reject(error) : resolve(rows)));
});

const cleanString = (value) => typeof value === 'string' ? value.trim() : '';
const publicError = (res, status, message) => res.status(status).json({ message });

router.post('/register', limitAuthAttempts, async (req, res, next) => {
	try {
		const name = cleanString(req.body.name);
		const lastname = cleanString(req.body.lastname);
		const username = cleanString(req.body.username).toLowerCase();
		const email = cleanString(req.body.email).toLowerCase();
		const password = typeof req.body.password === 'string' ? req.body.password : '';

		if (!name || !lastname || !checkUsername(username) || !isEmail(email) || password.length < 8 || Buffer.byteLength(password, 'utf8') > 72) {
			return publicError(res, 400, 'Provide valid name, lastname, username, email, and a password of 8–72 bytes.');
		}

		const existing = await query('SELECT userID FROM users WHERE username = ? OR email = ? LIMIT 1', [username, email]);
		if (existing.length) return publicError(res, 409, 'Username or email is already registered.');

		const passwordHash = await bcrypt.hash(password, 12);
		await query('INSERT INTO users (name, lastname, username, email, password) VALUES (?, ?, ?, ?, ?)', [name, lastname, username, email, passwordHash]);
		return res.status(201).json({ message: 'User successfully registered.' });
	} catch (error) {
		if (error.code === 'ER_DUP_ENTRY') return publicError(res, 409, 'Username or email is already registered.');
		return next(error);
	}
});

router.post('/login', limitAuthAttempts, async (req, res, next) => {
	try {
		const identifier = cleanString(req.body.email).toLowerCase();
		const password = typeof req.body.password === 'string' ? req.body.password : '';
		if (!identifier || !password || (!isEmail(identifier) && !checkUsername(identifier))) {
			return publicError(res, 400, 'Enter a valid email or username and password.');
		}

		const field = isEmail(identifier) ? 'email' : 'username';
		const users = await query(`SELECT userID, name, lastname, username, email, password, role FROM users WHERE ${field} = ? LIMIT 1`, [identifier]);
		const user = users[0];
		if (!user || !(await bcrypt.compare(password, user.password || ''))) return publicError(res, 401, 'Email/username or password is incorrect.');

		req.session.regenerate((error) => {
			if (error) return next(error);
			req.session.user = {
				userID: user.userID,
				name: user.name,
				lastname: user.lastname,
				username: user.username,
				role: user.role,
			};
			return req.session.save((saveError) => {
				if (saveError) return next(saveError);
				return res.status(200).json({ message: 'Signed in.', user: req.session.user });
			});
		});
	} catch (error) {
		return next(error);
	}
});

router.post('/logout', (req, res, next) => {
	if (!req.session) return res.sendStatus(204);
	return req.session.destroy((error) => {
		if (error) return next(error);
		res.clearCookie('session_id', { path: '/' });
		return res.sendStatus(204);
	});
});

module.exports = router;
