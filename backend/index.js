require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const helmet = require('helmet');
const authRouter = require('./routes/auth');

const app = express();
const port = Number(process.env.SERVERPORT) || 4000;
const isProduction = process.env.NODE_ENV === 'production';
const sessionSecret = process.env.SESSION_SECRET;
const frontendOrigin = process.env.ORIGIN_FRONTEND_SERVER || 'http://localhost:3000';

if (!sessionSecret || sessionSecret.length < 32) {
	throw new Error('SESSION_SECRET must be set to a random value of at least 32 characters.');
}

app.disable('x-powered-by');
if (isProduction) app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({ origin: frontendOrigin, credentials: true }));
app.use(express.json({ limit: '10kb' }));
app.use(session({
	name: 'session_id',
	secret: sessionSecret,
	resave: false,
	saveUninitialized: false,
	cookie: {
		httpOnly: true,
		secure: isProduction,
		sameSite: 'lax',
		maxAge: 1000 * 60 * 60 * 8,
	},
}));

app.use('/auth', authRouter);
app.get('/', (req, res) => res.json({ loggedIn: Boolean(req.session.user), user: req.session.user || null }));
app.use((req, res) => res.status(404).json({ message: 'Route not found.' }));
app.use((error, req, res, next) => {
	if (res.headersSent) return next(error);
	console.error('Request failed.');
	return res.status(500).json({ message: 'An unexpected server error occurred.' });
});

if (require.main === module) {
	app.listen(port, () => console.log(`Authentication API listening on port ${port}`));
}

module.exports = app;
